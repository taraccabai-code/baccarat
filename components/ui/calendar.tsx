"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-4", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-y-0 justify-center",
                month: "space-y-4 px-8",
                month_caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 text-white !opacity-100 hover:text-blue-400 hover:bg-gray-800 inline-flex items-center justify-center rounded-md border border-gray-700 z-10 [&_svg]:!text-white [&_svg]:fill-current [&_svg]:stroke-current"
                ),
                button_previous: "absolute left-4 h-7 w-7 bg-transparent p-0 !text-white !opacity-100 hover:text-blue-400 hover:bg-gray-800 inline-flex items-center justify-center rounded-md border border-gray-700 z-10 [&_svg]:!text-white [&_svg]:fill-current [&_svg]:stroke-current",
                button_next: "absolute right-4 h-7 w-7 bg-transparent p-0 !text-white !opacity-100 hover:text-blue-400 hover:bg-gray-800 inline-flex items-center justify-center rounded-md border border-gray-700 z-10 [&_svg]:!text-white [&_svg]:fill-current [&_svg]:stroke-current",
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                week: "flex w-full mt-2",
                day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day_button: "h-9 w-9 p-0 font-normal rounded-md hover:bg-gray-800",
                selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white rounded-md",
                today: "bg-accent text-accent-foreground rounded-md",
                outside: "text-muted-foreground opacity-50",
                disabled: "text-muted-foreground opacity-50",
                hidden: "invisible",
                ...classNames,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
