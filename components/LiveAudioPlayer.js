// components/LiveAudioPlayer.js
import { useState, useRef, useEffect } from "react";

export default function LiveAudioPlayer({ script }) {
  const [loading, setLoading] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const audioRef = useRef(null);

  const placeholderURL = "/audio/placeholder.mp3"; // public folder path

  const playAudio = async () => {
    if (!script) return alert("No script provided");

    setLoading(true);

    try {
      // Call your API to generate audio
      const response = await fetch("/api/generateAudio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      if (!response.ok) throw new Error("Audio generation failed");

      // Convert response to blob and create URL
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      audioRef.current.src = url;
      audioRef.current.play();
    } catch (err) {
      console.error("Audio generation failed, using placeholder:", err.message);
      // Fallback to placeholder
      setAudioURL(placeholderURL);
      audioRef.current.src = placeholderURL;
      audioRef.current.play();
    } finally {
      setLoading(false);
    }
  };

  // Optional: autoplay when audioURL changes
  useEffect(() => {
    if (audioURL && audioRef.current) audioRef.current.play().catch(() => {});
  }, [audioURL]);

  return (
    <div>
      <button
        onClick={playAudio}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Loading..." : "Play Audio"}
      </button>

      <audio ref={audioRef} controls className="mt-4 w-full" />
    </div>
  );
}
