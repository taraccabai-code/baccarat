"use client"

import React, { Suspense, useState, useEffect } from 'react'
import { getAccounts } from '@/helper/accounts'
import { getUnits } from '@/helper/units'
import { getFranchises } from '@/helper/franchise'
import { SearchBarHeader } from '@/components/ui/search-bar-header'
import { AccountsTable, AccountsTableSkeleton } from '@/components/tables/accounts'

import { CreateUserAccountDialog } from '@/components/modal/Create/CreateUserAccountDialog'

const UserAccountsPage = () => {
    const [accounts, setAccounts] = useState<any[]>([])
    const [units, setUnits] = useState<any[]>([])
    const [franchises, setFranchises] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountsData, unitsData, franchisesData] = await Promise.all([
                    getAccounts(),
                    getUnits(),
                    getFranchises()
                ])
                setAccounts(accountsData)
                setUnits(unitsData)
                setFranchises(franchisesData)
            } catch (error) {
                console.error("Failed to fetch data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredAccounts = accounts.filter(account => {
        const query = searchQuery.toLowerCase()
        return (
            (account.first_name?.toLowerCase() || "").includes(query) ||
            (account.last_name?.toLowerCase() || "").includes(query) ||
            (account.email?.toLowerCase() || "").includes(query) ||
            (account.franchise?.toLowerCase() || "").includes(query)
        )
    })

    return (
        <div suppressHydrationWarning className="p-6 bg-[#050505] h-full">
            <div className="flex flex-col rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] shadow-2xl overflow-hidden">
                {/* Header Section */}
                <div className="px-6 pt-6 pb-10">
                    <SearchBarHeader
                        title="User Accounts"
                        actionComponent={<CreateUserAccountDialog units={units} franchises={franchises} setAccounts={setAccounts} />}
                        showSearch={true}
                        onSearchChange={setSearchQuery}
                    />
                </div>

                {/* Content Section */}
                <div className="px-6 pb-6">
                    {isLoading ? (
                        <AccountsTableSkeleton />
                    ) : (
                        <AccountsTable data={filteredAccounts} units={units} franchises={franchises} setAccounts={setAccounts} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserAccountsPage
