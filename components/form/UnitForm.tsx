"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getBaccaratData, updateBaccaratRow, createBaccaratRow } from "@/helper/baccarat"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { getFranchises } from "@/helper/franchise"
import { Franchise } from "@/types/franchise"

interface UnitFormProps {
    initialData?: any | null
    onSuccess: () => void
}

const BACCARAT_STATUSES = ["Running", "Stopped", "Burned", "Idle", "Starting"]
const STRATEGIES = ["Standard", "Sweeper", "Burst", "Tank"]

export function UnitForm({ initialData, onSuccess }: UnitFormProps) {
    const isEditing = !!initialData
    const [isLoading, setIsLoading] = useState(false)
    const [franchises, setFranchises] = useState<Franchise[]>([])
    const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null)

    const [formData, setFormData] = useState({
        pc_name: initialData?.unit_name || "",
    })

    useEffect(() => {
        const fetchFranchises = async () => {
            try {
                const data = await getFranchises()
                setFranchises(data || [])
            } catch (error) {
                console.error("Error fetching franchises:", error)
            }
        }
        fetchFranchises()
    }, [])

    const handleFranchiseChange = (franchiseId: string) => {
        const franchise = franchises.find(f => f.id === franchiseId) || null
        setSelectedFranchise(franchise)

        if (franchise) {
            const code = (franchise.franchise_code || franchise.franchise_name || "").toUpperCase()
            setFormData(prev => ({ ...prev, pc_name: code }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (isEditing && initialData) {
                await updateBaccaratRow({
                    id: initialData.id,
                    pc_name: formData.pc_name,
                    // Preserve existing values or use defaults for required fields
                    level: initialData.level ?? 1,
                    pattern: initialData.pattern ?? "",
                    target_profit: initialData.target_profit ?? 0,
                    bet_size: initialData.bet_size ?? 10,
                    strategy: initialData.strategy ?? "Standard",
                    status: initialData.status ?? "Idle",
                    duration: initialData.duration ?? 0,
                } as any)
                toast.success("Unit updated successfully")
            } else {
                await createBaccaratRow({
                    pc_name: formData.pc_name,
                    status: "Idle",
                    level: 1,
                    pattern: "",
                    target_profit: 0,
                    bet_size: 10,
                    strategy: "Standard",
                    duration: 0,
                })
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-4">
                <div className="space-y-2">
                    <Label htmlFor="franchise">Franchise</Label>
                    <SearchableSelect
                        id="franchise"
                        value={selectedFranchise?.id || ""}
                        onChange={handleFranchiseChange}
                        options={franchises.map(f => ({ value: f.id, label: f.franchise_name || "Unnamed" }))}
                        placeholder="Select franchise"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pc_name">PC Name / Unit Name</Label>
                    <Input
                        id="pc_name"
                        placeholder="e.g. PC-01"
                        value={formData.pc_name}
                        onChange={(e) => setFormData({ ...formData, pc_name: e.target.value })}
                        required
                        className="bg-[#050505] border-[#1a1a1a] focus:border-blue-500/50"
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
