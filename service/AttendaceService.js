import { supabase } from '@/lib/supabase/client'

export async function registerAttendance(data) {
    return await supabase
        .from('attendances')
        .insert(data)
}

export async function getAttendanceByStudent(studentId) {
    return await supabase
        .from('attendances')
        .select('*')
        .eq('student_id', studentId)
        .order('data', { ascending: false })
}
