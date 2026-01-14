import { supabase } from './supabaseClient'

export async function registerAttendance(data) {
    return await supabase
        .from('attendance')
        .insert(data)
}

export async function getAttendanceByStudent(studentId) {
    return await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('data', { ascending: false })
}
