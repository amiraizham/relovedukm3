import * as React from "react"
import { cn } from "@/lib/utils"

export const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn("h-9 w-9 p-2 rounded-md hover:bg-gray-100", className)}
      {...props}
    />
  )
})

IconButton.displayName = "IconButton"
