"use client"

import React, { useState, useCallback, useMemo } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, Check, X, ArrowUp, ArrowDown } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
    duration?: string | null
    strategy?: string | null
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
    selectedRows: Set<string | number>
    onSelectionChange: (selected: Set<string | number>) => void
}

const clampLevel = (n: number | null | undefined) =>
    Math.min(15, Math.max(1, Number(n) || 1))

const DEFAULT_PATTERN = ""

type SortConfig = {
    key: keyof BaccaratRow | null
    direction: 'asc' | 'desc' | null
}

export const PlayBaccaratTable = ({
    data,
    loading,
    error,
    onRowUpdate,
    selectedRows,
    onSelectionChange
}: PlayBaccaratTableProps) => {
    const [levelByRowId, setLevelByRowId] = useState<Record<string, number>>({})
    const [editingLevelRowId, setEditingLevelRowId] = useState<string | null>(null)
    const [editingLevelValue, setEditingLevelValue] = useState("")
    const [patternByRowId, setPatternByRowId] = useState<Record<string, string>>({})
    const [targetProfitByRowId, setTargetProfitByRowId] = useState<Record<string, string>>({})
    const [editingTargetProfitRowId, setEditingTargetProfitRowId] = useState<string | null>(null)
    const [editingTargetProfitValue, setEditingTargetProfitValue] = useState("")
    const [betSizeByRowId, setBetSizeByRowId] = useState<Record<string, number>>({})
    const [strategyByRowId, setStrategyByRowId] = useState<Record<string, string>>({})
    const [durationByRowId, setDurationByRowId] = useState<Record<string, { d: string, h: string, m: string }>>({})
    const [savingRowId, setSavingRowId] = useState<string | null>(null)
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null })

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(new Set(data.map(row => row.id)))
        } else {
            onSelectionChange(new Set())
        }
    }

    const toggleSelectRow = (id: string | number, checked: boolean) => {
        const next = new Set(selectedRows)
        if (checked) {
            next.add(id)
        } else {
            next.delete(id)
        }
        onSelectionChange(next)
    }

    const isAllSelected = data.length > 0 && selectedRows.size === data.length
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < data.length

    const handleSort = (key: keyof BaccaratRow) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                if (prev.direction === 'asc') return { key, direction: 'desc' }
                if (prev.direction === 'desc') return { key: null, direction: null }
            }
            return { key, direction: 'asc' }
        })
    }

    const displayRows = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) return data

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key!]
            const bValue = b[sortConfig.key!]

            if (aValue === bValue) return 0
            if (aValue === null || aValue === undefined) return 1
            if (bValue === null || bValue === undefined) return -1

            const direction = sortConfig.direction === 'asc' ? 1 : -1

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return (aValue - bValue) * direction
            }

            return String(aValue).localeCompare(String(bValue)) * direction
        })
    }, [data, sortConfig])

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

            setEditingLevelRowId(null)
            setEditingLevelValue("")
        },
        [
            editingLevelValue,
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

    const handlePatternSelect = useCallback(
        (rowId: string | number, value: string) => {
            const id = String(rowId)
            const lettersOnly = value.replace(/-/g, "")
            const newLevel = clampLevel(lettersOnly.length)

            setPattern(id, value)
            setLevel(id, newLevel)

            // If Level is currently being edited for this row, close its edit state
            if (editingLevelRowId === id) {
                setEditingLevelRowId(null)
                setEditingLevelValue("")
            }
        },
        [editingLevelRowId, setLevel, setPattern]
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

    const getStrategy = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            if (id in strategyByRowId) return strategyByRowId[id]
            return row.strategy ?? ""
        },
        [strategyByRowId]
    )

    const handleStrategyChange = useCallback((rowId: string | number, value: string) => {
        const id = String(rowId)
        setStrategyByRowId((prev) => ({ ...prev, [id]: value }))
    }, [])

    const parseDuration = (duration: string | null | undefined) => {
        if (!duration) return { d: "0", h: "0", m: "0" }
        const dMatch = duration.match(/(\d+)d/)
        const hMatch = duration.match(/(\d+)h/)
        const mMatch = duration.match(/(\d+)m/)
        return {
            d: dMatch ? dMatch[1] : "0",
            h: hMatch ? hMatch[1] : "0",
            m: mMatch ? mMatch[1] : "0"
        }
    }

    const getDuration = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            if (id in durationByRowId) return durationByRowId[id]
            return parseDuration(row.duration)
        },
        [durationByRowId]
    )

    const handleDurationChange = useCallback((rowId: string | number, field: 'd' | 'h' | 'm', value: string) => {
        const id = String(rowId)
        const digitsOnly = value.replace(/\D/g, "")
        setDurationByRowId((prev) => {
            const current = prev[id] || parseDuration(data.find(r => String(r.id) === id)?.duration)
            return {
                ...prev,
                [id]: { ...current, [field]: digitsOnly || "0" }
            }
        })
    }, [data])

    const formatDurationString = (dur: { d: string, h: string, m: string }) => {
        return `${dur.d}d ${dur.h}h ${dur.m}m`
    }

    const hasRowChanges = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            if (id in levelByRowId && levelByRowId[id] !== clampLevel(row.level)) return true
            if (id in patternByRowId && patternByRowId[id] !== (row.pattern ?? DEFAULT_PATTERN)) return true
            if (id in targetProfitByRowId && targetProfitByRowId[id] !== (row.target_profit != null ? String(row.target_profit) : "")) return true
            if (id in betSizeByRowId && betSizeByRowId[id] !== (row.bet_size != null ? Number(row.bet_size) : null)) return true
            if (id in strategyByRowId && strategyByRowId[id] !== (row.strategy ?? "")) return true
            if (id in durationByRowId) {
                const current = durationByRowId[id]
                const original = parseDuration(row.duration)
                if (current.d !== original.d || current.h !== original.h || current.m !== original.m) return true
            }
            return false
        },
        [levelByRowId, patternByRowId, targetProfitByRowId, betSizeByRowId, strategyByRowId, durationByRowId]
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
        setStrategyByRowId((prev) => {
            if (!(id in prev)) return prev
            const next = { ...prev }
            delete next[id]
            return next
        })
        setDurationByRowId((prev) => {
            if (!(id in prev)) return prev
            const next = { ...prev }
            delete next[id]
            return next
        })
        if (editingLevelRowId === id) {
            setEditingLevelRowId(null)
            setEditingLevelValue("")
        }
        if (editingTargetProfitRowId === id) {
            setEditingTargetProfitRowId(null)
            setEditingTargetProfitValue("")
        }
    }, [editingLevelRowId, editingTargetProfitRowId])

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
                    bet_size,
                    strategy: getStrategy(row),
                    duration: formatDurationString(getDuration(row))
                })

                // After successful save, clear local dirty state so row is "clean"
                handleCancelRowChanges(row)

                // Update row in parent state instead of refetching everything
                onRowUpdate?.({
                    id: row.id,
                    level,
                    pattern,
                    target_profit,
                    bet_size,
                    strategy: getStrategy(row),
                    duration: formatDurationString(getDuration(row))
                })
            } catch (error: any) {
                console.error("Save failed:", error)
                alert(error.message || "Failed to save changes for this row.")
            } finally {
                setSavingRowId((current) => (current === id ? null : current))
            }
        },
        [getLevel, getPattern, getTargetProfit, getBetSize, getStrategy, getDuration, handleCancelRowChanges, onRowUpdate]
    )

    const handleStatusChange = useCallback(
        async (row: BaccaratRow, newStatus: string) => {
            const id = String(row.id)
            try {
                setSavingRowId(id)
                await updateBaccaratRow({
                    id: row.id,
                    level: getLevel(row),
                    pattern: getPattern(row),
                    target_profit: Number(getTargetProfit(row)) || null,
                    bet_size: getBetSize(row),
                    strategy: getStrategy(row),
                    duration: formatDurationString(getDuration(row)),
                    status: newStatus,
                    command: newStatus === "Running"
                })

                onRowUpdate?.({
                    id: row.id,
                    level: getLevel(row),
                    pattern: getPattern(row),
                    target_profit: Number(getTargetProfit(row)) || null,
                    bet_size: getBetSize(row),
                    strategy: getStrategy(row),
                    duration: formatDurationString(getDuration(row)),
                    status: newStatus
                })
            } catch (error: any) {
                console.error("Status update failed:", error)
                alert(error.message || "Failed to update status.")
            } finally {
                setSavingRowId((current) => (current === id ? null : current))
            }
        },
        [getLevel, getPattern, getTargetProfit, getBetSize, getStrategy, getDuration, onRowUpdate]
    )

    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="w-12 text-center px-4">
                            <Checkbox
                                checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                                onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                aria-label="Select all rows"
                            />
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Units</span>
                                <div
                                    className="cursor-pointer hover:text-gray-200 transition-colors p-0.5"
                                    onClick={() => handleSort('units')}
                                >
                                    {sortConfig.key === 'units' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-500" /> : <ArrowDown className="h-3 w-3 text-blue-500" />
                                    ) : (
                                        <ArrowUpDown className="h-3 w-3 text-gray-500" />
                                    )}
                                </div>
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Status</span>
                                <div
                                    className="cursor-pointer hover:text-gray-200 transition-colors p-0.5"
                                    onClick={() => handleSort('status')}
                                >
                                    {sortConfig.key === 'status' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-500" /> : <ArrowDown className="h-3 w-3 text-blue-500" />
                                    ) : (
                                        <ArrowUpDown className="h-3 w-3 text-gray-500" />
                                    )}
                                </div>
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>User Balance</span>
                                <div
                                    className="cursor-pointer hover:text-gray-200 transition-colors p-0.5"
                                    onClick={() => handleSort('user_balance')}
                                >
                                    {sortConfig.key === 'user_balance' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-500" /> : <ArrowDown className="h-3 w-3 text-blue-500" />
                                    ) : (
                                        <ArrowUpDown className="h-3 w-3 text-gray-500" />
                                    )}
                                </div>
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Bet Size</span>
                                <div
                                    className="cursor-pointer hover:text-gray-200 transition-colors p-0.5"
                                    onClick={() => handleSort('bet_size')}
                                >
                                    {sortConfig.key === 'bet_size' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-500" /> : <ArrowDown className="h-3 w-3 text-blue-500" />
                                    ) : (
                                        <ArrowUpDown className="h-3 w-3 text-gray-500" />
                                    )}
                                </div>
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Level</span>
                                <div
                                    className="cursor-pointer hover:text-gray-200 transition-colors p-0.5"
                                    onClick={() => handleSort('level')}
                                >
                                    {sortConfig.key === 'level' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-500" /> : <ArrowDown className="h-3 w-3 text-blue-500" />
                                    ) : (
                                        <ArrowUpDown className="h-3 w-3 text-gray-500" />
                                    )}
                                </div>
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Strategy</span>
                                <div
                                    className="cursor-pointer hover:text-gray-200 transition-colors p-0.5"
                                    onClick={() => handleSort('strategy')}
                                >
                                    {sortConfig.key === 'strategy' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-500" /> : <ArrowDown className="h-3 w-3 text-blue-500" />
                                    ) : (
                                        <ArrowUpDown className="h-3 w-3 text-gray-500" />
                                    )}
                                </div>
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Pattern</span>
                                <div
                                    className="cursor-pointer hover:text-gray-200 transition-colors p-0.5"
                                    onClick={() => handleSort('pattern')}
                                >
                                    {sortConfig.key === 'pattern' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-500" /> : <ArrowDown className="h-3 w-3 text-blue-500" />
                                    ) : (
                                        <ArrowUpDown className="h-3 w-3 text-gray-500" />
                                    )}
                                </div>
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Target Profit</span>
                                <div
                                    className="cursor-pointer hover:text-gray-200 transition-colors p-0.5"
                                    onClick={() => handleSort('target_profit')}
                                >
                                    {sortConfig.key === 'target_profit' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-500" /> : <ArrowDown className="h-3 w-3 text-blue-500" />
                                    ) : (
                                        <ArrowUpDown className="h-3 w-3 text-gray-500" />
                                    )}
                                </div>
                            </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">
                            <div className="flex items-center justify-center gap-1 select-none">
                                <span>Duration</span>
                                <div
                                    className="cursor-pointer hover:text-gray-200 transition-colors p-0.5"
                                    onClick={() => handleSort('duration')}
                                >
                                    {sortConfig.key === 'duration' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-500" /> : <ArrowDown className="h-3 w-3 text-blue-500" />
                                    ) : (
                                        <ArrowUpDown className="h-3 w-3 text-gray-500" />
                                    )}
                                </div>
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
                            <TableCell colSpan={10} className="text-center text-gray-500 h-32 italic">
                                Loading data...
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && error && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={10} className="text-center text-red-500 h-32 italic">
                                {error}
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && !error && displayRows.length === 0 && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={10} className="text-center text-gray-500 h-32 italic">
                                No active units found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && !error && displayRows.length > 0 && displayRows.map((row) => (
                        <TableRow key={row.id} className="border-gray-800">
                            <TableCell className="w-12 text-center px-4">
                                <Checkbox
                                    checked={selectedRows.has(row.id)}
                                    onCheckedChange={(checked) => toggleSelectRow(row.id, !!checked)}
                                    aria-label={`Select row ${row.units || row.id}`}
                                />
                            </TableCell>
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
                                <Select
                                    value={getStrategy(row)}
                                    onValueChange={(value) => handleStrategyChange(row.id, value)}
                                >
                                    <SelectTrigger className="w-24 h-7 text-xs bg-transparent border-[#868686] text-gray-200 justify-center mx-auto">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-gray-800">
                                        <SelectItem value="Tank" className="text-gray-200 hover:bg-gray-800">Tank</SelectItem>
                                        <SelectItem value="Sweeper" className="text-gray-200 hover:bg-gray-800">Sweeper</SelectItem>
                                        <SelectItem value="Standard" className="text-gray-200 hover:bg-gray-800">Standard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs">
                                <Select
                                    value={getPattern(row)}
                                    onValueChange={(value) => handlePatternSelect(row.id, value)}
                                >
                                    <SelectTrigger className="w-28 h-7 text-xs bg-transparent border-[#868686] text-gray-200 justify-center mx-auto">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-gray-800">
                                        <SelectItem value="P" className="text-gray-200 hover:bg-gray-800">P</SelectItem>
                                        <SelectItem value="B" className="text-gray-200 hover:bg-gray-800">B</SelectItem>
                                        <SelectItem value="PB" className="text-gray-200 hover:bg-gray-800">PB</SelectItem>
                                        <SelectItem value="BP" className="text-gray-200 hover:bg-gray-800">BP</SelectItem>
                                        <SelectItem value="PPPB" className="text-gray-200 hover:bg-gray-800">PPPB</SelectItem>
                                        <SelectItem value="BBBP" className="text-gray-200 hover:bg-gray-800">BBBP</SelectItem>
                                    </SelectContent>
                                </Select>
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
                            <TableCell className="text-center text-gray-200 text-xs">
                                <div className="flex items-center justify-center gap-1">
                                    <div className="flex flex-col items-center">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={getDuration(row).d}
                                            onChange={(e) => handleDurationChange(row.id, 'd', e.target.value)}
                                            className="w-8 h-7 text-center text-xs text-gray-200 bg-transparent border border-gray-700 rounded focus:border-blue-500 focus:outline-none focus:ring-0"
                                            placeholder="D"
                                        />
                                        <span className="text-[8px] text-gray-500 uppercase mt-0.5">Days</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={getDuration(row).h}
                                            onChange={(e) => handleDurationChange(row.id, 'h', e.target.value)}
                                            className="w-8 h-7 text-center text-xs text-gray-200 bg-transparent border border-gray-700 rounded focus:border-blue-500 focus:outline-none focus:ring-0"
                                            placeholder="H"
                                        />
                                        <span className="text-[8px] text-gray-500 uppercase mt-0.5">Hours</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={getDuration(row).m}
                                            onChange={(e) => handleDurationChange(row.id, 'm', e.target.value)}
                                            className="w-10 h-7 text-center text-xs text-gray-200 bg-transparent border border-gray-700 rounded focus:border-blue-500 focus:outline-none focus:ring-0"
                                            placeholder="M"
                                        />
                                        <span className="text-[8px] text-gray-500 uppercase mt-0.5">Mins</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        size="sm"
                                        className="text-white text-xs h-5 px-3 rounded-md border-0"
                                        style={{ backgroundColor: row.status === "Running" ? "#D32020" : "#868686" }}
                                        onClick={() => handleStatusChange(row, "Stopped")}
                                        disabled={savingRowId === String(row.id) || row.status === "Stopped"}
                                    >
                                        Stop
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="text-white text-xs h-5 px-3 rounded-md border-0"
                                        style={{ backgroundColor: row.status === "Stopped" ? "#4ADE80" : "#868686" }}
                                        onClick={() => handleStatusChange(row, "Running")}
                                        disabled={savingRowId === String(row.id) || row.status === "Running"}
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
