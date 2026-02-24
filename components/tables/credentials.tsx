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
import { Pencil, Trash2, Copy, Check } from "lucide-react"
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
        <div className="w-full">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">ACCOUNT NAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">USERNAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">PASSWORD</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow className="border-[#1a1a1a]">
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No credentials found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((credential) => (
                            <TableRow key={credential.id} className="border-gray-800 hover:bg-[#1a1a1a]/50 transition-colors">
                                <TableCell className="text-center text-gray-200 text-xs py-3">
                                    {credential.account_name || "-"}
                                </TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-3">{credential.username || "-"}</TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-3 font-mono">
                                    <div className="flex items-center justify-center gap-2 group">
                                        <span>********</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#262626]"
                                            onClick={() => handleCopy(credential.password || "", credential.id)}
                                        >
                                            {copiedId === credential.id ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <EditCredentialDialog
                                            credential={credential}
                                            funders={funders}
                                        />
                                        <button
                                            onClick={() => handleDeleteClick(credential.id, credential.account_name || "this credential")}
                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-gray-800/50 rounded-md border border-gray-700 hover:border-red-500/50"
                                            title="Delete Credential"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
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
        <div className="w-full">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">ACCOUNT NAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">USERNAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">PASSWORD</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i} className="border-gray-800 hover:bg-transparent">
                            <TableCell className="py-3">
                                <div className="flex justify-center">
                                    <Skeleton className="h-4 w-[150px] bg-[#1a1a1a]" />
                                </div>
                            </TableCell>
                            <TableCell className="py-3">
                                <div className="flex justify-center">
                                    <Skeleton className="h-4 w-[120px] bg-[#1a1a1a]" />
                                </div>
                            </TableCell>
                            <TableCell className="py-3">
                                <div className="flex justify-center">
                                    <Skeleton className="h-4 w-[100px] bg-[#1a1a1a]" />
                                </div>
                            </TableCell>
                            <TableCell className="py-3">
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
