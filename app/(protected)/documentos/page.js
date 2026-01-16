"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Download,
  Trash2,
  FileText,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export default function DocumentosPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [user, setUser] = useState(null)
  const [students, setStudents] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [openDialog, setOpenDialog] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [file, setFile] = useState(null)

  const [formData, setFormData] = useState({
    student_id: "",
    document_name: "",
    document_type: "",
  })

  /* =====================
     INIT
  ===================== */
  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    setUser(data.user)
    await loadData(data.user.id)
  }

  /* =====================
     LOAD DATA
  ===================== */
  async function loadData(userId) {
    setLoading(true)

    // ALUNOS
    const {
      data: studentsData,
      error: studentsError,
    } = await supabase
      .from("students")
      .select("id, name_completo")
      .eq("user_id", userId)
      .order("name_completo")

    if (studentsError) {
      console.error(studentsError)
      toast({
        title: "Erro",
        description: "Erro ao carregar alunos",
        variant: "destructive",
      })
    }

    // DOCUMENTOS
    const {
      data: docsData,
      error: docsError,
    } = await supabase
      .from("documents")
      .select(`
        id,
        document_name,
        document_type,
        document_url,
        upload_date,
        students ( name_completo )
      `)
      .eq("user_id", userId)
      .order("upload_date", { ascending: false })

    if (docsError) {
      console.error(docsError)
      toast({
        title: "Erro",
        description: "Erro ao carregar documentos",
        variant: "destructive",
      })
    }

    setStudents(Array.isArray(studentsData) ? studentsData : [])
    setDocuments(Array.isArray(docsData) ? docsData : [])
    setLoading(false)
  }

  /* =====================
     HANDLERS
  ===================== */
  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleFileChange(e) {
    setFile(e.target.files?.[0] || null)
  }

  async function uploadDocument(file) {
    const formDataUpload = new FormData()
    formDataUpload.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formDataUpload,
    })

    if (!response.ok) {
      throw new Error("Erro ao fazer upload")
    }

    const data = await response.json()
    return data.url
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!file || !formData.student_id || !formData.document_name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const documentUrl = await uploadDocument(file)

      const { error } = await supabase.from("documents").insert({
        student_id: formData.student_id,
        document_name: formData.document_name,
        document_type: formData.document_type,
        document_url: documentUrl,
        user_id: user.id,
      })

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Documento cadastrado",
      })

      setFormData({
        student_id: "",
        document_name: "",
        document_type: "",
      })
      setFile(null)
      setOpenDialog(false)
      loadData(user.id)
    } catch (err) {
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", deleteId)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Documento excluído",
      })

      setDeleteId(null)
      loadData(user.id)
    } catch (err) {
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  /* =====================
     UI
  ===================== */
  if (loading) {
    return (
      <p className="text-center py-12 text-muted-foreground">
        Carregando...
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">
            Gerencie documentos dos alunos
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Documento
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Documento</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Aluno *</Label>
                <select
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Selecione</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_completo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Nome do Documento *</Label>
                <Input
                  name="document_name"
                  value={formData.document_name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Tipo</Label>
                <Input
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Arquivo *</Label>
                <Input type="file" onChange={handleFileChange} />
                {file && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {file.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LISTA */}
      <Card>
        <CardContent className="p-0 divide-y">
          {documents.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Nenhum documento cadastrado
            </p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.document_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.students?.name_completo || "Aluno"}
                      {doc.document_type && ` · ${doc.document_type}`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a href={doc.document_url} target="_blank">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* CONFIRM DELETE */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
