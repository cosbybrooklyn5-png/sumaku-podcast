import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const audioDir = path.join(process.cwd(), "public", "audio");
    const outputPath = path.join(audioDir, "final_episode.mp3");

    // ✅ Scan audio folder automatically
    const allFiles = fs.readdirSync(audioDir).filter(f => f.endsWith(".mp3"));
    console.log("Found audio files:", allFiles);

    // Find common assets
    const dingFile = allFiles.find(f => f.toLowerCase().includes("ding")) || null;

    // Group voice/background files dynamically
    const voiceFiles = allFiles.filter(f =>
      /intro|segment|outro/i.test(f) && !f.toLowerCase().includes("bg")
    );
    const bgFiles = allFiles.filter(f => f.toLowerCase().includes("bg"));

    // Sort logically: intro → segment1 → segment2 → ... → outro
    voiceFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    bgFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const segments = voiceFiles.map((voice, i) => ({
      voice,
      bg: bgFiles[i] || bgFiles[0] || null, // fallback to first bg if fewer bg files
    }));

    console.log("Segments detected:", segments);

    if (segments.length === 0) {
      return res.status(400).json({ error: "No voice segments found." });
    }

    const cmd = ffmpeg();

    // Add inputs (voice + bg for each segment + optional ding)
    segments.forEach((seg, index) => {
      if (index > 0 && dingFile) cmd.input(path.join(audioDir, dingFile));
      cmd.input(path.join(audioDir, seg.voice));
      if (seg.bg) cmd.input(path.join(audioDir, seg.bg));
    });

    const filter = [];
    let inputCount = 0;
    const amixLabels = [];

    segments.forEach((seg, index) => {
      const hasDing = index > 0 && dingFile;
      const voiceInput = hasDing ? inputCount + 1 : inputCount;
      const bgInput = seg.bg ? voiceInput + 1 : null;

      if (seg.bg) {
        filter.push(`[${voiceInput}:a][${bgInput}:a]amix=inputs=2:duration=longest[a${index}]`);
      } else {
        filter.push(`[${voiceInput}:a]anull[a${index}]`);
      }

      amixLabels.push(`[a${index}]`);
      inputCount += hasDing ? (seg.bg ? 3 : 2) : (seg.bg ? 2 : 1);
    });

    const concatFilter = `${amixLabels.join("")}concat=n=${segments.length}:v=0:a=1[out]`;
    filter.push(concatFilter);

    cmd.complexFilter(filter, "out")
      .outputOptions(["-map [out]", "-c:a libmp3lame", "-q:a 2"])
      .on("start", (cmdLine) => console.log("FFmpeg started:", cmdLine))
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        res.status(500).json({ error: "Failed to mix audio" });
      })
      .on("end", () => {
        console.log("✅ Audio mix (with fades) completed!");
        res.status(200).json({ success: true, file: "/audio/final_episode.mp3" });
      })
      .save(outputPath);

  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Unexpected error mixing audio" });
  }
}
