"use client"

import React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { DeletePlatformModal } from "@/components/modal/Delete/DeletePlatform"
import { deletePlatformWebsite } from "@/helper/platform_websites"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export type BettingPlatform = {
    id: string | number
    name: string
    code: string
    website: string
    min_bet: number | string
    raw?: any // Original record for editing
}

interface BettingPlatformTableProps {
    data: BettingPlatform[]
    loading: boolean
    onEdit?: (platform: any) => void
}

export const BettingPlatformTable = ({ data, loading, onEdit }: BettingPlatformTableProps) => {
    const router = useRouter()
    const [selectedPlatform, setSelectedPlatform] = React.useState<{ id: string | number, name: string } | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDeleteClick = (id: string | number, name: string) => {
        setSelectedPlatform({ id, name })
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedPlatform) return

        setIsDeleting(true)
        try {
            await deletePlatformWebsite(selectedPlatform.id)
            toast.success("Platform deleted successfully")
            setIsDeleteModalOpen(false)
            setSelectedPlatform(null)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete platform")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Platform Name
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Platform Code
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Platform Website
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Minimum Bet
                        </TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center h-10 px-4">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={5} className="text-center text-gray-500 h-32 italic">
                                Loading platforms...
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && data.length === 0 && (
                        <TableRow className="border-gray-800">
                            <TableCell colSpan={5} className="text-center text-gray-500 h-32 italic">
                                No platforms found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && data.length > 0 && data.map((row) => (
                        <TableRow key={row.id} className="border-gray-800 hover:bg-[#111] transition-colors">
                            <TableCell className="text-center text-gray-200 text-xs py-4">
                                {row.name}
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs py-4">
                                {row.code}
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs py-4">
                                <a
                                    href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    {row.website}
                                </a>
                            </TableCell>
                            <TableCell className="text-center text-gray-200 text-xs py-4">
                                {row.min_bet}
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-[#262626] text-muted-foreground hover:text-white transition-colors"
                                        onClick={() => onEdit?.(row.raw || row)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-[#262626] text-muted-foreground hover:text-red-500 transition-colors"
                                        onClick={() => handleDeleteClick(row.id, row.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <DeletePlatformModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                platformName={selectedPlatform?.name || ""}
                isPending={isDeleting}
            />
        </div>
    )
}
