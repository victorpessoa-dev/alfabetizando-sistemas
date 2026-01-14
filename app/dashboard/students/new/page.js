"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useState } from "react"

export default function NewStudentPage() {
    const router = useRouter()
    const [nome, setNome] = useState("")
    const [responsavel, setResponsavel] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            setError("Erro ao obter usuário")
            setLoading(false)
            return
        }

        const { error: insertError } = await supabase.from("students").insert({
            nome_completo: nome,
            nome_responsavel: responsavel,
            user_id: userData.user.id,
        })

        if (insertError) {
            setError("Erro ao cadastrar aluno")
            setLoading(false)
            return
        }

        router.push("/dashboard/students")
    }

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-bold mb-6">Novo Aluno</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
                        {error}
                    </div>
                )}

                <input
                    placeholder="Nome do aluno"
                    className="w-full border p-2 rounded"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    disabled={loading}
                />

                <input
                    placeholder="Responsável"
                    className="w-full border p-2 rounded"
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    required
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Salvando..." : "Salvar"}
                </button>
            </form>
        </div>
    )
}
