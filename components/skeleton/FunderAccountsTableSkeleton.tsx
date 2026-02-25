"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"


export const FunderAccountsTableSkeleton = () => {
    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">UNIT</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">USER</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">ACCOUNT ID</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">PACKAGE</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">FUNDER</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">STATUS</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">DATE</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4 pb-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i} className="border-gray-800 hover:bg-transparent">
                            <TableCell>
                                <Skeleton className="h-4 w-12 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-28 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-12 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-16 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-20 mx-auto bg-[#1a1a1a] rounded-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20 mx-auto bg-[#1a1a1a]" />
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