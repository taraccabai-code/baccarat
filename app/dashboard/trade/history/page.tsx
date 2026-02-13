"use client"

import React from 'react'
import { History } from 'lucide-react'
import { PlayHistoryTable } from '@/components/tables/play_history'


const TradeHistoryPage = () => {
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

            <PlayHistoryTable />
        </div>
    )
}

export default TradeHistoryPage