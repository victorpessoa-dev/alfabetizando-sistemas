"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function EditarAlunoPage() {
  const supabase = createClient()
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [form, setForm] = useState({})
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)

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
      toast({
        title: "Erro ao carregar aluno",
        variant: "destructive",
      })
      return
    }

    setForm(data)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    let photo_url = form.photo_url

    try {
      if (photo) {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const path = `${user.id}/${Date.now()}-${photo.name}`

        const { error: uploadError } = await supabase.storage
          .from("students-photos")
          .upload(path, photo)

        if (uploadError) throw uploadError

        photo_url = supabase.storage
          .from("students-photos")
          .getPublicUrl(path).data.publicUrl
      }

      const { error } = await supabase
        .from("students")
        .update({ ...form, photo_url })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Aluno atualizado com sucesso",
        description: "As informações foram salvas.",
      })

      router.back()
    } catch (err) {
      toast({
        title: "Erro ao salvar alterações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Editar Aluno</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name_completo"
            placeholder="Nome completo"
            value={form.name_completo || ""}
            onChange={handleChange}
            required
          />

          <Input
            type="date"
            name="birth_date"
            value={form.birth_date || ""}
            onChange={handleChange}
            required
          />

          <Input
            name="guardian_name"
            placeholder="Responsável"
            value={form.guardian_name || ""}
            onChange={handleChange}
          />

          <Input
            name="whatsapp"
            placeholder="WhatsApp"
            value={form.whatsapp || ""}
            onChange={handleChange}
          />

          <select
            name="grade"
            value={form.grade || ""}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            required
          >
            <option value="">Selecione a série</option>
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

          <Input
            name="school_name"
            placeholder="Escola"
            value={form.school_name || ""}
            onChange={handleChange}
          />

          <Input
            name="address"
            placeholder="Endereço"
            value={form.address || ""}
            onChange={handleChange}
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />

          <div className="flex gap-2">
            <Button disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
