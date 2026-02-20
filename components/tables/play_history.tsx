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

export type IncomeViewMode = "per_game" | "daily"

export type DailyAggregatedRow = {
    date: string
    pc_name: string
    level: number | string
    bet_size: number | string
    start_balance: number
    end_balance: number
    dailyIncome: number
}

export const PlayHistoryTable = ({
    data,
    loading,
    viewMode = "per_game",
}: {
    data: PlayHistory[] | DailyAggregatedRow[]
    loading: boolean
    viewMode?: IncomeViewMode
}) => {
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

    const formatDateOnly = (dateString?: string) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        })
    }

    const getIncomeColor = (income: number) => {
        if (income === 0) return "text-white"
        return income > 0 ? "text-green-400" : "text-red-400"
    }

    const getValueColor = (value: number | string | undefined) => {
        if (value === 0) return "text-white"
        return "text-gray-200"
    }

    const isDaily = viewMode === "daily"

    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            {isDaily ? "Date" : "Date/Time"}
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
                            {isDaily ? "Starting Day Capital" : "Starting Capital"}
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            {isDaily ? "End Day Capital" : "End Capital"}
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            {isDaily ? "Daily Income" : "Per Game Income"}
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Commission
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={8} className="text-center text-gray-500 h-32 italic">
                                Loading history...
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && data.length === 0 && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={8} className="text-center text-gray-500 h-32 italic">
                                No history found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && data.length > 0 && isDaily && (data as DailyAggregatedRow[]).map((row, idx) => {
                        const income = row.dailyIncome
                        const commission = income > 0 ? income * 0.05 : 0
                        return (
                            <TableRow key={`daily-${idx}`} className="border-gray-800 hover:bg-[#1a1a1a]/50">
                                <TableCell className="text-center text-gray-200 text-xs py-3">
                                    {formatDateOnly(row.date)}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${getValueColor(row.pc_name)}`}>
                                    {row.pc_name}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${getValueColor(row.level)}`}>
                                    {row.level}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${getValueColor(row.bet_size)}`}>
                                    {row.bet_size}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${getValueColor(row.start_balance)}`}>
                                    {row.start_balance === 0 ? "0" : row.start_balance}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${getValueColor(row.end_balance)}`}>
                                    {row.end_balance === 0 ? "0" : row.end_balance}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${getIncomeColor(income)}`}>
                                    {income === 0 ? "0.00" : `${income > 0 ? "+" : ""}${income.toFixed(2)}`}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${commission === 0 ? "text-white" : "text-yellow-400"}`}>
                                    {commission === 0 ? "0.00" : commission.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        )
                    })}

                    {!loading && data.length > 0 && !isDaily && (data as PlayHistory[]).map((row) => {
                        const perGameIncome = (row.end_balance || 0) - (row.start_balance || 0)
                        return (
                            <TableRow key={row.id} className="border-gray-800 hover:bg-[#1a1a1a]/50">
                                <TableCell className="text-center text-gray-200 text-xs py-3">
                                    {formatDate(row.created_at)}
                                </TableCell>
                                <TableCell className="text-center text-gray-200 text-xs py-3">
                                    {row.pc_name}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${getValueColor(row.level)}`}>
                                    {row.level}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${getValueColor(row.bet_size)}`}>
                                    {row.bet_size}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${getValueColor(row.start_balance)}`}>
                                    {row.start_balance === 0 ? "0" : row.start_balance}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${getValueColor(row.end_balance)}`}>
                                    {row.end_balance === 0 ? "0" : row.end_balance}
                                </TableCell>
                                <TableCell className={`text-center text-xs py-3 ${getIncomeColor(perGameIncome)}`}>
                                    {perGameIncome === 0 ? "0.00" : `${perGameIncome > 0 ? "+" : ""}${perGameIncome.toFixed(2)}`}
                                </TableCell>
                                <TableCell className="text-center text-xs py-3 text-gray-500">
                                    -
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
