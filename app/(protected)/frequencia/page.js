"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "lucide-react"

export default function PresencaPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedGrade, setSelectedGrade] = useState("") // filtro por série
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const grades = [
    "Educação Infantil",
    "1º Ano",
    "2º Ano",
    "3º Ano",
    "4º Ano",
    "5º Ano",
    "6º Ano",
    "7º Ano",
    "8º Ano",
    "9º Ano",
  ]

  useEffect(() => {
    loadData()
  }, [selectedDate, selectedGrade])

  async function loadData() {
    setLoading(true)
    try {
      let query = supabase.from("students").select("*").eq("active", true).order("name_completo")
      if (selectedGrade) query = query.eq("grade", selectedGrade)

      const { data: studentsData } = await query

      const { data: attendanceData } = await supabase
        .from("attendances")
        .select("*")
        .eq("attendance_date", selectedDate)

      setStudents(studentsData || [])

      const attendanceMap = {}
      attendanceData?.forEach((record) => {
        attendanceMap[record.student_id] = record.status || "ausente"
      })
      setAttendance(attendanceMap)
    } catch (error) {
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  function handleAttendanceChange(studentId, status) {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  function markAll(status) {
    const newAttendance = {}
    students.forEach((s) => (newAttendance[s.id] = status))
    setAttendance(newAttendance)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      const records = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: studentId,
        attendance_date: selectedDate,
        status,
        user_id: user.id,
      }))

      if (records.length > 0) {
        await supabase.from("attendances").upsert(records, { onConflict: ["student_id", "attendance_date"] })
      }

      toast({ title: "Presença salva", description: "As presenças foram registradas com sucesso." })
      loadData()
    } catch (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const presenteCount = Object.values(attendance).filter((v) => v === "presente").length
  const ausenteCount = Object.values(attendance).filter((v) => v === "ausente").length
  const justificadoCount = Object.values(attendance).filter((v) => v === "justificado").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Presença Diária</h1>
        <p className="text-muted-foreground">Marque a presença dos alunos</p>
      </div>

      {/* Controle de data e botões rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Selecione a data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>

            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="grade">Filtrar por série</Label>
              <select
                id="grade"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="">Todas</option>
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => markAll("presente")} disabled={students.length === 0}>
                Marcar Todos Presente
              </Button>
              <Button onClick={handleSave} disabled={saving || Object.keys(attendance).length === 0}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>

            <p className="mt-2 text-sm">
              <span className="text-green-600 font-bold">✅ {presenteCount}</span> |{" "}
              <span className="text-red-600 font-bold">❌ {ausenteCount}</span> |{" "}
              <span className="text-yellow-600 font-bold">📝 {justificadoCount}</span> de {students.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de alunos */}
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
                        src={student.photo_url}
                        alt={student.name_completo}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{student.name_completo.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{student.name_completo}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.grade} {student.class && `- ${student.class}`}
                      </p>
                    </div>
                  </div>

                  {/* Botões de status com cores */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className={`${attendance[student.id] === "presente"
                        ? "bg-green-500 text-white"
                        : "bg-white border border-green-500 text-green-500 hover:bg-green-100"
                        }`}
                      onClick={() => handleAttendanceChange(student.id, "presente")}
                    >
                      Presente
                    </Button>
                    <Button
                      size="sm"
                      className={`${attendance[student.id] === "ausente"
                        ? "bg-red-500 text-white"
                        : "bg-white border border-red-500 text-red-500 hover:bg-red-100"
                        }`}
                      onClick={() => handleAttendanceChange(student.id, "ausente")}
                    >
                      Ausente
                    </Button>
                    <Button
                      size="sm"
                      className={`${attendance[student.id] === "justificado"
                        ? "bg-yellow-400 text-white"
                        : "bg-white border border-yellow-400 text-yellow-600 hover:bg-yellow-100"
                        }`}
                      onClick={() => handleAttendanceChange(student.id, "justificado")}
                    >
                      Justificado
                    </Button>
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
