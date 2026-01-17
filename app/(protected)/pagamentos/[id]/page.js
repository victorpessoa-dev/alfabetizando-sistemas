"use client"

import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Button
} from "@/components/ui/button"
import {
  Card,
  CardContent
} from "@/components/ui/card"
import {
  Input
} from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Trash2,
  ArrowLeft,
  Plus,
  Pencil
} from "lucide-react"

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export default function PagamentosAlunoPage() {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const { id: studentId } = useParams()

  const [user, setUser] = useState(null)
  const [student, setStudent] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editing, setEditing] = useState(null)

  const [newPayment, setNewPayment] = useState({
    startMonth: new Date().getMonth() + 1,
    endMonth: 12,
    day: "1",
    amount: "",
  })

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data } = await supabase.auth.getUser()
    if (!data?.user) return

    setUser(data.user)

    const { data: studentData } = await supabase
      .from("students")
      .select("id, name_completo")
      .eq("id", studentId)
      .single()

    setStudent(studentData)
    await loadPayments(data.user.id)
    setLoading(false)
  }

  async function loadPayments(userId) {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("student_id", studentId)
      .eq("user_id", userId)
      .order("reference_month")

    setPayments(data || [])
  }

  async function createPayments() {
    const { startMonth, endMonth, day, amount } = newPayment

    if (!amount || startMonth > endMonth) {
      toast({
        title: "Erro",
        description: "Intervalo de meses inválido",
        variant: "destructive",
      })
      return
    }

    const year = new Date().getFullYear()
    let inserts = []

    for (let m = startMonth; m <= endMonth; m++) {
      const date = new Date(year, m - 1, day)

      if (date.getMonth() !== m - 1) {
        const lastDay = new Date(year, m, 0)
        inserts.push({
          student_id: studentId,
          reference_month: lastDay.toISOString().split("T")[0],
          amount: Number(amount),
          paid: false,
          user_id: user.id,
        })
        continue
      }

      inserts.push({
        student_id: studentId,
        reference_month: date.toISOString().split("T")[0],
        amount: Number(amount),
        paid: false,
        user_id: user.id,
      })
    }

    const existing = payments.map(p => p.reference_month)
    inserts = inserts.filter(p => !existing.includes(p.reference_month))

    if (!inserts.length) {
      toast({ title: "Pagamentos já existem nesse período" })
      return
    }

    await supabase.from("payments").insert(inserts)

    toast({ title: "Pagamentos gerados com sucesso" })
    setOpenCreate(false)
    loadPayments(user.id)
  }


  async function togglePaid(payment) {
    await supabase
      .from("payments")
      .update({ paid: !payment.paid })
      .eq("id", payment.id)

    loadPayments(user.id)
  }

  async function deletePayment(id) {
    if (!confirm("Deseja excluir este pagamento?")) return

    await supabase.from("payments").delete().eq("id", id)
    toast({ title: "Pagamento excluído" })
    loadPayments(user.id)
  }

  async function saveEdit() {
    await supabase
      .from("payments")
      .update({
        amount: editing.amount,
        reference_month: editing.reference_month,
      })
      .eq("id", editing.id)

    toast({ title: "Pagamento atualizado" })
    setOpenEdit(false)
    loadPayments(user.id)
  }

  const totalGeral = payments.reduce((s, p) => s + Number(p.amount), 0)
  const totalPago = payments
    .filter(p => p.paid)
    .reduce((s, p) => s + Number(p.amount), 0)
  const totalPendente = totalGeral - totalPago

  if (loading) return <div className="flex justify-center items-center py-12">
    <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  </div>

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          Pagamentos - {student?.name_completo}
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total Geral</p>
          <p className="text-xl font-bold">{formatCurrency(totalGeral)}</p>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total Pago</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Pendente</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalPendente)}</p>
        </CardContent></Card>
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Gerar Pagamentos
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Pagamentos</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <select
              className="w-full border p-2"
              value={newPayment.startMonth}
              onChange={e => setNewPayment({ ...newPayment, startMonth: Number(e.target.value) })}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
                </option>
              ))}
            </select>

            <select
              className="w-full border p-2"
              value={newPayment.endMonth}
              onChange={e => setNewPayment({ ...newPayment, endMonth: Number(e.target.value) })}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
                </option>
              ))}
            </select>

            <Input
              type="number"
              placeholder="Dia"
              value={newPayment.day}
              onChange={e => setNewPayment({ ...newPayment, day: e.target.value })}
            />

            <Input
              type="number"
              placeholder="Valor"
              value={newPayment.amount}
              onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
            />

            <Button onClick={createPayments}>Gerar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* LISTA */}
      {payments.map(p => (
        <Card key={p.id}>
          <CardContent className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                {new Date(p.reference_month).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </p>
              <p>{formatCurrency(p.amount)}</p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => togglePaid(p)}
                variant={p.paid ? "default" : "outline"}
                className={
                  p.paid
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                }
              >
                {p.paid ? "Pago" : "Pendente"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(p); setOpenEdit(true) }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => deletePayment(p.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* EDITAR */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-3">
              <Input
                type="date"
                value={editing.reference_month}
                onChange={e => setEditing({ ...editing, reference_month: e.target.value })}
              />
              <Input
                type="number"
                value={editing.amount}
                onChange={e => setEditing({ ...editing, amount: e.target.value })}
              />
              <Button onClick={saveEdit}>Salvar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
