import Navbar from '../../components/Navbar'

export default function Guides() {
  return (
    <>
      <div className="animated-grid"></div>
      <Navbar />
      <main className="container">
        <h1 className="hero-title" style={{ textAlign: 'center', marginTop: '60px' }}>
          Gaming <span className="glow-text">Guides</span>
        </h1>
        
        <div className="grid">
          <div className="card">
            <h2>📡 Lower Your Ping</h2>
            <p>Learn how to reduce your ping from 80ms to 40ms by changing game region</p>
            <ol style={{ paddingLeft: '20px', color: '#94a3b8', marginTop: '10px' }}>
              <li>Open CODM settings</li>
              <li>Go to server selection</li>
              <li>Choose nearest server</li>
              <li>Enable DNS accelerator</li>
              <li>Restart game</li>
            </ol>
          </div>
          
          <div className="card">
            <h2>🎯 Crosshair Setup</h2>
            <p>Optimize your crosshair for better aim</p>
            <ul style={{ paddingLeft: '20px', color: '#94a3b8', marginTop: '10px' }}>
              <li>Choose MYTHIC crosshairs for precision</li>
              <li>Adjust scale based on screen size</li>
              <li>Use dynamic center dot</li>
              <li>Test in training mode first</li>
            </ul>
          </div>
          
          <div className="card">
            <h2>🔧 ADB Setup</h2>
            <p>Unlock advanced features with ADB</p>
            <pre style={{ 
              background: 'var(--carbon-black)', 
              padding: '15px', 
              borderRadius: '10px',
              color: 'var(--cyber-green)',
              overflowX: 'auto',
              marginTop: '10px'
            }}>
{`adb shell pm grant com.aistudio.elitebooster.muhammadnabeel android.permission.WRITE_SECURE_SETTINGS`}
            </pre>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <a 
            href="https://www.instagram.com/Alphawolf24k" 
            target="_blank" 
            rel="noopener noreferrer"
            className="instagram-button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            Follow on Instagram for Updates
          </a>
        </div>
      </main>
    </>
  )
}