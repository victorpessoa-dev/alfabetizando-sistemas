"use client"

import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Trash2, ArrowLeft, Plus } from "lucide-react"

function formatCurrency(v) {
  return Number(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export default function PagamentosAlunoPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()
  const { id: studentId } = useParams()

  const [user, setUser] = useState(null)
  const [student, setStudent] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const [openModal, setOpenModal] = useState(false)
  const [newPayment, setNewPayment] = useState({
    type: "mensal", // "mensal" ou "anual"
    day: "1",
    amount: "",
  })


  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      toast({ title: "Erro", description: "Usuário não autenticado", variant: "destructive" })
      return
    }
    setUser(userData.user)

    const { data: studentData } = await supabase
      .from("students")
      .select("id, name_completo")
      .eq("id", studentId)
      .single()
    setStudent(studentData)

    await loadPayments(userData.user.id)
    setLoading(false)
  }

  async function loadPayments(userId) {
    const { data } = await supabase
      .from("payments")
      .select("id, reference_month, amount, paid")
      .eq("student_id", studentId)
      .eq("user_id", userId)
      .order("reference_month", { ascending: true })

    setPayments(data || [])
  }

  async function createPayments() {
    if (!newPayment.amount || !newPayment.day) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" })
      return
    }

    const year = new Date().getFullYear()
    let inserts = []

    if (newPayment.type === "anual") {
      // Criar um pagamento por mês do ano
      for (let m = 0; m < 12; m++) {
        const date = new Date(year, m, Number(newPayment.day)).toISOString().split("T")[0]
        inserts.push({
          student_id: studentId,
          reference_month: date,
          amount: Number(newPayment.amount),
          paid: false,
          user_id: user.id,
        })
      }
    } else {
      // Mensal: do mês atual até dezembro
      const startMonth = new Date().getMonth()
      for (let m = startMonth; m < 12; m++) {
        const date = new Date(year, m, Number(newPayment.day)).toISOString().split("T")[0]
        inserts.push({
          student_id: studentId,
          reference_month: date,
          amount: Number(newPayment.amount),
          paid: false,
          user_id: user.id,
        })
      }
    }

    const existingMonths = payments.map(p => p.reference_month)
    inserts = inserts.filter(i => !existingMonths.includes(i.reference_month))
    if (inserts.length === 0) {
      toast({ title: "Aviso", description: "Pagamentos já existem" })
      return
    }

    await supabase.from("payments").insert(inserts)
    toast({ title: "Sucesso", description: "Pagamentos criados" })
    setOpenModal(false)
    setNewPayment({ type: "mensal", day: "1", amount: "" })
    loadPayments(user.id)
  }

  async function togglePaid(payment) {
    await supabase.from("payments").update({ paid: !payment.paid }).eq("id", payment.id)
    loadPayments(user.id)
  }

  async function deletePayment(payment) {
    await supabase.from("payments").delete().eq("id", payment.id)
    loadPayments(user.id)
  }

  if (loading) return <p className="text-center py-10">Carregando...</p>

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Pagamentos - {student?.name_completo}</h1>
      </div>

      {/* MODAL */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Novo Pagamento
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Pagamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <label className="font-semibold">Tipo de pagamento</label>
            <select
              className="w-full border p-2"
              value={newPayment.type}
              onChange={e => setNewPayment({ ...newPayment, type: e.target.value })}
            >
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </select>

            <label className="font-semibold">Dia de vencimento</label>
            <Input
              type="number"
              placeholder="1 a 28"
              value={newPayment.day}
              onChange={e => setNewPayment({ ...newPayment, day: e.target.value })}
            />

            <label className="font-semibold">Valor</label>
            <Input
              type="number"
              placeholder="R$ 0,00"
              value={newPayment.amount}
              onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
            />

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setOpenModal(false)}>Cancelar</Button>
              <Button onClick={createPayments}>Criar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LISTA DE PAGAMENTOS */}
      <div className="space-y-2">
        {payments.length === 0 && (
          <p className="text-center text-muted-foreground">Nenhum pagamento cadastrado</p>
        )}
        {payments.map(p => (
          <Card key={p.id}>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Data de vencimento</p>
                <p className="font-semibold">
                  {new Date(p.reference_month).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </p>

                <p className="text-sm text-muted-foreground mt-1">Valor</p>
                <p className="font-semibold">{formatCurrency(p.amount)}</p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant={p.paid ? "default" : "outline"} onClick={() => togglePaid(p)}>
                  {p.paid ? "Pago" : "Pendente"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => deletePayment(p)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
