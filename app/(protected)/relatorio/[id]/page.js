"use client"

import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, } from "lucide-react"

export default function RelatorioDetalhePage() {

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                </Button>
                <h1 className="text-2xl font-bold">Relatório -
                    {/* {student.name_completo} */}
                </h1>
            </div>

            <div>
                Page Relatório ainda nao foi detalhado aqui
            </div>

            {/* <ul className="divide-y border rounded-md">
                {docs.length === 0 && (
                    <li className="p-4 text-center text-muted-foreground">Nenhum documento cadastrado</li>
                )}
            </ul> */}
        </div>
    )
}
