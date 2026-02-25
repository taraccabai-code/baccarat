import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export const AccountsTableSkeleton = () => {
    return (
        <div className="border rounded-md border-gray-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0a0a0a]">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">Actions</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">FRANCHISE</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">FIRST NAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">MIDDLE NAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">LAST NAME</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">EMAIL</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">ADDRESS</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">CONTACT NUMBER 1</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-4">CONTACT NUMBER 2</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i} className="border-gray-800 hover:bg-transparent">
                            <TableCell>
                                <div className="flex items-center justify-center gap-2">
                                    <Skeleton className="h-8 w-18 bg-[#1a1a1a]" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-24 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-24 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-24 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-32 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-40 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-28 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-28 mx-auto bg-[#1a1a1a]" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}