// pages/api/saveVoice.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();

    const { audioBase64 } = req.body;
    if (!audioBase64) return res.status(400).json({ error: "No audio provided" });

    const audioBuffer = Buffer.from(audioBase64, "base64");
    const filePath = path.join(process.cwd(), "public", "audio", "voice.mp3");

    fs.writeFileSync(filePath, audioBuffer);

    res.status(200).json({ success: true, file: "/audio/voice.mp3" });
  } catch (error) {
    console.error("Error saving voice:", error);
    res.status(500).json({ error: "Failed to save voice" });
  }
}
