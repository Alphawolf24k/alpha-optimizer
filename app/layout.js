'use client'
import './globals.css'
import { useEffect, useState } from 'react'

export default function RootLayout({ children }) {
  const [showMobilePopup, setShowMobilePopup] = useState(false)

  useEffect(() => {
    // Check if mobile - NO localStorage check, show every time
    const isMobile = window.innerWidth <= 768
    
    if (isMobile) {
      // Show popup after 1 second on every page load
      const timer = setTimeout(() => {
        setShowMobilePopup(true)
      }, 1000)
      return () => clearTimeout(timer)
    }

    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Notification permission granted')
          }
        })
      }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered')
        })
        .catch(err => {
          console.log('Service Worker registration failed:', err)
        })
    }
  }, [])

  const dismissMobilePopup = () => {
    setShowMobilePopup(false)
  }

  return (
    <html lang="en">
      <head>
        <title>Alpha Optimizer - Ping Stabilizer with Custom Crosshairs</title>
        <meta name="description" content="Boost your gaming performance with Alpha Optimizer. 25+ custom crosshairs, DNS accelerator, real-time ping monitor, and more. Built by Muhammad Nabeel." />
        <meta name="keywords" content="CODM optimizer, Free Fire crosshair, ping stabilizer, gaming booster, mobile gaming" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <div className="particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 8 + 4}s`,
                animationDelay: `${Math.random() * 4}s`,
                width: `${Math.random() * 3 + 2}px`,
                height: `${Math.random() * 3 + 2}px`,
              }}
            />
          ))}
        </div>
        {children}

        {/* Mobile Recommendation Popup - Shows EVERY TIME */}
        {showMobilePopup && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '99999',
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1a4a 50%, #1a0a2e 100%)',
              border: '3px solid #9B59B6',
              borderRadius: '20px',
              padding: '25px',
              maxWidth: '350px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 0 60px rgba(155, 89, 182, 0.6)',
              position: 'relative',
              animation: 'popupAppear 0.3s ease-out'
            }}>
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes popupAppear {
                  from { opacity: 0; transform: scale(0.8); }
                  to { opacity: 1; transform: scale(1); }
                }
              `}} />

              {/* Close Button */}
              <button
                onClick={dismissMobilePopup}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#D4A5E8',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  padding: '5px'
                }}
              >
                ✕
              </button>

              {/* Icon */}
              <div style={{ fontSize: '50px', marginBottom: '15px' }}>
                💻
              </div>

              {/* Title */}
              <h3 style={{
                color: '#FFD700',
                fontFamily: 'Gothic, cursive',
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '12px',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
              }}>
                𝕽𝖊𝖈𝖔𝖒𝖒𝖊𝖓𝖉𝖆𝖙𝖎𝖔𝖓
              </h3>

              {/* Message */}
              <p style={{
                color: '#D4A5E8',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '20px'
              }}>
                We recommend you to open this website on <strong style={{ color: '#FFD700' }}>PC/Laptop</strong> for better and smooth use.
              </p>

              {/* Continue Button */}
              <button
                onClick={dismissMobilePopup}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Continue on Mobile
              </button>

              {/* Small note */}
              <p style={{
                color: '#64748b',
                fontSize: '11px',
                marginTop: '10px'
              }}>
                You can still use all features on mobile
              </p>
            </div>
          </div>
        )}
      </body>
    </html>
  )
}