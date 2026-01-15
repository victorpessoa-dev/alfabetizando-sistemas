import { createClient } from "@/lib/supabase/client"
import formidable from "formidable"
import fs from "fs"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" })
  }

  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return res.status(401).json({ error: "Usuário não autenticado" })
  }

  const form = new formidable.IncomingForm()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao processar arquivo" })
    }

    try {
      const file = files.file // arquivo do input name="file"
      const type = fields.type // "photo" ou "document"
      const studentId = fields.studentId // UUID do aluno
      const documentName = fields.documentName || null
      const documentType = fields.documentType || null

      if (!file || !type || !studentId) {
        return res.status(400).json({ error: "Arquivo, tipo ou studentId faltando" })
      }

      const bucket = type === "photo" ? "students-photos" : "student-documents"
      const fileExt = file.originalFilename.split(".").pop()
      const fileName = `${studentId}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Faz upload para o bucket
      const fileData = fs.readFileSync(file.filepath)
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileData, {
          contentType: file.mimetype,
          upsert: false,
        })

      if (uploadError) {
        return res.status(500).json({ error: uploadError.message })
      }

      // URL privada ou assinada
      const { data: signedUrlData } = supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60) // URL válida por 1 hora

      let dbResult

      if (type === "photo") {
        // Atualiza students.photo_url
        const { data, error } = await supabase
          .from("students")
          .update({ photo_url: signedUrlData.signedUrl })
          .eq("id", studentId)
          .eq("user_id", user.id)
          .select()
          .single()
        if (error) return res.status(500).json({ error: error.message })
        dbResult = data
      } else {
        // Insere documento na tabela documents
        const { data, error } = await supabase
          .from("documents")
          .insert({
            student_id: studentId,
            document_name: documentName || file.originalFilename,
            document_type: documentType || file.mimetype,
            document_url: signedUrlData.signedUrl,
            storage_path: filePath,
            user_id: user.id,
          })
          .select()
          .single()
        if (error) return res.status(500).json({ error: error.message })
        dbResult = data
      }

      res.status(200).json({
        message: "Upload realizado com sucesso",
        fileName,
        filePath,
        signedUrl: signedUrlData.signedUrl,
        bucket,
        record: dbResult,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Erro interno ao fazer upload" })
    }
  })
}
