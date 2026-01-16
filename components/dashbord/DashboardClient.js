"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, CreditCard, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function DashboardClient({ initialStats, initialRecentStudents }) {
    const [stats, setStats] = useState(initialStats)
    const [recentStudents, setRecentStudents] = useState(initialRecentStudents)
    const [loading, setLoading] = useState(false) // Loading state will be handled by the server component initially
    const router = useRouter()
    const supabase = createClient()

    // Although initial data is from server, this useEffect can be used for client-side re-fetching if needed.
    // For now, it's just a placeholder if more client-side data updates are required.
    useEffect(() => {
        // If there's a need to re-fetch data on the client-side after initial load,
        // this is where you would put that logic.
        // For example, if the dashboard needs to update in real-time or based on user interaction.
    }, [])

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push("/auth/login")
    }

    // The loading state from the server component is handled before this component renders.
    // This client component will only show its own loading state if it initiates a re-fetch.
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
                    <p className="text-xs text-muted-foreground">Visão geral do sistema de gerenciamento escolar</p>
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
                        <CardTitle className="text-sm font-medium">Frequência Hoje</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.attendance}</div>
                        <p className="text-xs text-muted-foreground">Alunos presentes hoje</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Alunos Recentes</h2>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {recentStudents.length > 0 ? (
                                recentStudents.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between">
                                        <div className="font-medium">{student.name}</div>
                                        <Link href={`/alunos/${student.id}`} passHref>
                                            <Button variant="outline" size="sm">
                                                Ver Perfil
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">Nenhum aluno recente.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}