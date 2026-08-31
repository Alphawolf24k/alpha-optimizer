'use client'
import { useState, useEffect, useRef } from 'react'
import { getOrCreateDeviceId } from '../utils/deviceId'
import { getUserProfile, saveUserProfile } from '../utils/userProfile'

export default function UserProfile() {
  const [profile, setProfile] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const fileInputRef = useRef(null)
  const [deviceId, setDeviceId] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const init = async () => {
      const id = getOrCreateDeviceId()
      setDeviceId(id)
      const userProfile = await getUserProfile(id)
      setProfile(userProfile)
    }
    init()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!profile) return null

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        profile.profilePicture = event.target.result
        await saveUserProfile(profile)
        setProfile({...profile})
      }
      reader.readAsDataURL(file)
    }
  }

  const getLogoEmoji = () => {
    const logoMap = { 'dragon': '🐉', 'phoenix': '🦅', 'skull': '💀', 'none': '' }
    return logoMap[profile.legendaryLogo] || ''
  }

  const getNameAnimation = () => {
    const animations = {
      none: {},
      pulse: { animation: 'profilePulse 1s ease-in-out infinite' },
      glow: { animation: 'profileGlow 1.5s ease-in-out infinite' },
      fire: { animation: 'profileFire 1.5s ease-in-out infinite' },
      lightning: { animation: 'profileLightning 1s ease-in-out infinite' }
    }
    return animations[profile.animation] || {}
  }

  return (
    <>
      <style jsx>{`
        @keyframes profilePulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
        @keyframes profileGlow { 0%, 100% { text-shadow: 0 0 10px currentColor; } 50% { text-shadow: 0 0 30px currentColor, 0 0 60px currentColor; } }
        @keyframes profileFire { 0%, 100% { text-shadow: 0 0 10px #FF4500, 0 0 20px #FF4500; } 50% { text-shadow: 0 0 30px #FF6347, 0 0 60px #FF4500; } }
        @keyframes profileLightning { 0%, 100% { text-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF; } 50% { text-shadow: 0 0 30px #00FFFF, 0 0 60px #FFFFFF; } }
      `}</style>

      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'linear-gradient(145deg, var(--dark-grey), #1a1f2e)',
            border: '2px solid #9B59B6',
            borderRadius: '50px',
            padding: isMobile ? '4px 8px' : '8px 12px',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(155, 89, 182, 0.5)',
            whiteSpace: 'nowrap'
          }}
        >
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" style={{ width: isMobile ? '18px' : '25px', height: isMobile ? '18px' : '25px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #9B59B6' }} />
          ) : (
            <div style={{ width: isMobile ? '18px' : '25px', height: isMobile ? '18px' : '25px', borderRadius: '50%', background: 'linear-gradient(135deg, #9B59B6, #8E44AD)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '9px' : '12px' }}>👤</div>
          )}
          <span style={{ color: profile.nameColor || '#FFFFFF', fontWeight: 'bold', fontSize: isMobile ? '9px' : '11px', ...getNameAnimation() }}>
            {getLogoEmoji()} {profile.interactionName || 'Player'}
          </span>
        </button>

        {showDropdown && (
          <div style={{
            position: 'fixed',
            top: '55px',
            right: '10px',
            left: '10px',
            background: 'linear-gradient(145deg, #1a0a2e, #2d1a4a)',
            border: '2px solid #9B59B6',
            borderRadius: '12px',
            padding: '15px',
            minWidth: isMobile ? 'auto' : '220px',
            maxWidth: isMobile ? '100%' : '220px',
            boxShadow: '0 0 30px rgba(155, 89, 182, 0.4)',
            zIndex: '999'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <p style={{ color: '#FFD700', fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>💰 {profile.points} Points</p>
            </div>
            
            <button onClick={() => fileInputRef.current.click()} style={{ width: '100%', padding: '8px', background: 'linear-gradient(135deg, #9B59B6, #8E44AD)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px', fontSize: isMobile ? '12px' : '13px' }}>
              📸 Change Profile Picture
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePictureUpload} style={{ display: 'none' }} />
            
            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <p style={{ color: '#D4A5E8', fontSize: isMobile ? '10px' : '11px', marginBottom: '4px' }}>Owned Items:</p>
              {profile.purchasedItems && profile.purchasedItems.length > 0 ? (
                profile.purchasedItems.map((item, index) => (
                  <span key={index} style={{ display: 'inline-block', background: 'rgba(155, 89, 182, 0.3)', border: '1px solid #9B59B6', borderRadius: '5px', padding: '2px 6px', margin: '2px', fontSize: isMobile ? '8px' : '9px', color: '#D4A5E8' }}>{item.replace(/_/g, ' ')}</span>
                ))
              ) : (
                <p style={{ color: '#94a3b8', fontSize: isMobile ? '9px' : '11px' }}>No items purchased yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}