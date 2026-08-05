import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";
import formidable from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = formidable({ maxFileSize: 50 * 1024 * 1024 }); // 50MB

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: "File parse error: " + err.message });

    const file = files.audio?.[0] || files.audio;
    if (!file) return res.status(400).json({ error: "No audio file provided" });

    const userId = fields.userId?.[0] || fields.userId;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const ext = file.originalFilename?.split(".").pop() || "mp3";
    const fileName = `audio/${userId}/${Date.now()}.${ext}`;
    const fileBuffer = fs.readFileSync(file.filepath);

    const { error: uploadError } = await supabase.storage
      .from("music")
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || "audio/mpeg",
        upsert: false,
      });

    if (uploadError) return res.status(400).json({ error: uploadError.message });

    const { data: urlData } = supabase.storage
      .from("music")
      .getPublicUrl(fileName);

    fs.unlinkSync(file.filepath);

    return res.status(200).json({ url: urlData.publicUrl, path: fileName });
  });
}
