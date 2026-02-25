"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getBaccaratData, updateBaccaratRow, createBaccaratRow } from "@/helper/baccarat"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface UnitFormProps {
    initialData?: any | null
    onSuccess: () => void
}

const BACCARAT_STATUSES = ["Running", "Stopped", "Burned", "Idle", "Starting"]
const STRATEGIES = ["Standard", "Sweeper", "Burst", "Tank"]

export function UnitForm({ initialData, onSuccess }: UnitFormProps) {
    const isEditing = !!initialData
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        pc_name: initialData?.unit_name || "",
        status: initialData?.status?.charAt(0).toUpperCase() + initialData?.status?.slice(1) || "Idle",
        level: initialData?.level || 1,
        pattern: initialData?.pattern || "",
        target_profit: initialData?.target_profit || 0,
        bet_size: initialData?.bet_size || 10,
        strategy: initialData?.strategy || "Standard",
        duration: initialData?.duration || 0,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (isEditing && initialData) {
                await updateBaccaratRow({
                    id: initialData.id,
                    ...formData,
                    bet_size: Number(formData.bet_size),
                    level: Number(formData.level),
                    target_profit: Number(formData.target_profit),
                    duration: Number(formData.duration),
                })
                toast.success("Unit updated successfully")
            } else {
                await createBaccaratRow({
                    ...formData,
                    bet_size: Number(formData.bet_size),
                    level: Number(formData.level),
                    target_profit: Number(formData.target_profit),
                    duration: Number(formData.duration),
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
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
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

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <SearchableSelect
                        id="status"
                        value={formData.status}
                        onChange={(val) => setFormData({ ...formData, status: val })}
                        options={BACCARAT_STATUSES.map(s => ({ value: s, label: s }))}
                        placeholder="Select status"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="strategy">Strategy</Label>
                    <SearchableSelect
                        id="strategy"
                        value={formData.strategy}
                        onChange={(val) => setFormData({ ...formData, strategy: val })}
                        options={STRATEGIES.map(s => ({ value: s, label: s }))}
                        placeholder="Select strategy"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bet_size">Bet Size</Label>
                    <Input
                        id="bet_size"
                        type="number"
                        value={formData.bet_size}
                        onChange={(e) => setFormData({ ...formData, bet_size: Number(e.target.value) })}
                        className="bg-[#050505] border-[#1a1a1a] focus:border-blue-500/50"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Input
                        id="level"
                        type="number"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                        className="bg-[#050505] border-[#1a1a1a] focus:border-blue-500/50"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="target_profit">Target Profit</Label>
                    <Input
                        id="target_profit"
                        type="number"
                        value={formData.target_profit}
                        onChange={(e) => setFormData({ ...formData, target_profit: Number(e.target.value) })}
                        className="bg-[#050505] border-[#1a1a1a] focus:border-blue-500/50"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="duration">Timer (mins)</Label>
                    <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                        className="bg-[#050505] border-[#1a1a1a] focus:border-blue-500/50"
                    />
                </div>

                <div className="space-y-2 col-span-2">
                    <Label htmlFor="pattern">Pattern</Label>
                    <Input
                        id="pattern"
                        placeholder="e.g. PPPB"
                        value={formData.pattern}
                        onChange={(e) => setFormData({ ...formData, pattern: e.target.value.toUpperCase() })}
                        className="bg-[#050505] border-[#1a1a1a] focus:border-blue-500/50 uppercase"
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
