"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function DocumentsPage() {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDocuments()
    }, [])

    async function loadDocuments() {
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            setLoading(false)
            return
        }

        // Tentar carregar documentos (se a tabela existir)
        const { data, error } = await supabase
            .from("documents")
            .select("*")
            .eq("user_id", userData.user.id)
            .order("created_at", { ascending: false })

        if (!error) {
            setDocuments(data || [])
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-4">Documentos</h1>
                <p className="text-gray-500">Carregando...</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Documentos</h1>
            </div>

            <div className="bg-white rounded shadow">
                {documents.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-500 mb-4">
                            Nenhum documento cadastrado
                        </p>
                        <p className="text-sm text-gray-400">
                            Os documentos serão exibidos aqui quando adicionados
                        </p>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="border rounded-lg p-4 hover:shadow-md transition"
                                >
                                    <h3 className="font-semibold mb-2">
                                        {doc.titulo || "Documento sem título"}
                                    </h3>
                                    {doc.descricao && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            {doc.descricao}
                                        </p>
                                    )}
                                    {doc.url && (
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            Abrir documento
                                        </a>
                                    )}
                                    {doc.created_at && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
