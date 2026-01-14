"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase/client"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
    const router = useRouter()

    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleRegister(e) {
        e.preventDefault()
        setLoading(true)
        setError("")

        // 1️⃣ Criar usuário
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        const userId = data.user.id

        // 2️⃣ Criar escolinha
        const { error: schoolError } = await supabase
            .from("school_settings")
            .insert({
                user_id: userId,
                nome,
            })

        if (schoolError) {
            setError("Erro ao criar escolinha")
            setLoading(false)
            return
        }

        router.push("/dashboard")
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleRegister}
                className="bg-white p-8 rounded-lg shadow w-full max-w-sm"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Criar Escolinha
                </h1>

                {error && (
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="text-sm font-medium">Nome da Escolinha</label>
                    <input
                        required
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full border rounded px-3 py-2 mt-1"
                    />
                </div>

                <div className="mb-4">
                    <label className="text-sm font-medium">E-mail</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border rounded px-3 py-2 mt-1"
                    />
                </div>

                <div className="mb-6">
                    <label className="text-sm font-medium">Senha</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2 mt-1"
                    />
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                    {loading ? "Criando..." : "Criar Conta"}
                </button>

                <p className="text-center text-sm mt-4">
                    Já tem conta?{" "}
                    <a href="/login" className="text-blue-600 hover:underline">
                        Entrar
                    </a>
                </p>
            </form>
        </div>
    )
}
