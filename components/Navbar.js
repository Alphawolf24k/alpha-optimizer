'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-content" style={{ flexWrap: 'nowrap', overflowX: 'auto', gap: '8px', justifyContent: 'flex-start', padding: '8px 10px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-primary)', flexShrink: 0 }}>
          <h1 style={{ fontSize: isMobile ? '16px' : '24px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            <span className="glow-text">Alpha</span> Optimizer
          </h1>
        </Link>
        
        <div style={{ display: 'flex', gap: isMobile ? '4px' : '10px', alignItems: 'center', flexShrink: 0 }}>
          <Link href="/features" className="nav-link" style={{ fontSize: isMobile ? '10px' : '14px', padding: isMobile ? '4px 8px' : '8px 16px', whiteSpace: 'nowrap' }}>Features</Link>
          <Link href="/pricing" className="nav-link" style={{ fontSize: isMobile ? '10px' : '14px', padding: isMobile ? '4px 8px' : '8px 16px', whiteSpace: 'nowrap' }}>Pricing</Link>
          <Link href="/download" className="nav-link" style={{ fontSize: isMobile ? '10px' : '14px', padding: isMobile ? '4px 8px' : '8px 16px', whiteSpace: 'nowrap' }}>Download</Link>
          <Link href="/guides" className="nav-link" style={{ fontSize: isMobile ? '10px' : '14px', padding: isMobile ? '4px 8px' : '8px 16px', whiteSpace: 'nowrap' }}>Guides</Link>
        </div>
      </div>
    </nav>
  )
}