"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, DollarSign, CalendarCheck, Edit3, MessageCircle } from "lucide-react"

export default function AlunoDetalhePage() {
  const supabase = createClient()
  const { id } = useParams()
  const router = useRouter()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudent()
  }, [])

  async function loadStudent() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setStudent(data)
    setLoading(false)
  }

  if (loading) return <p className="text-center py-10">Carregando...</p>
  if (!student) return <p className="text-center py-10">Aluno não encontrado</p>

  return (
    <div className="space-y-6">

      {/* CARD PRINCIPAL */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* FOTO */}
            <img
              src={student.photo_url || "/avatar.png"}
              className="h-32 w-32 rounded-full object-cover border border-gray-200"
            />

            {/* DETALHES */}
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-bold">{student.name_completo}</h1>
              {student.grade && <p className="text-sm text-muted-foreground">Série: {student.grade}</p>}
              {student.guardian_name && <p className="text-sm text-muted-foreground">Responsável: {student.guardian_name}</p>}
              {student.whatsapp && <p className="text-sm text-muted-foreground">WhatsApp: {student.whatsapp}</p>}
              {student.email && <p className="text-sm text-muted-foreground">Email: {student.email}</p>}
              {student.cidade && <p className="text-sm text-muted-foreground">Cidade: {student.cidade} - {student.estado}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Link href={`/alunos/${id}/editar`}>
              <Button variant="outline">
                <Edit3 className="h-4 w-4 mr-1" /> Editar
              </Button>
            </Link>

            <Link href={`/alunos/${id}/avaliacoes`}>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-1" /> Avaliações
              </Button>
            </Link>

            <Link href={`/alunos/${id}/documentos`}>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-1" /> Documentos
              </Button>
            </Link>

            <Link href={`/alunos/${id}/pagamentos`}>
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-1" /> Pagamentos
              </Button>
            </Link>

            <Link href={`/alunos/${id}/frequencia`}>
              <Button variant="outline">
                <CalendarCheck className="h-4 w-4 mr-1" /> Frequência
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2">
          <h2 className="text-lg font-bold">Informações Complementares</h2>
          {student.observacoes ? (
            <p className="text-sm text-muted-foreground">{student.observacoes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma observação cadastrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
