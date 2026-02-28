"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { createPlatformWebsite, updatePlatformWebsite, PlatformWebsiteRecord } from "@/helper/platform_websites"
import { toast } from "sonner"
import Swal from "sweetalert2"

const platformSchema = z.object({
    platform_name: z.string().min(1, "Platform name is required"),
    platform_website: z.string().min(1, "Platform website is required"),
    min_bet: z.string().min(1, "Minimum bet is required"),
    platform_code: z.string().min(1, "Platform code is required"),
    text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
    bg_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
})

type PlatformFormValues = z.infer<typeof platformSchema>

interface BettingPlatformFormProps {
    initialData?: PlatformWebsiteRecord | null
    onSuccess?: () => void
    onCancel?: () => void
}

export const BettingPlatformForm = ({ initialData, onSuccess, onCancel }: BettingPlatformFormProps) => {
    const [isPending, setIsPending] = React.useState(false)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<PlatformFormValues>({
        resolver: zodResolver(platformSchema),
        defaultValues: {
            platform_name: initialData?.platform_name || "",
            platform_website: initialData?.platform_website || "",
            min_bet: String(initialData?.min_bet || ""),
            platform_code: initialData?.platform_code || "",
            text_color: initialData?.text_color || "#ffffff",
            bg_color: initialData?.bg_color || "#000000",
        },
    })

    const platformName = watch("platform_name")

    React.useEffect(() => {
        if (!initialData) {
            const code = platformName
                .replace(/\s+/g, '')
                .substring(0, 3)
                .toUpperCase()
            setValue("platform_code", code)
        }
    }, [platformName, setValue, initialData])

    const onSubmit = async (data: PlatformFormValues) => {
        setIsPending(true)
        try {
            const payload = {
                platform_name: data.platform_name,
                platform_website: data.platform_website,
                min_bet: data.min_bet,
                platform_code: data.platform_code,
                text_color: data.text_color,
                bg_color: data.bg_color,
            }

            if (initialData?.id) {
                await updatePlatformWebsite(initialData.id, payload)
                toast.success("Platform updated successfully")
            } else {
                await createPlatformWebsite(payload)
                toast.success("Platform created successfully")
            }

            if (onSuccess) {
                onSuccess()
            }
        } catch (error: any) {
            console.error("Operation failed:", error)
            Swal.fire({
                title: 'Error!',
                text: error.message || "Something went wrong",
                icon: 'error',
                confirmButtonColor: '#2563eb',
                background: '#0a0a0a',
                color: '#ffffff'
            })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="platform_name" className="text-white">
                    Platform Name <span className="text-red-400">*</span>
                </Label>
                <Input
                    id="platform_name"
                    {...register("platform_name")}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                    placeholder="Enter platform name"
                />
                {errors.platform_name && <p className="text-xs text-red-500">{errors.platform_name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="platform_code" className="text-white">
                    Platform Code <span className="text-red-400">*</span>
                </Label>
                <Input
                    id="platform_code"
                    {...register("platform_code")}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                    placeholder="Auto-generated code"
                />
                {errors.platform_code && <p className="text-xs text-red-500">{errors.platform_code.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="platform_website" className="text-white">
                    Platform Website <span className="text-red-400">*</span>
                </Label>
                <Input
                    id="platform_website"
                    {...register("platform_website")}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                    placeholder="Enter platform website (e.g. example.com)"
                />
                {errors.platform_website && <p className="text-xs text-red-500">{errors.platform_website.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="min_bet" className="text-white">
                    Minimum Bet <span className="text-red-400">*</span>
                </Label>
                <Input
                    id="min_bet"
                    {...register("min_bet")}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                    placeholder="Enter minimum bet"
                />
                {errors.min_bet && <p className="text-xs text-red-500">{errors.min_bet.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="text_color" className="text-white">
                        Text Color
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="text_color"
                            type="color"
                            {...register("text_color")}
                            className="h-10 w-full bg-gray-800 border-gray-700 p-1 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-gray-400 uppercase">{watch("text_color")}</span>
                    </div>
                    {errors.text_color && <p className="text-xs text-red-500">{errors.text_color.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bg_color" className="text-white">
                        Background Color
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="bg_color"
                            type="color"
                            {...register("bg_color")}
                            className="h-10 w-full bg-gray-800 border-gray-700 p-1 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-gray-400 uppercase">{watch("bg_color")}</span>
                    </div>
                    {errors.bg_color && <p className="text-xs text-red-500">{errors.bg_color.message}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="text-white hover:bg-gray-800 px-6"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
                >
                    {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {initialData ? "Update Platform" : "Add Platform"}
                </Button>
            </div>
        </form>
    )
}
