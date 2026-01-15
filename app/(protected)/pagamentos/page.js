"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PagamentosPage() {
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [formData, setFormData] = useState({
    student_id: "",
    month: new Date().toISOString().split("T")[0],
    amount: "",
    paid: false,
    observations: "",
  })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const { data: studentsData } = await supabase.from("students").select("*").eq("active", true).order("name")

    const { data: paymentsData } = await supabase.from("payments").select("*").order("month", { ascending: false })

    setStudents(studentsData || [])
    setPayments(paymentsData || [])
    setLoading(false)
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      const { error } = await supabase.from("payments").insert([formData])

      if (error) throw error

      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso.",
      })

      setFormData({
        student_id: "",
        month: new Date().toISOString().split("T")[0],
        amount: "",
        paid: false,
        observations: "",
      })
      setOpenDialog(false)
      loadData()
    } catch (error) {
      toast({
        title: "Erro ao registrar pagamento",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  async function handleDelete() {
    try {
      const { error } = await supabase.from("payments").delete().eq("id", deleteId)

      if (error) throw error

      toast({
        title: "Pagamento excluído",
        description: "O pagamento foi excluído com sucesso.",
      })

      loadData()
      setDeleteId(null)
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  async function togglePaymentStatus(id, currentStatus) {
    try {
      const { error } = await supabase.from("payments").update({ paid: !currentStatus }).eq("id", id)

      if (error) throw error

      loadData()
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  function getStudentName(studentId) {
    return students.find((s) => s.id === studentId)?.name || "Desconhecido"
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Pagamentos</h1>
          <p className="text-muted-foreground">Gerencie os pagamentos dos alunos</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <Label htmlFor="student_id">Aluno *</Label>
                <select
                  id="student_id"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Selecione um aluno</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="month">Mês *</Label>
                <Input
                  id="month"
                  name="month"
                  type="date"
                  value={formData.month}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="paid"
                  name="paid"
                  checked={formData.paid}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <Label htmlFor="paid" className="font-normal cursor-pointer">
                  Pago
                </Label>
              </div>
              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum pagamento registrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Aluno</th>
                    <th className="text-left p-4 font-medium">Período</th>
                    <th className="text-left p-4 font-medium">Valor</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{getStudentName(payment.student_id)}</td>
                      <td className="p-4">{formatDate(payment.month)}</td>
                      <td className="p-4 font-medium">R$ {Number.parseFloat(payment.amount).toFixed(2)}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            payment.paid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.paid ? "Pago" : "Pendente"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePaymentStatus(payment.id, payment.paid)}
                          >
                            {payment.paid ? "Marcar como pendente" : "Marcar como pago"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteId(payment.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
