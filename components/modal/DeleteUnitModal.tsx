"use client"

import React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle } from "lucide-react"

interface DeleteUnitModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    unitName: string
    isPending: boolean
}

export function DeleteUnitModal({
    isOpen,
    onClose,
    onConfirm,
    unitName,
    isPending
}: DeleteUnitModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white sm:max-w-[400px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-red-500/10 text-red-500">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-xl">Delete Unit</DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-400 text-sm py-2">
                        Are you sure you want to delete <span className="text-white font-semibold">"{unitName}"</span>? 
                        This action cannot be undone and will permanently remove this unit from the baccarat monitor.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex gap-3 mt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border-transparent"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isPending}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Unit"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
