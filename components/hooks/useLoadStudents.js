"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function useLoadStudents() {
    const supabase = createClient()
    const { toast } = useToast()

    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const lastFetchedRef = useRef(null)

    const loadStudents = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from("students")
                .select("id, name_completo, grade, guardian_name, photo_url, updated_at")
                .order("created_at", { ascending: false })

            if (lastFetchedRef.current) {
                query = query.gt("updated_at", lastFetchedRef.current)
            }

            const { data, error } = await query
            if (error) throw error

            if (data && data.length > 0) {
                const latestUpdate = data.reduce(
                    (acc, item) => (item.updated_at > acc ? item.updated_at : acc),
                    lastFetchedRef.current || data[0].updated_at
                )
                lastFetchedRef.current = latestUpdate

                setStudents((prev) => {
                    const map = {}
                    prev.forEach((s) => (map[s.id] = s))
                    data.forEach((s) => (map[s.id] = s))
                    return Object.values(map)
                })
            }
        } catch (err) {
            toast({
                title: "Erro ao carregar alunos",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStudents()

        // opcional: atualizar a cada X segundos
        const interval = setInterval(loadStudents, 30000) // 30s
        return () => clearInterval(interval)
    }, [])

    return { students, loading, loadStudents }
}
