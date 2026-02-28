"use client"

import React, { Suspense, useState, useEffect } from 'react'
import { getPlatformWebsites, PlatformWebsiteRecord } from '@/helper/platform_websites'
import { SearchBarHeader } from '@/components/ui/search-bar-header'
import { BettingPlatformTable } from '@/components/tables/betting_platforms'
import { FundersTableSkeleton } from '@/components/skeleton/PlatformSkeleton'
import { FunderModal } from '@/components/modal/FunderModal'

const FundersPage = () => {
    const [funders, setFunders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedFunder, setSelectedFunder] = useState<any | null>(null)

    const fetchPlatforms = async (silent = false) => {
        if (!silent) setIsLoading(true)
        try {
            const data = await getPlatformWebsites()
            setFunders(data) // Reusing funders state for now to minimize changes, but it holds platform data
        } catch (error) {
            console.error("Failed to fetch platforms:", error)
        } finally {
            if (!silent) setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPlatforms()
    }, [])

    const handleAddClick = () => {
        setSelectedFunder(null)
        setIsModalOpen(true)
    }

    const handleEditClick = (funder: any) => {
        setSelectedFunder(funder)
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setSelectedFunder(null)
    }

    const handleModalSuccess = () => {
        setIsModalOpen(false)
        setSelectedFunder(null)
        fetchPlatforms(true) // Refresh silently
    }
    const filteredPlatforms = (funders as PlatformWebsiteRecord[]).filter(platform => {
        const query = searchQuery.toLowerCase()
        return (
            (platform.platform_name?.toLowerCase() || "").includes(query) ||
            (platform.platform_website?.toLowerCase() || "").includes(query)
        )
    })

    const mappedPlatforms = filteredPlatforms.map(platform => ({
        id: platform.id,
        name: platform.platform_name || "Unknown",
        code: platform.platform_code || "N/A",
        website: platform.platform_website || "N/A",
        min_bet: platform.min_bet || "0",
        text_color: platform.text_color || undefined,
        bg_color: platform.bg_color || undefined,
        raw: platform // Pass the full record for editing
    }))

    return (
        <div suppressHydrationWarning className="p-6 bg-[#050505] h-full">
            <div className="flex flex-col rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] shadow-2xl overflow-hidden ">
                {/* Header Section */}
                <div className="px-6 pt-6 pb-10">
                    <SearchBarHeader
                        title="Betting Platforms"
                        addButtonText="Add Platform"
                        onAddClick={handleAddClick}
                        showSearch={true}
                        onSearchChange={setSearchQuery}
                    />
                </div>

                {/* Content Section */}
                <div className="px-6 pb-6">
                    {isLoading ? (
                        <FundersTableSkeleton />
                    ) : (
                        <BettingPlatformTable
                            data={mappedPlatforms}
                            loading={isLoading}
                            onEdit={handleEditClick}
                        />
                    )}
                </div>
            </div>

            <FunderModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                initialData={selectedFunder}
            />
        </div>
    )
}

export default FundersPage