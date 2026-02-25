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
import { DeletePackageModal } from "@/components/modal/Delete/DeletePackage"
import { deletePackage } from "@/helper/package"
import { toast } from "sonner"
import Link from "next/link"

interface Package {
    id: string
    name: string
    balance?: string | number
    phase?: string
    instrument?: string
    funders?: {
        name: string
    }
    [key: string]: any
}

interface PackagesTableProps {
    data: Package[]
    onEdit: (pkg: Package) => void
}

export const PackagesTable = ({ data, onEdit }: PackagesTableProps) => {
    const [selectedPackage, setSelectedPackage] = useState<{ id: string, name: string } | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: string, name: string) => {
        setSelectedPackage({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPackage) return;

        setIsDeleting(true);
        try {
            await deletePackage(selectedPackage.id);
            toast.success("Package deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedPackage(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete package");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">FUNDER</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">PACKAGE NAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">BALANCE</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">PHASE</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">INSTRUMENT</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={6} className="h-24 text-center text-gray-500 italic">
                                No packages found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow key={item.id} className="border-gray-800 hover:bg-[#111] transition-colors">
                                <TableCell className="text-center text-gray-200 text-xs py-4">
                                    {item.funders?.name || "-"}
                                </TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-4">{item.name}</TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-4">{item.balance || "-"}</TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-4">{item.phase || "-"}</TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-4">{item.symbol || "-"}</TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(item)}
                                            className="h-8 w-8 hover:bg-[#262626] text-muted-foreground hover:text-white transition-colors"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-[#262626] text-muted-foreground hover:text-red-500 transition-colors"
                                            onClick={() => handleDeleteClick(item.id, item.name)}
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

            <DeletePackageModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                packageName={selectedPackage?.name || ""}
                isPending={isDeleting}
            />
        </div>
    )
}

export const PackagesTableSkeleton = () => {
    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">FUNDER</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">PACKAGE NAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">BALANCE</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">PHASE</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">INSTRUMENT</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i} className="border-[#1a1a1a] hover:bg-transparent">
                            <TableCell className="py-4">
                                <Skeleton className="h-4 w-[100px] bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell className="py-4">
                                <Skeleton className="h-4 w-[120px] bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell className="py-4">
                                <Skeleton className="h-4 w-[80px] bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell className="py-4">
                                <Skeleton className="h-4 w-[80px] bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell className="py-4">
                                <Skeleton className="h-4 w-[80px] bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-8 rounded-md bg-[#1a1a1a]" />
                                    <Skeleton className="h-8 w-8 rounded-md bg-[#1a1a1a]" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
