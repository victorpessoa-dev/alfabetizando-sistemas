"use client"

import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Pencil, Phone, User, Calendar, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AlunoDetalhesPage() {
  const params = useParams()
  const supabase = createClient()
  const [student, setStudent] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudent()
  }, [])

  async function loadStudent() {
    const { data: studentData } = await supabase.from("students").select("*").eq("id", params.id).single()

    if (studentData) {
      setStudent(studentData)

      const { data: docsData } = await supabase.from("documents").select("*").eq("student_id", params.id)
      setDocuments(docsData || [])
    }

    setLoading(false)
  }

  function formatDate(dateString) {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Aluno não encontrado</p>
        <Link href="/alunos">
          <Button>Voltar para Alunos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/alunos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
            <p className="text-muted-foreground">Detalhes do aluno</p>
          </div>
        </div>
        <Link href={`/alunos/${student.id}/editar`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Foto e informações básicas */}
        <Card>
          <CardContent className="flex flex-col items-center pt-6">
            {student.photo_url ? (
              <img
                src={student.photo_url || "/placeholder.svg"}
                alt={student.name}
                className="h-32 w-32 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-primary">{student.name.charAt(0)}</span>
              </div>
            )}
            <h2 className="text-xl font-bold text-center mb-4">{student.name}</h2>
            <div className="w-full space-y-3">
              {student.birth_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(student.birth_date)}</span>
                </div>
              )}
              {student.whatsapp && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{student.whatsapp}</span>
                </div>
              )}
              {student.guardian_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{student.guardian_name}</span>
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className={`text-sm font-medium ${student.active ? "text-green-600" : "text-red-600"}`}>
                  {student.active ? "Ativo" : "Inativo"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações detalhadas */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Acadêmicas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Série</p>
              <p className="font-medium">{student.grade || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Turma</p>
              <p className="font-medium">{student.class || "-"}</p>
            </div>
            {student.observations && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Observações</p>
                <p className="font-medium text-sm">{student.observations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs para documentos e outras informações */}
      <Tabs defaultValue="documents" className="w-full">
        <TabsList>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="attendance">Presença</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.document_name}</p>
                        <p className="text-xs text-muted-foreground">{doc.document_type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum documento cadastrado</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Presença</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Acesse a página de{" "}
                <Link href="/presenca" className="text-primary hover:underline">
                  Presença
                </Link>{" "}
                para marcar presenças
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Acesse a página de{" "}
                <Link href="/pagamentos" className="text-primary hover:underline">
                  Pagamentos
                </Link>{" "}
                para gerenciar pagamentos
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
