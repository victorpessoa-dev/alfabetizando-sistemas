"use client"

import { useState, useMemo } from "react"
import { supabase } from "../../lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    function getPasswordStrength(password) {
        if (!password) return { strength: "none", label: "", color: "" }

        let strength = 0
        let label = ""
        let color = ""

        // Comprimento
        if (password.length >= 8) strength += 1
        else if (password.length >= 6) strength += 0.5

        // Letras minúsculas
        if (/[a-z]/.test(password)) strength += 1

        // Letras maiúsculas
        if (/[A-Z]/.test(password)) strength += 1

        // Números
        if (/[0-9]/.test(password)) strength += 1

        // Caracteres especiais
        if (/[^A-Za-z0-9]/.test(password)) strength += 1

        if (strength <= 2) {
            label = "Fraca"
            color = "bg-red-500"
        } else if (strength <= 4) {
            label = "Média"
            color = "bg-yellow-500"
        } else {
            label = "Forte"
            color = "bg-green-500"
        }

        return { strength: Math.min(strength, 5), label, color, max: 5 }
    }

    const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

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

        router.push("/setup")
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <div className="flex-1 flex items-center justify-center">
                <form
                    onSubmit={handleRegister}
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
                        Criar Conta
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

                        {password && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">
                                        Força da senha:
                                    </span>
                                    <span
                                        className={`text-xs font-medium ${
                                            passwordStrength.label === "Fraca"
                                                ? "text-red-600"
                                                : passwordStrength.label === "Média"
                                                ? "text-yellow-600"
                                                : "text-green-600"
                                        }`}
                                    >
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                                        style={{
                                            width: `${(passwordStrength.strength / passwordStrength.max) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
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

            <footer className="py-4 text-center text-sm text-gray-600">
                © {new Date().getFullYear()} Alfabetizando Sistemas. Todos os direitos reservados.
            </footer>
        </div>
    )
}
