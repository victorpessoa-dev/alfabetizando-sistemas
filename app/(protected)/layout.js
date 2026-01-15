"use client"

import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Home, Users, CalendarCheck, FileText, CreditCard, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProtectedLayout({ children }) {

  const [school, setSchool] = useState(null)

  useEffect(() => {
    loadSchool()
  }, [])

  async function loadSchool() {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data } = await supabase
      .from("school_settings")
      .select("school_name, school_logo_url")
      .eq("user_id", user.id)
      .single()

    setSchool(data)
  }


  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-screen">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800">
          {school?.school_logo_url && (
            <Image
              src={school.school_logo_url}
              alt="Logo"
              width={40}
              height={40}
              className="rounded"
            />
          )}

          <div className="leading-tight">
            <p className="text-sm font-semibold">
              {school?.school_name || "Minha Escola"}
            </p>
            <span className="text-xs text-muted-foreground">
              Painel Administrativo
            </span>
          </div>
        </div>


        <nav className="flex-1 space-y-2 px-4">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-white">
              <Home className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          </Link>

          <Link href="/alunos">
            <Button variant="ghost" className="w-full justify-start text-white">
              <Users className="mr-2 h-4 w-4" /> Alunos
            </Button>
          </Link>

          <Link href="/frequencia">
            <Button variant="ghost" className="w-full justify-start text-white">
              <CalendarCheck className="mr-2 h-4 w-4" /> Frequência
            </Button>
          </Link>

          <Link href="/pagamentos">
            <Button variant="ghost" className="w-full justify-start text-white">
              <CreditCard className="mr-2 h-4 w-4" /> Pagamentos
            </Button>
          </Link>

          <Link href="/documentos">
            <Button variant="ghost" className="w-full justify-start text-white">
              <FileText className="mr-2 h-4 w-4" /> Documentos
            </Button>
          </Link>

          <Link href="/configuracoes">
            <Button variant="ghost" className="w-full justify-start text-white">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
          </Link>
        </nav>

        {/* FOOTER */}
        <footer className="p-4 text-sm text-center text-slate-400 border-t border-slate-700">
          © {new Date().getFullYear()} Alfabetizando Sistemas
        </footer>
      </aside>

      {/* CONTEÚDO */}
      <main className="ml-64 flex-1 p-6 bg-slate-50">
        {children}
      </main>

    </div>
  )
}
