"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createCredential, updateCredential } from "@/helper/credentials"
import { getPlatformWebsites, PlatformWebsiteRecord } from "@/helper/platform_websites"
import { getAccounts } from "@/helper/accounts"

const credentialSchema = z.object({
    account_name: z.string().min(1, "Account Name is required"),
    betting_platform: z.string().min(1, "Betting Site is required"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
})

type CredentialFormValues = z.infer<typeof credentialSchema>

interface AccountCredentialsFormProps {
    initialData?: any | null
    // Add Modal Logic Props
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const AccountCredentialsForm = ({
    initialData,
    onSuccess,
    onCancel
}: AccountCredentialsFormProps) => {
    const router = useRouter()
    const [isPending, setIsPending] = React.useState(false)
    const [platforms, setPlatforms] = useState<PlatformWebsiteRecord[]>([])
    const [accounts, setAccounts] = useState<any[]>([])
    const [showPassword, setShowPassword] = useState(false)
    const isUpdate = !!initialData

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [platformData, accountsData] = await Promise.all([
                    getPlatformWebsites(),
                    getAccounts()
                ])
                setPlatforms(platformData)
                setAccounts(accountsData)
            } catch (error) {
                console.error("Failed to fetch data:", error)
            }
        }
        fetchData()
    }, [])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CredentialFormValues>({
        resolver: zodResolver(credentialSchema),
        defaultValues: {
            account_name: initialData?.account_name || "",
            betting_platform: initialData?.betting_platform || "",
            username: initialData?.username || "",
            password: initialData?.password || "",
        },
    })

    const onSubmit = async (data: CredentialFormValues) => {
        setIsPending(true)
        try {
            const payload = {
                ...data,
            }

            if (isUpdate) {
                await updateCredential(initialData.id, payload)
                toast.success("Credential updated successfully")
            } else {
                await createCredential(payload)
                toast.success("Credential created successfully")
            }

            // 2. Updated Navigation Logic
            if (onSuccess) {
                // If in Modal: Close and Refresh Parent
                onSuccess()
            } else {
                // If on Page: Navigate away
                router.push("/dashboard/trading-accounts/credentials")
                router.refresh()
            }

        } catch (error: any) {
            toast.error(error.message || "Failed to save credentials")
        } finally {
            setIsPending(false)
        }
    }

    // 3. Helper for Cancel Button
    const handleCancel = () => {
        if (onCancel) {
            onCancel() // Close modal
        } else {
            router.back() // Go back in history
        }
    }

    const selectClassName = "flex h-11 w-full rounded-md border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner"

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Only show title if NOT in a modal */}
            {!onSuccess && (
                <h1 className="text-xl font-semibold text-white tracking-tight">
                    {isUpdate ? "Update Credential" : "Add Account Credentials"}
                </h1>
            )}

            {/* ACCOUNT NAME */}
            <div className="space-y-2">
                <Label htmlFor="account_name" className="text-white text-sm font-medium">ACCOUNT NAME</Label>
                <select
                    id="account_name"
                    {...register("account_name")}
                    className={selectClassName}
                >
                    <option value="" disabled className="text-gray-500 bg-[#0d0d0d]">Select a user account</option>
                    {accounts.map((acc) => {
                        const fullName = [acc.first_name, acc.middle_name, acc.last_name]
                            .filter(Boolean)
                            .join(" ");
                        return (
                            <option key={acc.id} value={fullName} className="bg-[#0d0d0d]">
                                {fullName}
                            </option>
                        );
                    })}
                </select>
                {errors.account_name && <p className="text-xs text-red-500 mt-1">{errors.account_name.message}</p>}
            </div>



            {/* BETTING SITE */}
            <div className="space-y-2">
                <Label htmlFor="betting_platform" className="text-white text-sm font-medium uppercase">BETTING PLATFORM</Label>
                <select
                    id="betting_platform"
                    {...register("betting_platform")}
                    className={selectClassName}
                >
                    <option value="" disabled className="text-gray-500 bg-[#0d0d0d]">Select a betting platform</option>
                    {platforms.map((p) => (
                        <option key={p.id} value={String(p.platform_name)} className="bg-[#0d0d0d]">
                            {p.platform_name}
                        </option>
                    ))}
                </select>
                {errors.betting_platform && <p className="text-xs text-red-500 mt-1">{errors.betting_platform.message}</p>}
            </div>

            {/* USERNAME */}
            <div className="space-y-2">
                <Label htmlFor="username" className="text-white text-sm font-medium">USERNAME</Label>
                <Input
                    id="username"
                    {...register("username")}
                    className="bg-[#0d0d0d] border-[#1a1a1a] text-white placeholder:text-gray-500 h-11 focus:border-blue-500 transition-all shadow-inner"
                    placeholder="Enter platform username"
                />
                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
                <Label htmlFor="password" className="text-white text-sm font-medium">PASSWORD</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...register("password")}
                        className="bg-[#0d0d0d] border-[#1a1a1a] text-white h-11 focus:border-blue-500 transition-all shadow-inner pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#1a1a1a]">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    className="text-gray-400 hover:bg-[#1a1a1a] hover:text-white px-6 transition-all"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
                >
                    {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {isUpdate ? "Update Credential" : "Add Credentials"}
                </Button>
            </div>
        </form>
    )
}