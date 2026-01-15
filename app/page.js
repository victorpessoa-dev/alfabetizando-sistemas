"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, CreditCard, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, attendance: 0, pending: 0 })
  const [recentStudents, setRecentStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)

    try {
      const { data: allStudents } = await supabase.from("students").select("*")
      const { data: attendanceToday } = await supabase
        .from("attendances")
        .select("*")
        .eq("attendance_date", new Date().toISOString().split("T")[0])
      const { data: pendingPayments } = await supabase.from("payments").select("*").eq("paid", false)
      const { data: recent } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      setStats({
        total: allStudents?.length || 0,
        active: allStudents?.filter((s) => s.active)?.length || 0,
        attendance: attendanceToday?.length || 0,
        pending: pendingPayments?.length || 0,
      })
      setRecentStudents(recent || [])
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard - Tia Sheila</h1>
          <p className="text-muted-foreground">Visão geral do sistema de gerenciamento escolar</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Sair
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Todos os alunos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Status ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Presença Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendance}</div>
            <p className="text-xs text-muted-foreground">Marcações de hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Não pagos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alunos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentStudents && recentStudents.length > 0 ? (
            <div className="space-y-4">
              {recentStudents.map((student) => (
                <Link
                  key={student.id}
                  href={`/alunos/${student.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {student.photo_url ? (
                      <img
                        src={student.photo_url || "/placeholder.svg"}
                        alt={student.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{student.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.grade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{student.class || "-"}</p>
                    <p className="text-xs text-muted-foreground">{student.active ? "Ativo" : "Inativo"}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum aluno cadastrado ainda.{" "}
              <Link href="/alunos/novo" className="text-primary hover:underline">
                Cadastrar primeiro aluno
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
