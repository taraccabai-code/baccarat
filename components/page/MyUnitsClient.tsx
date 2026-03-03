"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { UnitsSearch } from '@/components/search/UnitsSearch'
import { Plus, RefreshCw, Filter, ChevronDown, Check } from 'lucide-react'
import UnitsList from '@/components/list/UnitsList'
import { UnitModal } from '@/components/modal/Update/UnitModal'
import { Unit } from "@/types/units"
import { deleteUnit } from '@/helper/units'
import { DeleteUnitModal } from '@/components/modal/DeleteUnitModal'
import { FranchiseModal } from "@/components/modal/FranchiseModal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getFranchises } from '@/helper/franchise'
import { Franchise } from '@/types/franchise'
import { getBaccaratData, updateBaccaratRow } from '@/helper/baccarat'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface MyUnitsClientProps {
    initialUnits: any[];
}



export default function MyUnitsClient({ initialUnits }: MyUnitsClientProps) {
    const [units, setUnits] = useState<any[]>(initialUnits);
    const [searchQuery, setSearchQuery] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedUnitForDelete, setSelectedUnitForDelete] = useState<{ id: string, name: string } | null>(null);
    const [isFranchiseModalOpen, setIsFranchiseModalOpen] = useState(false);
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | null>(null);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const data = await getBaccaratData();
            // Map the baccarat data to match the Unit interface expected by UnitsList
            const mappedUnits = data.map((item: any) => ({
                id: item.id.toString(),
                unit_id: item.id.toString(),
                unit_name: item.units || item.pc_name || "Unknown PC",
                status: item.status || "disabled",
                balance: item.user_balance || item.balance,
                level: item.level,
                pattern: item.pattern,
                strategy: item.strategy,
                target_profit: item.target_profit,
                bet_size: item.bet_size,
                duration: item.duration,

                assigned_user: item.assigned_user || null,
                franchise_code: item.franchise_code || null
            }));
            setUnits(mappedUnits);
            toast.success("Units refreshed from baccarat monitor");
        } catch (error) {
            toast.error("Failed to refresh units");
        } finally {
            setIsRefreshing(false);
        }
    };

    const fetchFranchises = async () => {
        try {
            const data = await getFranchises();
            setFranchises(data || []);
        } catch (error) {
            console.error("Failed to fetch franchises", error);
        }
    };

    // Run on mount
    useEffect(() => {
        fetchFranchises();
    }, []); // Empty dependency array runs once on mount

    const handleEdit = (unit: any) => {
        setUnitToEdit(unit);
        setIsUnitModalOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        setSelectedUnitForDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUnitForDelete) return;

        setIsDeleting(true);
        try {
            await deleteUnit(selectedUnitForDelete.id);
            toast.success(`${selectedUnitForDelete.name} deleted successfully`);
            setIsDeleteModalOpen(false);
            setSelectedUnitForDelete(null);
            handleRefresh();
        } catch (error: any) {
            console.error("Error deleting unit:", error);
            toast.error("Failed to delete unit");
        } finally {
            setIsDeleting(false);
        }
    };



    const handleStatusChange = async (unitId: string, newStatus: any) => {
        try {
            setUnits((prev: any) => prev.map((u: any) =>
                u.id === unitId ? { ...u, status: newStatus } : u
            ));

            await updateBaccaratRow({
                id: unitId,
                status: newStatus,
                level: null,
                pattern: null,
                target_profit: null
            });
        } catch (error: any) {
            toast.error("Failed to update status");
            handleRefresh();
        }
    }

    const filteredUnits = React.useMemo(() => {
        return units.filter((unit: any) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = (
                unit.unit_name?.toLowerCase().includes(query) ||
                unit.franchise?.franchise_name?.toLowerCase().includes(query) ||
                unit.franchise?.franchise_code?.toLowerCase().includes(query)
            );
            const matchesFranchise = !selectedFranchiseId || unit.franchise_id === selectedFranchiseId;
            return matchesSearch && matchesFranchise;
        });
    }, [units, searchQuery, selectedFranchiseId]);

    return (
        <div className="flex flex-col h-full bg-[#050505] min-h-screen">
            <div className="px-6 pt-6 pb-6 bg-[#050505] sticky top-0 z-10 border-b border-gray-900/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-white tracking-tight">My Units</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="h-8 w-8 text-gray-500 hover:text-white"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <UnitsSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-10 border-gray-800 bg-[#0A0A0A] text-gray-400 hover:text-white hover:bg-gray-900 gap-2 shrink-0 px-4",
                                        selectedFranchiseId && "border-blue-600/50 bg-blue-600/5 text-blue-400 hover:text-blue-300"
                                    )}
                                >
                                    <Filter className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {selectedFranchiseId
                                            ? franchises.find(f => f.id === selectedFranchiseId)?.franchise_name
                                            : "Franchises"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-[#0A0A0A] border-gray-800 text-white">
                                <DropdownMenuLabel className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                                    Filter by Franchise
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-800" />
                                <DropdownMenuItem
                                    onClick={() => setSelectedFranchiseId(null)}
                                    className="gap-2 focus:bg-gray-900 focus:text-white cursor-pointer"
                                >
                                    <div className="w-4 flex items-center justify-center">
                                        {!selectedFranchiseId && <Check className="h-3 w-3 text-blue-500" />}
                                    </div>
                                    All Units
                                </DropdownMenuItem>
                                {franchises.map((f) => (
                                    <DropdownMenuItem
                                        key={f.id}
                                        onClick={() => setSelectedFranchiseId(f.id === selectedFranchiseId ? null : f.id)}
                                        className="gap-2 focus:bg-gray-900 focus:text-white cursor-pointer"
                                    >
                                        <div className="w-4 flex items-center justify-center">
                                            {selectedFranchiseId === f.id && <Check className="h-3 w-3 text-blue-500" />}
                                        </div>
                                        {f.franchise_name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            onClick={() => setIsFranchiseModalOpen(true)}
                            className="h-10 bg-[#16a34a] hover:bg-[#15803d] text-white font-medium px-4 gap-2 shadow-lg shadow-green-900/10 transition-all active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Franchise</span>
                            <span className="sm:hidden">Franchise</span>
                        </Button>

                        <Button
                            onClick={() => {
                                setUnitToEdit(null);
                                setIsUnitModalOpen(true);
                            }}
                            className="h-10 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 gap-2 shadow-lg shadow-blue-900/10 transition-all active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Unit</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="h-full">
                <UnitsList
                    units={filteredUnits}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                />
            </div>

            <UnitModal
                isOpen={isUnitModalOpen}
                initialData={unitToEdit}
                onClose={() => {
                    setIsUnitModalOpen(false);
                    setUnitToEdit(null);
                }}
                onSuccess={() => {
                    handleRefresh();
                    setIsUnitModalOpen(false);
                    setUnitToEdit(null);
                }}
            />

            <DeleteUnitModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                unitName={selectedUnitForDelete?.name || ""}
                isPending={isDeleting}
            />



            <FranchiseModal
                isOpen={isFranchiseModalOpen}
                onClose={() => setIsFranchiseModalOpen(false)}
            />
        </div>
    )
}
