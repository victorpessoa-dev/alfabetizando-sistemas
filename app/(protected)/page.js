"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

import {
    Users,
    CalendarCheck,
    CreditCard,
    Clock,
    Star,
} from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Skeleton } from "@/components/ui/skeleton"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

export default function DashboardPage() {
    const supabase = createClient()

    const [stats, setStats] = useState(null)
    const [attendanceWeek, setAttendanceWeek] = useState([])
    const [recentStudents, setRecentStudents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboard()
    }, [])

    async function loadDashboard() {
        setLoading(true)

        // Total de alunos
        const { count: totalAlunos } = await supabase
            .from("students")
            .select("*", { count: "exact", head: true })

        // Alunos recentes
        const { data: alunosRecentes } = await supabase
            .from("students")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5)

        // Presença hoje
        const today = new Date().toISOString().split("T")[0]
        const { count: presencaHoje } = await supabase
            .from("attendances")
            .select("*", { count: "exact", head: true })
            .eq("date", today)

        // Avaliações hoje
        const { count: avaliacoesHoje } = await supabase
            .from("student_evaluations")
            .select("*", { count: "exact", head: true })
            .eq("evaluation_date", today)

        // Pagamentos do mês
        const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
        const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]

        const { data: pagamentosMes } = await supabase
            .from("payments")
            .select("amount")
            .gte("reference_month", firstDay)
            .lte("reference_month", lastDay)
            .eq("paid", true)

        const totalPagamentos = pagamentosMes?.reduce((acc, p) => acc + Number(p.amount), 0) || 0

        // Presenças da semana (Seg a Sex)
        const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex"]
        const startOfWeek = new Date()
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1) // Segunda-feira
        let attendanceWeekData = []

        for (let i = 0; i < 5; i++) {
            const day = new Date(startOfWeek)
            day.setDate(day.getDate() + i)
            const dayISO = day.toISOString().split("T")[0]

            const { count } = await supabase
                .from("attendances")
                .select("*", { count: "exact", head: true })
                .eq("date", dayISO)

            attendanceWeekData.push({
                day: weekDays[i],
                total: count || 0
            })
        }

        setStats({
            total: totalAlunos || 0,
            attendanceToday: presencaHoje || 0,
            paymentsMonth: totalPagamentos,
            evaluationsToday: avaliacoesHoje || 0,
        })

        setRecentStudents(alunosRecentes || [])
        setAttendanceWeek(attendanceWeekData)

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Visão geral do sistema escolar
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardCard title="Total de Alunos" value={stats.total} icon={Users} />
                <DashboardCard title="Presença Hoje" value={stats.attendanceToday} icon={CalendarCheck} />
                <DashboardCard title="Pagamentos do Mês" value={`R$ ${stats.paymentsMonth.toLocaleString("pt-BR")}`} icon={CreditCard} />
                <DashboardCard title="Avaliações Hoje" value={stats.evaluationsToday} icon={Star} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Presenças da Semana</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceWeek}>
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alunos Recentes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentStudents.map((s) => (
                            <Link
                                key={s.id}
                                href={`/alunos/${s.id}`}
                                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
                            >
                                <div>
                                    <p className="font-medium">{s.nome_completo}</p>
                                    <span className="text-xs text-muted-foreground">
                                        {s.active ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function DashboardCard({ title, value, icon: Icon }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
