"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "lucide-react"

export default function PresencaPage() {
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [selectedDate])

  async function loadData() {
    setLoading(true)

    const { data: studentsData } = await supabase.from("students").select("*").eq("active", true).order("name")

    const { data: attendanceData } = await supabase.from("attendances").select("*").eq("attendance_date", selectedDate)

    setStudents(studentsData || [])

    const attendanceMap = {}
    attendanceData?.forEach((record) => {
      attendanceMap[record.student_id] = record.present
    })
    setAttendance(attendanceMap)

    setLoading(false)
  }

  async function handleAttendanceChange(studentId, present) {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: present,
    }))
  }

  async function handleSave() {
    setSaving(true)

    try {
      for (const [studentId, present] of Object.entries(attendance)) {
        const { data: existing } = await supabase
          .from("attendances")
          .select("id")
          .eq("student_id", studentId)
          .eq("attendance_date", selectedDate)
          .single()

        if (existing) {
          await supabase
            .from("attendances")
            .update({ present })
            .eq("student_id", studentId)
            .eq("attendance_date", selectedDate)
        } else {
          await supabase.from("attendances").insert([
            {
              student_id: studentId,
              attendance_date: selectedDate,
              present,
            },
          ])
        }
      }

      toast({
        title: "Presença salva",
        description: "As presenças foram registradas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Presença Diária</h1>
        <p className="text-muted-foreground">Marque a presença dos alunos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Selecione a data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={saving || Object.keys(attendance).length === 0}>
              {saving ? "Salvando..." : "Salvar Presenças"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum aluno ativo cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {students.map((student) => (
                <div key={student.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                  <div className="flex-1 flex items-center gap-3">
                    {student.photo_url ? (
                      <img
                        src={student.photo_url || "/placeholder.svg"}
                        alt={student.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{student.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.grade}
                        {student.class && ` - ${student.class}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={attendance[student.id] === true}
                        onCheckedChange={(checked) => handleAttendanceChange(student.id, checked === true)}
                      />
                      <span className="text-sm">Presente</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
