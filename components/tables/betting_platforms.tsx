"use client"

import React, { useMemo, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { DeletePlatformModal } from "@/components/modal/Delete/DeletePlatform"
import { deletePlatformWebsite } from "@/helper/platform_websites"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export type BettingPlatform = {
    id: string | number
    name: string
    code: string
    website: string
    min_bet: number | string
    text_color?: string
    bg_color?: string
    raw?: any // Original record for editing
}

type SortConfig = {
    key: keyof BettingPlatform | null;
    direction: 'asc' | 'desc' | null;
};

interface BettingPlatformTableProps {
    data: BettingPlatform[]
    loading: boolean
    onEdit?: (platform: any) => void
}

export const BettingPlatformTable = ({ data, loading, onEdit }: BettingPlatformTableProps) => {
    const router = useRouter()
    const [selectedPlatform, setSelectedPlatform] = useState<{ id: string | number, name: string } | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

    const requestSort = (key: keyof BettingPlatform) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        let sortableData = [...data];
        if (sortConfig.key !== null && sortConfig.direction !== null) {
            sortableData.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    const SortableHeader = ({ label, sortKey, className }: { label: string, sortKey: keyof BettingPlatform, className?: string }) => {
        const isActive = sortConfig.key === sortKey;

        return (
            <TableHead
                className={`text-gray-400 font-bold uppercase text-[10px] tracking-wider cursor-pointer hover:text-white transition-colors px-4 h-10 ${className}`}
                onClick={() => requestSort(sortKey)}
            >
                <div className="flex items-center justify-center gap-1 select-none group">
                    <span>{label}</span>
                    <div className="transition-colors p-0.5">
                        {isActive ? (
                            sortConfig.direction === 'asc' ? (
                                <ArrowUp className="h-3 w-3 text-blue-500" />
                            ) : (
                                <ArrowDown className="h-3 w-3 text-blue-500" />
                            )
                        ) : (
                            <ArrowUpDown className="h-3 w-3 text-gray-500 group-hover:text-gray-300" />
                        )}
                    </div>
                </div>
            </TableHead>
        );
    };

    const handleDeleteClick = (id: string | number, name: string) => {
        setSelectedPlatform({ id, name })
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedPlatform) return

        setIsDeleting(true)
        try {
            await deletePlatformWebsite(selectedPlatform.id)
            toast.success("Platform deleted successfully")
            setIsDeleteModalOpen(false)
            setSelectedPlatform(null)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete platform")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <SortableHeader label="Platform Name" sortKey="name" />
                        <SortableHeader label="Platform Code" sortKey="code" />
                        <SortableHeader label="Platform Website" sortKey="website" />
                        <SortableHeader label="Minimum Bet" sortKey="min_bet" />
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={5} className="text-center text-gray-500 h-32 italic">
                                Loading platforms...
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && sortedData.length === 0 && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={5} className="text-center text-gray-500 h-32 italic">
                                No platforms found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && sortedData.length > 0 && sortedData.map((row) => (
                        <TableRow key={row.id} className="border-gray-800 hover:bg-[#111] transition-colors">
                            <TableCell className="text-center text-gray-200 text-xs py-4">
                                {row.name}
                            </TableCell>
                            <TableCell className="text-center py-4">
                                <span
                                    className="px-2.5 py-1 rounded-md text-xs font-medium"
                                    style={{
                                        backgroundColor: row.bg_color || 'transparent',
                                        color: row.text_color || '#e5e7eb',
                                    }}
                                >
                                    {row.code}
                                </span>
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs py-4">
                                <a
                                    href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    {row.website}
                                </a>
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs py-4">
                                {row.min_bet}
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-[#262626] text-muted-foreground hover:text-white transition-colors"
                                        onClick={() => onEdit?.(row.raw || row)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-[#262626] text-muted-foreground hover:text-red-500 transition-colors"
                                        onClick={() => handleDeleteClick(row.id, row.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <DeletePlatformModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                platformName={selectedPlatform?.name || ""}
                isPending={isDeleting}
            />
        </div>
    )
}
