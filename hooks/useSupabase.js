"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useGlobalStore } from "./useGlobalStore"

export function useSupabase() {
    const { toast } = useToast()
    const lastFetchedRef = useRef({})
    const { cache, setCache } = useGlobalStore()
    const [loadingTables, setLoadingTables] = useState({})

    const fetchTable = async (table, columns = ["*"], filter = {}) => {
        setLoadingTables((prev) => ({ ...prev, [table]: true }))

        let query = supabase.from(table).select(columns.join(","))

        if (lastFetchedRef.current[table]) {
            query = query.gt("updated_at", lastFetchedRef.current[table])
        }

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== "" && value !== null) query = query.eq(key, value)
        })

        query = query.order("created_at", { ascending: false })

        const { data, error } = await query
        setLoadingTables((prev) => ({ ...prev, [table]: false }))

        if (error) {
            toast({ title: `Erro ao carregar ${table}`, description: error.message, variant: "destructive" })
            return []
        }

        if (data && data.length > 0) {
            lastFetchedRef.current[table] = new Date().toISOString()
            setCache(table, [...(cache[table] || []), ...data])
        }

        return data || []
    }

    const subscribe = (table, callback) => {
        const subscription = supabase
            .channel(`realtime:${table}`)
            .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => callback(payload))
            .subscribe()

        return () => supabase.removeChannel(subscription)
    }

    const uploadFile = async (bucket, path, file) => {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
        if (error) toast({ title: "Erro no upload", description: error.message, variant: "destructive" })
        return data
    }

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) toast({ title: "Erro no login", description: error.message, variant: "destructive" })
        return data
    }

    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) toast({ title: "Erro ao sair", description: error.message, variant: "destructive" })
    }

    return { fetchTable, subscribe, uploadFile, login, logout, loadingTables }
}
