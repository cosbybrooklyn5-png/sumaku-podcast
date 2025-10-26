// components/AudioPlayer.js
import { useEffect, useRef, useState } from "react";

export default function AudioPlayer({ audioUrl }) {
  const audioRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState(audioUrl);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {
        // Auto-play might fail in some browsers, that's fine
      });
    }
  }, [currentUrl]);

  // Fallback if audio fails to load
  const handleError = () => {
    console.warn("Audio failed to load, using placeholder.");
    setCurrentUrl("/audio/placeholder.mp3");
  };

  return (
    <div style={{ margin: "1rem 0" }}>
      <h3>Generated Audio</h3>
      <audio
        ref={audioRef}
        controls
        src={currentUrl}
        style={{ width: "100%" }}
        onError={handleError}
      />
      <a
        href={currentUrl}
        download="episode.mp3"
        style={{ display: "block", marginTop: "0.5rem" }}
      >
        Download Audio
      </a>
    </div>
  );
}
