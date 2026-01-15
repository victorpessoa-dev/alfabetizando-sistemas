"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Search, Plus, Grid3x3, List, Trash2, Eye, Pencil } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function AlunosPage() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [searchTerm, students])

  async function loadStudents() {
    setLoading(true)
    const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Erro ao carregar alunos",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setStudents(data || [])
    }
    setLoading(false)
  }

  function filterStudents() {
    if (!searchTerm) {
      setFilteredStudents(students)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.grade?.toLowerCase().includes(term) ||
        student.class?.toLowerCase().includes(term) ||
        student.guardian_name?.toLowerCase().includes(term),
    )
    setFilteredStudents(filtered)
  }

  async function handleDelete() {
    if (!deleteId) return

    const { error } = await supabase.from("students").delete().eq("id", deleteId)

    if (error) {
      toast({
        title: "Erro ao excluir aluno",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Aluno excluído",
        description: "O aluno foi excluído com sucesso.",
      })
      loadStudents()
    }
    setDeleteId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">Gerencie todos os alunos cadastrados</p>
        </div>
        <Link href="/alunos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, série, turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Nenhum aluno encontrado." : "Nenhum aluno cadastrado ainda."}
            </p>
            {!searchTerm && (
              <Link href="/alunos/novo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Primeiro Aluno
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {student.photo_url ? (
                    <img
                      src={student.photo_url || "/placeholder.svg"}
                      alt={student.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{student.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{student.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{student.guardian_name}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Série:</span>
                    <span className="font-medium">{student.grade || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Turma:</span>
                    <span className="font-medium">{student.class || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{student.active ? "Ativo" : "Inativo"}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/alunos/${student.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/alunos/${student.id}/editar`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => setDeleteId(student.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Nome</th>
                    <th className="text-left p-4 font-medium">Responsável</th>
                    <th className="text-left p-4 font-medium">Série</th>
                    <th className="text-left p-4 font-medium">Turma</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{student.name}</td>
                      <td className="p-4">{student.guardian_name || "-"}</td>
                      <td className="p-4">{student.grade || "-"}</td>
                      <td className="p-4">{student.class || "-"}</td>
                      <td className="p-4">
                        <span className={`text-sm font-medium ${student.active ? "text-green-600" : "text-red-600"}`}>
                          {student.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/alunos/${student.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/alunos/${student.id}/editar`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(student.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
