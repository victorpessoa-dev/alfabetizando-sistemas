"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function StudentView() {
    const { id } = useParams()
    const router = useRouter()
    const [student, setStudent] = useState(null)

    useEffect(() => {
        async function load() {
            const { data, error } = await supabase
                .from("students")
                .select("*")
                .eq("id", id)
                .single()

            if (error) {
                router.push("/dashboard/students")
                return
            }
            setStudent(data)
        }
        load()
    }, [id, router])

    if (!student) return null

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    {student.nome_completo}
                </h1>

                <Link
                    href={`/dashboard/students/${id}/edit`}
                    className="text-blue-600"
                >
                    Editar
                </Link>
            </div>

            <p><strong>Responsável:</strong> {student.nome_responsavel}</p>
            <p><strong>Turma:</strong> {student.turma}</p>
            <p><strong>Escola:</strong> {student.escola}</p>
        </div>
    )
}
