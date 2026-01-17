"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import Link from "next/link"
import StudentCard from "@/components/students/AlunoCard"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import StudentFilter from "@/components/students/AlunoFilter"

export default function AlunosPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
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
    loadStudents()
  }, [])

  async function loadStudents() {
    setLoading(true)

    const { data, error } = await supabase
      .from("students")
      .select("id, name_completo, grade, guardian_name, photo_url")
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Erro ao carregar alunos",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setStudents(data || [])
      setFiltered(data || [])
    }

    setLoading(false)
  }

  const handleFilterChange = ({ search, grade }) => {
    const term = search.toLowerCase()
    const gradeTerm = grade.toLowerCase()

    setFiltered(
      students.filter((s) => {
        const matchSearch =
          s.name_completo.toLowerCase().includes(term) ||
          (s.guardian_name || "").toLowerCase().includes(term)

        const matchGrade = grade
          ? (s.grade || "").toLowerCase().includes(gradeTerm)
          : true

        return matchSearch && matchGrade
      })
    )
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

      <div className="flex gap-2">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filtered.length > 0 ? (
            filtered.map((student) => (
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
    </div>
  )
}
