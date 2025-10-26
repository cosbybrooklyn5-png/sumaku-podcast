import { useState } from 'react';

export default function Extras({ script }) {
  const [showNotes, setShowNotes] = useState('');
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateExtras = async () => {
    if (!script) return;
    setLoading(true);

    try {
      const res = await fetch('/api/generateExtras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      setShowNotes(data.showNotes);
      setSnippets(data.snippets);
    } catch (error) {
      console.error(error);
      alert('Failed to generate show notes/snippets.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <button onClick={generateExtras} style={{ padding: '0.5rem 1rem' }}>
        Generate Show Notes & Snippets
      </button>
      {loading && <p>Loading...</p>}
      {showNotes && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Show Notes</h3>
          <textarea value={showNotes} readOnly rows={5} style={{ width: '100%', padding: '1rem' }} />
        </div>
      )}
      {snippets.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Social Media Snippets</h3>
          <ul>
            {snippets.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
