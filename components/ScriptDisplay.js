export default function ScriptDisplay({ script, setScript }) {
  return (
    <div style={{ margin: '1rem 0' }}>
      <h3>Generated Script</h3>
      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        rows={15}
        style={{ width: '100%', padding: '1rem' }}
      />
    </div>
  );
}
