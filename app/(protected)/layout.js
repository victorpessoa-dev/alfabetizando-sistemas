"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  FileText,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

const HEADER_HEIGHT = "4rem" // 64px
const FOOTER_HEIGHT = "3rem" // 48px
const SIDEBAR_WIDTH = "16rem" // 256px

export default function ProtectedLayout({ children }) {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/auth/login")
      }
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-muted/30">
      {/* SIDEBAR FIXO */}
      <aside
        className="fixed top-0 left-0 h-screen border-r bg-background hidden md:flex flex-col z-50"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="h-20 flex items-center justify-center border-b">
          <Image src="/sheila.png" alt="Logo" width={90} height={90} />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavLink href="/alunos" icon={<Users size={18} />} label="Alunos" />
          <NavLink href="/presenca" icon={<Calendar size={18} />} label="Frequência" />
          <NavLink href="/pagamentos" icon={<CreditCard size={18} />} label="Pagamentos" />
          <NavLink href="/documentos" icon={<FileText size={18} />} label="Documentos" />
        </nav>

        <div className="p-4 border-t">
          <Button onClick={handleLogout} variant="outline" className="w-full gap-2">
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </aside>

      {/* HEADER FIXO */}
      <header
        className="fixed top-0 right-0 border-b bg-background flex items-center px-6 z-40"
        style={{
          left: SIDEBAR_WIDTH,
          height: HEADER_HEIGHT,
        }}
      >
        <h1 className="font-semibold">Alfabetizando Sistemas</h1>
      </header>

      {/* FOOTER FIXO */}
      <footer
        className="fixed bottom-0 right-0 border-t bg-background flex items-center justify-center z-40"
        style={{
          left: SIDEBAR_WIDTH,
          height: FOOTER_HEIGHT,
        }}
      >
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Alfabetizando Sistemas. Todos os direitos reservados.
        </p>
      </footer>

      {/* CONTEÚDO (SCROLL AQUI) */}
      <main
        className="absolute overflow-y-auto p-6"
        style={{
          top: HEADER_HEIGHT,
          bottom: FOOTER_HEIGHT,
          left: SIDEBAR_WIDTH,
          right: 0,
        }}
      >
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition"
    >
      {icon}
      {label}
    </Link>
  )
}
