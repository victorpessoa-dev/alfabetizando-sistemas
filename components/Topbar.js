"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function Topbar() {
    const router = useRouter()
    const [school, setSchool] = useState(null)

    useEffect(() => {
        async function loadSchool() {
            const { data: userData } = await supabase.auth.getUser()

            if (!userData.user) return

            const { data } = await supabase
                .from("school_settings")
                .select("nome, logo_url")
                .eq("user_id", userData.user.id)
                .single()

            setSchool(data)
        }

        loadSchool()
    }, [])

    async function logout() {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                {school?.logo_url && (
                    <img
                        src={school.logo_url}
                        alt="Logo"
                        className="h-8 w-8 rounded"
                    />
                )}
                <span className="font-semibold">
                    {school?.nome}
                </span>
            </div>

            <button
                onClick={logout}
                className="text-sm text-red-600 hover:underline"
            >
                Sair
            </button>
        </header>
    )
}
