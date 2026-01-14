'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { registerAttendance } from '@/service/AttendaceService'

export default function AttendancesForm({ studentId, onSuccess }) {
    const [presente, setPresente] = useState(true)
    const [observacao, setObservacao] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Obter user_id
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            setError('Erro ao obter usuário')
            setLoading(false)
            return
        }

        const { error: insertError } = await registerAttendance({
            user_id: userData.user.id,
            student_id: studentId,
            data: new Date().toISOString().split('T')[0],
            presente: presente,
            observacao: observacao || null
        })

        if (insertError) {
            setError('Erro ao registrar presença: ' + insertError.message)
            setLoading(false)
            return
        }

        // Limpar formulário
        setObservacao('')
        setPresente(true)
        setLoading(false)

        // Notificar componente pai para atualizar lista
        if (onSuccess) {
            onSuccess()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
                    {error}
                </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="presente"
                    checked={presente}
                    onChange={e => setPresente(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4"
                />
                <label htmlFor="presente" className="text-sm font-medium">
                    {presente ? '✅ Presente' : '❌ Falta'}
                </label>
            </div>

            <textarea
                className="border p-2 rounded w-full"
                placeholder="Observação (opcional)"
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                disabled={loading}
            />

            <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
                {loading ? 'Registrando...' : 'Registrar'}
            </button>
        </form>
    )
}
