// © 2025 Brooklyn Cosby. All rights reserved.
// This code and content are protected under copyright law.

import { useState } from "react";
import AudioPlayer from "../components/AudioPlayer";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [scriptSegments, setScriptSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [segmentProgress, setSegmentProgress] = useState([0, 0, 0, 0, 0]);
  const [finalAudioUrl, setFinalAudioUrl] = useState(null);

  const segmentNames = ["Intro", "Segment 1", "Segment 2", "Segment 3", "Outro"];

  const handleGenerate = async () => {
    if (!topic) return alert("Please enter a topic.");

    setLoading(true);
    setStatus("Generating script...");
    setScriptSegments([]);
    setFinalAudioUrl(null);
    setSegmentProgress([0, 0, 0, 0, 0]);

    try {
      // Generate script
      const scriptRes = await fetch("/api/generateScript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await scriptRes.json();
      if (!data.segments) throw new Error("No script segments returned");
      setScriptSegments(data.segments);

      // Generate audio for each segment
      const audioUrls = [];
      for (let i = 0; i < data.segments.length; i++) {
        setStatus(`Generating ${segmentNames[i]}...`);
        const audioRes = await fetch("/api/generateAudio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script: data.segments[i], segmentIndex: i }),
        });

        const blob = await audioRes.blob();
        const url = URL.createObjectURL(blob);
        audioUrls.push(url);

        setSegmentProgress((prev) => {
          const copy = [...prev];
          copy[i] = 100;
          return copy;
        });
      }

      setFinalAudioUrl(audioUrls[0]); // For now, just play the first segment
      setStatus("Episode ready!");
    } catch (err) {
      console.error(err);
      setStatus("Error occurred. Check console.");
      alert("Something went wrong. Check the terminal.");
      setSegmentProgress([0, 0, 0, 0, 0]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: 700, margin: "auto" }}>
      <h1>The Real Spill (AI)</h1>
      <p>Type a topic and let Sumaku produce a full episode automatically.</p>

      <input
        type="text"
        placeholder="Enter episode topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={{ width: "100%", padding: "0.75rem", marginTop: "1rem" }}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{ marginTop: "1rem", padding: "0.75rem 1.5rem" }}
      >
        {loading ? "Working..." : "Generate Episode"}
      </button>

      <p style={{ fontWeight: "bold", marginTop: "1rem" }}>{status}</p>

      {/* Segment Timeline */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        {segmentNames.map((name, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div
              style={{
                height: "1rem",
                background: "#ddd",
                borderRadius: "5px",
                overflow: "hidden",
                marginBottom: "0.25rem",
              }}
            >
              <div
                style={{
                  width: `${segmentProgress[i]}%`,
                  height: "100%",
                  background: "#4caf50",
                  transition: "width 0.3s",
                }}
              />
            </div>
            <div style={{ textAlign: "center", fontSize: "0.8rem" }}>{name}</div>
          </div>
        ))}
      </div>

      {/* Script Preview */}
      {scriptSegments.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Script Segments</h2>
          {scriptSegments.map((seg, i) => (
            <pre
              key={i}
              style={{
                background: "#f9f9f9",
                padding: "0.75rem",
                whiteSpace: "pre-wrap",
                marginBottom: "0.5rem",
              }}
            >
              <strong>{segmentNames[i]}:</strong> {seg}
            </pre>
          ))}
        </div>
      )}

      {/* Audio Player */}
      {finalAudioUrl && <AudioPlayer audioUrl={finalAudioUrl} />}

      {/* Footer with Copyright */}
      <footer style={{ textAlign: "center", marginTop: "3rem", fontSize: "0.9rem", color: "#555" }}>
        © 2025 Brooklyn Cosby. All rights reserved.
      </footer>
    </main>
  );
}
