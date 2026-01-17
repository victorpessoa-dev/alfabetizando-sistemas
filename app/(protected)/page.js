"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Cell } from "recharts"

import {
    Users,
    CalendarCheck,
    CreditCard,
    Star,
    BarChart3,
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
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboard()
    }, [])

    async function loadDashboard() {
        setLoading(true)

        const { count: totalStudents } = await supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .eq("active", true)

        const today = new Date().toISOString().split("T")[0]

        const { count: attendanceToday } = await supabase
            .from("attendances")
            .select("*", { count: "exact", head: true })
            .eq("attendance_date", today)
            .eq("status", "presente")

        const startOfWeek = new Date()
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)

        const startISO = startOfWeek.toISOString().split("T")[0]

        const { count: evaluationsWeek } = await supabase
            .from("student_evaluations")
            .select("*", { count: "exact", head: true })
            .gte("evaluation_date", startISO)
            .lte("evaluation_date", today)

        const firstDay = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        ).toISOString().split("T")[0]

        const lastDay = new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
        ).toISOString().split("T")[0]

        const { data: payments } = await supabase
            .from("payments")
            .select("amount")
            .eq("paid", true)
            .gte("reference_month", firstDay)
            .lte("reference_month", lastDay)

        const totalPayments =
            payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0

        const weekLabels = ["Seg", "Ter", "Qua", "Qui", "Sex"]
        let weekData = []
        let totalWeekAttendance = 0

        for (let i = 0; i < 5; i++) {
            const day = new Date(startOfWeek)
            day.setDate(day.getDate() + i)

            const dateISO = day.toISOString().split("T")[0]

            const { count } = await supabase
                .from("attendances")
                .select("*", { count: "exact", head: true })
                .eq("attendance_date", dateISO)
                .eq("status", "presente")

            const total = count || 0
            totalWeekAttendance += total

            weekData.push({
                day: weekLabels[i],
                total,
            })
        }

        const weeklyAverage = Math.round(totalWeekAttendance / 5)

        setStats({
            totalStudents: totalStudents || 0,
            attendanceToday: attendanceToday || 0,
            weeklyAverage,
            paymentsMonth: totalPayments,
            evaluationsWeek: evaluationsWeek || 0,
        })

        setAttendanceWeek(weekData)
        setLoading(false)
    }

    const dayColors = [
        "#1459ee",
        "#3772f3",
        "#598af3",
        "#628ae2",
        "#203d7a"
    ]


    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral da escolinha
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <DashboardCard title="Total de Alunos" value={stats.totalStudents} icon={Users} />
                <DashboardCard title="Presença Hoje" value={stats.attendanceToday} icon={CalendarCheck} />
                <DashboardCard title="Média Semanal" value={stats.weeklyAverage} icon={BarChart3} />
                <DashboardCard title="Pagamentos do Mês" value={`R$ ${stats.paymentsMonth.toLocaleString("pt-BR")}`} icon={CreditCard} />
                <DashboardCard title="Avaliações da Semana" value={stats.evaluationsWeek} icon={Star} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Presença da Semana (Presentes)</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendanceWeek}>
                            <XAxis dataKey="day" />
                            <YAxis allowDecimals={false} />
                            <Tooltip cursor={false} />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                {attendanceWeek.map((_, index) => (
                                    <Cell key={index} fill={dayColors[index % dayColors.length]} />
                                ))}
                            </Bar>

                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
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
