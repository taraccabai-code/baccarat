"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getBaccaratData, updateBaccaratRow, createBaccaratRow, getFranchiseUnitCount } from "@/helper/baccarat"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { getFranchises } from "@/helper/franchise"
import { Franchise } from "@/types/franchise"
import { getAccounts, updateAccount } from "@/helper/accounts"
import { Account } from "@/types/accounts"


interface UnitFormProps {
    initialData?: any | null
    onSuccess: () => void
}

const BACCARAT_STATUSES = ["Running", "Stopped", "Burned", "Idle", "Starting"]
const STRATEGIES = ["Standard", "Sweeper", "Burst", "Tank"]

export function UnitForm({ initialData, onSuccess }: UnitFormProps) {
    const isEditing = !!initialData
    const [isLoading, setIsLoading] = useState(false)
    const [accounts, setAccounts] = useState<Account[]>([])
    const [franchises, setFranchises] = useState<Franchise[]>([])
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
    const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null)

    const [originalAccountId, setOriginalAccountId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        pc_name: initialData?.pc_name || initialData?.unit_name || "",
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [franchiseData, accountData] = await Promise.all([
                    getFranchises(),
                    getAccounts()
                ])
                setAccounts(accountData || [])
                setFranchises(franchiseData || [])

                // If editing, find the account linked to this unit
                if (isEditing && initialData) {
                    const currentAccount = accountData?.find(acc => 
                        (initialData.id && acc.unit_id === initialData.id) || 
                        (initialData.user_id && acc.id === initialData.user_id)
                    )
                    if (currentAccount) {
                        setSelectedAccount(currentAccount)
                        setOriginalAccountId(currentAccount.id)
                    }
                    
                    // Also find the franchise for this unit
                    if (initialData.franchise_name || initialData.franchise_code) {
                        const currentFranchise = franchiseData?.find(f => 
                            f.franchise_name === initialData.franchise_name ||
                            f.franchise_code === initialData.franchise_code
                        )
                        if (currentFranchise) setSelectedFranchise(currentFranchise)
                    }
                }
            } catch (error) {
                console.error("Error fetching form data:", error)
            }
        }
        fetchData()
    }, [isEditing, initialData])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            let unitId = initialData?.id;

            if (isEditing && initialData) {
                // 1. Update unit in bot_monitoring (secondary/only table used now)
                await updateBaccaratRow({
                    id: initialData.id,
                    pc_name: formData.pc_name,
                    user_id: selectedAccount?.id || null,
                    franchise: selectedFranchise?.franchise_name || null,
                    franchise_id: selectedFranchise?.db_id ? Number(selectedFranchise.db_id) : null,
                    // Preserve existing values or use defaults
                    level: initialData.level ?? 1,
                    pattern: initialData.pattern ?? "",
                    target_profit: initialData.target_profit ?? 0,
                    bet_size: initialData.bet_size ?? 10,
                    strategy: initialData.strategy ?? "Standard",
                    status: initialData.status ?? "Idle",
                    duration: initialData.duration ?? 0,
                } as any)

                // 3. Update account linking if changed
                if (selectedAccount?.id !== originalAccountId) {
                    // Unlink old
                    if (originalAccountId) {
                        await updateAccount(originalAccountId, { unit_id: null });
                    }
                    // Link new
                    if (selectedAccount) {
                        await updateAccount(selectedAccount.id, { unit_id: initialData.id });
                    }
                }

                toast.success("Unit updated successfully")
            } else {
                // 1. Create in bot_monitoring
                const createdRows = await createBaccaratRow({
                    pc_name: formData.pc_name,
                    status: "Idle",
                    level: 1,
                    pattern: "",
                    target_profit: 0,
                    bet_size: 10,
                    strategy: "Standard",
                    duration: 0,
                    user_id: selectedAccount?.id || null,
                    franchise: selectedFranchise?.franchise_name || null,
                    franchise_id: selectedFranchise?.db_id ? Number(selectedFranchise.db_id) : null,
                })
                
                if (!createdRows || createdRows.length === 0) {
                    throw new Error("Failed to create unit: No data returned from database")
                }
                
                unitId = createdRows[0].id;

                // 3. Link account if selected
                if (selectedAccount) {
                    await updateAccount(selectedAccount.id, { unit_id: unitId });
                }

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
                        onChange={async (id) => {
                            const found = franchises.find(f => f.id === id) || null;
                            setSelectedFranchise(found);
                            if (found && found.franchise_code && found.db_id) {
                                try {
                                    const currentCount = await getFranchiseUnitCount(Number(found.db_id));
                                    setFormData(prev => ({ ...prev, pc_name: `${found.franchise_code}-${currentCount + 1}` }));
                                } catch (error) {
                                    console.error("Error generating PC name:", error);
                                    setFormData(prev => ({ ...prev, pc_name: found.franchise_code || "" }));
                                }
                            }
                        }}
                        options={franchises.map(f => ({ 
                            value: f.id, 
                            label: f.franchise_name || "Unknown"
                        }))}
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

                <div className="space-y-2">
                    <Label htmlFor="account">User Account</Label>
                    <SearchableSelect
                        id="account"
                        value={selectedAccount?.id || ""}
                        onChange={(id) => setSelectedAccount(accounts.find(a => a.id === id) || null)}
                        options={accounts.map(a => ({ 
                            value: a.id, 
                            label: `${a.first_name || ""} ${a.last_name || ""} (${a.email})`.trim() || a.email 
                        }))}
                        placeholder="Select user account"
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
