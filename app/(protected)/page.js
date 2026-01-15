"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CalendarCheck, Wallet, Star } from "lucide-react"

// Exemplo simples de gráfico com Recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function DashboardPage() {
    const supabase = createClient()

    const [attendanceWeek, setAttendanceWeek] = useState([])
    const [recentPayments, setRecentPayments] = useState([])
    const [alerts, setAlerts] = useState([])
    const [stats, setStats] = useState({
        students: 0,
        attendanceToday: 0,
        paymentsMonth: 0,
        evaluationsToday: 0,
    })
    const [loading, setLoading] = useState(true)

    const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex"]

    // Load weekly attendance
    useEffect(() => {
        async function loadAttendanceWeek() {
            const data = await Promise.all(
                weekDays.map(async (day) => {
                    const { count } = await supabase
                        .from("attendances")
                        .select("id", { count: "exact", head: true })
                        .eq("present", true)
                    return { day, total: count || 0 }
                })
            )
            setAttendanceWeek(data)
        }
        loadAttendanceWeek()
    }, [])

    // Load recent payments
    useEffect(() => {
        async function loadRecentPayments() {
            const { data } = await supabase
                .from("payments")
                .select(`
          id,
          amount,
          paid,
          students ( nome_completo )
        `)
                .order("created_at", { ascending: false })
                .limit(5)

            setRecentPayments(data || [])
        }
        loadRecentPayments()
    }, [])

    // Load main dashboard stats
    useEffect(() => {
        loadDashboard()
    }, [])

    async function loadDashboard() {
        setLoading(true)

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
        ] = await Promise.all([
            supabase.from("students").select("id", { count: "exact", head: true }).eq("active", true),
            supabase.from("attendances").select("id", { count: "exact", head: true }).eq("attendance_date", today).eq("present", true),
            supabase.from("payments").select("amount").gte("payment_date", firstDayMonth),
            supabase.from("student_evaluations").select("id", { count: "exact", head: true }).eq("evaluation_date", today),
            supabase.from("payments").select("id", { count: "exact", head: true }).eq("paid", false),
        ])

        const totalPayments = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

        const newAlerts = []
        if ((attendanceRes.count || 0) === 0) newAlerts.push("Nenhuma presença registrada hoje")
        if ((unpaidRes.count || 0) > 0) newAlerts.push(`${unpaidRes.count} pagamentos pendentes`)
        setAlerts(newAlerts)

        setStats({
            students: studentsRes.count || 0,
            attendanceToday: attendanceRes.count || 0,
            paymentsMonth: totalPayments,
            evaluationsToday: evaluationsRes.count || 0,
        })

        setLoading(false)
    }

    if (loading) {
        return <p>Carregando dashboard...</p>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard title="Alunos Ativos" value={stats.students} icon={<Users />} />
                <DashboardCard title="Presenças Hoje" value={stats.attendanceToday} icon={<CalendarCheck />} />
                <DashboardCard title="Pagamentos do Mês" value={`R$ ${stats.paymentsMonth.toFixed(2)}`} icon={<Wallet />} />
                <DashboardCard title="Avaliações Hoje" value={stats.evaluationsToday} icon={<Star />} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <AttendanceChart data={attendanceWeek} />
                <RecentPayments payments={recentPayments} />
                <AlertsList alerts={alerts} />
            </div>
        </div>
    )
}

// Card genérico do dashboard
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

// Gráfico de presenças da semana
function AttendanceChart({ data }) {
    return (
        <Card className="p-4">
            <p className="font-bold mb-2">Presenças da Semana</p>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    )
}

// Lista de pagamentos recentes
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

// Lista de alertas
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
