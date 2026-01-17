"use client"

import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Users,
  CalendarCheck,
  FileText,
  CreditCard,
  Settings,
  BarChart,
  LogOut,
  StarIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function ProtectedLayout({ children }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [school, setSchool] = useState(null)

  useEffect(() => {
    loadSchool()
  }, [])

  async function loadSchool() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("school_settings")
      .select("school_name, school_logo_url")
      .eq("user_id", user.id)
      .single()

    setSchool(data)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const menu = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/alunos", label: "Alunos", icon: Users },
    { href: "/frequencia", label: "Frequência", icon: CalendarCheck },
    { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
    { href: "/avaliacoes", label: "Avaliações", icon: StarIcon },
    // { href: "/relatorio-semanal", label: "Relatórios Semanal", icon: BarChart },
    { href: "/documentos", label: "Documentos", icon: FileText },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-muted/40">

      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background flex flex-col">

        <div className="flex items-center gap-3 px-4 py-5">
          {school?.school_logo_url ? (
            <Image
              src={school.school_logo_url || "/logo_sistema.png"}
              alt="Logo"
              width={42}
              height={42}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center font-bold text-primary">
              {school?.school_name?.charAt(0) || "E"}
            </div>
          )}

          <div className="leading-tight">
            <p className="font-semibold text-sm">
              {school?.school_name || "Minha Escola"}
            </p>
            <span className="text-xs text-muted-foreground">
              Painel Administrativo
            </span>
          </div>
        </div>

        <Separator />

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <Separator />

        <div className="p-4 space-y-3">
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            © {new Date().getFullYear()} Alfabetizando Sistemas
          </p>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
