"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function Topbar() {
    const [school, setSchool] = useState(null)

    useEffect(() => {
        async function loadSchool() {
            const { data: userData, error: userError } = await supabase.auth.getUser()

            if (userError || !userData.user) return

            const { data, error } = await supabase
                .from("school_settings")
                .select("nome")
                .eq("user_id", userData.user.id)
                .single()

            if (!error && data) {
                setSchool(data)
            }
        }

        loadSchool()
    }, [])

    return (
        <header className="bg-white shadow px-6 py-4">
            <span className="font-semibold text-lg">
                {school?.nome || "Alfabetizando Sistemas"}
            </span>
        </header>
    )
}
