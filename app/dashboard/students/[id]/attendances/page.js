import AttendanceForm from '@/components/AttendanceForm'
import AttendanceTable from '@/components/AttendanceTable'

export default function AttendancePage({ params }) {
    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
                Presenças e Faltas
            </h1>

            <AttendanceForm studentId={params.id} />
            <AttendanceTable studentId={params.id} />
        </div>
    )
}
