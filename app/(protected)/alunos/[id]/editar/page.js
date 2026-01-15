"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function EditarAlunoPage() {
  const supabase = createClient()
  const { id } = useParams()
  const router = useRouter()

  const [form, setForm] = useState({})
  const [photo, setPhoto] = useState(null)

  useEffect(() => {
    loadStudent()
  }, [])

  async function loadStudent() {
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single()

    setForm(data)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    let photo_url = form.photo_url

    if (photo) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const path = `${user.id}/${Date.now()}-${photo.name}`

      await supabase.storage.from("students-photos").upload(path, photo)

      photo_url = supabase.storage
        .from("students-photos")
        .getPublicUrl(path).data.publicUrl
    }

    await supabase
      .from("students")
      .update({ ...form, photo_url })
      .eq("id", id)

    router.push(`/alunos/${id}`)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="text-xl font-bold mb-4">Editar Aluno</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name_completo" value={form.name_completo || ""} onChange={handleChange} />
          <Input type="date" name="birth_date" value={form.birth_date || ""} onChange={handleChange} />
          <Input name="guardian_name" value={form.guardian_name || ""} onChange={handleChange} />
          <Input name="whatsapp" value={form.whatsapp || ""} onChange={handleChange} />

          <select
            name="grade"
            value={form.grade || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option>Educação Infantil</option>
            <option>1º Ano</option>
            <option>2º Ano</option>
            <option>3º Ano</option>
            <option>4º Ano</option>
            <option>5º Ano</option>
            <option>6º Ano</option>
            <option>7º Ano</option>
            <option>8º Ano</option>
            <option>9º Ano</option>
          </select>

          <Input name="school_name" value={form.school_name || ""} onChange={handleChange} />

          <Input name="address" value={form.address || ""} onChange={handleChange} />

          <Input type="file" onChange={(e) => setPhoto(e.target.files[0])} />

          <Button>Salvar</Button>
        </form>
      </CardContent>
    </Card>
  )
}
