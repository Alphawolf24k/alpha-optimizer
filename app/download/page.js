'use client'
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import NeonButton from '../../components/NeonButton'

export default function Download() {
  const [apkInfo, setApkInfo] = useState(null)
  const [manualInfo, setManualInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        // Fetch APK file info
        const apkResponse = await fetch('/downloads/alpha-optimizer.apk', { method: 'HEAD' })
        const apkSize = apkResponse.headers.get('content-length')
        
        // Fetch manual file info
        const manualResponse = await fetch('/downloads/manual/user-manual.pdf', { method: 'HEAD' })
        const manualSize = manualResponse.headers.get('content-length')
        
        setApkInfo({
          size: apkSize ? (parseInt(apkSize) / (1024 * 1024)).toFixed(1) + ' MB' : 'Unknown size',
          lastModified: apkResponse.headers.get('last-modified') || new Date().toISOString()
        })
        
        setManualInfo({
          size: manualSize ? (parseInt(manualSize) / (1024 * 1024)).toFixed(1) + ' MB' : 'Unknown size',
          lastModified: manualResponse.headers.get('last-modified') || new Date().toISOString()
        })
      } catch (error) {
        console.log('Error fetching file info:', error)
        setApkInfo({
          size: 'Check file',
          lastModified: new Date().toISOString()
        })
        setManualInfo({
          size: 'Check file',
          lastModified: new Date().toISOString()
        })
      }
      setLoading(false)
    }
    fetchFileInfo()
  }, [])

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (error) {
      return 'Today'
    }
  }

  return (
    <>
      <div className="animated-grid"></div>
      <Navbar />
      <main className="container">
        <div className="hero">
          <h1 className="hero-title">
            Download <span className="glow-text">Alpha Optimizer</span>
          </h1>
          <p className="hero-subtitle">
            Get the latest version of Alpha Optimizer
          </p>
          
          <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <h2 style={{ marginBottom: '20px' }}>📱 Latest Version</h2>
            
            {loading ? (
              <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Loading file info...</p>
            ) : (
              <>
                <p style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#FFD700' }}>Size:</strong> {apkInfo?.size}
                </p>
                <p style={{ marginBottom: '30px' }}>
                  <strong style={{ color: '#FFD700' }}>Last Updated:</strong> {formatDate(apkInfo?.lastModified)}
                </p>
              </>
            )}
            
            <NeonButton text="📥 Download APK" href="/downloads/alpha-optimizer.apk" />
            
            <p style={{ marginTop: '20px', color: '#94a3b8', fontSize: '14px' }}>
              By downloading, you agree to our terms and conditions
            </p>
          </div>
          
          <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <h2 style={{ marginBottom: '20px' }}>📖 User Manual</h2>
            {loading ? (
              <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Loading file info...</p>
            ) : (
              <p style={{ marginBottom: '20px', color: '#94a3b8' }}>
                Size: {manualInfo?.size} | Updated: {formatDate(manualInfo?.lastModified)}
              </p>
            )}
            
            <NeonButton text="📖 Download User Manual" href="/downloads/manual/user-manual.pdf" />
          </div>
          
          <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <h2 style={{ marginBottom: '20px' }}>📝 Installation Guide</h2>
            <ol style={{ textAlign: 'left', paddingLeft: '20px', color: '#94a3b8' }}>
              <li style={{ marginBottom: '10px' }}>Click "Download APK" button above</li>
              <li style={{ marginBottom: '10px' }}>Open the downloaded APK file</li>
              <li style={{ marginBottom: '10px' }}>Allow installation from unknown sources if prompted</li>
              <li style={{ marginBottom: '10px' }}>Install and launch Alpha Optimizer</li>
              <li style={{ marginBottom: '10px' }}>Enter your license key or start free trial</li>
            </ol>
          </div>
        </div>
      </main>
    </>
  )
}