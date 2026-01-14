"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function SetupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({
        nome: "",
        logo_url: "",
        telefone: "",
        whatsapp: "",
        email: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
    })

    useEffect(() => {
        checkSetup()
    }, [])

    async function checkSetup() {
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            router.push("/login")
            return
        }

        // Verificar se já existe configuração
        const { data, error } = await supabase
            .from("school_settings")
            .select("*")
            .eq("user_id", userData.user.id)
            .single()

        if (!error && data) {
            // Já tem configuração, vai para o dashboard
            router.push("/dashboard")
            return
        }

        setLoading(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSaving(true)
        setError("")

        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            setError("Erro ao obter usuário")
            setSaving(false)
            return
        }

        const { error: insertError } = await supabase
            .from("school_settings")
            .insert({
                user_id: userData.user.id,
                ...form,
            })

        if (insertError) {
            setError("Erro ao salvar dados da escola: " + insertError.message)
            setSaving(false)
            return
        }

        router.push("/dashboard")
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-500">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen flex flex-col bg-gray-100">
                <div className="flex-1 flex items-center justify-center py-8">
                    <div className="bg-white p-8 rounded-lg shadow w-full max-w-2xl mx-4">
                        <div className="flex justify-center mb-6">
                            <Image
                                src="/logo_sistema.png"
                                alt="Alfabetizando Sistemas"
                                width={120}
                                height={120}
                                className="object-contain"
                            />
                        </div>

                        <h1 className="text-2xl font-bold mb-2 text-center">
                            Configuração da Escolinha
                        </h1>
                        <p className="text-gray-600 text-center mb-6">
                            Preencha os dados da sua escolinha para começar
                        </p>

                        {error && (
                            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Nome da Escolinha <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.nome}
                                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    disabled={saving}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    URL do Logo
                                </label>
                                <input
                                    type="url"
                                    value={form.logo_url}
                                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="https://exemplo.com/logo.png"
                                    disabled={saving}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.telefone}
                                        onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="(00) 0000-0000"
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        WhatsApp
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.whatsapp}
                                        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="(00) 00000-0000"
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="contato@escolinha.com"
                                    disabled={saving}
                                />
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-semibold mb-4">Endereço</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">
                                            Rua
                                        </label>
                                        <input
                                            type="text"
                                            value={form.rua}
                                            onChange={(e) => setForm({ ...form, rua: e.target.value })}
                                            className="w-full border rounded px-3 py-2"
                                            disabled={saving}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Número
                                        </label>
                                        <input
                                            type="text"
                                            value={form.numero}
                                            onChange={(e) => setForm({ ...form, numero: e.target.value })}
                                            className="w-full border rounded px-3 py-2"
                                            disabled={saving}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Bairro
                                        </label>
                                        <input
                                            type="text"
                                            value={form.bairro}
                                            onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                                            className="w-full border rounded px-3 py-2"
                                            disabled={saving}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            CEP
                                        </label>
                                        <input
                                            type="text"
                                            value={form.cep}
                                            onChange={(e) => setForm({ ...form, cep: e.target.value })}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="00000-000"
                                            disabled={saving}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Cidade
                                        </label>
                                        <input
                                            type="text"
                                            value={form.cidade}
                                            onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                                            className="w-full border rounded px-3 py-2"
                                            disabled={saving}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Estado
                                        </label>
                                        <input
                                            type="text"
                                            value={form.estado}
                                            onChange={(e) => setForm({ ...form, estado: e.target.value })}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="UF"
                                            maxLength={2}
                                            disabled={saving}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
                            >
                                {saving ? "Salvando..." : "Finalizar Configuração"}
                            </button>
                        </form>
                    </div>
                </div>

                <footer className="py-4 text-center text-sm text-gray-600">
                    © {new Date().getFullYear()} Alfabetizando Sistemas. Todos os direitos reservados.
                </footer>
            </div>
        </ProtectedRoute>
    )
}
