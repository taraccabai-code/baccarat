"use client"

import React, { useState, useMemo } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
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

type SortKey = "date" | "pc_name" | "level" | "bet_size" | "start_balance" | "end_balance" | "income" | "commission"

type SortConfig = {
    key: SortKey | null
    direction: 'asc' | 'desc' | null
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
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null })

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

    const handleSort = (key: SortKey) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                if (prev.direction === 'asc') return { key, direction: 'desc' }
                if (prev.direction === 'desc') return { key: null, direction: null }
            }
            return { key, direction: 'asc' }
        })
    }

    const SortIcon = ({ columnKey }: { columnKey: SortKey }) => (
        <div
            className="cursor-pointer hover:text-gray-200 transition-colors p-0.5"
            onClick={() => handleSort(columnKey)}
        >
            {sortConfig.key === columnKey ? (
                sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-500" /> : <ArrowDown className="h-3 w-3 text-blue-500" />
            ) : (
                <ArrowUpDown className="h-3 w-3 text-gray-500" />
            )}
        </div>
    )

    // Helper to extract sortable values from either row type
    const getSortValue = (row: PlayHistory | DailyAggregatedRow, key: SortKey): number | string => {
        if (isDaily) {
            const r = row as DailyAggregatedRow
            switch (key) {
                case "date": return r.date ? new Date(r.date).getTime() : 0
                case "pc_name": return r.pc_name || ""
                case "level": return typeof r.level === "number" ? r.level : 0
                case "bet_size": return typeof r.bet_size === "number" ? r.bet_size : 0
                case "start_balance": return r.start_balance
                case "end_balance": return r.end_balance
                case "income": return r.dailyIncome
                case "commission": return r.dailyIncome > 0 ? r.dailyIncome * 0.05 : 0
                default: return 0
            }
        } else {
            const r = row as PlayHistory
            switch (key) {
                case "date": return r.created_at ? new Date(r.created_at).getTime() : 0
                case "pc_name": return r.pc_name || ""
                case "level": return r.level || 0
                case "bet_size": return r.bet_size || 0
                case "start_balance": return r.start_balance || 0
                case "end_balance": return r.end_balance || 0
                case "income": return (r.end_balance || 0) - (r.start_balance || 0)
                case "commission": return 0 // N/A for per game
                default: return 0
            }
        }
    }

    const sortedData = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) return data

        return [...data].sort((a, b) => {
            const aValue = getSortValue(a, sortConfig.key!)
            const bValue = getSortValue(b, sortConfig.key!)

            if (aValue === bValue) return 0

            const direction = sortConfig.direction === 'asc' ? 1 : -1

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return (aValue - bValue) * direction
            }

            return String(aValue).localeCompare(String(bValue)) * direction
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, sortConfig, isDaily])

    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>{isDaily ? "Date" : "Date/Time"}</span>
                                <SortIcon columnKey="date" />
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Unit</span>
                                <SortIcon columnKey="pc_name" />
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Martingale Level</span>
                                <SortIcon columnKey="level" />
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Bet Size</span>
                                <SortIcon columnKey="bet_size" />
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>{isDaily ? "Starting Day Capital" : "Starting Capital"}</span>
                                <SortIcon columnKey="start_balance" />
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>{isDaily ? "End Day Capital" : "End Capital"}</span>
                                <SortIcon columnKey="end_balance" />
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>{isDaily ? "Daily Income" : "Per Game Income"}</span>
                                <SortIcon columnKey="income" />
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Commission</span>
                                {isDaily && <SortIcon columnKey="commission" />}
                            </div>
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

                    {!loading && sortedData.length > 0 && isDaily && (sortedData as DailyAggregatedRow[]).map((row, idx) => {
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

                    {!loading && sortedData.length > 0 && !isDaily && (sortedData as PlayHistory[]).map((row) => {
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
