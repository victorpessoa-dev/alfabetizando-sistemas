'use client'

import { useEffect, useState } from 'react'
import { getAttendanceByStudent } from '@/service/AttendaceService'

export default function AttendaceTable({ studentId, reloadTrigger }) {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data, error } = await getAttendanceByStudent(studentId)
            if (!error) {
                setRecords(data || [])
            }
            setLoading(false)
        }
        load()
    }, [studentId, reloadTrigger])

    if (loading) {
        return <p className="mt-4 text-gray-500">Carregando...</p>
    }

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
                {records.length === 0 ? (
                    <tr>
                        <td colSpan={3} className="border p-2 text-center text-gray-500">
                            Nenhuma presença registrada
                        </td>
                    </tr>
                ) : (
                    records.map(r => (
                        <tr key={r.id}>
                            <td className="border p-2">{r.data}</td>
                            <td className="border p-2">
                                {r.presente ? '✅ Presente' : '❌ Falta'}
                            </td>
                            <td className="border p-2">{r.observacao || '-'}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    )
}
