"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

export default function PaymentsPage() {
    const [payments, setPayments] = useState([])
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            setLoading(false)
            return
        }

        // Carregar alunos
        const { data: studentsData, error: studentsError } = await supabase
            .from("students")
            .select("*")
            .eq("user_id", userData.user.id)
            .order("nome_completo")

        if (!studentsError) {
            setStudents(studentsData || [])
        }

        // Carregar pagamentos (se a tabela existir)
        const { data: paymentsData, error: paymentsError } = await supabase
            .from("payments")
            .select("*, students(nome_completo)")
            .eq("user_id", userData.user.id)
            .order("data_vencimento", { ascending: false })

        if (!paymentsError) {
            setPayments(paymentsData || [])
        }

        setLoading(false)
    }

    function getStatusColor(status) {
        switch (status) {
            case "pago":
                return "text-green-600 bg-green-100"
            case "pendente":
                return "text-yellow-600 bg-yellow-100"
            case "vencido":
                return "text-red-600 bg-red-100"
            default:
                return "text-gray-600 bg-gray-100"
        }
    }

    if (loading) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-4">Pagamentos</h1>
                <p className="text-gray-500">Carregando...</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Pagamentos</h1>
            </div>

            <div className="bg-white rounded shadow">
                {payments.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-500 mb-4">
                            Nenhum pagamento registrado
                        </p>
                        <p className="text-sm text-gray-400">
                            Os pagamentos serão exibidos aqui quando registrados
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Aluno</th>
                                <th className="p-3 text-left">Valor</th>
                                <th className="p-3 text-left">Vencimento</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Observações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id} className="border-t">
                                    <td className="p-3">
                                        {payment.students?.nome_completo || "N/A"}
                                    </td>
                                    <td className="p-3">
                                        R$ {parseFloat(payment.valor || 0).toFixed(2)}
                                    </td>
                                    <td className="p-3">
                                        {payment.data_vencimento
                                            ? new Date(payment.data_vencimento).toLocaleDateString("pt-BR")
                                            : "-"}
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                                payment.status
                                            )}`}
                                        >
                                            {payment.status || "Pendente"}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {payment.observacoes || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
