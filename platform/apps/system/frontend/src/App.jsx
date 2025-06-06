import { useState, useEffect } from 'react'

function App() {
  const [systemData, setSystemData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Test API calls to the system backend
    Promise.all([
      fetch('/api/system/').then(r => r.json()),
      fetch('/api/system/health').then(r => r.json()),
      fetch('/api/system/info').then(r => r.json()),
      fetch('/api/system/features').then(r => r.json()),
    ])
    .then(([root, health, info, features]) => {
      setSystemData({ root, health, info, features })
      setLoading(false)
    })
    .catch(err => {
      console.error('API Error:', err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div style={styles.container}>Loading system data...</div>
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ System Dashboard</h1>
      <p style={styles.subtitle}>Singlet Framework System Information</p>
      
      {systemData ? (
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>🏠 System Status</h3>
            <p><strong>Message:</strong> {systemData.root.message}</p>
            <p><strong>Feature:</strong> {systemData.root.feature}</p>
            <small>{systemData.root.description}</small>
          </div>
          
          <div style={styles.card}>
            <h3>💚 Health Check</h3>
            <p><strong>Status:</strong> <span style={{color: 'green'}}>{systemData.health.status}</span></p>
            <p><strong>Uptime:</strong> {Math.floor(systemData.health.uptime)}s</p>
            <p><strong>Memory:</strong> {Math.round(systemData.health.memory.used / 1024 / 1024)}MB</p>
          </div>
          
          <div style={styles.card}>
            <h3>ℹ️ System Info</h3>
            <p><strong>Framework:</strong> {systemData.info.framework}</p>
            <p><strong>Version:</strong> {systemData.info.version}</p>
            <p><strong>Environment:</strong> {systemData.info.environment}</p>
            <p><strong>Node:</strong> {systemData.info.node}</p>
            <p><strong>Platform:</strong> {systemData.info.platform}</p>
          </div>
          
          <div style={styles.card}>
            <h3>🚩 Feature Flags</h3>
            {Object.keys(systemData.features.features).length > 0 ? (
              Object.entries(systemData.features.features).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> <span style={{color: value ? 'green' : 'red'}}>{value ? '✅' : '❌'}</span>
                </p>
              ))
            ) : (
              <p>No features configured</p>
            )}
          </div>
        </div>
      ) : (
        <p style={styles.error}>❌ Failed to connect to system backend</p>
      )}
      
      <footer style={styles.footer}>
        System Platform App • Singlet Framework • {new Date().toLocaleTimeString()}
      </footer>
    </div>
  )
}

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  title: {
    fontSize: '2.5rem',
    margin: '1rem 0',
    color: '#333',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    margin: '2rem 0'
  },
  card: {
    padding: '1.5rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  error: {
    color: '#e74c3c',
    fontSize: '1.1rem',
    textAlign: 'center',
    padding: '2rem'
  },
  footer: {
    marginTop: '3rem',
    padding: '1rem',
    color: '#888',
    fontSize: '0.9rem',
    textAlign: 'center',
    borderTop: '1px solid #ddd'
  }
}

export default App