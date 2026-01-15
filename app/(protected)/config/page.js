"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracoesPage() {
    const supabase = createClient()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        school_name: "",
        school_phone: "",
        school_email: "",
        school_address: "",
        school_logo_url: "",
    })

    useEffect(() => {
        loadSettings()
    }, [])

    async function loadSettings() {
        setLoading(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from("school_settings")
            .select("*")
            .eq("user_id", user.id)
            .single()

        if (error && error.code !== "PGRST116") {
            toast({ title: "Erro", description: error.message, variant: "destructive" })
        }

        if (data) {
            setForm(data)
        } else {
            // cria automaticamente se não existir
            await supabase.from("school_settings").insert({
                user_id: user.id,
            })
        }

        setLoading(false)
    }

    function handleChange(e) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)

        const { error } = await supabase
            .from("school_settings")
            .update({
                school_name: form.school_name,
                school_phone: form.school_phone,
                school_email: form.school_email,
                school_address: form.school_address,
                school_logo_url: form.school_logo_url,
            })
            .eq("id", form.id)

        if (error) {
            toast({ title: "Erro", description: error.message, variant: "destructive" })
        } else {
            toast({ title: "Configurações salvas com sucesso" })
        }

        setSaving(false)
    }

    if (loading) return <p>Carregando...</p>

    async function handleLogoUpload(file) {
        if (!file) return

        setSaving(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        const fileExt = file.name.split(".").pop()
        const filePath = `${user.id}/logo.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from("school-logos")
            .upload(filePath, file, { upsert: true })

        if (uploadError) {
            toast({
                title: "Erro no upload",
                description: uploadError.message,
                variant: "destructive",
            })
            setSaving(false)
            return
        }

        const { data: urlData } = supabase.storage
            .from("school-logos")
            .getPublicUrl(filePath)

        const logoUrl = urlData.publicUrl

        await supabase
            .from("school_settings")
            .update({ school_logo_url: logoUrl })
            .eq("id", form.id)

        setForm((prev) => ({ ...prev, school_logo_url: logoUrl }))

        toast({ title: "Logo atualizada com sucesso" })
        setSaving(false)
    }


    return (
        <div className="max-w-3xl space-y-6">
            <h1 className="text-3xl font-bold">Configurações da Escola</h1>

            <form onSubmit={handleSave}>
                <Card>
                    <CardHeader>
                        <CardTitle>Informações da Escola</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div>
                            <Label>Nome da Escola</Label>
                            <Input
                                name="school_name"
                                value={form.school_name || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label>Telefone</Label>
                            <Input
                                name="school_phone"
                                value={form.school_phone || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                name="school_email"
                                type="email"
                                value={form.school_email || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label>Endereço</Label>
                            <Input
                                name="school_address"
                                value={form.school_address || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label>Logo</Label>

                            {form.school_logo_url && (
                                <div className="mb-3">
                                    <Image
                                        src={form.school_logo_url}
                                        alt="Logo da escola"
                                        width={120}
                                        height={120}
                                        className="rounded-md"
                                    />
                                </div>
                            )}

                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleLogoUpload(e.target.files[0])}
                            />
                        </div>


                        <div className="pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? "Salvando..." : "Salvar Configurações"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
