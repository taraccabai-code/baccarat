"use client"

import React, { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Funder } from "@/types/funder"
import { DeleteFunderModal } from "@/components/modal/Delete/DeleteFunder"
import { deleteFunder } from "@/helper/funders"
import { toast } from "sonner"
import Link from "next/link"


const formatResetTime = (time?: string | null) => {
    if (!time) return "-";

    // Extract HH:mm from various formats (ISO, HH:mm:ss, HH:mm)
    let hours = "";
    let minutes = "";

    if (time.includes('T')) {
        const date = new Date(time);
        if (!isNaN(date.getTime())) {
            hours = date.getHours().toString().padStart(2, '0');
            minutes = date.getMinutes().toString().padStart(2, '0');
        }
    } else {
        const parts = time.split(':');
        if (parts.length >= 2) {
            hours = parts[0].padStart(2, '0');
            minutes = parts[1].padStart(2, '0');
        }
    }

    if (hours && minutes) {
        return `${hours}:${minutes} GMT+08:00 (Hong Kong)`;
    }

    return `${time} GMT+08:00 (Hong Kong)`;
}

interface FundersTableProps {
    data: Funder[]
    onEdit: (funder: Funder) => void
}

export const FundersTable = ({ data, onEdit }: FundersTableProps) => {
    const [selectedFunder, setSelectedFunder] = useState<{ id: string, name: string | null } | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: string, name: string | null) => {
        setSelectedFunder({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedFunder) return;

        setIsDeleting(true);
        try {
            await deleteFunder(selectedFunder.id);
            toast.success("Funder deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedFunder(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete funder");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">FUNDER NAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">FUNDER ALIAS</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">RESET TIME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={4} className="h-24 text-center text-gray-500 italic">
                                No funders found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((funder) => (
                            <TableRow key={funder.id} className="border-gray-800 hover:bg-[#111] transition-colors">
                                <TableCell className="text-center text-gray-200 text-xs py-4">{funder.name || "-"}</TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-4">{funder.allias || "-"}</TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-4">{formatResetTime(funder.reset_time)}</TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(funder)}
                                            className="h-8 w-8 hover:bg-[#262626] text-muted-foreground hover:text-white transition-colors"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteClick(funder.id, funder.name)}
                                            className="h-8 w-8 hover:bg-[#262626] text-muted-foreground hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <DeleteFunderModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                funderName={selectedFunder?.name || ""}
                isPending={isDeleting}
            />
        </div>
    )
}
