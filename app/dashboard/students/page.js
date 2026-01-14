"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

export default function StudentsPage() {
    const [students, setStudents] = useState([])

    useEffect(() => {
        loadStudents()
    }, [])

    async function loadStudents() {
        const { data: user } = await supabase.auth.getUser()

        const { data } = await supabase
            .from("students")
            .select("*")
            .eq("user_id", user.user.id)
            .order("nome_completo")

        setStudents(data || [])
    }

    return (
        <div>
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Alunos</h1>

                <Link
                    href="/dashboard/students/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Novo Aluno
                </Link>
            </div>

            <div className="bg-white rounded shadow">
                {students.length === 0 ? (
                    <p className="p-6 text-gray-500">Nenhum aluno cadastrado</p>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Aluno</th>
                                <th>Responsável</th>
                                <th>Turma</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {students.map((s) => (
                                <tr key={s.id} className="border-t">
                                    <td className="p-3 flex items-center gap-3">
                                        {s.foto_url ? (
                                            <img
                                                src={s.foto_url}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 bg-gray-300 rounded-full" />
                                        )}
                                        {s.nome_completo}
                                    </td>

                                    <td>{s.nome_responsavel}</td>
                                    <td>{s.turma}</td>

                                    <td className="text-right pr-4">
                                        <Link
                                            href={`/dashboard/students/${s.id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
