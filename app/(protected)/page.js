"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, CalendarCheck, CreditCard, Clock, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

export default function DashboardPage() {
    const supabase = createClient()
    const router = useRouter()

    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        attendanceToday: 0,
        paymentsMonth: 0,
        evaluationsToday: 0,
    })
    const [attendanceWeek, setAttendanceWeek] = useState([])
    const [recentPayments, setRecentPayments] = useState([])
    const [alerts, setAlerts] = useState([])
    const [recentStudents, setRecentStudents] = useState([])
    const [loading, setLoading] = useState(true)

    const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex"]

    useEffect(() => {
        loadDashboard()
    }, [])

    async function loadDashboard() {
        setLoading(true)
        try {
            const today = new Date().toISOString().split("T")[0]
            const firstDayMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                .toISOString()
                .split("T")[0]

            const [
                studentsRes,
                attendanceRes,
                paymentsRes,
                evaluationsRes,
                unpaidRes,
                recentStudentsRes,
            ] = await Promise.all([
                supabase.from("students").select("id, active", { count: "exact", head: true }),
                supabase.from("attendances").select("id", { count: "exact", head: true }).eq("attendance_date", today).eq("present", true),
                supabase.from("payments").select("amount").gte("payment_date", firstDayMonth),
                supabase.from("student_evaluations").select("id", { count: "exact", head: true }).eq("evaluation_date", today),
                supabase.from("payments").select("id", { count: "exact", head: true }).eq("paid", false),
                supabase.from("students").select("*").order("created_at", { ascending: false }).limit(5),
            ])

            const totalPayments = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

            const newAlerts = []
            if ((attendanceRes.count || 0) === 0) newAlerts.push("Nenhuma presença registrada hoje")
            if ((unpaidRes.count || 0) > 0) newAlerts.push(`${unpaidRes.count} pagamentos pendentes`)
            setAlerts(newAlerts)

            setStats({
                total: studentsRes.count || 0,
                active: studentsRes.count || 0,
                attendanceToday: attendanceRes.count || 0,
                paymentsMonth: totalPayments,
                evaluationsToday: evaluationsRes.count || 0,
            })

            setRecentStudents(recentStudentsRes.data || [])

            // Presença da semana
            const weekData = await Promise.all(
                weekDays.map(async (day, i) => {
                    // Aqui você pode personalizar a contagem por dia se quiser
                    const { count } = await supabase
                        .from("attendances")
                        .select("id", { count: "exact", head: true })
                        .eq("present", true)
                    return { day, total: count || 0 }
                })
            )
            setAttendanceWeek(weekData)

            // Pagamentos recentes
            const { data: recentPaymentsData } = await supabase
                .from("payments")
                .select(`
          id,
          amount,
          paid,
          students ( nome_completo )
        `)
                .order("created_at", { ascending: false })
                .limit(5)
            setRecentPayments(recentPaymentsData || [])
        } catch (err) {
            console.error("Erro ao carregar dashboard:", err)
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
                <p className="text-muted-foreground">Carregando dashboard...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard - Tia Sheila</h1>
                    <p className="text-muted-foreground">Visão geral do sistema de gerenciamento escolar</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    Sair
                </Button>
            </div>

            {/* Cards principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard title="Total de Alunos" value={stats.total} icon={<Users />} />
                <DashboardCard title="Alunos Ativos" value={stats.active} icon={<Clock />} />
                <DashboardCard title="Presença Hoje" value={stats.attendanceToday} icon={<CalendarCheck />} />
                <DashboardCard title="Pagamentos do Mês" value={`R$ ${stats.paymentsMonth.toFixed(2)}`} icon={<CreditCard />} />
                <DashboardCard title="Avaliações Hoje" value={stats.evaluationsToday} icon={<Star />} />
            </div>

            {/* Gráficos e listas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AttendanceChart data={attendanceWeek} />
                <RecentPayments payments={recentPayments} />
                <AlertsList alerts={alerts} />
            </div>

            {/* Alunos recentes */}
            <Card>
                <CardHeader>
                    <CardTitle>Alunos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentStudents.length > 0 ? (
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
                                                alt={student.name_completo}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-sm font-bold text-primary">{student.name_completo.charAt(0)}</span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{student.name_completo}</p>
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

/* ===== COMPONENTES AUXILIARES ===== */
function DashboardCard({ title, value, icon }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-full bg-primary/10 text-primary">{icon}</div>
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function AttendanceChart({ data }) {
    const colors = ["#3b82f6", "#f97316", "#10b981", "#facc15", "#8b5cf6"]

    return (
        <Card className="p-4">
            <p className="font-bold mb-2">Presenças da Semana</p>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    )
}

function RecentPayments({ payments }) {
    return (
        <Card className="p-4">
            <p className="font-bold mb-2">Pagamentos Recentes</p>
            <ul>
                {payments.map((p) => (
                    <li key={p.id} className="flex justify-between border-b py-1">
                        <span>{p.students?.nome_completo || "Aluno"}</span>
                        <span>R$ {Number(p.amount).toFixed(2)}</span>
                        <span>{p.paid ? "Pago" : "Pendente"}</span>
                    </li>
                ))}
            </ul>
        </Card>
    )
}

function AlertsList({ alerts }) {
    if (!alerts.length) return null
    return (
        <Card className="p-4">
            <p className="font-bold mb-2">Alertas</p>
            <ul className="list-disc pl-5">
                {alerts.map((a, index) => (
                    <li key={index}>{a}</li>
                ))}
            </ul>
        </Card>
    )
}
