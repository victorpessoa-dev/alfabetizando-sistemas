"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function EditStudentPage() {
    const { id } = useParams()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({
        nome_completo: "",
        nome_responsavel: "",
        tel_whatsapp: "",
        escola: "",
        turma: "",
        observacoes: "",
    })

    useEffect(() => {
        async function loadStudent() {
            const { data, error } = await supabase
                .from("students")
                .select("*")
                .eq("id", id)
                .single()

            if (error) {
                router.push("/dashboard/students")
                return
            }

            setForm(data)
            setLoading(false)
        }
        loadStudent()
    }, [id, router])

    async function handleSubmit(e) {
        e.preventDefault()
        setSaving(true)
        setError("")

        const { error: updateError } = await supabase
            .from("students")
            .update(form)
            .eq("id", id)

        if (updateError) {
            setError("Erro ao salvar alterações")
            setSaving(false)
            return
        }

        router.push(`/dashboard/students/${id}`)
    }

    if (loading) return <p>Carregando...</p>

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Editar Aluno</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
                        {error}
                    </div>
                )}

                <input
                    className="w-full border p-2 rounded"
                    placeholder="Nome do aluno"
                    value={form.nome_completo}
                    onChange={(e) => setForm({ ...form, nome_completo: e.target.value })}
                    required
                    disabled={saving}
                />

                <input
                    className="w-full border p-2 rounded"
                    placeholder="Responsável"
                    value={form.nome_responsavel}
                    onChange={(e) => setForm({ ...form, nome_responsavel: e.target.value })}
                    required
                    disabled={saving}
                />

                <input
                    className="w-full border p-2 rounded"
                    placeholder="WhatsApp"
                    value={form.tel_whatsapp}
                    onChange={(e) => setForm({ ...form, tel_whatsapp: e.target.value })}
                    disabled={saving}
                />

                <input
                    className="w-full border p-2 rounded"
                    placeholder="Escola regular"
                    value={form.escola || ""}
                    onChange={(e) => setForm({ ...form, escola: e.target.value })}
                    disabled={saving}
                />

                <input
                    className="w-full border p-2 rounded"
                    placeholder="Turma"
                    value={form.turma || ""}
                    onChange={(e) => setForm({ ...form, turma: e.target.value })}
                    disabled={saving}
                />

                <textarea
                    className="w-full border p-2 rounded"
                    placeholder="Observações"
                    value={form.observacoes || ""}
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                    disabled={saving}
                />

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? "Salvando..." : "Salvar"}
                </button>
            </form>
        </div>
    )
}
