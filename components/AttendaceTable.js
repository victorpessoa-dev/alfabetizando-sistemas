'use client'

import { useEffect, useState } from 'react'
import { getAttendanceByStudent } from '@/services/attendanceService'

export default function AttendanceTable({ studentId }) {
    const [records, setRecords] = useState([])

    useEffect(() => {
        async function load() {
            const { data } = await getAttendanceByStudent(studentId)
            setRecords(data || [])
        }
        load()
    }, [])

    return (
        <table className="w-full border mt-4">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border p-2">Data</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Obs.</th>
                </tr>
            </thead>
            <tbody>
                {records.map(r => (
                    <tr key={r.id}>
                        <td className="border p-2">{r.data}</td>
                        <td className="border p-2">
                            {r.status === 'presente' ? '✅ Presente' : '❌ Falta'}
                        </td>
                        <td className="border p-2">{r.observacao}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
