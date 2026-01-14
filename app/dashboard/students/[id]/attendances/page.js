"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import AttendancesForm from '@/components/AttendancesForm'
import AttendaceTable from '@/components/AttendaceTable'

export default function AttendancePage() {
    const params = useParams()
    const studentId = params.id
    const [reloadTrigger, setReloadTrigger] = useState(0)

    function handleSuccess() {
        setReloadTrigger(prev => prev + 1)
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
                Presenças e Faltas
            </h1>

            <AttendancesForm studentId={studentId} onSuccess={handleSuccess} />
            <AttendaceTable studentId={studentId} reloadTrigger={reloadTrigger} />
        </div>
    )
}
