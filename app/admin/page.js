'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Password - Always required every time
    const adminPassword = 'AlphAwolF'

    if (password === adminPassword) {
      // Set session flag for this visit only
      sessionStorage.setItem('adminAuth', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('❌ Wrong password! Access denied.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="animated-grid"></div>
      <Navbar />
      <main className="container">
        <div style={{
          maxWidth: '500px',
          margin: '100px auto',
          padding: '40px',
          background: 'linear-gradient(145deg, #1a0a2e, #2d1a4a)',
          border: '2px solid #9B59B6',
          borderRadius: '25px',
          boxShadow: '0 0 40px rgba(155, 89, 182, 0.4)',
          animation: 'pulse 2s infinite'
        }}>
          <style jsx>{`
            @keyframes pulse {
              0%, 100% { box-shadow: 0 0 40px rgba(155, 89, 182, 0.4); }
              50% { box-shadow: 0 0 60px rgba(155, 89, 182, 0.6); }
            }
          `}</style>
          
          <h1 style={{
            textAlign: 'center',
            fontSize: '32px',
            marginBottom: '10px',
            color: 'white'
          }}>
            🔐 Alpha <span style={{ color: '#9B59B6' }}>Login</span>
          </h1>
          
          <p style={{
            textAlign: 'center',
            color: '#D4A5E8',
            marginBottom: '30px'
          }}>
            Enter password to access Control Panel
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              style={{
                width: '100%',
                padding: '15px',
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid #9B59B6',
                borderRadius: '15px',
                color: 'white',
                fontSize: '16px',
                marginBottom: '20px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#D4A5E8'
                e.target.style.boxShadow = '0 0 20px rgba(155, 89, 182, 0.3)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#9B59B6'
                e.target.style.boxShadow = 'none'
              }}
            />

            {error && (
              <div style={{
                padding: '15px',
                background: 'rgba(231, 76, 60, 0.1)',
                border: '2px solid #E74C3C',
                borderRadius: '10px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#E74C3C', fontWeight: 'bold' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
                border: 'none',
                borderRadius: '15px',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 20px rgba(155, 89, 182, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)'
                e.target.style.boxShadow = '0 0 30px rgba(155, 89, 182, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 0 20px rgba(155, 89, 182, 0.3)'
              }}
            >
              {loading ? 'Verifying...' : 'Unlock Panel'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '20px',
            color: '#64748b',
            fontSize: '12px'
          }}>
            ⚡ Alpha of Alphas - Authorized Access Only
          </p>
        </div>
      </main>
    </>
  )
}