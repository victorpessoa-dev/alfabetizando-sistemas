"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const menu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Alunos", href: "/dashboard/students" },
    { label: "Presenças", href: "/dashboard/attendance" },
    { label: "Pagamentos", href: "/dashboard/payments" },
    { label: "Documentos", href: "/dashboard/documents" },
    { label: "Configurações", href: "/dashboard/settings" },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-white shadow">
            <div className="p-6 font-bold text-xl text-blue-600">
                Alfabetizando
            </div>

            <nav className="flex flex-col">
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
        </aside>
    )
}
