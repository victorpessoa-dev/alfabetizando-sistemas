"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Download, Trash2, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  const [documents, setDocuments] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [file, setFile] = useState(null)
  const [formData, setFormData] = useState({
    student_id: "",
    document_name: "",
    document_type: "",
  })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const { data: studentsData } = await supabase.from("students").select("*").order("name")

    const { data: docsData } = await supabase
      .from("documents")
      .select("*, students(name)")
      .order("upload_date", { ascending: false })

    setStudents(studentsData || [])
    setDocuments(docsData || [])
    setLoading(false)
  }

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleFileChange(e) {
    setFile(e.target.files?.[0] || null)
  }

  async function uploadDocument(docFile) {
    const formDataUpload = new FormData()
    formDataUpload.append("file", docFile)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formDataUpload,
    })

    if (!response.ok) {
      throw new Error("Erro ao fazer upload do documento")
    }

    const data = await response.json()
    return data.url
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo",
        variant: "destructive",
      })
      return
    }

    try {
      const documentUrl = await uploadDocument(file)

      const { error } = await supabase.from("documents").insert([
        {
          student_id: formData.student_id,
          document_name: formData.document_name,
          document_type: formData.document_type,
          document_url: documentUrl,
        },
      ])

      if (error) throw error

      toast({
        title: "Documento salvo",
        description: "O documento foi salvo com sucesso.",
      })

      setFormData({
        student_id: "",
        document_name: "",
        document_type: "",
      })
      setFile(null)
      setOpenDialog(false)
      loadData()
    } catch (error) {
      toast({
        title: "Erro ao salvar documento",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  async function handleDelete() {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", deleteId)

      if (error) throw error

      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso.",
      })

      loadData()
      setDeleteId(null)
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">Gerencie documentos dos alunos</p>
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
              <DialogTitle>Adicionar Documento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <Label htmlFor="student_id">Aluno *</Label>
                <select
                  id="student_id"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Selecione um aluno</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="document_name">Nome do Documento *</Label>
                <Input
                  id="document_name"
                  name="document_name"
                  value={formData.document_name}
                  onChange={handleInputChange}
                  placeholder="Ex: Contrato, RG, etc"
                  required
                />
              </div>
              <div>
                <Label htmlFor="document_type">Tipo de Documento</Label>
                <Input
                  id="document_type"
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleInputChange}
                  placeholder="Ex: Contrato, Comprovante, etc"
                />
              </div>
              <div>
                <Label htmlFor="file">Arquivo *</Label>
                <input id="file" type="file" onChange={handleFileChange} required className="w-full" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {documents.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum documento registrado</p>
            </div>
          ) : (
            <div className="divide-y">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.document_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.students?.name || "Aluno desconhecido"}
                        {doc.document_type && ` · ${doc.document_type}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(doc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
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
