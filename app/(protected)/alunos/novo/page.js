"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function NovoAlunoPage() {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [photo, setPhoto] = useState(null)

  const [form, setForm] = useState({
    name_completo: "",
    birth_date: "",
    guardian_name: "",
    whatsapp: "",
    grade: "",
    school_name: "",
    address: "",
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("Usuário não autenticado")
      }

      let photo_url = null

      if (photo) {
        const fileExt = photo.name.split(".").pop()
        const filePath = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("students-photos")
          .upload(filePath, photo)

        if (uploadError) throw uploadError

        photo_url = supabase.storage
          .from("students-photos")
          .getPublicUrl(filePath).data.publicUrl
      }

      const { error } = await supabase.from("students").insert({
        ...form,
        photo_url,
        active: true,
        user_id: user.id,
      })

      if (error) throw error

      toast({
        title: "Aluno cadastrado com sucesso",
        description: "As informações foram salvas.",
      })

      router.back()
    } catch (err) {
      toast({
        title: "Erro ao salvar aluno",
        description: err.message || "Erro inesperado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Novo Aluno</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name_completo"
            placeholder="Nome completo"
            required
            onChange={handleChange}
          />

          <Input
            type="date"
            name="birth_date"
            required
            onChange={handleChange}
          />

          <Input
            name="guardian_name"
            placeholder="Nome do responsável"
            onChange={handleChange}
          />

          <Input
            name="whatsapp"
            placeholder="WhatsApp"
            onChange={handleChange}
          />

          <select
            name="grade"
            required
            onChange={handleChange}
            className="w-full border rounded-md p-2"
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
            onChange={handleChange}
          />

          <Input
            name="address"
            placeholder="Endereço"
            onChange={handleChange}
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />

          <div className="flex gap-2">
            <Button disabled={loading}>
              {loading ? "Salvando..." : "Salvar Aluno"}
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
