import { createClient } from "@/lib/supabase/client"

/* ===============================
   FUNÇÃO PARA SANITIZAR NOMES
=============================== */
function sanitizeFileName(name) {
  return name
    .normalize("NFD")                 // remove acentos
    .replace(/[\u0300-\u036f]/g, "")  // remove diacríticos
    .replace(/[^a-zA-Z0-9-_\.]/g, "_") // substitui caracteres inválidos
}

/* ===============================
   POST HANDLER
=============================== */
export async function POST(req) {
  try {
    const supabase = createClient()

    // 1️⃣ Pega usuário logado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    // 2️⃣ Pega FormData (App Router)
    const formData = await req.formData()
    const file = formData.get("file")
    const type = formData.get("type") // "photo" ou "document"
    const studentId = formData.get("studentId")
    const documentName = formData.get("documentName") || null
    const documentType = formData.get("documentType") || null

    if (!file || !type || !studentId) {
      return new Response(
        JSON.stringify({ error: "Arquivo, tipo ou studentId faltando" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // 3️⃣ Escolhe bucket
    const bucket = type === "photo" ? "students-photos" : "student-documents"

    // 4️⃣ Sanitiza nome do arquivo e pastas
    const safeStudentId = sanitizeFileName(studentId)
    const safeFileName = `${Date.now()}-${sanitizeFileName(file.name)}`
    const filePath = type === "photo"
      ? `${safeStudentId}/${safeFileName}` // fotos podem ficar dentro de pasta do aluno
      : `${safeStudentId}/documents/${safeFileName}` // documentos em subpasta "documents"

    // 5️⃣ Converte arquivo para Buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // 6️⃣ Faz upload no Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, { contentType: file.type, upsert: false })

    if (uploadError) throw new Error(uploadError.message)

    // 7️⃣ Cria signed URL temporária (1 hora)
    const { data: signedUrlData } = supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60)

    // 8️⃣ Atualiza banco de dados
    let dbResult
    if (type === "photo") {
      // Foto do aluno
      const { data, error } = await supabase
        .from("students")
        .update({ photo_url: signedUrlData.signedUrl })
        .eq("id", studentId)
        .eq("user_id", user.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      dbResult = data
    } else {
      // Documento
      const { data, error } = await supabase
        .from("documents")
        .insert({
          student_id: studentId,
          document_name: documentName || file.name,
          document_type: documentType || file.type,
          document_url: signedUrlData.signedUrl,
          storage_path: filePath,
          user_id: user.id,
        })
        .select()
        .single()
      if (error) throw new Error(error.message)
      dbResult = data
    }

    // 9️⃣ Retorna JSON de sucesso
    return new Response(
      JSON.stringify({
        message: "Upload realizado com sucesso",
        fileName: safeFileName,
        filePath,
        signedUrl: signedUrlData.signedUrl,
        bucket,
        record: dbResult,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )

  } catch (err) {
    console.error("Upload error:", err)
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno ao fazer upload" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
