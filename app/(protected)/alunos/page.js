"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Plus,
  Search,
  Grid3x3,
  List,
  Trash2,
  Eye,
  Pencil
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AlunosPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState("")
  const [view, setView] = useState("grid")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    const term = search.toLowerCase()
    setFiltered(
      students.filter(
        (s) =>
          s.name_completo.toLowerCase().includes(term) ||
          s.grade.toLowerCase().includes(term) ||
          (s.guardian_name || "").toLowerCase().includes(term)
      )
    )
  }, [search, students])

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
        variant: "destructive"
      })
    } else {
      setStudents(data || [])
      setFiltered(data || [])
    }

    setLoading(false)
  }

  async function deleteStudent(id) {
    const confirm = window.confirm("Tem certeza que deseja excluir este aluno?")
    if (!confirm) return

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", id)

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      })
    } else {
      toast({ title: "Aluno excluído com sucesso" })
      loadStudents()
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Carregando alunos...</p>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alunos</h1>
        <Link href="/alunos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        </Link>
      </div>

      {/* Busca e visualização */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Buscar aluno por nome, série ou responsável"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button
          size="icon"
          variant={view === "grid" ? "default" : "outline"}
          onClick={() => setView("grid")}
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant={view === "list" ? "default" : "outline"}
          onClick={() => setView("list")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid */}
      {view === "grid" && (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <Image
                    src={s.photo_url || "/avatar-placeholder.png"}
                    alt={s.name_completo}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{s.name_completo}</h3>
                    <p className="text-sm text-muted-foreground">{s.grade}</p>
                  </div>
                </div>

                <p className="text-sm">{s.guardian_name}</p>

                <div className="flex gap-2 pt-2">
                  <Link href={`/alunos/${s.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Link href={`/alunos/${s.id}/editar`}>
                    <Button size="sm" variant="outline">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteStudent(s.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lista */}
      {view === "list" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-3 text-left">Aluno</th>
                  <th className="p-3 text-left">Série</th>
                  <th className="p-3 text-left">Responsável</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3 flex items-center gap-2">
                      <Image
                        src={s.photo_url || "/avatar-placeholder.png"}
                        alt={s.name_completo}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                      {s.name_completo}
                    </td>
                    <td className="p-3">{s.grade}</td>
                    <td className="p-3">{s.guardian_name}</td>
                    <td className="p-3 flex justify-end gap-2">
                      <Link href={`/alunos/${s.id}`}>
                        <Eye className="h-4 w-4 cursor-pointer" />
                      </Link>
                      <Link href={`/alunos/${s.id}/editar`}>
                        <Pencil className="h-4 w-4 cursor-pointer" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-center">
          Nenhum aluno encontrado.
        </p>
      )}
    </div>
  )
}

