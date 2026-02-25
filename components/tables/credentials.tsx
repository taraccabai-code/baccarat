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
                    {data.length === 0 ? (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={4} className="h-24 text-center text-gray-500 italic">
                                No credentials found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((credential) => (
                            <TableRow key={credential.id} className="border-gray-800 hover:bg-[#111] transition-colors">
                                <TableCell className="text-center text-gray-200 text-xs py-4">
                                    {credential.account_name || "-"}
                                </TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-4">{credential.username || "-"}</TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-4 font-mono">
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
