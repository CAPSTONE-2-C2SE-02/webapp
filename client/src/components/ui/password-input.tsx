import React, { useState } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { EyeOff, Eye } from "lucide-react"

function PasswordInput({ className, ...props }: React.ComponentProps<"input">) {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <div className="relative">
        <Input
            type={showPassword ? "text" : "password"}
            className={cn("pe-10", className)}
            {...props}
        />
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground"
        >
            {showPassword ? (
                <EyeOff className="size-4" />
            ) : (
                <Eye className="size-4" />
            )}
        </button>
        </div>
    )
}


PasswordInput.displayName = "PasswordInput"

export { PasswordInput }