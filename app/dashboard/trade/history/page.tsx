"use client"

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { History, Search, ChevronDown } from 'lucide-react'
import { PlayHistoryTable } from '@/components/tables/play_history'
import { createClient2 } from "@/lib/supabase/client"
import { getPlayHistory, PlayHistory } from "@/helper/play_history"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TradeHistoryPage = () => {
    const [data, setData] = useState<PlayHistory[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFilter, setSelectedFilter] = useState("All")

    const fetchHistory = useCallback(async () => {
        try {
            const history = await getPlayHistory()
            setData(history)
        } catch (error) {
            console.error("Failed to fetch play history", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchHistory()

        const supabase = createClient2()
        const channel = supabase
            .channel('play_history_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'play_history'
                },
                () => {
                    fetchHistory()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchHistory])

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data

        const query = searchQuery.toLowerCase()

        return data.filter(row => {
            if (selectedFilter === "All") {
                return (
                    (row.pc_name?.toLowerCase() || "").includes(query) ||
                    String(row.level || "").toLowerCase().includes(query) ||
                    (row.created_at?.toLowerCase() || "").includes(query)
                )
            }
            if (selectedFilter === "Units") {
                return (row.pc_name?.toLowerCase() || "").includes(query)
            }
            if (selectedFilter === "Level") {
                return String(row.level || "").toLowerCase().includes(query)
            }
            return true
        })
    }, [data, searchQuery, selectedFilter])

    return (
        <div className="animate-in fade-in duration-500 w-full p-8 bg-[#050505] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <History className="h-6 w-6 text-muted-foreground" />
                        Play History
                    </h2>
                    <p className="text-sm text-muted-foreground">Review completed playing sessions and their parameters.</p>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
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
            </div>

            <PlayHistoryTable data={filteredData} loading={loading} />
        </div>
    )
}

export default TradeHistoryPage