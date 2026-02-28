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
    TrendingUp,
    Trash2
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
    assignedUserName?: string;
    franchiseCode?: string;
    balance?: number | string;
    level?: number;
    pattern?: string;
    strategy?: string;
    onStatusChange?: (id: string, status: UnitStatus) => void;
    onArchive?: (id: string, name: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string, name: string) => void;
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
    assignedUserName,
    franchiseCode,
    onStatusChange,
    onArchive,
    onEdit,
    onDelete
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
                "border text-card-foreground shadow hover:border-gray-600 transition-colors rounded-lg bg-gray-800 border-l-4 flex flex-col h-full",
                accentColor
            )}
        >
            <div className="p-6 flex flex-col flex-1 h-full">
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
                    {assignedUserName && (
                        <div className="flex items-center justify-center gap-1.5 mt-3 text-gray-400">
                            <User className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium truncate max-w-[150px]">
                                {assignedUserName}
                            </span>
                        </div>
                    )}

                </div>
            

                {/* Actions */}
                <div className="flex items-center justify-between mt-auto pt-6">
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
                            title="Delete Unit"
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => onDelete?.(id, code)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
