"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function SettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")
    const [userEmail, setUserEmail] = useState("")
    const [form, setForm] = useState({
        nome: "",
        logo_url: "",
        telefone: "",
        whatsapp: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
    })
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    function getPasswordStrength(password) {
        if (!password) return { strength: "none", label: "", color: "" }

        let strength = 0
        let label = ""
        let color = ""

        if (password.length >= 8) strength += 1
        else if (password.length >= 6) strength += 0.5

        if (/[a-z]/.test(password)) strength += 1
        if (/[A-Z]/.test(password)) strength += 1
        if (/[0-9]/.test(password)) strength += 1
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

    const passwordStrength = useMemo(() => getPasswordStrength(passwordForm.newPassword), [passwordForm.newPassword])

    useEffect(() => {
        loadSettings()
    }, [])

    async function loadSettings() {
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            setLoading(false)
            return
        }

        setUserEmail(userData.user.email || "")

        const { data, error } = await supabase
            .from("school_settings")
            .select("*")
            .eq("user_id", userData.user.id)
            .single()

        if (!error && data) {
            setForm({
                nome: data.nome || "",
                logo_url: data.logo_url || "",
                telefone: data.telefone || "",
                whatsapp: data.whatsapp || "",
                rua: data.rua || "",
                numero: data.numero || "",
                bairro: data.bairro || "",
                cidade: data.cidade || "",
                estado: data.estado || "",
                cep: data.cep || "",
            })
        }

        setLoading(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSaving(true)
        setError("")
        setSuccess("")

        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            setError("Erro ao obter usuário")
            setSaving(false)
            return
        }

        const { error: updateError } = await supabase
            .from("school_settings")
            .update(form)
            .eq("user_id", userData.user.id)

        if (updateError) {
            setError("Erro ao salvar configurações")
            setSaving(false)
            return
        }

        setSuccess("Configurações salvas com sucesso!")
        setSaving(false)
        setTimeout(() => {
            router.refresh()
        }, 1000)
    }

    async function handlePasswordChange(e) {
        e.preventDefault()
        setChangingPassword(true)
        setPasswordError("")
        setPasswordSuccess("")

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("As senhas não coincidem")
            setChangingPassword(false)
            return
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError("A senha deve ter pelo menos 6 caracteres")
            setChangingPassword(false)
            return
        }

        // Primeiro, verificar a senha atual fazendo login
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
            setPasswordError("Erro ao obter usuário")
            setChangingPassword(false)
            return
        }

        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: passwordForm.currentPassword,
        })

        if (verifyError) {
            setPasswordError("Senha atual incorreta")
            setChangingPassword(false)
            return
        }

        // Se a senha atual está correta, atualizar para a nova senha
        const { error: updateError } = await supabase.auth.updateUser({
            password: passwordForm.newPassword,
        })

        if (updateError) {
            setPasswordError("Erro ao alterar senha: " + updateError.message)
            setChangingPassword(false)
            return
        }

        setPasswordSuccess("Senha alterada com sucesso!")
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        })
        setChangingPassword(false)
    }

    if (loading) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-4">Configurações</h1>
                <p className="text-gray-500">Carregando...</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold">Configurações</h1>

            {/* Formulário de Informações da Escola */}
            <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded shadow p-6">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 text-green-700 p-3 rounded text-sm">
                        {success}
                    </div>
                )}

                <h2 className="text-xl font-semibold mb-4">Informações da Escolinha</h2>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Nome da Escolinha <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                        required
                        disabled={saving}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        URL do Logo
                    </label>
                    <input
                        type="url"
                        className="w-full border p-2 rounded"
                        placeholder="https://exemplo.com/logo.png"
                        value={form.logo_url}
                        onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
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
                            className="w-full border p-2 rounded"
                            value={form.telefone}
                            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            WhatsApp
                        </label>
                        <input
                            type="tel"
                            className="w-full border p-2 rounded"
                            value={form.whatsapp}
                            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
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
                        className="w-full border p-2 rounded bg-gray-100"
                        value={userEmail}
                        disabled
                        readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        O e-mail não pode ser alterado
                    </p>
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
                                className="w-full border p-2 rounded"
                                value={form.rua}
                                onChange={(e) => setForm({ ...form, rua: e.target.value })}
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Número
                            </label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                value={form.numero}
                                onChange={(e) => setForm({ ...form, numero: e.target.value })}
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
                                className="w-full border p-2 rounded"
                                value={form.bairro}
                                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                CEP
                            </label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                value={form.cep}
                                onChange={(e) => setForm({ ...form, cep: e.target.value })}
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
                                className="w-full border p-2 rounded"
                                value={form.cidade}
                                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Estado
                            </label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                value={form.estado}
                                onChange={(e) => setForm({ ...form, estado: e.target.value })}
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
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? "Salvando..." : "Salvar Configurações"}
                </button>
            </form>

            {/* Formulário de Redefinição de Senha */}
            <form onSubmit={handlePasswordChange} className="space-y-4 bg-white rounded shadow p-6">
                {passwordError && (
                    <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
                        {passwordError}
                    </div>
                )}

                {passwordSuccess && (
                    <div className="bg-green-100 text-green-700 p-3 rounded text-sm">
                        {passwordSuccess}
                    </div>
                )}

                <h2 className="text-xl font-semibold mb-4">Redefinir Senha</h2>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Senha Atual
                    </label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            className="w-full border p-2 rounded pr-10"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            required
                            disabled={changingPassword}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Nova Senha
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            className="w-full border p-2 rounded pr-10"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                            disabled={changingPassword}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {passwordForm.newPassword && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Força da senha:</span>
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

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Confirmar Nova Senha
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="w-full border p-2 rounded pr-10"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                            disabled={changingPassword}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={changingPassword}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {changingPassword ? "Alterando..." : "Alterar Senha"}
                </button>
            </form>
        </div>
    )
}
