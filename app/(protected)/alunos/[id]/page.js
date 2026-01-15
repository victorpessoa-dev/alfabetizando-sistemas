"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AlunoDetalhePage() {
  const supabase = createClient()
  const { id } = useParams()
  const [student, setStudent] = useState(null)

  useEffect(() => {
    loadStudent()
  }, [])

  async function loadStudent() {
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single()

    setStudent(data)
  }

  if (!student) return <p>Carregando...</p>

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <img
          src={student.photo_url || "/avatar.png"}
          className="h-32 w-32 rounded-full"
        />

        <h1 className="text-2xl font-bold">{student.name_completo}</h1>
        <p>Série: {student.grade}</p>
        <p>Responsável: {student.guardian_name}</p>
        <p>WhatsApp: {student.whatsapp}</p>

        <div className="flex gap-3 pt-4">
          <Link href={`/alunos/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <Link href={`/alunos/${id}/avaliacoes`}>
            <Button variant="outline">Avaliações</Button>
          </Link>
          <Link href={`/alunos/${id}/documentos`}>
            <Button variant="outline">Documentos</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
