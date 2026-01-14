"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Image from "next/image"

const menu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Alunos", href: "/dashboard/students" },
    { label: "Pagamentos", href: "/dashboard/payments" },
    { label: "Documentos", href: "/dashboard/documents" },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [school, setSchool] = useState(null)

    useEffect(() => {
        async function loadSchool() {
            const { data: userData, error: userError } = await supabase.auth.getUser()

            if (userError || !userData.user) return

            const { data, error } = await supabase
                .from("school_settings")
                .select("nome, logo_url")
                .eq("user_id", userData.user.id)
                .single()

            if (!error && data) {
                setSchool(data)
            }
        }

        loadSchool()
    }, [])

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <aside className="w-64 bg-white shadow flex flex-col min-h-screen">
            {/* Logo no topo */}
            <div className="p-6 border-b">
                <div className="flex justify-center items-center">
                    {school?.logo_url ? (
                        <Image
                            src={school.logo_url}
                            alt={school.nome || "Logo"}
                            width={120}
                            height={120}
                            className="object-contain max-h-24"
                        />
                    ) : (
                        <div className="text-xl font-bold text-blue-600">
                            Alfabetizando
                        </div>
                    )}
                </div>
            </div>

            {/* Menu principal */}
            <nav className="flex-1 flex flex-col py-4">
                {menu.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`px-6 py-3 text-sm hover:bg-gray-100 ${pathname === item.href ? "bg-gray-200 font-semibold" : ""
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Rodapé com Configurações e Logout */}
            <div className="border-t mt-auto">
                <Link
                    href="/dashboard/settings"
                    className={`block px-6 py-3 text-sm hover:bg-gray-100 ${pathname === "/dashboard/settings" ? "bg-gray-200 font-semibold" : ""
                        }`}
                >
                    Configurações
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-gray-100"
                >
                    Sair
                </button>
            </div>
        </aside>
    )
}
