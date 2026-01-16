"use client"

import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Upload, ArrowLeft } from "lucide-react"

export default function DocumentosAlunoPage() {
    const supabase = createClient()
    const { toast } = useToast()
    const router = useRouter()
    const { id: studentId } = useParams()

    const [user, setUser] = useState(null)
    const [docs, setDocs] = useState([])
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    /* =======================
       INIT
    ======================= */
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
            return
        }

        setUser(data.user)
        await loadDocs(data.user.id)
        setLoading(false)
    }

    /* =======================
       LOAD DOCUMENTS
    ======================= */
    async function loadDocs(userId) {
        const { data, error } = await supabase
            .from("documents")
            .select("id, document_name, document_url, storage_path")
            .eq("student_id", studentId)
            .eq("user_id", userId)
            .order("created_at", { ascending: false })

        if (error) {
            console.error(error)
            toast({
                title: "Erro",
                description: "Erro ao carregar documentos",
                variant: "destructive",
            })
            return
        }

        setDocs(data || [])
    }

    /* =======================
       UPLOAD
    ======================= */
    async function uploadDocument() {
        if (!file) {
            toast({
                title: "Erro",
                description: "Selecione um arquivo",
                variant: "destructive",
            })
            return
        }

        setUploading(true)

        try {
            const path = `${user.id}/${studentId}/${Date.now()}-${file.name}`

            const { error: uploadError } = await supabase.storage
                .from("student-documents")
                .upload(path, file)

            if (uploadError) throw uploadError

            // gera URL assinada (mais seguro)
            const { data: signed } = await supabase.storage
                .from("student-documents")
                .createSignedUrl(path, 60 * 60) // 1h

            const { error: insertError } = await supabase.from("documents").insert({
                student_id: studentId,
                document_name: file.name,
                document_url: signed.signedUrl,
                storage_path: path,
                user_id: user.id,
            })

            if (insertError) throw insertError

            toast({
                title: "Documento enviado",
                description: "Upload realizado com sucesso",
            })

            setFile(null)
            loadDocs(user.id)
        } catch (error) {
            console.error(error)
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setUploading(false)
        }
    }

    /* =======================
       DELETE
    ======================= */
    async function removeDocument(doc) {
        try {
            await supabase.storage
                .from("student-documents")
                .remove([doc.storage_path])

            await supabase
                .from("documents")
                .delete()
                .eq("id", doc.id)
                .eq("user_id", user.id)

            toast({
                title: "Documento excluído",
            })

            loadDocs(user.id)
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao excluir documento",
                variant: "destructive",
            })
        }
    }

    /* =======================
       UI
    ======================= */
    if (loading) {
        return <p className="text-center py-10">Carregando...</p>
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                </Button>
                <h1 className="text-2xl font-bold">Documentos do Aluno</h1>
            </div>

            {/* UPLOAD */}
            <div className="flex items-center gap-2">
                <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Button onClick={uploadDocument} disabled={uploading}>
                    <Upload className="h-4 w-4 mr-1" />
                    {uploading ? "Enviando..." : "Upload"}
                </Button>
            </div>

            {file && (
                <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: <strong>{file.name}</strong>
                </p>
            )}

            {/* LISTA */}
            <ul className="divide-y border rounded-md">
                {docs.length === 0 && (
                    <li className="p-4 text-center text-muted-foreground">
                        Nenhum documento cadastrado
                    </li>
                )}

                {docs.map((d) => (
                    <li
                        key={d.id}
                        className="flex items-center justify-between p-4"
                    >
                        <a
                            href={d.document_url}
                            target="_blank"
                            className="text-blue-600 hover:underline"
                        >
                            {d.document_name}
                        </a>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeDocument(d)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
