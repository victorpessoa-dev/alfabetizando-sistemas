"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
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
        <div className="min-h-screen flex flex-col bg-gray-100">
            <div className="flex-1 flex items-center justify-center">
                <form
                    onSubmit={handleLogin}
                    className="bg-white p-8 rounded-lg shadow w-full max-w-sm"
                >
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/logo_sistema.png"
                            alt="Alfabetizando Sistemas"
                            width={150}
                            height={150}
                            className="object-contain"
                        />
                    </div>

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
                        <div className="relative mt-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border rounded px-3 py-2 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
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

            <footer className="py-4 text-center text-sm text-gray-600">
                © {new Date().getFullYear()} Alfabetizando Sistemas. Todos os direitos reservados.
            </footer>
        </div>
    )
}
