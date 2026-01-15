"use client"

import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AvaliacoesPage() {
    const supabase = createClient()
    const { id } = useParams()
    const [text, setText] = useState("")
    const [date, setDate] = useState("")

    function getWeekday(d) {
        return ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][new Date(d).getDay()]
    }

    async function save() {
        await supabase.from("student_evaluations").upsert({
            student_id: id,
            evaluation_date: date,
            weekday: getWeekday(date),
            evaluation_text: text,
        })
        alert("Avaliação salva")
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">Avaliação</h1>
            <Input type="date" onChange={(e) => setDate(e.target.value)} />
            <textarea
                className="w-full border rounded p-2"
                rows={5}
                onChange={(e) => setText(e.target.value)}
            />
            <Button onClick={save}>Salvar</Button>
        </div>
    )
}
