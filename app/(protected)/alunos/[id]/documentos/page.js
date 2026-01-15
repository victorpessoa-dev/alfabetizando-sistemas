"use client"

import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DocumentosPage() {
    const supabase = createClient()
    const { id } = useParams()
    const [docs, setDocs] = useState([])
    const [file, setFile] = useState(null)

    useEffect(() => {
        loadDocs()
    }, [])

    async function loadDocs() {
        const { data } = await supabase
            .from("documents")
            .select("*")
            .eq("student_id", id)
        setDocs(data || [])
    }

    async function upload() {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        const path = `${user.id}/${Date.now()}-${file.name}`

        await supabase.storage.from("student-documents").upload(path, file)

        const url = supabase.storage
            .from("student-documents")
            .getPublicUrl(path).data.publicUrl

        await supabase.from("documents").insert({
            student_id: id,
            document_name: file.name,
            document_url: url,
            storage_path: path,
        })

        loadDocs()
    }

    async function remove(doc) {
        await supabase.storage.from("student-documents").remove([doc.storage_path])
        await supabase.from("documents").delete().eq("id", doc.id)
        loadDocs()
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">Documentos</h1>

            <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <Button onClick={upload}>Upload</Button>

            <ul className="space-y-2">
                {docs.map((d) => (
                    <li key={d.id} className="flex justify-between">
                        <a href={d.document_url} target="_blank">{d.document_name}</a>
                        <Button variant="destructive" onClick={() => remove(d)}>Excluir</Button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
