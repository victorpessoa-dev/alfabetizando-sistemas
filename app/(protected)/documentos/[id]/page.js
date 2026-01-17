"use client"

import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Upload, ArrowLeft, FileText } from "lucide-react"


function sanitizeFileName(name) {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_\.]/g, "_")
}

export default function DocumentosAlunoPage() {
    const supabase = createClient()
    const { toast } = useToast()
    const router = useRouter()
    const { id: studentId } = useParams()

    const [user, setUser] = useState(null)
    const [student, setStudent] = useState({})
    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(true)

    const [open, setOpen] = useState(false)
    const [file, setFile] = useState(null)
    const [fileName, setFileName] = useState("")
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        init()
    }, [])

    async function init() {
        const { data, error } = await supabase.auth.getUser()
        if (error || !data?.user) {
            toast({ title: "Erro", description: "Usuário não autenticado", variant: "destructive" })
            return
        }
        setUser(data.user)
        await loadStudent(data.user.id)
        await loadDocs(data.user.id)
        setLoading(false)
    }

    async function loadStudent(userId) {
        const { data, error } = await supabase
            .from("students")
            .select("id, name_completo")
            .eq("id", studentId)
            .eq("user_id", userId)
            .single()

        if (error) {
            toast({
                title: "Erro",
                description: "Aluno não encontrado",
                variant: "destructive"
            })
            router.back()
            return
        }

        setStudent(data)
    }


    async function loadDocs(userId) {
        const { data, error } = await supabase
            .from("documents")
            .select("id, document_name, document_url, storage_path")
            .eq("student_id", studentId)
            .eq("user_id", userId)
            .order("created_at", { ascending: false })

        if (error) {
            console.error(error)
            toast({ title: "Erro", description: "Erro ao carregar documentos", variant: "destructive" })
            return
        }

        setDocs(data || [])
    }

    async function uploadDocument() {
        if (!file || !fileName) {
            toast({ title: "Erro", description: "Selecione um arquivo e informe o nome", variant: "destructive" })
            return
        }

        setUploading(true)
        try {
            const ext = file.name.split(".").pop()
            const safeName = sanitizeFileName(fileName) + "." + ext
            const path = `${sanitizeFileName(studentId)}/documents/${Date.now()}-${safeName}`

            const { error: uploadError } = await supabase.storage
                .from("student-documents")
                .upload(path, file)
            if (uploadError) throw uploadError

            const { data: signed } = await supabase.storage
                .from("student-documents")
                .createSignedUrl(path, 60 * 60)

            const { error: insertError } = await supabase.from("documents").insert({
                student_id: studentId,
                document_name: fileName,
                document_url: signed.signedUrl,
                storage_path: path,
                user_id: user.id,
            })
            if (insertError) throw insertError

            toast({ title: "Upload realizado", description: "Documento enviado com sucesso" })
            setFile(null)
            setFileName("")
            setOpen(false)
            loadDocs(user.id)
        } catch (err) {
            console.error(err)
            toast({ title: "Erro", description: err.message, variant: "destructive" })
        } finally {
            setUploading(false)
        }
    }

    async function removeDocument(doc) {
        try {
            await supabase.storage.from("student-documents").remove([doc.storage_path])
            await supabase.from("documents").delete().eq("id", doc.id).eq("user_id", user.id)
            toast({ title: "Documento excluído" })
            loadDocs(user.id)
        } catch (err) {
            toast({ title: "Erro", description: "Erro ao excluir documento", variant: "destructive" })
        }
    }

    if (loading) return <div className="flex justify-center items-center py-12">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                </Button>
                <h1 className="text-2xl font-bold">Documentos - {student.name_completo}</h1>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Upload className="h-4 w-4 mr-1" />
                        Adicionar Documento
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Enviar Novo Documento</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <div className="flex flex-col gap-1">
                            <Label>Nome do Documento</Label>
                            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Digite um nome para o arquivo" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label>Arquivo</Label>
                            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            {file && <p className="text-sm text-muted-foreground">Selecionado: {file.name}</p>}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button onClick={uploadDocument} disabled={uploading}>
                                {uploading ? "Enviando..." : "Upload"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ul className="divide-y border rounded-md">
                {docs.length === 0 && (
                    <li className="p-4 text-center text-muted-foreground">Nenhum documento cadastrado</li>
                )}

                {docs.map((d) => (
                    <li key={d.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <a href={d.document_url} target="_blank" className="text-blue-600 hover:underline">{d.document_name}</a>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => removeDocument(d)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
