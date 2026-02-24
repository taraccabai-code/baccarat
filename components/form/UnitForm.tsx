"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Unit, UnitStatus } from "@/types/units"
import { Franchise } from "@/types/franchise"
import { Credential } from "@/types/credentials"
import { getFranchises } from "@/helper/franchise"
import { createUnit, updateUnit, getUnits, updateUnitConfig } from "@/helper/units"
import { getCredentials } from "@/helper/credentials"
import { getPlatformWebsites, PlatformWebsiteRecord } from "@/helper/platform_websites"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface UnitFormProps {
    initialData?: Unit | null
    onSuccess: () => void
    franchises?: Franchise[]
    units?: Unit[]
}

const UNIT_STATUSES: UnitStatus[] = ["enabled", "disabled", "processing", "slow network", "not connected", "pc issue"]

export function UnitForm({ initialData, onSuccess, franchises: initialFranchises, units: initialUnits }: UnitFormProps) {
    const isEditing = !!initialData
    const [isLoading, setIsLoading] = useState(false)
    const [franchises, setFranchises] = useState<Franchise[]>(initialFranchises || [])
    const [units, setUnits] = useState<Unit[]>(initialUnits || [])
    const [credentials, setCredentials] = useState<Credential[]>([])
    const [platforms, setPlatforms] = useState<PlatformWebsiteRecord[]>([])

    const [formData, setFormData] = useState({
        unit_name: initialData?.unit_name || "",
        api_base_url: initialData?.api_base_url || "",
        franchise_id: initialData?.franchise_id || "",
        status: initialData?.status || "disabled" as UnitStatus,
        platform: initialData?.platform || "",
        credential_id: initialData?.credential_id || ""
    })

    useEffect(() => {
        const fetchData = async () => {
            const [franchiseData, unitData, credentialData, platformData] = await Promise.all([
                !initialFranchises ? getFranchises() : Promise.resolve(initialFranchises),
                !initialUnits ? getUnits() : Promise.resolve(initialUnits),
                getCredentials(),
                getPlatformWebsites()
            ])
            if (!initialFranchises) setFranchises(franchiseData)
            if (!initialUnits) setUnits(unitData)
            setCredentials(credentialData as Credential[])
            setPlatforms(platformData)
        }
        fetchData()
    }, [initialFranchises, initialUnits])

    // Automatically select the first franchise if none is selected and we're not editing
    useEffect(() => {
        if (!isEditing && !formData.franchise_id && franchises.length > 0) {
            setFormData(prev => ({ ...prev, franchise_id: franchises[0].id }))
        }
    }, [franchises, isEditing, formData.franchise_id])

    const selectedFranchise = franchises.find(f => f.id === formData.franchise_id)
    const franchiseUnits = units.filter(u => u.franchise_id === formData.franchise_id)
    const nextNumber = isEditing ? 0 : (() => {
        const numbers = franchiseUnits
            .map(u => {
                const parts = u.unit_name.split("-UNIT-")
                return parts.length > 1 ? parseInt(parts[1]) : 0
            })
            .filter(n => !isNaN(n))
        return Math.max(0, ...numbers) + 1
    })()
    const previewName = selectedFranchise ? `${selectedFranchise.code}-UNIT-${nextNumber}` : ""

    useEffect(() => {
        if (!isEditing && previewName) {
            setFormData(prev => ({ ...prev, unit_name: previewName }))
        }
    }, [previewName, isEditing])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Test the unit configuration before completing creation/update
            if (formData.api_base_url) {
                try {
                    await updateUnitConfig(formData.api_base_url, formData.unit_name);
                    toast.success("Unit configuration verified");
                } catch (configError: any) {
                    console.error("Config test failed:", configError);
                    toast.error(`Config test failed: ${configError.message}. Proceeding anyway...`);
                }
            }

            if (isEditing && initialData) {
                await updateUnit(initialData.id, formData)
                toast.success("Unit updated successfully")
            } else {
                await createUnit(formData)
                toast.success("Unit created successfully")
            }
            onSuccess()
        } catch (error: any) {
            console.error("Error saving unit:", error)
            toast.error(error.message || "Failed to save unit")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="unit_name">Unit Name</Label>
                    <Input
                        id="unit_name"
                        placeholder="e.g. Unit 01"
                        value={formData.unit_name}
                        onChange={(e) => setFormData({ ...formData, unit_name: e.target.value })}
                        required
                        disabled
                        className="bg-[#050505] border-[#1a1a1a] focus:border-blue-500/50 opacity-100"
                    />
                    {!isEditing && previewName && (
                        <p className="text-[10px] text-blue-500/80 font-medium">
                            Preview: <span className="text-blue-400">{previewName}</span>
                        </p>
                    )}
                </div>

                {/* Hidden Franchise Field - Defaulting to first if not editing */}
                {/* {!isEditing && (
                    <div className="space-y-2">
                        <Label htmlFor="franchise_id">Franchise</Label>
                        <SearchableSelect
                            id="franchise_id"
                            required
                            value={formData.franchise_id || ""}
                            onChange={(val) => setFormData({ ...formData, franchise_id: val })}
                            placeholder="Select a franchise"
                            options={franchises.map(f => ({ value: f.id, label: `${f.name} (${f.code})` }))}
                        />
                    </div>
                )} */}

                <div className="space-y-2">
                    <Label htmlFor="credential_id">User</Label>
                    <SearchableSelect
                        id="credential_id"
                        value={formData.credential_id || ""}
                        onChange={(val) => setFormData({ ...formData, credential_id: val })}
                        placeholder="Select a user"
                        emptyLabel="No user assigned"
                        options={credentials.map(c => ({ value: c.id, label: c.name ?? c.id }))}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <SearchableSelect
                        id="platform"
                        required
                        value={formData.platform || ""}
                        onChange={(val) => setFormData({ ...formData, platform: val })}
                        placeholder="Select a platform"
                        options={platforms.map(p => ({ value: String(p.platform_name), label: String(p.platform_name) }))}
                    />
                </div>

            </div>

            <div className="flex gap-3 pt-4 justify-end">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-500 text-white min-w-[120px]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        isEditing ? "Update Unit" : "Add Unit"
                    )}
                </Button>
            </div>
        </form>
    )
}
