"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function StudentFilter({ grades, onFilterChange }) {
    const [search, setSearch] = useState("")
    const [selectedGrade, setSelectedGrade] = useState("")

    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({ search, grade: selectedGrade })
        }, 300)

        return () => clearTimeout(timer)
    }, [search, selectedGrade, onFilterChange])

    const clearFilters = () => {
        setSearch("")
        setSelectedGrade("")
        onFilterChange({ search: "", grade: "" })
    }

    return (
        <div className="flex gap-4 flex-wrap items-end mb-4">
            <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    className="pl-10"
                    placeholder="Buscar aluno por nome, série ou responsável"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex-1 min-w-[140px]">
                <Label className="block mb-1">Série</Label>
                <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full border rounded-md p-2"
                >
                    <option value="">Todas</option>
                    {grades.map((g) => (
                        <option key={g} value={g}>
                            {g}
                        </option>
                    ))}
                </select>
            </div>

            <Button className="bg-primary text-white hover:bg-primary/80 hover:text-white" variant="outline" onClick={clearFilters}>
                Limpar
            </Button>

        </div>
    )
}
