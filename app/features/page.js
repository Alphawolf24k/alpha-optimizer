import Navbar from '../../components/Navbar'

const features = [
  { icon: "🎯", title: "25 Custom Crosshairs", desc: "PRO (5), LEGENDARY (8), MYTHIC (12) designs with dynamic center dot color, adjustable scale, and thickness" },
  { icon: "🚀", title: "DNS Accelerator", desc: "VPN service using Cloudflare, Google, OpenDNS. Zong CODM bypass confirmed working!" },
  { icon: "📊", title: "Real-Time Ping", desc: "TCP handshake measurement to game servers, updates every 2-3 seconds" },
  { icon: "🎯", title: "Headshot Calibration", desc: "Long-Range: 110%, Close-Range: 150% with adjustable sliders" },
  { icon: "🔄", title: "Free Fire Auto-Rotate", desc: "System-wide landscape forcing with auto-restore" },
  { icon: "⚡", title: "Max Refresh Rate", desc: "Forces highest available display refresh rate" },
  { icon: "🎨", title: "Color Enhancement", desc: "Multi-key display mode switching + brightness fallback" },
  { icon: "🔕", title: "Gaming DND", desc: "Mutes all notifications and calls while gaming" },
  { icon: "📱", title: "App Locker", desc: "PIN/password lock with 60s unlock session" },
  { icon: "🔍", title: "Phone Info", desc: "Device specs, RAM, storage, battery health" },
  { icon: "📖", title: "Ping Guide", desc: "5-step screenshot guide for changing game region" },
  { icon: "🛡️", title: "Anti-Piracy", desc: "Advanced protection system" }
]

export default function Features() {
  return (
    <>
      <div className="animated-grid"></div>
      <Navbar />
      <main className="container">
        <h1 className="hero-title" style={{ textAlign: 'center', marginTop: '60px' }}>
          All <span className="glow-text">Features</span>
        </h1>
        <div className="grid">
          {features.map((feature, index) => (
            <div key={index} className="card">
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>{feature.icon}</div>
              <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>{feature.title}</h2>
              <p style={{ color: '#94a3b8' }}>{feature.desc}</p>
            </div>
          ))}
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