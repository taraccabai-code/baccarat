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
import { ArrowUpDown, ChevronDown, Check, X } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateBaccaratRow } from "@/helper/baccarat"

export type BaccaratRow = {
    id: number | string
    level: number | null
    pattern: string | null
    target_profit: number | null
    actions: string | null
    units?: string | null
    status?: string | null
    user_balance?: number | string | null
    bet_size?: number | string | null
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

interface PlayBaccaratTableProps {
    data: BaccaratRow[]
    loading: boolean
    error: string | null
    onRowUpdate?: (updatedRow: Partial<BaccaratRow> & { id: string | number }) => void
}

const clampLevel = (n: number | null | undefined) =>
    Math.min(15, Math.max(1, Number(n) || 1))

const DEFAULT_PATTERN = ""

function formatPatternInput(raw: string, maxLetters = 15): string {
    const letters = raw
        .toUpperCase()
        .replace(/[^BTP]/g, "")
        .slice(0, maxLetters)
    if (!letters.length) return ""

    const groups: string[] = []
    for (let i = 0; i < letters.length; i += 4) {
        groups.push(letters.slice(i, i + 4))
    }
    return groups.join("-")
}

export const PlayBaccaratTable = ({ data, loading, error, onRowUpdate }: PlayBaccaratTableProps) => {
    const [levelByRowId, setLevelByRowId] = useState<Record<string, number>>({})
    const [editingLevelRowId, setEditingLevelRowId] = useState<string | null>(null)
    const [editingLevelValue, setEditingLevelValue] = useState("")
    const [patternByRowId, setPatternByRowId] = useState<Record<string, string>>({})
    const [editingPatternRowId, setEditingPatternRowId] = useState<string | null>(null)
    const [editingPatternValue, setEditingPatternValue] = useState("")
    const [targetProfitByRowId, setTargetProfitByRowId] = useState<Record<string, string>>({})
    const [editingTargetProfitRowId, setEditingTargetProfitRowId] = useState<string | null>(null)
    const [editingTargetProfitValue, setEditingTargetProfitValue] = useState("")
    const [betSizeByRowId, setBetSizeByRowId] = useState<Record<string, number>>({})
    const [savingRowId, setSavingRowId] = useState<string | null>(null)
    const displayRows = data

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

            // When Level changes, clear the pattern for this row
            setLevel(row.id, clamped)
            setPatternByRowId((prev) => ({ ...prev, [String(row.id)]: "" }))
            if (editingPatternRowId === String(row.id)) {
                setEditingPatternRowId(null)
                setEditingPatternValue("")
            }

            setEditingLevelRowId(null)
            setEditingLevelValue("")
        },
        [
            editingLevelValue,
            editingPatternRowId,
            setLevel,
            setPatternByRowId,
        ]
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

    const handlePatternChange = useCallback(
        (row: BaccaratRow, raw: string) => {
            const level = getLevel(row)
            setEditingPatternValue(formatPatternInput(raw, level))
        },
        [getLevel]
    )

    const handlePatternBlur = useCallback(
        (row: BaccaratRow) => {
            const formatted = formatPatternInput(editingPatternValue.trim())
            const lettersOnly = formatted.replace(/-/g, "")

            if (!lettersOnly.length) {
                // Empty pattern: clear pattern, keep current level
                setPattern(row.id, "")
            } else {
                const newLevel = clampLevel(lettersOnly.length)
                const trimmed = lettersOnly.slice(0, newLevel)

                const groups: string[] = []
                for (let i = 0; i < trimmed.length; i += 4) {
                    groups.push(trimmed.slice(i, i + 4))
                }
                const finalPattern = groups.join("-")

                // When Pattern changes, Level adjusts to match its length
                setPattern(row.id, finalPattern)
                setLevel(row.id, newLevel)
                // If Level is currently being edited for this row, close its edit state
                if (editingLevelRowId === String(row.id)) {
                    setEditingLevelRowId(null)
                    setEditingLevelValue("")
                }
            }

            setEditingPatternRowId(null)
            setEditingPatternValue("")
        },
        [
            editingPatternValue,
            editingLevelRowId,
            setLevel,
            setPattern,
        ]
    )

    const getTargetProfit = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            if (id in targetProfitByRowId) return targetProfitByRowId[id]
            return row.target_profit != null ? String(row.target_profit) : ""
        },
        [targetProfitByRowId]
    )

    const handleTargetProfitFocus = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            setEditingTargetProfitRowId(id)
            setEditingTargetProfitValue(getTargetProfit(row))
        },
        [getTargetProfit]
    )

    const handleTargetProfitChange = useCallback((raw: string) => {
        // Only allow digits; strip everything else
        const digitsOnly = raw.replace(/\D/g, "")
        setEditingTargetProfitValue(digitsOnly)
    }, [])

    const handleTargetProfitBlur = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            const trimmed = editingTargetProfitValue.trim()
            const digitsOnly = trimmed.replace(/\D/g, "")

            setTargetProfitByRowId((prev) => ({
                ...prev,
                [id]: digitsOnly,
            }))

            setEditingTargetProfitRowId(null)
            setEditingTargetProfitValue("")
        },
        [editingTargetProfitValue]
    )

    const getBetSize = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            if (id in betSizeByRowId) return betSizeByRowId[id]
            return row.bet_size != null ? Number(row.bet_size) : null
        },
        [betSizeByRowId]
    )

    const handleBetSizeChange = useCallback((rowId: string | number, value: number) => {
        const id = String(rowId)
        setBetSizeByRowId((prev) => ({ ...prev, [id]: value }))
    }, [])

    const hasRowChanges = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            if (id in levelByRowId && levelByRowId[id] !== clampLevel(row.level)) return true
            if (id in patternByRowId && patternByRowId[id] !== (row.pattern ?? DEFAULT_PATTERN)) return true
            if (id in targetProfitByRowId && targetProfitByRowId[id] !== (row.target_profit != null ? String(row.target_profit) : "")) return true
            if (id in betSizeByRowId && betSizeByRowId[id] !== (row.bet_size != null ? Number(row.bet_size) : null)) return true
            return false
        },
        [levelByRowId, patternByRowId, targetProfitByRowId, betSizeByRowId]
    )

    const handleCancelRowChanges = useCallback((row: BaccaratRow) => {
        const id = String(row.id)
        setLevelByRowId((prev) => {
            if (!(id in prev)) return prev
            const next = { ...prev }
            delete next[id]
            return next
        })
        setPatternByRowId((prev) => {
            if (!(id in prev)) return prev
            const next = { ...prev }
            delete next[id]
            return next
        })
        setTargetProfitByRowId((prev) => {
            if (!(id in prev)) return prev
            const next = { ...prev }
            delete next[id]
            return next
        })
        setBetSizeByRowId((prev) => {
            if (!(id in prev)) return prev
            const next = { ...prev }
            delete next[id]
            return next
        })
        if (editingLevelRowId === id) {
            setEditingLevelRowId(null)
            setEditingLevelValue("")
        }
        if (editingPatternRowId === id) {
            setEditingPatternRowId(null)
            setEditingPatternValue("")
        }
        if (editingTargetProfitRowId === id) {
            setEditingTargetProfitRowId(null)
            setEditingTargetProfitValue("")
        }
    }, [editingLevelRowId, editingPatternRowId, editingTargetProfitRowId])

    const handleConfirmRowChanges = useCallback(
        async (row: BaccaratRow) => {
            const id = String(row.id)

            const level = getLevel(row)
            const pattern = getPattern(row)
            const targetProfitRaw = getTargetProfit(row)
            const target_profit =
                targetProfitRaw.trim() === "" ? null : Number(targetProfitRaw.replace(/\D/g, "")) || null
            const bet_size = getBetSize(row)

            try {
                setSavingRowId(id)

                // Directly calling human-readable Server Action
                await updateBaccaratRow({
                    id: row.id,
                    level,
                    pattern,
                    target_profit,
                    bet_size
                })

                // After successful save, clear local dirty state so row is "clean"
                handleCancelRowChanges(row)

                // Update row in parent state instead of refetching everything
                onRowUpdate?.({
                    id: row.id,
                    level,
                    pattern,
                    target_profit,
                    bet_size
                })
            } catch (error: any) {
                console.error("Save failed:", error)
                alert(error.message || "Failed to save changes for this row.")
            } finally {
                setSavingRowId((current) => (current === id ? null : current))
            }
        },
        [getLevel, getPattern, getTargetProfit, getBetSize, handleCancelRowChanges, onRowUpdate]
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
                                <span>Bet Size</span>
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
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                            {/* Empty header for confirm/cancel icons */}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={9} className="text-center text-gray-500 h-32 italic">
                                Loading data...
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && error && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={9} className="text-center text-red-500 h-32 italic">
                                {error}
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && !error && displayRows.length === 0 && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={9} className="text-center text-gray-500 h-32 italic">
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
                                <Select
                                    value={String(getBetSize(row) ?? "")}
                                    onValueChange={(value) => handleBetSizeChange(row.id, Number(value))}
                                >
                                    <SelectTrigger className="w-20 h-7 text-xs bg-transparent border-[#868686] text-gray-200 justify-center mx-auto">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-gray-800">
                                        <SelectItem value="10" className="text-gray-200 hover:bg-gray-800">10</SelectItem>
                                        <SelectItem value="50" className="text-gray-200 hover:bg-gray-800">50</SelectItem>
                                        <SelectItem value="100" className="text-gray-200 hover:bg-gray-800">100</SelectItem>
                                        <SelectItem value="200" className="text-gray-200 hover:bg-gray-800">200</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                        onChange={(e) => handlePatternChange(row, e.target.value)}
                                        onBlur={() => handlePatternBlur(row)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") e.currentTarget.blur()
                                        }}
                                        maxLength={19}
                                        className="w-36 h-7 text-center text-xs text-gray-200 bg-transparent border-0 focus:outline-none focus:ring-0"
                                        placeholder="BBBB-BBBB"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handlePatternFocus(row)}
                                        className="w-36 h-7 text-center text-xs text-gray-200 bg-transparent border-0 focus:outline-none focus:ring-0"
                                    >
                                        {getPattern(row)}
                                    </button>
                                )}
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                        editingTargetProfitRowId === String(row.id)
                                            ? editingTargetProfitValue
                                            : getTargetProfit(row)
                                    }
                                    onFocus={() => handleTargetProfitFocus(row)}
                                    onChange={(e) => handleTargetProfitChange(e.target.value)}
                                    onBlur={() => handleTargetProfitBlur(row)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") e.currentTarget.blur()
                                    }}
                                    className="w-20 h-7 text-center text-xs text-gray-200 bg-transparent border-0 focus:outline-none focus:ring-0"
                                />
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
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-green-400 hover:text-green-300 hover:bg-[#1a1a1a]"
                                        disabled={savingRowId === String(row.id) || !hasRowChanges(row)}
                                        onClick={() => handleConfirmRowChanges(row)}
                                        aria-label="Confirm row changes"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-[#1a1a1a]"
                                        disabled={savingRowId === String(row.id) || !hasRowChanges(row)}
                                        onClick={() => handleCancelRowChanges(row)}
                                        aria-label="Cancel row changes"
                                    >
                                        <X className="h-3.5 w-3.5" />
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
