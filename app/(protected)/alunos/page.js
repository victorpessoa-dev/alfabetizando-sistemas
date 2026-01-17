"use client"

import { useState, useEffect } from "react"
import { useLoadStudents } from "@/components/hooks/useLoadStudents"
import StudentCard from "@/components/students/AlunoCard"
import StudentFilter from "@/components/students/AlunoFilter"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function AlunosPage() {
  const { students, loading } = useLoadStudents()
  const [filteredStudents, setFilteredStudents] = useState([])

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
    setFilteredStudents(students)
  }, [students])

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
      <div className="flex justify-center items-center py-12">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alunos</h1>
        <Link href="/alunos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        </Link>
      </div>

      <StudentFilter grades={grades} onFilterChange={handleFilterChange} />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              href={`/alunos/${student.id}`}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-center">
            Nenhum aluno encontrado.
          </p>
        )}
      </div>
    </div>
  )
}
