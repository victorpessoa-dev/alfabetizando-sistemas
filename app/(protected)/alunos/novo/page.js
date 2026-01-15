"use client"

import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function NovoAlunoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    birth_date: "",
    guardian_name: "",
    whatsapp: "",
    grade: "",
    class: "",
    active: true,
    observations: "",
  })

  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  async function uploadPhoto(file) {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Erro ao fazer upload da foto")
    }

    const data = await response.json()
    return data.url
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      let photoUrl = null

      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile)
      }

      const { data, error } = await supabase
        .from("students")
        .insert([{ ...formData, photo_url: photoUrl }])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Aluno cadastrado",
        description: "O aluno foi cadastrado com sucesso.",
      })

      router.push(`/alunos/${data.id}`)
    } catch (error) {
      toast({
        title: "Erro ao cadastrar aluno",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/alunos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Aluno</h1>
          <p className="text-muted-foreground">Cadastre um novo aluno no sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="guardian_name">Responsável</Label>
              <Input
                id="guardian_name"
                name="guardian_name"
                value={formData.guardian_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                placeholder="(XX) 9XXXX-XXXX"
                value={formData.whatsapp}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Acadêmicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Acadêmicas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="grade">Série *</Label>
              <Input
                id="grade"
                name="grade"
                placeholder="Ex: 1º ano, Infantil, etc"
                value={formData.grade}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="class">Turma</Label>
              <Input
                id="class"
                name="class"
                placeholder="Ex: A, B, C"
                value={formData.class}
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                name="observations"
                value={formData.observations}
                onChange={handleInputChange}
                rows={3}
                placeholder="Informações adicionais..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <Label htmlFor="active" className="font-normal cursor-pointer">
                Aluno ativo
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Foto */}
        <Card>
          <CardHeader>
            <CardTitle>Foto do Aluno</CardTitle>
          </CardHeader>
          <CardContent>
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full max-w-[200px] h-[200px] object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Clique para enviar foto</span>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <Link href="/alunos">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Aluno"}
          </Button>
        </div>
      </form>
    </div>
  )
}
