"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function ProtectedRoute({ children }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkAuth() {
            const { data } = await supabase.auth.getUser()

            if (!data.user) {
                router.push("/login")
            } else {
                setLoading(false)
            }
        }

        checkAuth()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Carregando...
            </div>
        )
    }

    return children
}
