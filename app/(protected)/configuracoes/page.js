"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracoesPage() {
    const supabase = createClient()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [open, setOpen] = useState(false)

    const [school, setSchool] = useState({
        id: "",
        school_name: "",
        school_phone: "",
        school_email: "",
        school_address: "",
        school_logo_url: "",
    })

    useEffect(() => {
        loadSchool()
    }, [])

    async function loadSchool() {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        const { data } = await supabase
            .from("school_settings")
            .select("*")
            .eq("user_id", user.id)
            .single()

        if (data) {
            setSchool(data)
        } else {
            const { data: created } = await supabase
                .from("school_settings")
                .insert({ user_id: user.id })
                .select()
                .single()

            setSchool(created)
        }

        setLoading(false)
    }

    function handleChange(e) {
        setSchool({ ...school, [e.target.name]: e.target.value })
    }

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)

        await supabase
            .from("school_settings")
            .update({
                school_name: school.school_name,
                school_phone: school.school_phone,
                school_email: school.school_email,
                school_address: school.school_address,
            })
            .eq("id", school.id)

        toast({ title: "Configurações salvas com sucesso" })
        setSaving(false)
        setOpen(false)
    }

    async function handleLogoUpload(file) {
        if (!file) return
        setSaving(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        const ext = file.name.split(".").pop()
        const path = `${user.id}/logo.${ext}`

        await supabase.storage
            .from("school-logos")
            .upload(path, file, { upsert: true })

        const { data } = supabase.storage
            .from("school-logos")
            .getPublicUrl(path)

        await supabase
            .from("school_settings")
            .update({ school_logo_url: data.publicUrl })
            .eq("id", school.id)

        setSchool((prev) => ({ ...prev, school_logo_url: data.publicUrl }))
        toast({ title: "Logo atualizada" })
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold">Configurações da Escola</h1>

            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">

                        {school.school_logo_url ? (
                            <img
                                src={school.school_logo_url}
                                alt={school.school_name}
                                className="h-32 w-32 border-gray-200"
                            />
                        ) : (
                            <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center border border-gray-200">
                                <span className="text-3xl font-bold text-primary">
                                    {school.school_name?.charAt(0)?.toUpperCase() || "E"}
                                </span>
                            </div>
                        )}

                        <div className="flex-1 space-y-1">
                            <h1 className="text-2xl font-bold">
                                {school.school_name || "Nome da Escola"}
                            </h1>

                            {school.school_email && (
                                <p className="text-sm text-muted-foreground">
                                    Email: {school.school_email}
                                </p>
                            )}

                            {school.school_phone && (
                                <p className="text-sm text-muted-foreground">
                                    Telefone: {school.school_phone}
                                </p>
                            )}

                            {school.school_address && (
                                <p className="text-sm text-muted-foreground">
                                    Endereço: {school.school_address}
                                </p>
                            )}
                        </div>

                        {/* BOTÃO EDITAR */}
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Editar</Button>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Editar Escola</DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleSave} className="space-y-4">
                                    <div>
                                        <Label>Nome da Escola</Label>
                                        <Input
                                            name="school_name"
                                            value={school.school_name || ""}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <Label>Email</Label>
                                        <Input
                                            name="school_email"
                                            type="email"
                                            value={school.school_email || ""}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <Label>Telefone</Label>
                                        <Input
                                            name="school_phone"
                                            value={school.school_phone || ""}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <Label>Endereço</Label>
                                        <Input
                                            name="school_address"
                                            value={school.school_address || ""}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <Label>Logo</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleLogoUpload(e.target.files[0])}
                                        />
                                    </div>

                                    <Button type="submit" disabled={saving}>
                                        {saving ? "Salvando..." : "Salvar"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
