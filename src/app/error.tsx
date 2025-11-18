'use client'

export default function ErrorPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '10px', color: '#d32f2f' }}>⚠️ Error</h1>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>There was a problem loading the page. Please refresh or try again later.</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px' }}>
          Refresh Page
        </button>
      </div>
    </div>
  );
}
