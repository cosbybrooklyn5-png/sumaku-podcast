import fs from "fs";
import path from "path";

// Disable Next's default body parser so we can accept raw binary audio data
export const config = {
  api: {
    bodyParser: false,
  },
};

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const buffer = await streamToBuffer(req);

    const publicPath = path.join(process.cwd(), "public", "audio");
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }

    const outPath = path.join(publicPath, "voice.mp3");
    fs.writeFileSync(outPath, buffer);

    return res.status(200).json({ success: true, file: "/audio/voice.mp3" });
  } catch (err) {
    console.error("uploadVoice error:", err);
    return res.status(500).json({ error: "Failed to save voice file" });
  }
}
