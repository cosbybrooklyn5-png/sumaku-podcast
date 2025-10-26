import fetch from "node-fetch";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!voiceId || !apiKey) {
      return res.status(500).json({ error: "ELEVENLABS_VOICE_ID or ELEVENLABS_API_KEY not set in environment" });
    }

    const introText = "Welcome to The Real Spill";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: introText,
          voice_settings: { stability: 0.7, similarity_boost: 0.85 }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    // Convert response to Base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    // Save directly to /public/audio/intro_name.mp3
    const publicAudioPath = path.join(process.cwd(), "public", "audio", "intro_name.mp3");
    fs.writeFileSync(publicAudioPath, Buffer.from(base64Audio, "base64"));

    res.status(200).json({ success: true, file: "/audio/intro_name.mp3" });
  } catch (err) {
    console.error("Error generating intro voice:", err);
    res.status(500).json({ error: "Failed to generate intro voice" });
  }
}
