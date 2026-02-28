"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Loader2, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createAccount, updateAccount } from "@/helper/accounts"
import { Franchise } from "@/types/franchise"

const userAccountSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    contact_number_1: z.string().min(1, "Contact number 1 is required"),
    contact_number_2: z.string().optional(),
    franchise: z.string().optional(),
})

type UserAccountFormValues = z.infer<typeof userAccountSchema>

interface UserAccountsFormProps {
    initialData?: any | null
    units?: any[]
    franchises?: Franchise[]
    setAccounts: React.Dispatch<React.SetStateAction<any[]>>
    onSuccess?: () => void
    onCancel?: () => void
}

export const UserAccountsForm = ({ initialData, units = [], franchises = [], setAccounts, onSuccess, onCancel }: UserAccountsFormProps) => {
    const router = useRouter()
    const [isPending, setIsPending] = React.useState(false)
    const isUpdate = !!initialData

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<UserAccountFormValues>({
        resolver: zodResolver(userAccountSchema),
        defaultValues: {
            first_name: initialData?.first_name || "",
            last_name: initialData?.last_name || "",
            email: initialData?.email || "",
            contact_number_1: initialData?.contact_number_1 || "",
            contact_number_2: initialData?.contact_number_2 || "",
            franchise: initialData?.franchise || "",
        },
    })

    const onSubmit = async (data: UserAccountFormValues) => {
        setIsPending(true)
        const previousAccounts = await new Promise<any[]>(resolve => setAccounts(prev => { resolve(prev); return prev; }));

        try {
            // Convert empty strings to null for numeric fields to avoid Postgres errors
            const numericFields = ["contact_number_1", "contact_number_2"] as const;
            const sanitizedData = { ...data } as any;

            numericFields.forEach(field => {
                if (sanitizedData[field] === "") {
                    sanitizedData[field] = null;
                } else if (sanitizedData[field] !== undefined && sanitizedData[field] !== null) {
                    // Also ensure they are numbers if they are strings
                    sanitizedData[field] = Number(sanitizedData[field]);
                }
            });

            const optimisticAccount = {
                ...initialData,
                ...sanitizedData,
                id: initialData?.id || `temp-${Date.now()}`
            };

            // Optimistic update
            if (isUpdate) {
                setAccounts(prev => prev.map(acc => acc.id === initialData.id ? optimisticAccount : acc));
                await updateAccount(initialData.id, sanitizedData)
                toast.success("User account updated successfully")
            } else {
                setAccounts(prev => [optimisticAccount, ...prev]);
                await createAccount(sanitizedData)
                toast.success("User account created successfully")
            }

            if (onSuccess) {
                onSuccess()
            } else {
                router.push("/dashboard/trading-accounts/user-accounts")
                router.refresh()
            }
        } catch (error: any) {
            // Rollback
            setAccounts(previousAccounts);
            toast.error(error.message || "Failed to save user account")
        } finally {
            setIsPending(false)
        }
    }

    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        } else {
            router.back()
        }
    }

    return (
        <div className="space-y-6">
            {!onSuccess && (
                <h1 className="text-xl font-semibold text-white tracking-tight">
                    {isUpdate ? "Update User Account" : "Add User Account"}
                </h1>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* FIRST NAME */}
                    <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-white">FIRST NAME</Label>
                        <Input
                            id="first_name"
                            {...register("first_name")}
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            placeholder="Enter first name"
                        />
                        {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
                    </div>

                    {/* LAST NAME */}
                    <div className="space-y-2">
                        <Label htmlFor="last_name" className="text-white">LAST NAME</Label>
                        <Input
                            id="last_name"
                            {...register("last_name")}
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            placeholder="Enter last name"
                        />
                        {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
                    </div>
                </div>




                {/* EMAIL ADDRESS */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">EMAIL ADDRESS</Label>
                    <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        placeholder="Enter email address"
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                {/* CONTACT NUMBERS */}
                <div className="grid grid-cols-2 gap-4">
                    {/* CONTACT NUMBER 1 */}
                    <div className="space-y-2">
                        <Label htmlFor="contact_number_1" className="text-white">CONTACT NUMBER 1</Label>
                        <Input
                            id="contact_number_1"
                            {...register("contact_number_1")}
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            placeholder="Enter contact number 1"
                        />
                        {errors.contact_number_1 && <p className="text-xs text-red-500">{errors.contact_number_1.message}</p>}
                    </div>

                    {/* CONTACT NUMBER 2 */}
                    <div className="space-y-2">
                        <Label htmlFor="contact_number_2" className="text-white">CONTACT NUMBER 2</Label>
                        <Input
                            id="contact_number_2"
                            {...register("contact_number_2")}
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            placeholder="Enter contact number 2"
                        />
                    </div>
                </div>



                {/* FRANCHISE */}
                <div className="space-y-2">
                    <Label htmlFor="franchise" className="text-white">FRANCHISE</Label>
                    <div className="relative">
                        <select
                            id="franchise"
                            {...register("franchise")}
                            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-1 text-sm appearance-none focus:border-blue-500 transition-colors shadow-inner"
                        >
                            <option value="">-- Select Franchise --</option>
                            {franchises
                                .map((franchise) => (
                                    <option
                                        key={franchise.id}
                                        value={franchise.franchise_name || ""}
                                        className="text-white"
                                    >
                                        {franchise.franchise_name}
                                    </option>
                                ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.franchise && <p className="text-xs text-red-500">{errors.franchise.message}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
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
                        {isUpdate ? "Update Account" : "Add Account"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
