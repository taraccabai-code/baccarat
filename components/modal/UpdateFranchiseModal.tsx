"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateFranchise } from "@/helper/franchise";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Franchise } from "@/types/franchise";

interface UpdateFranchiseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    franchise: Franchise | null;
}

export const UpdateFranchiseModal = ({ isOpen, onClose, onSuccess, franchise }: UpdateFranchiseModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        franchise_name: "",
        franchise_code: "",
        investor_name: "",
    });

    useEffect(() => {
        if (franchise) {
            setFormData({
                franchise_name: franchise.franchise_name || "",
                franchise_code: franchise.franchise_code || "",
                investor_name: franchise.investor_name || "",
            });
        }
    }, [franchise]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!franchise) return;
        
        // Use either id or franchise_name as the identifier
        const identifier = (franchise as any).id || franchise.franchise_name;
        if (!identifier) {
            toast.error("Cannot identify franchise to update");
            return;
        }

        if (!formData.franchise_name || !formData.franchise_code || !formData.investor_name) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            await updateFranchise(identifier, formData);
            toast.success("Franchise updated successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error updating franchise:", error);
            toast.error(error.message || "Failed to update franchise");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0A0A0A] border-gray-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Franchise</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="franchise_name">Franchise Name</Label>
                        <Input
                            id="franchise_name"
                            name="franchise_name"
                            placeholder="e.g. Alpha Ventures"
                            value={formData.franchise_name}
                            onChange={handleChange}
                            className="bg-[#111111] border-gray-800 focus:border-blue-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="franchise_code">Franchise Code</Label>
                        <Input
                            id="franchise_code"
                            name="franchise_code"
                            placeholder="e.g. ALP-101"
                            value={formData.franchise_code}
                            onChange={handleChange}
                            className="bg-[#111111] border-gray-800 focus:border-blue-600 uppercase"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="investor_name">Investor Name</Label>
                        <Input
                            id="investor_name"
                            name="investor_name"
                            placeholder="e.g. John Doe"
                            value={formData.investor_name}
                            onChange={handleChange}
                            className="bg-[#111111] border-gray-800 focus:border-blue-600"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={loading}
                            className="hover:bg-gray-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Franchise"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
