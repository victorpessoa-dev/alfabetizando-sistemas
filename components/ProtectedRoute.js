"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function ProtectedRoute({ children }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkAuth() {
            const { data, error } = await supabase.auth.getUser()

            if (error || !data.user) {
                router.push("/login")
            } else {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Carregando...
            </div>
        )
    }

    return children
}
