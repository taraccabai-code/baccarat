import React, { Suspense } from 'react'
import { getBaccaratData } from '@/helper/baccarat'
import MyUnitsClient from '@/components/page/MyUnitsClient'
import { UnitSkeleton } from '@/components/skeleton/UnitSkeleton'

export default async function MyUnitsPage() {
    const data = await getBaccaratData();
    
    // Map baccarat monitor rows to unit structure
    const initialUnits = data.map((item: any) => ({
        id: item.id.toString(),
        unit_id: item.id.toString(),
        unit_name: item.units || item.pc_name || "Unknown PC",
        status: item.status?.toLowerCase() || "disabled",
        balance: item.user_balance || item.balance,
        level: item.level,
        pattern: item.pattern,
        strategy: item.strategy,
        archived: false,
        franchise: null
    }));

    return (
        <Suspense fallback={<UnitSkeleton />}>
            <MyUnitsClient initialUnits={initialUnits} />
        </Suspense>
    )
}