"use client"

import { useEffect, useState } from "react"
import { loadStudents } from "@/lib/loadStudents"
import StudentCard from "@/components/students/AlunoCard"

export default function RelatoriosPage() {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            const data = await loadStudents()
            setStudents(data)
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) {
        return <p className="text-muted-foreground">Carregando...</p>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Relatórios</h1>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {students.map((student) => (
                    <StudentCard
                        key={student.id}
                        student={student}
                        href={`/avaliacoes/${student.id}`}
                    />
                ))}
            </div>
        </div>
    )
}
