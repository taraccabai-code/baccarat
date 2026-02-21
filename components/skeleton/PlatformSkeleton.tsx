"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export const FundersTableSkeleton = () => {
    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Platform Name
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Platform Website
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Minimum Bet
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i} className="border-gray-800 hover:bg-transparent">
                            <TableCell className="text-center py-3">
                                <Skeleton className="h-4 w-[120px] bg-[#1a1a1a] mx-auto" />
                            </TableCell>
                            <TableCell className="text-center py-3">
                                <Skeleton className="h-4 w-[180px] bg-[#1a1a1a] mx-auto" />
                            </TableCell>
                            <TableCell className="text-center py-3">
                                <Skeleton className="h-4 w-[60px] bg-[#1a1a1a] mx-auto" />
                            </TableCell>
                            <TableCell className="text-center py-3">
                                <div className="flex items-center justify-center">
                                    <Skeleton className="h-7 w-7 rounded-md bg-[#1a1a1a]" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
