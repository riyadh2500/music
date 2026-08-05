import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";
import formidable from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 }); // 10MB

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: "File parse error: " + err.message });

    const file = files.image?.[0] || files.image;
    if (!file) return res.status(400).json({ error: "No image file provided" });

    const userId = fields.userId?.[0] || fields.userId;
    const type = fields.type?.[0] || fields.type || "avatar"; // avatar | cover

    const ext = file.originalFilename?.split(".").pop() || "jpg";
    const fileName = `images/${type}/${userId || "guest"}_${Date.now()}.${ext}`;
    const fileBuffer = fs.readFileSync(file.filepath);

    const { error: uploadError } = await supabase.storage
      .from("music")
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || "image/jpeg",
        upsert: true,
      });

    if (uploadError) return res.status(400).json({ error: uploadError.message });

    const { data: urlData } = supabase.storage
      .from("music")
      .getPublicUrl(fileName);

    fs.unlinkSync(file.filepath);

    // Update profile if userId provided — only for avatar and cover, NOT track images
    if (userId && (type === "avatar" || type === "cover")) {
      const field = type === "cover" ? "cover_url" : "avatar_url";
      await supabase
        .from("profiles")
        .update({ [field]: urlData.publicUrl })
        .eq("id", userId);
    }

    return res.status(200).json({ url: urlData.publicUrl, path: fileName });
  });
}
