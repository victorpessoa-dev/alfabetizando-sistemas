"use client"

import { useEffect, useState } from "react"
import { loadStudents } from "@/lib/loadStudents"
import StudentCard from "@/components/students/AlunoCard"

export default function PagamentosPage() {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            const data = await loadStudents()
            setStudents(data)
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="flex justify-center items-center py-12">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Pagamentos</h1>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {students.map((student) => (
                    <StudentCard
                        key={student.id}
                        student={student}
                        href={`/pagamentos/${student.id}`}
                    />
                ))}
            </div>
        </div>
    )
}
