'use client'

import { useState } from 'react'
import { registerAttendance } from '@/services/attendanceService'

export default function AttendanceForm({ studentId }) {
    const [status, setStatus] = useState('presente')
    const [observacao, setObservacao] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()

        await registerAttendance({
            student_id: studentId,
            data: new Date().toISOString().split('T')[0],
            status,
            observacao
        })

        alert('Presença registrada')
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <select
                className="border p-2 rounded w-full"
                value={status}
                onChange={e => setStatus(e.target.value)}
            >
                <option value="presente">Presente</option>
                <option value="falta">Falta</option>
            </select>

            <textarea
                className="border p-2 rounded w-full"
                placeholder="Observação (opcional)"
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
            />

            <button className="bg-green-600 text-white px-4 py-2 rounded">
                Registrar
            </button>
        </form>
    )
}
