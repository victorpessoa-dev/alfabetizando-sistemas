"use client"

import { useEffect, useState } from "react"
import { loadStudents } from "@/lib/loadStudents"
import StudentCard from "@/components/students/AlunoCard"
import StudentFilter from "@/components/students/AlunoFilter"

export default function AvaliacoesPage() {
    const [students, setStudents] = useState([])
    const [filteredStudents, setFilteredStudents] = useState([])
    const [loading, setLoading] = useState(true)

    const grades = [
        "Educação Infantil",
        "1º Ano",
        "2º Ano",
        "3º Ano",
        "4º Ano",
        "5º Ano",
        "6º Ano",
        "7º Ano",
        "8º Ano",
        "9º Ano",
    ]

    useEffect(() => {
        async function fetchData() {
            const data = await loadStudents()
            setStudents(data)
            setFilteredStudents(data)
            setLoading(false)
        }
        fetchData()
    }, [])

    const handleFilterChange = ({ search, grade }) => {
        const lowerSearch = search.toLowerCase()
        const lowerGrade = grade.toLowerCase()

        const filtered = students.filter((s) => {
            const matchName =
                s.name_completo.toLowerCase().includes(lowerSearch) ||
                (s.guardian_name || "").toLowerCase().includes(lowerSearch)

            const matchGrade = grade
                ? (s.grade || "").toLowerCase().includes(lowerGrade)
                : true

            return matchName && matchGrade
        })

        setFilteredStudents(filtered)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Avaliações</h1>

            <StudentFilter grades={grades} onFilterChange={handleFilterChange} />

            {filteredStudents.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {filteredStudents.map((student) => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            href={`/avaliacoes/${student.id}`}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">Nenhum aluno encontrado.</p>
            )}
        </div>
    )
}