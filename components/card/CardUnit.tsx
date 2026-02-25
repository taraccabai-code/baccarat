"use client";

import { useState } from "react";
import {
    Pencil,
    Archive,
    Eye,
    EyeOff,
    User,
    DollarSign,
    Zap,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UnitStatus } from "@/types/units";

export interface UnitTag {
    label: string;
    count: number;
    bgColor: string;
    textColor?: string;
}


export interface UnitCardProps {
    id: string;
    code: string;           // MJ-9
    shortName: string;      // MJ
    company?: string;       // View Plus
    status: UnitStatus;
    serial: string;         // 20D7CBBF
    owner: string;
    accentColor: string;    // purple-500, teal-500
    badgeBg: string;        // purple-600
    badgeText: string;      // purple-100
    tags?: UnitTag[];
    credentialName?: string;
    credentialUsername?: string;
    credentialPassword?: string;
    balance?: number | string;
    level?: number;
    pattern?: string;
    strategy?: string;
    onStatusChange?: (id: string, status: UnitStatus) => void;
    onArchive?: (id: string, name: string) => void;
    onEdit?: (id: string) => void;
}

export function UnitCard({
    id,
    code,
    shortName,
    company,
    status,
    serial,
    owner,
    accentColor,
    badgeBg,
    badgeText,
    tags = [],
    credentialName,
    credentialUsername,
    credentialPassword,
    balance,
    level,
    pattern,
    strategy,
    onStatusChange,
    onArchive,
    onEdit
}: UnitCardProps) {
    const [showPassword, setShowPassword] = useState(false);
    const getStatusConfig = (status: string) => {
        // Normalize status to title case to match baccarat mapping keys
        const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        
        const STATUS_COLORS: Record<string, string> = {
            Running: "#4ADE80",
            Burned: "#D32020",
            Stopped: "#FF8000",
            Idle: "#94A3B8",
            Starting: "#cefc01ff",
            Enabled: "#4ADE80",
            Disabled: "#94A3B8",
            "Slow network": "#FF8000",
            "Not connected": "#D32020",
            "Pc issue": "#D32020",
            Processing: "#cefc01ff"
        };

        const color = STATUS_COLORS[normalizedStatus] || "#868686";
        return { color, label: normalizedStatus };
    };

    const config = getStatusConfig(status);

    const statuses: UnitStatus[] = ["enabled", "processing", "slow network", "not connected", "pc issue", "disabled"];
    return (
        <div
            className={cn(
                "border text-card-foreground shadow hover:border-gray-600 transition-colors rounded-lg bg-gray-800 border-l-4",
                accentColor
            )}
        >
            <div className="p-6">
                {/* Badge */}
                <div className="flex justify-end mb-2 min-h-[28px]">
                    <span
                        className={cn(
                            "text-xs font-bold px-2 py-1 rounded",
                            badgeBg,
                            badgeText
                        )}
                        title={company}
                    >
                        {shortName}
                    </span>
                </div>



                {/* Code & Balance */}
                <div className="text-center mb-2">
                    <div className="font-bold text-2xl font-mono text-white flex items-center justify-center gap-2">
                        {code}
                    </div>
                    {balance !== undefined && (
                        <div className="flex items-center justify-center gap-1 text-green-400 font-mono font-bold text-lg mt-1">
                            <DollarSign className="h-4 w-4" />
                            {typeof balance === 'number' ? balance.toLocaleString() : balance}
                        </div>
                    )}
                    <div className="min-h-[16px]">
                        {company && (
                            <div className="text-xs mt-1 text-gray-400">{company}</div>
                        )}
                    </div>
                </div>

                {/* Serial */}
                <div className="text-center mb-4">
                    <div className="text-sm font-mono text-gray-400">{serial}</div>
                </div>

                {/* Owner */}
                <div className="text-center mb-4 min-h-[24px]">
                    <div className="text-sm font-medium text-gray-300">{owner}</div>
                </div>

                <div className="border-t border-gray-700 mb-4" />

                {/* User & Password */}
                <div className="mb-4 min-h-[80px] flex flex-col justify-center gap-2">
                    {credentialName ? (
                        <>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <User className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                                <span className="truncate font-medium">{credentialName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-mono tracking-widest text-gray-400 text-xs flex-1 truncate">
                                    {showPassword
                                        ? (credentialPassword || "—")
                                        : "••••••••"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="text-gray-500 hover:text-white transition-colors shrink-0"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword
                                        ? <EyeOff className="h-3.5 w-3.5" />
                                        : <Eye className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-xs text-gray-600 text-center">No user assigned</div>
                    )}
                </div>

                {/* Live Stats Section */}
                {(level !== undefined || pattern || strategy) && (
                    <div className="grid grid-cols-2 gap-2 mb-4 p-2 rounded bg-gray-900/50 border border-gray-700/50">
                        {level !== undefined && (
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Level</span>
                                <span className="text-sm font-mono text-blue-400">{level}</span>
                            </div>
                        )}
                        {strategy && (
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Strategy</span>
                                <span className="text-sm truncate text-gray-300" title={strategy}>{strategy}</span>
                            </div>
                        )}
                        {pattern && (
                            <div className="flex flex-col col-span-2 border-t border-gray-800 pt-1 mt-1">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Pattern</span>
                                <span className="text-sm font-mono text-amber-500 truncate" title={pattern}>{pattern}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="border-t border-gray-700 mb-4" />

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-2 py-1">
                        <div 
                            className="w-2 h-2 rounded-full shrink-0" 
                            style={{ backgroundColor: config.color }}
                        />
                        <span className="text-xs font-medium text-gray-400">{config.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Unit"
                            className="text-white hover:bg-gray-700"
                            onClick={() => onEdit?.(id)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            title="Archive Unit"
                            className="text-white hover:bg-gray-700"
                            onClick={() => onArchive?.(id, code)}
                        >
                            <Archive className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
