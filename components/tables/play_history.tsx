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
import { PlayHistory } from "@/helper/play_history"

export const PlayHistoryTable = ({ data, loading }: { data: PlayHistory[], loading: boolean }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        })
    }

    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Date/Time
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Unit
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Martingale Level
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Bet Size
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Starting Day Capital
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            End Day Capital
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Daily Income
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={7} className="text-center text-gray-500 h-32 italic">
                                Loading history...
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && data.length === 0 && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={7} className="text-center text-gray-500 h-32 italic">
                                No history found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && data.length > 0 && data.map((row) => {
                        const dailyIncome = (row.end_balance || 0) - (row.start_balance || 0)
                        return (
                            <TableRow key={row.id} className="border-gray-800 hover:bg-[#1a1a1a]/50">
                                <TableCell className="text-center text-gray-200 text-xs py-3">
                                    {formatDate(row.created_at)}
                                </TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-3">
                                    {row.pc_name}
                                </TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-3">
                                    {row.level}
                                </TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-3">
                                    {row.bet_size}
                                </TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-3">
                                    {row.start_balance}
                                </TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-3">
                                    {row.end_balance}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${dailyIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    {dailyIncome > 0 ? "+" : ""}{dailyIncome.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
