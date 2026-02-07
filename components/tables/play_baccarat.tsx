"use client"

import React, { useState, useCallback } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown } from "lucide-react"

export type BaccaratRow = {
    id: number | string
    level: number | null
    pattern: string | null
    target_profit: number | null
    actions: string | null
    units?: string | null
    status?: string | null
    user_balance?: number | string | null
}

const STATUS_COLORS: Record<string, string> = {
    Running: "#4ADE80",
    Burned: "#D32020",
    Pending: "#868686",
    Stopped: "#FF8000",
}

function getStatusColor(status: string | null | undefined): string {
    if (!status) return "#868686"
    return STATUS_COLORS[status] ?? "#868686"
}

/** Set to false when using database data only (e.g. from /api/baccarat/units). */
const INCLUDE_DUMMY_ROW = true

const DUMMY_ROW: BaccaratRow = {
    id: "dummy",
    units: "PC1",
    status: "Running",
    user_balance: 62000,
    level: 15,
    pattern: "BPPP-BTPP",
    target_profit: 65000,
    actions: null,
}

interface PlayBaccaratTableProps {
    data: BaccaratRow[]
    loading: boolean
    error: string | null
}

const clampLevel = (n: number | null | undefined) =>
    Math.min(15, Math.max(1, Number(n) || 1))

const PATTERN_FORMAT = /^[BTP]{4}-[BTP]{4}$/
const DEFAULT_PATTERN = "BBBB-BBBB"

function formatPatternInput(raw: string): string {
    const letters = raw.toUpperCase().replace(/[^BTP]/g, "").slice(0, 8)
    if (letters.length <= 4) return letters
    return letters.slice(0, 4) + "-" + letters.slice(4, 8)
}

function isValidPattern(s: string): boolean {
    return PATTERN_FORMAT.test(s)
}

