"use client"

import React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Edit2 } from "lucide-react"

export type BettingPlatform = {
    id: string | number
    name: string
    website: string
    min_bet: number | string
    raw?: any // Original record for editing
}

interface BettingPlatformTableProps {
    data: BettingPlatform[]
    loading: boolean
    onEdit?: (platform: any) => void
}

export const BettingPlatformTable = ({ data, loading, onEdit }: BettingPlatformTableProps) => {
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
                    {loading && (
                        <TableRow className="border-gray-800 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            <TableCell colSpan={3} className="text-center text-gray-500 h-32 italic">
                                Loading platforms...
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && data.length === 0 && (
                        <TableRow className="border-gray-800 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            <TableCell colSpan={3} className="text-center text-gray-500 h-32 italic">
                                No platforms found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && data.length > 0 && data.map((row) => (
                        <TableRow key={row.id} className="border-gray-800 hover:bg-[#1a1a1a]/50">
                            <TableCell className="text-center text-gray-200 text-xs py-3">
                                {row.name}
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs py-3">
                                <a
                                    href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    {row.website}
                                </a>
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs py-3">
                                {row.min_bet}
                            </TableCell>
                            <TableCell className="text-center py-3">
                                <button
                                    onClick={() => onEdit?.(row.raw || row)}
                                    className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors bg-gray-800/50 rounded-md border border-gray-700 hover:border-blue-400/50"
                                    title="Edit Platform"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
