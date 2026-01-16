"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Plus, ChevronDown, Trash2 } from "lucide-react"

export default function PagamentosPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [user, setUser] = useState(null)
  const [students, setStudents] = useState([])
  const [data, setData] = useState([])
  const [expanded, setExpanded] = useState(null)

  // modal
  const [openModal, setOpenModal] = useState(false)
  const [newPayment, setNewPayment] = useState({
    student_id: "",
    start_day: "",
    amount: "",
  })

  // paginação
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data } = await supabase.auth.getUser()
    if (!data?.user) return
    setUser(data.user)
    loadData(data.user.id)
  }

  async function loadData(userId) {
    const { data: payments } = await supabase
      .from("payments")
      .select(`
        id,
        reference_month,
        amount,
        paid,
        student_id,
        students (
          id,
          name_completo
        )
      `)
      .eq("user_id", userId)
      .order("reference_month", { ascending: false })

    const grouped = {}

    payments.forEach(p => {
      const sid = p.students.id
      if (!grouped[sid]) {
        grouped[sid] = {
          student: p.students,
          payments: [],
        }
      }
      grouped[sid].payments.push(p)
    })

    setData(Object.values(grouped))
  }

  async function loadStudents() {
    const { data } = await supabase
      .from("students")
      .select("id, name_completo")
      .eq("user_id", user.id)
      .order("name_completo")
    setStudents(data || [])
  }

  useEffect(() => {
    if (openModal && user) loadStudents()
  }, [openModal])

  async function createPayments() {
    const year = new Date().getFullYear()
    const startMonth = new Date().getMonth() + 1

    const inserts = []

    for (let m = startMonth; m <= 12; m++) {
      const date = new Date(
        year,
        m - 1,
        Number(newPayment.start_day)
      )
        .toISOString()
        .split("T")[0]

      inserts.push({
        student_id: newPayment.student_id,
        reference_month: date,
        amount: Number(newPayment.amount),
        paid: false,
        user_id: user.id,
      })
    }

    const { data: existing } = await supabase
      .from("payments")
      .select("reference_month")
      .eq("student_id", newPayment.student_id)
      .eq("user_id", user.id)

    const existingDates = existing.map(e => e.reference_month)
    const filtered = inserts.filter(i => !existingDates.includes(i.reference_month))

    if (filtered.length === 0) {
      toast({ title: "Aviso", description: "Mensalidades já existem" })
      return
    }

    await supabase.from("payments").insert(filtered)

    toast({ title: "Sucesso", description: "Mensalidades criadas" })
    setOpenModal(false)
    setNewPayment({ student_id: "", start_day: "", amount: "" })
    loadData(user.id)
  }

  async function togglePaid(id, paid) {
    await supabase.from("payments").update({ paid: !paid }).eq("id", id)
    loadData(user.id)
  }

  async function deletePayment(id) {
    await supabase.from("payments").delete().eq("id", id)
    loadData(user.id)
  }

  function formatCurrency(v) {
    return Number(v).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <div className="space-y-6">

      {/* CABEÇALHO */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <Button onClick={() => setOpenModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pagamento
        </Button>
      </div>

      {/* LISTA POR ALUNO */}
      {data.slice((page - 1) * limit, page * limit).map(item => (
        <Card key={item.student.id}>
          <CardContent>
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() =>
                setExpanded(expanded === item.student.id ? null : item.student.id)
              }
            >
              <strong>{item.student.name_completo}</strong>
              <ChevronDown />
            </div>

            {expanded === item.student.id && (
              <table className="w-full mt-4">
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {item.payments.map(p => (
                    <tr key={p.id} className="border-t">
                      <td>
                        {new Date(p.reference_month).toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td>{formatCurrency(p.amount)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant={p.paid ? "default" : "outline"}
                          onClick={() => togglePaid(p.id, p.paid)}
                        >
                          {p.paid ? "Pago" : "Pendente"}
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deletePayment(p.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      ))}

      {/* PAGINAÇÃO */}
      <div className="flex justify-between items-center">
        <select value={limit} onChange={e => setLimit(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>

        <div className="flex gap-2">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Anterior
          </Button>
          <Button onClick={() => setPage(p => p + 1)}>
            Próxima
          </Button>
        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Novo Pagamento</h2>

            <select
              className="w-full border p-2"
              value={newPayment.student_id}
              onChange={e => setNewPayment({ ...newPayment, student_id: e.target.value })}
            >
              <option value="">Aluno</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name_completo}</option>
              ))}
            </select>

            <Input
              placeholder="Dia inicial (1 a 28)"
              type="number"
              value={newPayment.start_day}
              onChange={e => setNewPayment({ ...newPayment, start_day: e.target.value })}
            />

            <Input
              placeholder="Valor"
              type="number"
              value={newPayment.amount}
              onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenModal(false)}>
                Cancelar
              </Button>
              <Button onClick={createPayments}>
                Criar
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
