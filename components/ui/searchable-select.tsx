"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchableSelectOption {
    value: string
    label: string
}

interface SearchableSelectProps {
    id?: string
    options: SearchableSelectOption[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    emptyLabel?: string
    required?: boolean
    className?: string
}

export function SearchableSelect({
    id,
    options,
    value,
    onChange,
    placeholder = "Search...",
    emptyLabel = "None",
    required = false,
    className,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Display label for the currently selected value
    const selectedLabel = options.find(o => o.value === value)?.label ?? ""

    const filtered = query.trim()
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
                setQuery("")
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const handleOpen = () => {
        setOpen(true)
        setQuery("")
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    const handleSelect = (val: string) => {
        onChange(val)
        setOpen(false)
        setQuery("")
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange("")
        setOpen(false)
        setQuery("")
    }

    const baseClass = cn(
        "flex h-10 w-full rounded-md border border-[#1a1a1a] bg-[#050505] px-3 py-2 text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "focus:border-blue-500/50 transition-colors",
        className
    )

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Hidden native input for form required validation */}
            {required && (
                <input
                    type="text"
                    required
                    value={value}
                    onChange={() => {}}
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                    aria-hidden
                />
            )}

            {/* Trigger button */}
            <button
                type="button"
                id={id}
                onClick={handleOpen}
                className={cn(
                    baseClass,
                    "flex items-center justify-between cursor-pointer text-left",
                    !value && "text-muted-foreground"
                )}
            >
                <span className="truncate">{value ? selectedLabel : placeholder}</span>
                <span className="flex items-center gap-1 shrink-0 ml-2">
                    {value && !required && (
                        <X
                            className="h-3.5 w-3.5 text-gray-500 hover:text-white transition-colors"
                            onClick={handleClear}
                        />
                    )}
                    <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", open && "rotate-180")} />
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-[#1a1a1a] bg-[#0a0a0a] shadow-xl overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-[#1a1a1a]">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Type to search..."
                            className="w-full bg-[#050505] border border-[#1a1a1a] rounded px-3 py-1.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    {/* Options list */}
                    <ul className="max-h-48 overflow-y-auto">
                        {/* Empty / None option */}
                        {!required && (
                            <li
                                key="__none__"
                                onClick={() => handleSelect("")}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition-colors",
                                    value === "" && "bg-[#1a1a1a] text-white"
                                )}
                            >
                                <span className="w-4 flex items-center justify-center">
                                    {value === "" && <Check className="h-3 w-3 text-blue-400" />}
                                </span>
                                {emptyLabel}
                            </li>
                        )}

                        {filtered.length === 0 ? (
                            <li className="px-3 py-4 text-center text-sm text-gray-600">No results found</li>
                        ) : (
                            filtered.map(o => (
                                <li
                                    key={o.value}
                                    onClick={() => handleSelect(o.value)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-colors",
                                        value === o.value && "bg-[#1a1a1a] text-white"
                                    )}
                                >
                                    <span className="w-4 flex items-center justify-center">
                                        {value === o.value && <Check className="h-3 w-3 text-blue-400" />}
                                    </span>
                                    {o.label}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    )
}
