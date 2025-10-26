import { useState } from 'react';

export default function EpisodeForm({ setScript, setAudioUrl, script }) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const generateScript = async () => {
    if (!topic) return;
    setLoading(true);
    setAudioUrl('');

    try {
      const res = await fetch('/api/generateScript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setScript(data.script);
    } catch (error) {
      console.error(error);
      alert('Failed to generate script.');
    } finally {
      setLoading(false);
    }
  };

  const generateAudio = async () => {
    if (!script) {
      alert('Please generate the script first.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/generateAudio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });

      const blob = await res.blob();
zx      // Create a local blob URL so the user can preview immediately
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Also persist the generated audio server-side so mixAudio can use it
      try {
        const uploadRes = await fetch('/api/uploadVoice', {
          method: 'POST',
          headers: { 'Content-Type': 'audio/mpeg' },
          body: blob,
        });

        if (uploadRes.ok) {
          // Prefer the persisted server copy for playback/download if available
          setAudioUrl('/audio/voice.mp3');
        } else {
          console.error('Upload failed', await uploadRes.text());
        }
      } catch (uploadErr) {
        console.error('Failed to upload voice to server:', uploadErr);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to generate audio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter episode topic"
        style={{ padding: '0.5rem', width: '60%' }}
      />
      <button onClick={generateScript} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
        Generate Script
      </button>
      <button onClick={generateAudio} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
        Generate Audio
      </button>
      {loading && <p>Loading...</p>}
    </div>
  );
}
