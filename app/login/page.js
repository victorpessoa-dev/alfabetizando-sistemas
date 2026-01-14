"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError("E-mail ou senha inválidos")
        } else {
            router.push("/dashboard")
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-lg shadow w-full max-w-sm"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Alfabetizando Sistemas
                </h1>

                {error && (
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

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
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    {loading ? "Entrando..." : "Entrar"}
                </button>

                <p className="text-center text-sm mt-4">
                    Não tem conta?{" "}
                    <a href="/register" className="text-blue-600 hover:underline">
                        Criar conta
                    </a>
                </p>
            </form>
        </div>
    )
}
