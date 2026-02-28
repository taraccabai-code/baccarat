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
import { Pencil, Trash2, Copy, Check, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { DeleteCredentialModal } from "@/components/modal/Delete/DeleteCredential"
import { deleteCredential } from "@/helper/credentials"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EditCredentialDialog } from "@/components/modal/Edit/EditCredentialDialog"

interface Credential {
    id: string
    created_at: string
    password?: string
    username?: string
    name?: string
    funder_account?: Array<{
        id: string
        package?: {
            funders?: {
                name: string
                allias: string
                allias_color: string
                text_color: string
            } | null
        } | null
    }> | null
    [key: string]: any
}

type SortConfig = {
    key: keyof Credential | null;
    direction: 'asc' | 'desc' | null;
};

interface CredentialsTableProps {
    data: Credential[]
    funders?: any[] // Keep for now if needed by other components, though unused here
}

export const CredentialsTable = ({ data, funders = [] }: CredentialsTableProps) => {
    const router = useRouter()
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [selectedCredential, setSelectedCredential] = useState<{ id: string, name: string } | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

    const handleCopy = async (password: string, id: string) => {
        try {
            await navigator.clipboard.writeText(password)
            setCopiedId(id)
            toast.success("Password copied to clipboard")
            setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
            toast.error("Failed to copy password")
        }
    }

    const requestSort = (key: keyof Credential) => {
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

    const SortableHeader = ({ label, sortKey, className }: { label: string, sortKey: keyof Credential, className?: string }) => {
        const isActive = sortConfig.key === sortKey;

        return (
            <TableHead
                className={`text-gray-400 font-bold uppercase text-[10px] tracking-wider cursor-pointer hover:text-white transition-colors px-4 pb-4 ${className}`}
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

    const handleDeleteClick = (id: string, name: string) => {
        setSelectedCredential({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCredential) return;

        setIsDeleting(true);
        try {
            await deleteCredential(selectedCredential.id);
            toast.success("Credential deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedCredential(null);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete credential");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                                                <SortableHeader label="ACCOUNT NAME" sortKey="account_name" />

                                                <SortableHeader label="USERNAME" sortKey="username" />

                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">PASSWORD</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.length === 0 ? (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={4} className="h-24 text-center text-gray-500 italic">
                                No credentials found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedData.map((credential) => (
                            <TableRow key={credential.id} className="border-gray-800 hover:bg-[#111] transition-colors">
                                <TableCell className="text-center text-gray-200 text-xs py-4">
                                    {credential.account_name || "-"}
                                </TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-4">{credential.username || "-"}</TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-4 font-mono">
                                    <div className="relative inline-flex items-center justify-center group w-[120px]">
                                        <span>********</span>
                                        <div className="absolute right-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#262626] ml-2"
                                                onClick={() => handleCopy(credential.password || "", credential.id)}
                                            >
                                                {copiedId === credential.id ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <EditCredentialDialog
                                            credential={credential}
                                            funders={funders}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-[#262626] text-muted-foreground hover:text-red-500 transition-colors"
                                            onClick={() => handleDeleteClick(credential.id, credential.account_name || "this credential")}
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

            <DeleteCredentialModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                credentialName={selectedCredential?.name || ""}
                isPending={isDeleting}
            />
        </div>
    )
}

export const CredentialsTableSkeleton = () => {
    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">ACCOUNT NAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">USERNAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">PASSWORD</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i} className="border-gray-800">
                            <TableCell>
                                <div className="flex justify-center">
                                    <Skeleton className="h-4 w-[150px] bg-[#1a1a1a]" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center">
                                    <Skeleton className="h-4 w-[120px] bg-[#1a1a1a]" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center">
                                    <Skeleton className="h-4 w-[100px] bg-[#1a1a1a]" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-center gap-2">
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
