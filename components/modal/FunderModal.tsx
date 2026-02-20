"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BettingPlatformForm } from "@/components/form/BettingPlatformForm"
import { PlatformWebsiteRecord } from "@/helper/platform_websites"

interface FunderModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    initialData?: PlatformWebsiteRecord | null
}

export function FunderModal({ isOpen, onClose, onSuccess, initialData }: FunderModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Update Platform' : 'Add New Platform'}</DialogTitle>
                </DialogHeader>
                <div className="pt-4">
                    <BettingPlatformForm
                        key={initialData?.id || 'new'}
                        initialData={initialData}
                        onSuccess={onSuccess}
                        onCancel={onClose}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
