"use client"

import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"

export default function AvaliacoesPage() {
    const supabase = createClient()
    const { id } = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [student, setStudent] = useState(null)
    const [date, setDate] = useState("")
    const [text, setText] = useState("")
    const [evaluations, setEvaluations] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    function getWeekday(date) {
        return [
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
        ][new Date(date).getDay()]
    }

    useEffect(() => {
        init()
    }, [])

    async function init() {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            toast({
                title: "Erro",
                description: "Usuário não autenticado",
                variant: "destructive",
            })
            return
        }

        const { data: studentData, error } = await supabase
            .from("students")
            .select("id, name_completo")
            .eq("id", id)
            .single()

        if (error) {
            toast({
                title: "Erro",
                description: "Aluno não encontrado",
                variant: "destructive",
            })
            router.back()
            return
        }

        setStudent(studentData)
        await loadEvaluations(user.id)
        setLoading(false)
    }

    async function loadEvaluations(userId) {
        const { data } = await supabase
            .from("student_evaluations")
            .select("id, evaluation_date, weekday, evaluation_text")
            .eq("student_id", id)
            .eq("user_id", userId)
            .order("evaluation_date", { ascending: false })

        setEvaluations(data || [])
    }

    async function save() {
        if (!date || !text) {
            toast({
                title: "Erro",
                description: "Preencha a data e a avaliação",
                variant: "destructive",
            })
            return
        }

        setSaving(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        const { error } = await supabase.from("student_evaluations").upsert(
            {
                student_id: id,
                evaluation_date: date,
                weekday: getWeekday(date),
                evaluation_text: text,
                user_id: user.id,
            },
            { onConflict: "student_id,evaluation_date" }
        )

        if (error) {
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            })
        } else {
            toast({
                title: "Avaliação salva",
                description: "Avaliação registrada com sucesso",
            })
            setText("")
            setDate("")
            loadEvaluations(user.id)
        }

        setSaving(false)
    }

    async function removeEvaluation(ev) {
        const confirm = window.confirm("Deseja excluir esta avaliação?")
        if (!confirm) return

        const {
            data: { user },
        } = await supabase.auth.getUser()

        await supabase
            .from("student_evaluations")
            .delete()
            .eq("id", ev.id)
            .eq("user_id", user.id)

        toast({ title: "Avaliação removida" })
        loadEvaluations(user.id)
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* HEADER */}
            <h1 className="text-xl font-bold">
                Avaliações – {student.name_completo}
            </h1>

            {/* FORM */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />

                    <textarea
                        className="w-full border rounded-md p-3 min-h-[120px]"
                        placeholder="Digite a avaliação do aluno"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <Button onClick={save} disabled={saving}>
                        {saving ? "Salvando..." : "Salvar Avaliação"}
                    </Button>
                </CardContent>
            </Card>

            {/* LISTA DE AVALIAÇÕES */}
            <div className="space-y-3">
                {evaluations.length === 0 && (
                    <p className="text-muted-foreground text-center">
                        Nenhuma avaliação registrada
                    </p>
                )}

                {evaluations.map((ev) => (
                    <Card key={ev.id}>
                        <CardContent className="p-4 flex justify-between gap-4">
                            <div>
                                <p className="font-semibold">
                                    {ev.evaluation_date.split("-").reverse().join("/")}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    {ev.weekday}
                                </p>
                                <p className="mt-2">{ev.evaluation_text}</p>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeEvaluation(ev)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
