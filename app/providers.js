"use client"

import { DesktopOnly } from "@/components/alertSystem/DesktopOnly"

export default function Providers({ children }) {
    return (
        <DesktopOnly>
            {children}
        </DesktopOnly>
    )
}
