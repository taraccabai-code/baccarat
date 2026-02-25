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
import { Trash2 } from "lucide-react"
import { DeleteAccountModal } from "@/components/modal/Delete/DeleteAccount"
import { deleteAccount } from "@/helper/accounts"
import { toast } from "sonner"
import Link from "next/link"
import { EditUserAccountDialog } from "@/components/modal/Edit/EditUserAccountDialog"
export { AccountsTableSkeleton } from "@/components/skeleton/AccountTableSkeleton"

interface Account {
    id: string
    first_name: string
    middle_name: string
    last_name: string
    email?: string
    address: string
    contact_number_1: string | number
    contact_number_2: string | number
    franchise?: string
    id_type: string
    billing: string
    [key: string]: any
}

interface AccountsTableProps {
    data: Account[]
    units?: any[]
    franchises?: any[]
    setAccounts: React.Dispatch<React.SetStateAction<any[]>>
}

export const AccountsTable = ({ data, units = [], franchises = [], setAccounts }: AccountsTableProps) => {
    const [selectedAccount, setSelectedAccount] = useState<{ id: string, name: string } | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: string, firstName: string, lastName: string) => {
        setSelectedAccount({ id, name: `${firstName} ${lastName}` });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedAccount) return;

        const accountToDelete = selectedAccount;
        const previousAccounts = [...data];

        setIsDeleting(true);
        // Optimistic update
        setAccounts(prev => prev.filter(acc => acc.id !== accountToDelete.id));

        try {
            await deleteAccount(accountToDelete.id);
            toast.success("Account deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedAccount(null);
        } catch (error: any) {
            // Rollback
            setAccounts(previousAccounts);
            toast.error(error.message || "Failed to delete account");
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        <div className="w-full space-y-4">
            <div className="border rounded-md border-gray-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#0a0a0a]">
                        <TableRow className="border-gray-800 hover:bg-transparent">
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">Actions</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">FRANCHISE</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">FIRST NAME</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">MIDDLE NAME</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">LAST NAME</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">EMAIL</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">ADDRESS</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">CONTACT NUMBER 1</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">CONTACT NUMBER 2</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow className="border-gray-800">
                                <TableCell colSpan={9} className="h-24 text-center text-gray-500 italic">
                                    No accounts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((account) => (
                                <TableRow key={account.id} className="border-gray-800">
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            <EditUserAccountDialog account={account} units={units} franchises={franchises} setAccounts={setAccounts} />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-[#262626] text-muted-foreground hover:text-red-500 transition-colors"
                                                onClick={() => handleDeleteClick(account.id, account.first_name, account.last_name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-gray-200 text-xs">{account.franchise || "-"}</TableCell>
                                    <TableCell className="text-center text-gray-200 text-xs">{account.first_name}</TableCell>
                                    <TableCell className="text-center text-gray-200 text-xs">{account.middle_name || "-"}</TableCell>
                                    <TableCell className="text-center text-gray-200 text-xs">{account.last_name}</TableCell>
                                    <TableCell className="text-center text-gray-200 text-xs">{account.email || "-"}</TableCell>
                                    <TableCell className="text-center text-gray-200 text-xs">
                                        {[account.address, account.city, account.province, account.zip_code]
                                            .filter(Boolean)
                                            .join(", ") || "-"}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-200 text-xs">{account.contact_number_1 || "-"}</TableCell>
                                    <TableCell className="text-center text-gray-200 text-xs">{account.contact_number_2 || "-"}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                accountName={selectedAccount?.name || ""}
                isPending={isDeleting}
            />
        </div>
    )
}


