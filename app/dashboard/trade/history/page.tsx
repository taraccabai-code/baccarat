"use client"

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { History, Search, ChevronDown, CalendarIcon, X } from 'lucide-react'
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { DateRange } from "react-day-picker"

type Franchise = {
    id: string
    name: string
    units?: { pc_name?: string }[]
}

const TradeHistoryPage = () => {
    const [data, setData] = useState<PlayHistory[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    // Franchise filter state
    const [franchises, setFranchises] = useState<Franchise[]>([])
    const [selectedFranchise, setSelectedFranchise] = useState("All")

    // Date filter state
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [datePopoverOpen, setDatePopoverOpen] = useState(false)

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

    const fetchFranchises = useCallback(async () => {
        try {
            const supabase = createClient2()
            // Fetch franchises with their unit pc_names
            const { data: franchiseData, error } = await supabase
                .from("franchise")
                .select("id, name, units(pc_name)")
                .order("name", { ascending: true })

            if (error) {
                console.error("Error fetching franchises:", error)
                return
            }
            setFranchises((franchiseData as Franchise[]) || [])
        } catch (error) {
            console.error("Failed to fetch franchises", error)
        }
    }, [])

    useEffect(() => {
        fetchHistory()
        fetchFranchises()

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
    }, [fetchHistory, fetchFranchises])

    // Build a lookup: pc_name -> franchise name
    const pcNameToFranchise = useMemo(() => {
        const map: Record<string, string> = {}
        franchises.forEach((f) => {
            (f.units || []).forEach((u) => {
                if (u.pc_name) {
                    map[u.pc_name] = f.name
                }
            })
        })
        return map
    }, [franchises])

    const filteredData = useMemo(() => {
        let result = data

        // Apply franchise filter
        if (selectedFranchise !== "All") {
            const unitNames = new Set<string>()
            franchises.forEach((f) => {
                if (f.name === selectedFranchise) {
                    (f.units || []).forEach((u) => {
                        if (u.pc_name) unitNames.add(u.pc_name)
                    })
                }
            })
            result = result.filter(row => unitNames.has(row.pc_name))
        }

        // Apply date range filter
        if (dateRange?.from) {
            const from = startOfDay(dateRange.from)
            const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)
            result = result.filter(row => {
                if (!row.created_at) return false
                const rowDate = new Date(row.created_at)
                return isWithinInterval(rowDate, { start: from, end: to })
            })
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(row =>
                (row.pc_name?.toLowerCase() || "").includes(query) ||
                String(row.level || "").toLowerCase().includes(query) ||
                String(row.bet_size || "").toLowerCase().includes(query) ||
                (row.created_at?.toLowerCase() || "").includes(query)
            )
        }

        return result
    }, [data, selectedFranchise, dateRange, franchises, searchQuery])

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

            <div className="flex items-center gap-3 mb-6 flex-wrap">
                {/* Franchise Filter Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium min-w-[140px] h-9 rounded-md border-0 flex items-center justify-between gap-2"
                        >
                            <span className="truncate">{selectedFranchise === "All" ? "All Franchise" : selectedFranchise}</span>
                            <ChevronDown className="h-4 w-4 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-gray-800 text-white" side="bottom" sideOffset={4}>
                        <DropdownMenuItem
                            className="hover:bg-gray-800 cursor-pointer"
                            onClick={() => setSelectedFranchise("All")}
                        >
                            All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="hover:bg-gray-800 cursor-pointer"
                            onClick={() => setSelectedFranchise("Alpha Pro")}
                        >
                            Alpha Pro
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="hover:bg-gray-800 cursor-pointer"
                            onClick={() => setSelectedFranchise("Gamma Systems")}
                        >
                            Gamma Systems
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="hover:bg-gray-800 cursor-pointer"
                            onClick={() => setSelectedFranchise("Beta Global")}
                        >
                            Beta Global
                        </DropdownMenuItem>
                        {franchises.filter(f => !["Alpha Pro", "Gamma Systems", "Beta Global"].includes(f.name)).map((f) => (
                            <DropdownMenuItem
                                key={f.id}
                                className="hover:bg-gray-800 cursor-pointer"
                                onClick={() => setSelectedFranchise(f.name)}
                            >
                                {f.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Date Range Calendar Filter */}
                <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`h-9 min-w-[200px] rounded-md border-gray-700 bg-[#0a0a0a] text-gray-200 hover:bg-[#1a1a1a] hover:text-white flex items-center justify-between gap-2 ${dateRange?.from ? "text-white" : "text-gray-500"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 shrink-0" />
                                <span className="truncate">
                                    {dateRange?.from
                                        ? dateRange.to
                                            ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                                            : format(dateRange.from, "MMM dd, yyyy")
                                        : "Filter by date"}
                                </span>
                            </div>
                            {dateRange?.from && (
                                <X
                                    className="h-3 w-3 shrink-0 text-gray-400 hover:text-white"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDateRange(undefined)
                                    }}
                                />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#0a0a0a] border-gray-800" align="start">
                        <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            autoFocus
                            numberOfMonths={2}
                            className="text-white"
                            classNames={{
                                selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white rounded-md",
                                range_start: "bg-blue-600 text-white rounded-l-md",
                                range_end: "bg-blue-600 text-white rounded-r-md",
                                range_middle: "bg-blue-600/20 text-blue-200",
                                today: "bg-gray-800 text-white rounded-md",
                                day_button: "h-9 w-9 p-0 font-normal text-gray-200 hover:bg-gray-800 rounded-md",
                                weekday: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                                caption_label: "text-sm font-medium text-white",
                                button_previous: "h-7 w-7 bg-transparent p-0 text-gray-400 hover:text-white border border-gray-700 rounded-md hover:bg-gray-800 inline-flex items-center justify-center absolute left-1",
                                button_next: "h-7 w-7 bg-transparent p-0 text-gray-400 hover:text-white border border-gray-700 rounded-md hover:bg-gray-800 inline-flex items-center justify-center absolute right-1",
                                month_grid: "w-full border-collapse",
                                day: "h-9 w-9 text-center text-sm p-0",
                                outside: "text-gray-700 opacity-50",
                            }}
                        />
                    </PopoverContent>
                </Popover>
                {/* Search input */}
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