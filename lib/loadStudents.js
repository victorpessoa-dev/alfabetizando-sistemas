import { createClient } from "@/lib/supabase/client"

export async function loadStudents() {
    const supabase = createClient()

    const { data, error } = await supabase
        .from("students")
        .select("id, name_completo, grade, photo_url")
        .order("name_completo")

    if (error) throw error
    return data || []
}
