"use client"

import React, { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown, ArrowUpDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type BaccaratRow = {
    id: number | string
    level: number | null
    pattern: string | null
    target_profit: number | null
    actions: string | null
}

const PlayBacarratPage = () => {
    const [selectedFilter, setSelectedFilter] = useState("All")
    const [rows, setRows] = useState<BaccaratRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/baccarat/units")
                if (!res.ok) {
                    throw new Error("Failed to load data")
                }
                const data: BaccaratRow[] = await res.json()
                setRows(data)
            } catch (err: any) {
                console.error("Error fetching baccarat data:", err)
                setError("Failed to load data")
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    return (
        <div className="w-full h-full p-6">
            <div className="flex flex-row items-start gap-6">
                <div className="w-48 flex flex-col gap-4">
                    <div className="w-48">
                        <Select defaultValue="status">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="status" className="text-muted-foreground">Status</SelectItem>
                                <SelectItem value="1">Running</SelectItem>
                                <SelectItem value="2">Burned</SelectItem>
                                <SelectItem value="3">Stopped</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-48">
                        <Select defaultValue="pattern">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pattern" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pattern" className="text-muted-foreground">Pattern</SelectItem>
                                <SelectItem value="1">Option 1</SelectItem>
                                <SelectItem value="2">Option 2</SelectItem>
                                <SelectItem value="3">Option 3</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-48">
                        <Select defaultValue="franchise">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Franchise" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="franchise" className="text-muted-foreground">Franchise</SelectItem>
                                <SelectItem value="1">Option 1</SelectItem>
                                <SelectItem value="2">Option 2</SelectItem>
                                <SelectItem value="3">Option 3</SelectItem>
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
                            />
                        </div>
                    </div>

                    <div className="border rounded-md border-gray-800 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#0a0a0a]">
                                <TableRow className="border-gray-800 hover:bg-transparent">
                                    <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>Units</span>
                                            <ArrowUpDown className="h-3 w-3 text-gray-500 cursor-pointer" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>Status</span>
                                            <ArrowUpDown className="h-3 w-3 text-gray-500 cursor-pointer" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>User Balance</span>
                                            <ArrowUpDown className="h-3 w-3 text-gray-500 cursor-pointer" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>Level</span>
                                            <ArrowUpDown className="h-3 w-3 text-gray-500 cursor-pointer" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>Pattern</span>
                                            <ArrowUpDown className="h-3 w-3 text-gray-500 cursor-pointer" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>Target Profit</span>
                                            <ArrowUpDown className="h-3 w-3 text-gray-500 cursor-pointer" />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    <TableRow className="border-gray-800">
                                        <TableCell colSpan={6} className="text-center text-gray-500 h-32 italic">
                                            Loading data...
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && error && (
                                    <TableRow className="border-gray-800">
                                        <TableCell colSpan={6} className="text-center text-red-500 h-32 italic">
                                            {error}
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && !error && rows.length === 0 && (
                                    <TableRow className="border-gray-800">
                                        <TableCell colSpan={6} className="text-center text-gray-500 h-32 italic">
                                            No active units found.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && !error && rows.map((row) => (
                                    <TableRow key={row.id} className="border-gray-800">
                                        {/* Units */}
                                        <TableCell className="text-center text-gray-200 text-xs">
                                            {/* intentionally left empty */}
                                        </TableCell>
                                        {/* Status */}
                                        <TableCell className="text-center text-gray-200 text-xs">
                                            {/* intentionally left empty */}
                                        </TableCell>
                                        {/* User Balance */}
                                        <TableCell className="text-center text-gray-200 text-xs">
                                            {/* intentionally left empty */}
                                        </TableCell>
                                        {/* Level */}
                                        <TableCell className="text-center text-gray-200 text-xs">
                                            {row.level ?? ""}
                                        </TableCell>
                                        {/* Pattern */}
                                        <TableCell className="text-center text-gray-200 text-xs">
                                            {row.pattern ?? ""}
                                        </TableCell>
                                        {/* Target Profit */}
                                        <TableCell className="text-center text-gray-200 text-xs">
                                            {row.target_profit ?? ""}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayBacarratPage
