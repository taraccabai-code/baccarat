"use client"

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlayBaccaratTable, type BaccaratRow } from "@/components/tables/play_baccarat"
import { createClient2 } from "@/lib/supabase/client"
import { getBaccaratData, updateBaccaratRow } from "@/helper/baccarat"
import { getFunders } from "@/helper/funders"

const PlayBacarratPage = () => {
    const [selectedFilter, setSelectedFilter] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [rows, setRows] = useState<BaccaratRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // IMPORTANT: Initialize Supabase client ONCE to prevent connection drops or duplicates
    const [supabase] = useState(() => createClient2())

    const [funders, setFunders] = useState<any[]>([])
    const [selectedFunder, setSelectedFunder] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    const fetchDropdownData = useCallback(async () => {
        try {
            const fundersData = await fetch("/api/funders").then(res => res.json()).catch(() => [])
            // Fallback to helper if API route doesn't exist or fails (since getFunders is a server action)
            // But this is a client component, so we should fetch funders differently or just use the data we have
            // Actually, let's use a server action if we can or just fetch from an endpoint.
            // For now, I'll assume we can use the getFunders helper if exported properly or fetch it.
        } catch (err) {
            console.error("Error fetching dropdown data:", err)
        }
    }, [])

    const fetchData = useCallback(async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true)
            const [baccaratData, fundersData] = await Promise.all([
                getBaccaratData(),
                getFunders()
            ])
            setRows(baccaratData as BaccaratRow[])
            setFunders(fundersData)
            setError(null)
        } catch (err: any) {
            console.error("Error fetching baccarat data:", err)
            setError("Failed to load data")
        } finally {
            if (showLoading) setLoading(false)
        }
    }, [])

    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())
    const [isUpdating, setIsUpdating] = useState(false)

    const handleUpdateRow = useCallback((updatedRow: Partial<BaccaratRow> & { id: string | number }) => {
        setRows(prevRows => prevRows.map(row =>
            String(row.id) === String(updatedRow.id) ? { ...row, ...updatedRow } : row
        ))
    }, [])

    const handleBulkStatusChange = useCallback(async (newStatus: "Running" | "Stopped") => {
        if (selectedRows.size === 0) return

        try {
            setIsUpdating(true)
            const updatePromises = Array.from(selectedRows).map(async (id) => {
                const row = rows.find(r => String(r.id) === String(id))
                if (!row) return

                await updateBaccaratRow({
                    id: row.id,
                    level: row.level,
                    pattern: row.pattern,
                    target_profit: Number(row.target_profit) || null,
                    bet_size: Number(row.bet_size) || null,
                    status: newStatus,
                    command: newStatus === "Running"
                })

                return { id: row.id, status: newStatus }
            })

            const updates = await Promise.all(updatePromises)

            // Update local state for all rows efficiently
            setRows(prevRows => prevRows.map(row => {
                if (selectedRows.has(row.id)) {
                    return { ...row, status: newStatus }
                }
                return row
            }))

            setSelectedRows(new Set())
            setError(null)
        } catch (err: any) {
            console.error("Bulk status update failed:", err)
            setError("Failed to update multiple bots. Some updates might have partially succeeded.")
        } finally {
            setIsUpdating(false)
        }
    }, [selectedRows, rows])

    useEffect(() => {
        fetchData(true)
    }, [fetchData])

    useEffect(() => {


        const channel = supabase
            .channel('bot_monitoring_realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bot_monitoring'
                },
                (payload) => {


                    if (payload.eventType === 'UPDATE') {
                        const newRow = payload.new as any
                        const update: any = { id: newRow.id }

                        // Selectively update only the fields present in the payload
                        if (newRow.pc_name !== undefined) update.units = newRow.pc_name
                        if (newRow.status !== undefined) update.status = newRow.status
                        if (newRow.balance !== undefined) update.user_balance = newRow.balance
                        if (newRow.bet !== undefined) update.bet_size = newRow.bet
                        if (newRow.level !== undefined) update.level = newRow.level
                        if (newRow.pattern !== undefined) update.pattern = newRow.pattern
                        if (newRow.target_profit !== undefined) update.target_profit = newRow.target_profit

                        handleUpdateRow(update)
                    } else if (payload.eventType === 'INSERT') {
                        fetchData()
                    } else if (payload.eventType === 'DELETE') {
                        setRows(prevRows => prevRows.filter(r => String(r.id) !== String(payload.old.id)))
                    }
                }
            )
            .subscribe((status) => {

            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, fetchData, handleUpdateRow])

    const filteredRows = useMemo(() => {
        let result = rows

        // Funder Filter (pc_name mapping)
        if (selectedFunder !== "all") {
            result = result.filter(row => (row.units || "").toLowerCase().includes(selectedFunder.toLowerCase()))
        }

        // Status Filter
        if (statusFilter !== "all") {
            result = result.filter(row => row.status === statusFilter)
        }

        // Search Query
        if (!searchQuery.trim()) return result

        const query = searchQuery.toLowerCase()

        return result.filter(row => {
            if (selectedFilter === "All") {
                return (
                    (row.units?.toLowerCase() || "").includes(query) ||
                    String(row.level || "").toLowerCase().includes(query) ||
                    (row.pattern?.toLowerCase() || "").includes(query) ||
                    (row.status?.toLowerCase() || "").includes(query)
                )
            }
            if (selectedFilter === "Units") {
                return (row.units?.toLowerCase() || "").includes(query)
            }
            if (selectedFilter === "Level") {
                return String(row.level || "").toLowerCase().includes(query)
            }
            if (selectedFilter === "Pattern") {
                return (row.pattern?.toLowerCase() || "").includes(query)
            }
            if (selectedFilter === "Status") {
                return (row.status?.toLowerCase() || "").includes(query)
            }
            return true
        })
    }, [rows, searchQuery, selectedFilter, selectedFunder, statusFilter])

    return (
        <div className="w-full h-full p-6">
            <div className="flex flex-row items-start gap-6">
                <div className="w-48 hidden flex-col gap-4">
                    <div className="w-48">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full bg-[#0a0a0a] border-gray-800 text-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Running">Running</SelectItem>
                                <SelectItem value="Burned">Burned</SelectItem>
                                <SelectItem value="Stopped">Stopped</SelectItem>
                                <SelectItem value="Idle (Remotely Stopped)">Idle</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-48">
                        <Select value={selectedFunder} onValueChange={setSelectedFunder}>
                            <SelectTrigger className="w-full bg-[#0a0a0a] border-gray-800 text-white">
                                <SelectValue placeholder="Funder" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
                                <SelectItem value="all">All Funders</SelectItem>
                                {funders.map((funder) => (
                                    <SelectItem key={funder.id} value={funder.name}>
                                        {funder.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium w-28 h-9 rounded-md border-0 flex items-center justify-between gap-2"
                                >
                                    {selectedFilter}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-gray-800 text-white">
                                <DropdownMenuItem
                                    className="hover:bg-gray-800 cursor-pointer"
                                    onClick={() => setSelectedFilter("All")}
                                >
                                    All
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="hover:bg-gray-800 cursor-pointer"
                                    onClick={() => setSelectedFilter("Units")}
                                >
                                    Units
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="hover:bg-gray-800 cursor-pointer"
                                    onClick={() => setSelectedFilter("Level")}
                                >
                                    Level
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="hover:bg-gray-800 cursor-pointer"
                                    onClick={() => setSelectedFilter("Pattern")}
                                >
                                    Pattern
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="hover:bg-gray-800 cursor-pointer"
                                    onClick={() => setSelectedFilter("Status")}
                                >
                                    Status
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search"
                                className="pl-10 h-9 bg-[#0a0a0a] border-gray-800 text-white placeholder:text-gray-500 rounded-md focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                className="bg-[#4ADE80] hover:bg-[#22c55e] text-white font-semibold h-9 px-6 rounded-md disabled:opacity-50"
                                onClick={() => handleBulkStatusChange("Running")}
                                disabled={selectedRows.size === 0 || loading || isUpdating}
                            >
                                Run
                            </Button>
                            <Button
                                className="bg-[#D32020] hover:bg-[#b91c1c] text-white font-semibold h-9 px-6 rounded-md disabled:opacity-50"
                                onClick={() => handleBulkStatusChange("Stopped")}
                                disabled={selectedRows.size === 0 || loading || isUpdating}
                            >
                                Stop
                            </Button>
                        </div>
                    </div>

                    <PlayBaccaratTable
                        data={filteredRows}
                        loading={loading}
                        error={error}
                        onRowUpdate={handleUpdateRow}
                        selectedRows={selectedRows}
                        onSelectionChange={setSelectedRows}
                    />
                </div>
            </div>
        </div>
    )
}

export default PlayBacarratPage