export const PlayBaccaratTable = ({ data, loading, error }: PlayBaccaratTableProps) => {
    const [levelByRowId, setLevelByRowId] = useState<Record<string, number>>({})
    const [editingLevelRowId, setEditingLevelRowId] = useState<string | null>(null)
    const [editingLevelValue, setEditingLevelValue] = useState("")
    const [patternByRowId, setPatternByRowId] = useState<Record<string, string>>({})
    const [editingPatternRowId, setEditingPatternRowId] = useState<string | null>(null)
    const [editingPatternValue, setEditingPatternValue] = useState("")
    const displayRows = INCLUDE_DUMMY_ROW ? [DUMMY_ROW, ...data] : data

    const getLevel = useCallback(
        (row: BaccaratRow) =>
            row.id in levelByRowId
                ? levelByRowId[row.id]
                : clampLevel(row.level),
        [levelByRowId]
    )

    const setLevel = useCallback((rowId: string | number, value: number) => {
        const clamped = clampLevel(value)
        setLevelByRowId((prev) => ({ ...prev, [String(rowId)]: clamped }))
    }, [])

    const handleLevelFocus = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            setEditingLevelRowId(id)
            setEditingLevelValue(String(getLevel(row)))
        },
        [getLevel]
    )

    const handleLevelChange = useCallback((raw: string) => {
        const digitsOnly = raw.replace(/\D/g, "").slice(0, 2)
        if (digitsOnly === "") {
            setEditingLevelValue("")
            return
        }
        const num = parseInt(digitsOnly, 10) || 0
        const clamped = clampLevel(num)
        setEditingLevelValue(String(clamped))
    }, [])

    const handleLevelBlur = useCallback(
        (row: BaccaratRow) => {
            const parsed = parseInt(editingLevelValue, 10)
            const clamped = Number.isNaN(parsed) ? clampLevel(row.level) : clampLevel(parsed)
            setLevel(row.id, clamped)
            setEditingLevelRowId(null)
            setEditingLevelValue("")
        },
        [editingLevelValue, setLevel]
    )

    const getPattern = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            return id in patternByRowId ? patternByRowId[id] : (row.pattern ?? DEFAULT_PATTERN)
        },
        [patternByRowId]
    )

    const setPattern = useCallback((rowId: string | number, value: string) => {
        const id = String(rowId)
        setPatternByRowId((prev) => ({ ...prev, [id]: value }))
    }, [])

    const handlePatternFocus = useCallback(
        (row: BaccaratRow) => {
            setEditingPatternRowId(String(row.id))
            setEditingPatternValue(getPattern(row))
        },
        [getPattern]
    )

    const handlePatternChange = useCallback((raw: string) => {
        setEditingPatternValue(formatPatternInput(raw))
    }, [])

    const handlePatternBlur = useCallback(
        (row: BaccaratRow) => {
            const value = editingPatternValue.trim()
            const final = isValidPattern(value) ? value : getPattern(row)
            setPattern(row.id, final)
            setEditingPatternRowId(null)
            setEditingPatternValue("")
        },
        [editingPatternValue, getPattern, setPattern]
    )

    return (
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
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={7} className="text-center text-gray-500 h-32 italic">
                                Loading data...
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && error && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={7} className="text-center text-red-500 h-32 italic">
                                {error}
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && !error && displayRows.length === 0 && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={7} className="text-center text-gray-500 h-32 italic">
                                No active units found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && !error && displayRows.length > 0 && displayRows.map((row) => (
                        <TableRow key={row.id} className="border-gray-800">
                            <TableCell className="text-center text-gray-200 text-xs">
                                {row.units ?? ""}
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs">
                                <div className="flex items-center justify-center gap-2">
                                    <span
                                        className="rounded-full shrink-0"
                                        style={{
                                            width: 8,
                                            height: 8,
                                            backgroundColor: getStatusColor(row.status),
                                        }}
                                        aria-hidden
                                    />
                                    <span>{row.status ?? ""}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs">
                                {row.user_balance ?? ""}
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs">
                                <div
                                    className="inline-flex items-center rounded-[5px] border bg-transparent"
                                    style={{ borderColor: "#868686" }}
                                >
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        minLength={1}
                                        maxLength={2}
                                        value={
                                            editingLevelRowId === String(row.id)
                                                ? editingLevelValue
                                                : String(getLevel(row))
                                        }
                                        onFocus={() => handleLevelFocus(row)}
                                        onChange={(e) =>
                                            handleLevelChange(e.target.value)
                                        }
                                        onBlur={() => handleLevelBlur(row)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") e.currentTarget.blur()
                                        }}
                                        onWheel={(e) => {
                                            e.preventDefault()
                                            const delta = e.deltaY > 0 ? -1 : 1
                                            const id = String(row.id)
                                            const next = clampLevel(
                                                (levelByRowId[id] ?? clampLevel(row.level)) + delta
                                            )
                                            setLevelByRowId((prev) => ({ ...prev, [id]: next }))
                                            if (editingLevelRowId === id)
                                                setEditingLevelValue(String(next))
                                        }}
                                        className="min-w-[2rem] w-9 h-7 text-center text-xs text-gray-200 bg-transparent border-0 focus:outline-none focus:ring-0"
                                    />
                                    <span className="pr-1.5 flex items-center text-[#868686]">
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs">
                                {editingPatternRowId === String(row.id) ? (
                                    <input
                                        type="text"
                                        value={editingPatternValue}
                                        autoFocus
                                        onFocus={() => handlePatternFocus(row)}
                                        onChange={(e) => handlePatternChange(e.target.value)}
                                        onBlur={() => handlePatternBlur(row)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") e.currentTarget.blur()
                                        }}
                                        maxLength={9}
                                        className="w-24 h-7 text-center text-xs text-gray-200 bg-[#0a0a0a] border border-[#868686] rounded-[5px] focus:outline-none focus:ring-1 focus:ring-[#868686]"
                                        placeholder="BBBB-BBBB"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handlePatternFocus(row)}
                                        className="w-full min-w-[6rem] h-7 text-center text-xs text-gray-200 bg-transparent border border-transparent rounded-[5px] hover:border-[#868686] focus:outline-none focus:ring-1 focus:ring-[#868686]"
                                    >
                                        {getPattern(row)}
                                    </button>
                                )}
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs">
                                {row.target_profit ?? ""}
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        size="sm"
                                        className="text-white text-xs h-5 px-3 rounded-md border-0"
                                        style={{ backgroundColor: "#D32020" }}
                                    >
                                        Stop
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="text-white text-xs h-5 px-3 rounded-md border-0"
                                        style={{ backgroundColor: "#868686" }}
                                    >
                                        Run
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
