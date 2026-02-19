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
    duration?: number | string | null
    strategy?: string | null
}

const STATUS_COLORS: Record<string, string> = {
    Running: "#4ADE80",
    Burned: "#D32020",
    Pending: "#868686",
    Stopped: "#FF8000",
    "Idle (Remotely Stopped)": "#94A3B8", // Slate-400 for idle
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

const getMaxLevel = (betSize: number | string | null | undefined, strategy?: string | null) => {
    if (strategy === "Sweeper" || strategy === "Burst") return 3
    const size = Number(betSize)
    if (size === 10) return 14
    if (size === 50) return 12
    if (size === 100) return 11
    if (size === 200) return 10
    return 14
}

const clampLevel = (n: number | null | undefined, betSize?: number | string | null, strategy?: string | null) => {
    if (n === null || n === undefined) return null
    const maxL = getMaxLevel(betSize, strategy)
    const num = Number(n)
    return Math.min(maxL, Math.max(1, num))
}

const DEFAULT_PATTERN = ""

export const generateGamePattern = (level: number | null | undefined, pattern: string | null | undefined) => {
    if (!pattern || level === null || level === undefined) return ""
    const numLevel = Number(level)
    let base = ""
    while (base.length < numLevel) {
        base += pattern
    }
    const truncated = base.substring(0, numLevel)
    let result = ""
    for (let i = 0; i < truncated.length; i++) {
        if (i > 0 && i % 4 === 0) {
            result += "-"
        }
        result += truncated[i]
    }
    return result
}

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
    const [levelByRowId, setLevelByRowId] = useState<Record<string, number | null>>({})
    const [patternByRowId, setPatternByRowId] = useState<Record<string, string>>({})
    const [targetProfitByRowId, setTargetProfitByRowId] = useState<Record<string, string>>({})
    const [editingTargetProfitRowId, setEditingTargetProfitRowId] = useState<string | null>(null)
    const [editingTargetProfitValue, setEditingTargetProfitValue] = useState("")
    const [betSizeByRowId, setBetSizeByRowId] = useState<Record<string, number>>({})
    const [durationByRowId, setDurationByRowId] = useState<Record<string, string>>({})
    const [editingDurationRowId, setEditingDurationRowId] = useState<string | null>(null)
    const [editingDurationValue, setEditingDurationValue] = useState("")
    const [strategyByRowId, setStrategyByRowId] = useState<Record<string, string>>({})
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

    const getBetSize = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            if (id in betSizeByRowId) return betSizeByRowId[id]
            return row.bet_size != null ? Number(row.bet_size) : null
        },
        [betSizeByRowId]
    )

    const getStrategy = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            if (id in strategyByRowId) return strategyByRowId[id]
            return row.strategy ?? ""
        },
        [strategyByRowId]
    )

    const getLevel = useCallback(
        (row: BaccaratRow) => {
            const betSize = getBetSize(row)
            const strategy = getStrategy(row)
            return row.id in levelByRowId
                ? levelByRowId[row.id]
                : clampLevel(row.level, betSize, strategy)
        },
        [levelByRowId, getBetSize, getStrategy]
    )

    const setLevel = useCallback((rowId: string | number, value: number | null, betSize?: number | string | null, strategy?: string | null) => {
        const clamped = value === null ? null : clampLevel(value, betSize, strategy)
        setLevelByRowId((prev) => ({ ...prev, [String(rowId)]: clamped }))
    }, [])


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
            setPattern(id, value)
        },
        [setPattern]
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


    const handleBetSizeChange = useCallback((rowId: string | number, value: number) => {
        const id = String(rowId)
        setBetSizeByRowId((prev) => ({ ...prev, [id]: value }))

        // Also clamp the current level if it exceeds the new max level
        setLevelByRowId((prevLevels) => {
            const currentLevel = prevLevels[id]
            if (currentLevel === null || currentLevel === undefined) return prevLevels
            const maxL = getMaxLevel(value)
            if (currentLevel > maxL) {
                return { ...prevLevels, [id]: maxL }
            }
            return prevLevels
        })
    }, [])

    const getDuration = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            if (id in durationByRowId) return durationByRowId[id]
            return row.duration != null ? String(row.duration) : ""
        },
        [durationByRowId]
    )

    const handleDurationFocus = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            setEditingDurationRowId(id)
            setEditingDurationValue(getDuration(row))
        },
        [getDuration]
    )

    const handleDurationChange = useCallback((raw: string) => {
        const digitsOnly = raw.replace(/\D/g, "")
        setEditingDurationValue(digitsOnly)
    }, [])

    const handleDurationBlur = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            const digitsOnly = editingDurationValue.replace(/\D/g, "")

            setDurationByRowId((prev) => ({
                ...prev,
                [id]: digitsOnly,
            }))

            setEditingDurationRowId(null)
            setEditingDurationValue("")
        },
        [editingDurationValue]
    )

    const handleStrategyChange = useCallback((rowId: string | number, value: string) => {
        const id = String(rowId)
        setStrategyByRowId((prev) => ({ ...prev, [id]: value }))

        // Also clamp the current level if it exceeds the new max level
        setLevelByRowId((prevLevels) => {
            const currentLevel = prevLevels[id]
            if (currentLevel === null || currentLevel === undefined) {
                // Even if not in local state, we should check the row level
                const row = data.find(r => String(r.id) === id)
                if (row) {
                    const betSize = betSizeByRowId[id] ?? row.bet_size
                    const maxL = getMaxLevel(betSize, value)

                    // If strategy is Burst/Sweeper, null is not allowed, default to 1
                    if (value === "Burst" || value === "Sweeper") {
                        return { ...prevLevels, [id]: 1 }
                    }

                    if (Number(row.level || 0) > maxL) {
                        return { ...prevLevels, [id]: maxL }
                    }
                }
                return prevLevels
            }

            const row = data.find(r => String(r.id) === id)
            const betSize = betSizeByRowId[id] ?? row?.bet_size
            const maxL = getMaxLevel(betSize, value)

            // If strategy is Burst/Sweeper, currentLevel (null) is invalid.
            if ((value === "Burst" || value === "Sweeper") && currentLevel === null) {
                return { ...prevLevels, [id]: 1 }
            }

            if (currentLevel !== null && currentLevel > maxL) {
                return { ...prevLevels, [id]: maxL }
            }
            return prevLevels
        })
    }, [betSizeByRowId, data])

    const hasRowChanges = useCallback(
        (row: BaccaratRow) => {
            const id = String(row.id)
            if (id in levelByRowId && levelByRowId[id] !== clampLevel(row.level)) return true
            if (id in patternByRowId && patternByRowId[id] !== (row.pattern ?? DEFAULT_PATTERN)) return true
            if (id in targetProfitByRowId && targetProfitByRowId[id] !== (row.target_profit != null ? String(row.target_profit) : "")) return true
            if (id in betSizeByRowId && betSizeByRowId[id] !== (row.bet_size != null ? Number(row.bet_size) : null)) return true
            if (id in durationByRowId && durationByRowId[id] !== (row.duration != null ? String(row.duration) : "")) return true
            if (id in strategyByRowId && strategyByRowId[id] !== (row.strategy ?? "")) return true
            return false
        },
        [levelByRowId, patternByRowId, targetProfitByRowId, betSizeByRowId, durationByRowId, strategyByRowId]
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
        setDurationByRowId((prev) => {
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
        if (editingTargetProfitRowId === id) {
            setEditingTargetProfitRowId(null)
            setEditingTargetProfitValue("")
        }
        if (editingDurationRowId === id) {
            setEditingDurationRowId(null)
            setEditingDurationValue("")
        }
    }, [editingTargetProfitRowId, editingDurationRowId])

    const handleConfirmRowChanges = useCallback(
        async (row: BaccaratRow) => {
            const id = String(row.id)

            const level = getLevel(row)
            const pattern = getPattern(row)
            const targetProfitRaw = getTargetProfit(row)
            const target_profit =
                targetProfitRaw.trim() === "" ? null : Number(targetProfitRaw.replace(/\D/g, "")) || null
            const bet_size = getBetSize(row)
            const durationRaw = getDuration(row)
            const duration = durationRaw.trim() === "" ? null : Number(durationRaw.replace(/\D/g, "")) || null

            try {
                setSavingRowId(id)

                // Directly calling human-readable Server Action
                await updateBaccaratRow({
                    id: row.id,
                    level,
                    pattern,
                    target_profit,
                    bet_size,
                    duration,
                    strategy: getStrategy(row),
                    game_pattern: generateGamePattern(level, pattern)
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
                    duration,
                    strategy: getStrategy(row)
                })
            } catch (error: any) {
                console.error("Save failed:", error)
                alert(error.message || "Failed to save changes for this row.")
            } finally {
                setSavingRowId((current) => (current === id ? null : current))
            }
        },
        [getLevel, getPattern, getTargetProfit, getBetSize, getDuration, getStrategy, handleCancelRowChanges, onRowUpdate]
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
                    duration: Number(getDuration(row)) || null,
                    strategy: getStrategy(row),
                    status: newStatus,
                    command: newStatus === "Running",
                    game_pattern: generateGamePattern(getLevel(row), getPattern(row))
                })

                onRowUpdate?.({
                    id: row.id,
                    status: newStatus,
                    duration: Number(getDuration(row)) || null,
                    // Note: command is not in BaccaratRow type yet, but we update it in DB
                })
            } catch (error: any) {
                console.error("Status update failed:", error)
                alert(error.message || "Failed to update status.")
            } finally {
                setSavingRowId((current) => (current === id ? null : current))
            }
        },
        [getLevel, getPattern, getTargetProfit, getBetSize, getDuration, getStrategy, onRowUpdate]
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
                                <span>Traget Profit (%)</span>
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
                                <span>Duration (mins.)</span>
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
                                <Select
                                    value={getLevel(row) === null ? "-" : String(getLevel(row))}
                                    onValueChange={(value) => setLevel(row.id, value === "-" ? null : Number(value), getBetSize(row), getStrategy(row))}
                                >
                                    <SelectTrigger className="w-16 h-7 text-xs bg-transparent border-[#868686] text-gray-200 justify-center mx-auto">
                                        <SelectValue placeholder="-" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-gray-800">
                                        {!(getStrategy(row) === "Burst" || getStrategy(row) === "Sweeper") && (
                                            <SelectItem value="-" className="text-gray-200 hover:bg-gray-800">-</SelectItem>
                                        )}
                                        {[...Array(getMaxLevel(getBetSize(row), getStrategy(row)))].map((_, i) => (
                                            <SelectItem key={i + 1} value={String(i + 1)} className="text-gray-200 hover:bg-gray-800">
                                                {i + 1}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                        <SelectItem value="Standard" className="text-gray-200 hover:bg-gray-800">Standard</SelectItem>
                                        <SelectItem
                                            value="Sweeper"
                                            className="text-gray-200 hover:bg-gray-800"
                                            disabled={(getLevel(row) ?? 0) >= 4}
                                        >
                                            Sweeper
                                        </SelectItem>
                                        <SelectItem
                                            value="Burst"
                                            className="text-gray-200 hover:bg-gray-800"
                                            disabled={(getLevel(row) ?? 0) >= 4}
                                        >
                                            Burst
                                        </SelectItem>
                                        <SelectItem value="Tank" className="text-gray-200 hover:bg-gray-800">Tank</SelectItem>
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
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                        editingDurationRowId === String(row.id)
                                            ? editingDurationValue
                                            : getDuration(row)
                                    }
                                    onFocus={() => handleDurationFocus(row)}
                                    onChange={(e) => handleDurationChange(e.target.value)}
                                    onBlur={() => handleDurationBlur(row)}
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
