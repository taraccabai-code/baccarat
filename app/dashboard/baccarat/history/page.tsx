"use client"

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { History, Search, ChevronDown, CalendarIcon, X, Download } from 'lucide-react'
import { PlayHistoryTable, IncomeViewMode, DailyAggregatedRow } from '@/components/tables/play_history'
import { getPlayHistory, PlayHistory } from "@/helper/play_history"
import { getFranchises } from "@/helper/franchise"
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
    const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: new Date(), to: new Date() })
    const [datePopoverOpen, setDatePopoverOpen] = useState(false)

    // Income view mode state
    const [incomeViewMode, setIncomeViewMode] = useState<IncomeViewMode>("per_game")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 100

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
            const franchiseData = await getFranchises()

            // Map database columns to the component's expected format.
            const formatted = (franchiseData || []).map((f: any) => ({
                id: f.franchise_name,
                name: f.franchise_name,
                units: [] // The current schema doesn't support the nested units join.
            }))

            setFranchises(formatted as Franchise[])
        } catch (error) {
            console.error("Failed to fetch franchises", error)
        }
    }, [])

    useEffect(() => {
        fetchHistory()
        fetchFranchises()
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
            const firstWord = selectedFranchise.split(" ")[0].toLowerCase()
            const unitNames = new Set<string>()
            franchises.forEach((f) => {
                if (f.name === selectedFranchise) {
                    (f.units || []).forEach((u) => {
                        if (u.pc_name) unitNames.add(u.pc_name)
                    })
                }
            })
            result = result.filter(row => {
                const pcName = row.pc_name || ""
                return unitNames.has(pcName) || pcName.toLowerCase().includes(firstWord)
            })
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

    // Aggregate data by date + unit for Daily view
    const dailyAggregatedData = useMemo<DailyAggregatedRow[]>(() => {
        if (incomeViewMode !== "daily") return []

        // Group by date (YYYY-MM-DD) + pc_name
        const grouped: Record<string, PlayHistory[]> = {}
        filteredData.forEach(row => {
            const dateKey = row.created_at
                ? new Date(row.created_at).toLocaleDateString("en-CA") // YYYY-MM-DD format
                : "unknown"
            const key = `${dateKey}|||${row.pc_name || "unknown"}`
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(row)
        })

        // Convert groups to aggregated rows
        const result: DailyAggregatedRow[] = Object.entries(grouped).map(([key, rows]) => {
            const [dateStr, pcName] = key.split("|||")
            // Sort rows by created_at ascending to get first and last of the day
            const sorted = [...rows].sort((a, b) => {
                const da = a.created_at ? new Date(a.created_at).getTime() : 0
                const db = b.created_at ? new Date(b.created_at).getTime() : 0
                return da - db
            })
            const firstRow = sorted[0]
            const lastRow = sorted[sorted.length - 1]
            const startBalance = firstRow.start_balance || 0
            const endBalance = lastRow.end_balance || 0
            const dailyIncome = endBalance - startBalance

            return {
                date: dateStr === "unknown" ? "" : `${dateStr}T00:00:00`,
                pc_name: pcName,
                level: "-",
                bet_size: "-",
                start_balance: startBalance,
                end_balance: endBalance,
                dailyIncome,
            }
        })

        // Sort by date descending
        result.sort((a, b) => {
            const da = a.date ? new Date(a.date).getTime() : 0
            const db = b.date ? new Date(b.date).getTime() : 0
            return db - da
        })

        return result
    }, [filteredData, incomeViewMode])

    const displayData = incomeViewMode === "daily" ? dailyAggregatedData : filteredData

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedFranchise, dateRange, incomeViewMode])

    const totalPages = Math.ceil(displayData.length / itemsPerPage)
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return displayData.slice(startIndex, startIndex + itemsPerPage)
    }, [displayData, currentPage, itemsPerPage])

    const handleDownloadCSV = useCallback(() => {
        if (selectedFranchise === "All" || displayData.length === 0) return

        const isDaily = incomeViewMode === "daily"

        const headers = [
            isDaily ? "Date" : "Date/Time",
            "Unit",
            isDaily ? "Starting Day Capital" : "Starting Capital",
            isDaily ? "End Day Capital" : "End Capital",
            isDaily ? "Daily Income" : "Per Game Income",
            "Commission"
        ]

        const csvRows = [headers.join(",")]
        let totalIncome = 0
        let totalCommission = 0

        if (isDaily) {
            (displayData as DailyAggregatedRow[]).forEach(row => {
                const income = row.dailyIncome
                if (income <= 0) return

                totalIncome += income
                const commission = income > 0 ? income * 0.05 : 0
                totalCommission += commission

                const dateStr = row.date ? format(new Date(row.date), "MMM dd, yyyy") : "-"

                const csvRow = [
                    `"=""${dateStr}"""`,
                    `"${row.pc_name || ""}"`,
                    row.start_balance || 0,
                    row.end_balance || 0,
                    income.toFixed(2),
                    commission.toFixed(2)
                ]
                csvRows.push(csvRow.join(","))
            })
            csvRows.push(`"","","","Total",${totalIncome.toFixed(2)},${totalCommission.toFixed(2)}`)
        } else {
            (displayData as PlayHistory[]).forEach(row => {
                const perGameIncome = (row.end_balance || 0) - (row.start_balance || 0)
                if (perGameIncome <= 0) return

                totalIncome += perGameIncome

                const dateStr = row.created_at ? format(new Date(row.created_at), "MMM dd, yyyy hh:mm a") : "-"

                const csvRow = [
                    `"=""${dateStr}"""`,
                    `"${row.pc_name || ""}"`,
                    row.start_balance || 0,
                    row.end_balance || 0,
                    perGameIncome.toFixed(2),
                    "-"
                ]
                csvRows.push(csvRow.join(","))
            })
            csvRows.push(`"","","","Total Income",${totalIncome.toFixed(2)},-`)
        }

        const csvString = csvRows.join("\n")
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `play_history_${incomeViewMode}_${selectedFranchise.replace(/\s+/g, '_')}_${format(new Date(), "yyyyMMdd")}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }, [displayData, selectedFranchise, incomeViewMode])

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
                {/* Income View Mode Toggle - Upper Right */}
                <div className="flex items-center gap-1 bg-[#0a0a0a] border border-gray-800 rounded-lg p-1">
                    <button
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                            incomeViewMode === "per_game"
                                ? "bg-[#2563eb] text-white shadow-md"
                                : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                        }`}
                        onClick={() => setIncomeViewMode("per_game")}
                    >
                        Per Game
                    </button>
                    <button
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                            incomeViewMode === "daily"
                                ? "bg-[#2563eb] text-white shadow-md"
                                : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                        }`}
                        onClick={() => setIncomeViewMode("daily")}
                    >
                        Daily
                    </button>
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
                        <DropdownMenuItem
                            className="hover:bg-gray-800 cursor-pointer"
                            onClick={() => setSelectedFranchise("Josh")}
                        >
                            Josh
                        </DropdownMenuItem>
                        {franchises.filter(f => !["Alpha Pro", "Gamma Systems", "Beta Global", "Josh"].includes(f.name)).map((f) => (
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
                            onSelect={(range) => {
                                // If current range is the default "today" range, and we're picking something else,
                                // start a fresh selection from the new date.
                                const todayStr = format(new Date(), "yyyy-MM-dd")
                                const isDefaultRange = dateRange?.from && dateRange?.to &&
                                    format(dateRange.from, "yyyy-MM-dd") === todayStr &&
                                    format(dateRange.to, "yyyy-MM-dd") === todayStr

                                if (isDefaultRange && range?.from && range?.to) {
                                    // If range changed from default today to something else, 
                                    // check which one is the "new" date.
                                    const fromStr = format(range.from, "yyyy-MM-dd")
                                    const toStr = format(range.to, "yyyy-MM-dd")
                                    
                                    if (fromStr !== todayStr) {
                                        setDateRange({ from: range.from, to: undefined })
                                    } else if (toStr !== todayStr) {
                                        setDateRange({ from: range.to, to: undefined })
                                    } else {
                                        setDateRange(range)
                                    }
                                } else {
                                    setDateRange(range)
                                }
                            }}
                            autoFocus
                            numberOfMonths={2}
                            className="text-white"
                            classNames={{
                                selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white rounded-md",
                                range_start: "bg-blue-600 text-white rounded-l-md",
                                range_end: "bg-blue-600 text-white rounded-r-md",
                                range_middle: "bg-blue-600/20 text-blue-200",
                                today: "bg-gray-800 text-white rounded-md underline decoration-blue-500 underline-offset-4",
                                day_button: "h-9 w-9 p-0 font-normal text-gray-200 hover:bg-gray-800 rounded-md",
                                weekday: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                                caption_label: "text-sm font-medium text-white",
                                month_grid: "w-full border-collapse",
                                day: "h-9 w-9 text-center text-sm p-0",
                                outside: "text-gray-700 opacity-50",
                            }}
                        />
                        <div className="px-3 pb-3 flex justify-end">
                            <button
                                className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"
                                onClick={() => {
                                    setDateRange({ from: new Date(), to: new Date() })
                                }}
                            >
                                Clear Date
                            </button>
                        </div>
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
                
                <Button
                    variant="outline"
                    size="icon"
                    className={`h-9 w-9 shrink-0 border-gray-700 bg-[#0a0a0a] rounded-md ${
                        selectedFranchise === "All" || displayData.length === 0
                            ? "opacity-50 cursor-not-allowed text-gray-500"
                            : "text-gray-200 hover:bg-[#1a1a1a] hover:text-white"
                    }`}
                    onClick={handleDownloadCSV}
                    disabled={selectedFranchise === "All" || displayData.length === 0}
                    title={selectedFranchise === "All" ? "Select a franchise to download" : "Download CSV"}
                >
                    <Download className="h-4 w-4" />
                </Button>
            </div>

            <PlayHistoryTable data={paginatedData} loading={loading} viewMode={incomeViewMode} />

            {!loading && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                    <div className="text-sm text-gray-400">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, displayData.length)} of {displayData.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-[#0a0a0a] border-gray-800 text-gray-200 hover:bg-[#1a1a1a] hover:text-white"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <div className="text-sm text-gray-400 font-medium px-2">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-[#0a0a0a] border-gray-800 text-gray-200 hover:bg-[#1a1a1a] hover:text-white"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TradeHistoryPage