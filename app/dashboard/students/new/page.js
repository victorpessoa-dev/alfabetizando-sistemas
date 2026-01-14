"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useState } from "react"

export default function NewStudentPage() {
    const router = useRouter()
    const [nome, setNome] = useState("")
    const [responsavel, setResponsavel] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()

        const { data: user } = await supabase.auth.getUser()

        await supabase.from("students").insert({
            nome_completo: nome,
            nome_responsavel: responsavel,
            user_id: user.user.id,
        })

        router.push("/dashboard/students")
    }

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-bold mb-6">Novo Aluno</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    placeholder="Nome do aluno"
                    className="w-full border p-2 rounded"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                />

                <input
                    placeholder="Responsável"
                    className="w-full border p-2 rounded"
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    required
                />

                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                    Salvar
                </button>
            </form>
        </div>
    )
}
