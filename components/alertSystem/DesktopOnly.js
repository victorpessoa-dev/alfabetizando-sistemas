"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

export function DesktopOnly({ children }) {
    const [allowed, setAllowed] = useState(null)

    useEffect(() => {
        function checkScreen() {
            setAllowed(window.innerWidth >= 768)
        }

        checkScreen()
        window.addEventListener("resize", checkScreen)
        return () => window.removeEventListener("resize", checkScreen)
    }, [])

    if (allowed === null) return null

    if (!allowed) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted px-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="space-y-4 p-6">
                        <h1 className="text-2xl font-bold">
                            Acesso indisponível
                        </h1>

                        <p className="text-muted-foreground">
                            Este sistema foi desenvolvido para uso em computadores ou tablets.
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Por favor, utilize um dispositivo com tela maior.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return children
}
