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
import { Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { DeleteAccountModal } from "@/components/modal/Delete/DeleteAccount"
import { deleteAccount } from "@/helper/accounts"
import { toast } from "sonner"
import Link from "next/link"
import { EditUserAccountDialog } from "@/components/modal/Edit/EditUserAccountDialog"
import { useMemo } from "react"
export { AccountsTableSkeleton } from "@/components/skeleton/AccountTableSkeleton"

interface Account {
    id: string
    first_name: string
    last_name: string
    email?: string
    contact_number_1: string | number
    contact_number_2: string | number
    franchise?: string
    id_type: string
    billing: string
    [key: string]: any
}

type SortConfig = {
    key: keyof Account | null;
    direction: 'asc' | 'desc' | null;
};

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
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

    const requestSort = (key: keyof Account) => {
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

    const SortableHeader = ({ label, sortKey, className }: { label: string, sortKey: keyof Account, className?: string }) => {
        const isActive = sortConfig.key === sortKey;

        return (
            <TableHead
                className={`text-gray-400 font-bold uppercase text-[10px] tracking-wider cursor-pointer hover:text-white transition-colors px-4 ${className}`}
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
                            <SortableHeader label="FRANCHISE" sortKey="franchise" />
                            <SortableHeader label="FIRST NAME" sortKey="first_name" />
                            <SortableHeader label="LAST NAME" sortKey="last_name" />
                            <SortableHeader label="EMAIL" sortKey="email" />
                            <SortableHeader label="CONTACT NUMBER 1" sortKey="contact_number_1" />
                            <SortableHeader label="CONTACT NUMBER 2" sortKey="contact_number_2" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.length === 0 ? (
                            <TableRow className="border-gray-800">
                                <TableCell colSpan={7} className="h-24 text-center text-gray-500 italic">
                                    No accounts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedData.map((account) => (
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
                                    <TableCell className="text-center text-gray-200 text-xs">{account.last_name}</TableCell>
                                    <TableCell className="text-center text-gray-200 text-xs">{account.email || "-"}</TableCell>
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


