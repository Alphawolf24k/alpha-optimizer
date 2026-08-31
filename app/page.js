'use client'
import Navbar from '../components/Navbar'
import NeonButton from '../components/NeonButton'
import DailyQuote from '../components/DailyQuote'
import QuizSystem from '../components/QuizSystem'
import Store from '../components/Store'
import UserProfile from '../components/UserProfile'
import GameChat from '../components/GameChat'
import Feedback from '../components/Feedback'

export default function Home() {
  return (
    <>
      <div className="animated-grid"></div>
      <Navbar />
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '5px 10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <UserProfile />
        <GameChat />
        <Feedback />
      </div>
      <main className="container">
        <div className="hero">
          <h1 className="hero-title">
            <span className="glow-text">Alpha Optimizer</span>
          </h1>
          <div style={{ marginBottom: '40px' }}>
            <p className="hero-subtitle typing-text">
              Ping Stabilizer with Custom Crosshairs
            </p>
          </div>
          <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '40px' }}>
            Boost your gaming performance with 25+ custom crosshairs, DNS accelerator, 
            real-time ping monitor, and more!
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <NeonButton text="Download Now" href="/download" />
            <NeonButton text="View Features" href="/features" />
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <h2>🎯 25 Custom Crosshairs</h2>
            <p>PRO, LEGENDARY, and MYTHIC designs with dynamic center dot color</p>
          </div>
          <div className="card">
            <h2>🚀 DNS Accelerator</h2>
            <p>Route DNS traffic through Cloudflare, Google, or OpenDNS</p>
          </div>
          <div className="card">
            <h2>📊 Real-Time Ping</h2>
            <p>Monitor your connection to game servers every 2-3 seconds</p>
          </div>
          <div className="card">
            <h2>🎮 Gaming DND</h2>
            <p>Mute all notifications and calls while gaming</p>
          </div>
          <div className="card">
            <h2>🔒 App Locker</h2>
            <p>Protect your apps with PIN or password</p>
          </div>
          <div className="card">
            <h2>📱 Phone Info</h2>
            <p>View device specs, RAM, storage, and battery health</p>
          </div>
        </div>

        <DailyQuote />
        <QuizSystem />
        <Store />

        {/* ALPHA OF ALPHAS - STATIC GOTHIC (NO ANIMATION) */}
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          position: 'relative'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            marginBottom: '20px',
            color: '#FFFFFF'
          }}>
            Built by <span className="glow-text">Muhammad Nabeel</span>
          </h2>
          
          {/* Static Gothic Alpha of Alphas - No Animation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <span style={{
              fontFamily: 'Gothic, Old English Text MT, Blackletter, cursive',
              fontSize: '36px',
              fontWeight: 'bold',
              letterSpacing: '3px',
              color: '#FF4500',
              whiteSpace: 'nowrap'
            }}>
              𝕬𝖑𝖕𝖍𝖆 𝖔𝖋 𝕬𝖑𝖕𝖍𝖆𝖘
            </span>
          </div>
          
          {/* Subtitle - UNCHANGED */}
          <p style={{ color: '#FFD700', fontSize: '14px', fontStyle: 'italic', marginBottom: '20px', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}>
            ~ 𝕿𝖍𝖊 𝕯𝖆𝖗𝖐 𝕶𝖓𝖎𝖌𝖍𝖙 𝖔𝖋 𝕲𝖆𝖒𝖎𝖓𝖌 ~
          </p>

          <a href="https://www.instagram.com/Alphawolf24k" target="_blank" rel="noopener noreferrer" className="instagram-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            Follow on Instagram
          </a>
          <div style={{ marginTop: '20px' }}>
            <NeonButton text="Get Started" href="/pricing" />
          </div>
        </div>
      </main>
    </>
  )
}