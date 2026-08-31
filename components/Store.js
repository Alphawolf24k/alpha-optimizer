'use client'
import { useState, useEffect } from 'react'
import { getOrCreateDeviceId } from '../utils/deviceId'
import { getUserProfile, saveUserProfile, purchaseItem } from '../utils/userProfile'

const storeItems = [
  {
    id: 'name_change',
    name: 'Change Interaction Name',
    description: 'Set a custom name that appears with your answers',
    points: 20,
    icon: '✏️',
    category: 'Basic'
  },
  {
    id: 'color_red',
    name: 'Red Name Color',
    description: 'Make your name glow in cyber red',
    points: 30,
    icon: '🔴',
    category: 'Color'
  },
  {
    id: 'color_blue',
    name: 'Blue Name Color',
    description: 'Make your name glow in cyber blue',
    points: 30,
    icon: '🔵',
    category: 'Color'
  },
  {
    id: 'color_green',
    name: 'Green Name Color',
    description: 'Make your name glow in cyber green',
    points: 30,
    icon: '🟢',
    category: 'Color'
  },
  {
    id: 'color_gold',
    name: 'Gold Name Color',
    description: 'Make your name shine in legendary gold',
    points: 50,
    icon: '⭐',
    category: 'Color'
  },
  {
    id: 'animation_pulse',
    name: 'Pulse Animation',
    description: 'Your name pulses with energy',
    points: 35,
    icon: '💫',
    category: 'Animation'
  },
  {
    id: 'animation_glow',
    name: 'Glow Animation',
    description: 'Your name glows with neon light',
    points: 35,
    icon: '✨',
    category: 'Animation'
  },
  {
    id: 'animation_fire',
    name: 'Fire Animation',
    description: 'Your name burns with legendary fire',
    points: 100,
    icon: '🔥',
    category: 'Legendary'
  },
  {
    id: 'animation_lightning',
    name: 'Lightning Animation',
    description: 'Your name crackles with electric power',
    points: 100,
    icon: '⚡',
    category: 'Legendary'
  },
  {
    id: 'logo_dragon',
    name: 'Dragon Logo',
    description: 'Legendary dragon flies beside your name',
    points: 100,
    icon: '🐉',
    category: 'Legendary Logo'
  },
  {
    id: 'logo_phoenix',
    name: 'Phoenix Logo',
    description: 'Mythical phoenix flies beside your name',
    points: 100,
    icon: '🦅',
    category: 'Legendary Logo'
  },
  {
    id: 'logo_skull',
    name: 'Skull Logo',
    description: 'Laughing skull appears beside your name',
    points: 100,
    icon: '💀',
    category: 'Legendary Logo'
  },
  {
    id: 'answerbox_fire',
    name: 'Fire Answer Box',
    description: 'Your answers appear in a burning fire box',
    points: 150,
    icon: '🔥',
    category: 'Answer Box'
  },
  {
    id: 'answerbox_ice',
    name: 'Ice Answer Box',
    description: 'Your answers appear in a frozen ice box',
    points: 150,
    icon: '❄️',
    category: 'Answer Box'
  },
  {
    id: 'answerbox_lightning',
    name: 'Lightning Answer Box',
    description: 'Your answers appear in an electric box',
    points: 150,
    icon: '⚡',
    category: 'Answer Box'
  },
  {
    id: 'answerbox_rainbow',
    name: 'Rainbow Answer Box',
    description: 'Your answers appear in a rainbow box',
    points: 200,
    icon: '🌈',
    category: 'Answer Box'
  },
  {
    id: 'answerbox_neon',
    name: 'Neon Answer Box',
    description: 'Your answers appear in a neon glow box',
    points: 200,
    icon: '💜',
    category: 'Answer Box'
  }
]

export default function Store() {
  const [profile, setProfile] = useState(null)
  const [deviceId, setDeviceId] = useState('')
  const [message, setMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      const id = getOrCreateDeviceId()
      setDeviceId(id)
      const userProfile = await getUserProfile(id)
      setProfile(userProfile)
    }
    init()
  }, [])

  if (!profile) return null

  const handlePurchase = async (item) => {
    const result = await purchaseItem(deviceId, item.id, item.points)
    if (result.success) {
      setProfile(result.profile)
      setMessage(`✅ Successfully purchased ${item.name}!`)
      
      if (item.id === 'name_change') {
        const newName = prompt('Enter your new interaction name:')
        if (newName && newName.trim()) {
          result.profile.interactionName = newName.trim()
          await saveUserProfile(result.profile)
          setProfile({...result.profile})
        }
      } else if (item.id.startsWith('color_')) {
        const colorMap = {
          'color_red': '#FF3366',
          'color_blue': '#6EA8FF',
          'color_green': '#34F5B0',
          'color_gold': '#FFD700'
        }
        result.profile.nameColor = colorMap[item.id]
        await saveUserProfile(result.profile)
        setProfile({...result.profile})
      } else if (item.id.startsWith('animation_')) {
        result.profile.animation = item.id.replace('animation_', '')
        await saveUserProfile(result.profile)
        setProfile({...result.profile})
      } else if (item.id.startsWith('logo_')) {
        result.profile.legendaryLogo = item.id.replace('logo_', '')
        await saveUserProfile(result.profile)
        setProfile({...result.profile})
      } else if (item.id.startsWith('answerbox_')) {
        result.profile.answerBox = item.id.replace('answerbox_', '')
        await saveUserProfile(result.profile)
        setProfile({...result.profile})
      }
    } else {
      setMessage('❌ Not enough points!')
    }
    
    setTimeout(() => setMessage(''), 3000)
  }

  const handlePreview = (item) => {
    setPreviewItem(item)
    setShowPreview(true)
  }

  const getPreviewContent = (item) => {
    const previewStyle = {
      padding: '20px',
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '10px',
      fontSize: '24px',
      fontWeight: 'bold'
    }

    if (item.id.startsWith('color_')) {
      const colorMap = {
        'color_red': '#FF3366',
        'color_blue': '#6EA8FF',
        'color_green': '#34F5B0',
        'color_gold': '#FFD700'
      }
      return (
        <div style={previewStyle}>
          <p style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: colorMap[item.id],
            textShadow: `0 0 10px ${colorMap[item.id]}, 0 0 20px ${colorMap[item.id]}, 0 0 30px ${colorMap[item.id]}`,
            animation: 'previewGlow 1.5s ease-in-out infinite'
          }}>
            {profile.interactionName || 'Player'}
          </p>
          <style>{`
            @keyframes previewGlow {
              0%, 100% { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
              50% { text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor; }
            }
          `}</style>
        </div>
      )
    }
    
    if (item.id === 'animation_pulse') {
      return (
        <div style={previewStyle}>
          <p style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: profile.nameColor || '#FFFFFF',
            animation: 'previewPulse 1s ease-in-out infinite'
          }}>
            {profile.interactionName || 'Player'}
          </p>
          <style>{`
            @keyframes previewPulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.6; }
            }
          `}</style>
        </div>
      )
    }
    
    if (item.id === 'animation_glow') {
      return (
        <div style={previewStyle}>
          <p style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: profile.nameColor || '#FFFFFF',
            animation: 'previewGlowAnim 1.5s ease-in-out infinite'
          }}>
            {profile.interactionName || 'Player'}
          </p>
          <style>{`
            @keyframes previewGlowAnim {
              0%, 100% { text-shadow: 0 0 5px ${profile.nameColor || '#FFFFFF'}, 0 0 10px ${profile.nameColor || '#FFFFFF'}; }
              50% { text-shadow: 0 0 20px ${profile.nameColor || '#FFFFFF'}, 0 0 40px ${profile.nameColor || '#FFFFFF'}; }
            }
          `}</style>
        </div>
      )
    }
    
    if (item.id === 'animation_fire') {
      return (
        <div style={previewStyle}>
          <p style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FF4500',
            animation: 'previewFireAnim 1.5s ease-in-out infinite'
          }}>
            {profile.interactionName || 'Player'}
          </p>
          <style>{`
            @keyframes previewFireAnim {
              0%, 100% { text-shadow: 0 0 10px #FF4500, 0 0 20px #FF4500; }
              50% { text-shadow: 0 0 30px #FF6347, 0 0 60px #FF4500; }
            }
          `}</style>
        </div>
      )
    }
    
    if (item.id === 'animation_lightning') {
      return (
        <div style={previewStyle}>
          <p style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#00FFFF',
            animation: 'previewLightningAnim 1.5s ease-in-out infinite'
          }}>
            {profile.interactionName || 'Player'}
          </p>
          <style>{`
            @keyframes previewLightningAnim {
              0%, 100% { text-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF; }
              50% { text-shadow: 0 0 30px #00FFFF, 0 0 60px #FFFFFF; }
            }
          `}</style>
        </div>
      )
    }
    
    if (item.id === 'logo_dragon') {
      return (
        <div style={{...previewStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px'}}>
          <span style={{ fontSize: '40px', animation: 'dragonFlyAnim 2s ease-in-out infinite', display: 'inline-block' }}>🐉</span>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: profile.nameColor || '#FFFFFF' }}>{profile.interactionName || 'Player'}</p>
          <style>{`
            @keyframes dragonFlyAnim {
              0%, 100% { transform: translateY(0) rotate(-5deg) scale(1); }
              50% { transform: translateY(-20px) rotate(5deg) scale(1.2); }
            }
          `}</style>
        </div>
      )
    }
    
    if (item.id === 'logo_phoenix') {
      return (
        <div style={{...previewStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px'}}>
          <span style={{ fontSize: '40px', animation: 'phoenixFlyAnim 2s ease-in-out infinite', display: 'inline-block' }}>🦅</span>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: profile.nameColor || '#FFFFFF' }}>{profile.interactionName || 'Player'}</p>
          <style>{`
            @keyframes phoenixFlyAnim {
              0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
              50% { transform: translateY(-25px) rotate(10deg) scale(1.25); }
            }
          `}</style>
        </div>
      )
    }
    
    if (item.id === 'logo_skull') {
      return (
        <div style={{...previewStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px'}}>
          <span style={{ fontSize: '40px', animation: 'skullLaughAnim 1.5s ease-in-out infinite', display: 'inline-block' }}>💀</span>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: profile.nameColor || '#FFFFFF' }}>{profile.interactionName || 'Player'}</p>
          <style>{`
            @keyframes skullLaughAnim {
              0%, 100% { transform: scale(1) rotate(-5deg); }
              50% { transform: scale(1.15) rotate(5deg); }
            }
          `}</style>
        </div>
      )
    }
    
    if (item.id.startsWith('answerbox_')) {
      return (
        <div style={{
          padding: '20px',
          borderRadius: '10px',
          ...getAnswerBoxStyle(item.id)
        }}>
          <p style={{ color: 'white', fontSize: '16px' }}>
            Your answer will appear in this {item.name.toLowerCase()}!
          </p>
        </div>
      )
    }
    
    return (
      <div style={previewStyle}>
        <p style={{ color: 'white', fontSize: '18px' }}>{item.description}</p>
      </div>
    )
  }

  const getAnswerBoxStyle = (itemId) => {
    const styles = {
      'answerbox_fire': {
        background: 'linear-gradient(135deg, #1a0000, #2d0000)',
        border: '2px solid #FF4500',
        boxShadow: '0 0 30px rgba(255, 69, 0, 0.5)'
      },
      'answerbox_ice': {
        background: 'linear-gradient(135deg, #001a1a, #002d2d)',
        border: '2px solid #00FFFF',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)'
      },
      'answerbox_lightning': {
        background: 'linear-gradient(135deg, #1a1a00, #2d2d00)',
        border: '2px solid #FFFF00',
        boxShadow: '0 0 30px rgba(255, 255, 0, 0.5)'
      },
      'answerbox_rainbow': {
        background: 'linear-gradient(135deg, #1a001a, #2d002d)',
        border: '2px solid #FF00FF',
        boxShadow: '0 0 30px rgba(255, 0, 255, 0.5)'
      },
      'answerbox_neon': {
        background: 'linear-gradient(135deg, #0a0a1a, #1a1a2d)',
        border: '2px solid #9B59B6',
        boxShadow: '0 0 30px rgba(155, 89, 182, 0.5)'
      }
    }
    return styles[itemId] || {}
  }

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '60px auto',
      padding: '0 20px'
    }}>
      <style jsx>{`
        @keyframes storePulse {
          0%, 100% { box-shadow: 0 0 40px rgba(155, 89, 182, 0.4); }
          50% { box-shadow: 0 0 60px rgba(155, 89, 182, 0.6); }
        }
        .store-box {
          background: linear-gradient(135deg, #1a0a2e 0%, #2d1a4a 50%, #1a0a2e 100%);
          border: 3px solid #9B59B6;
          border-radius: 25px;
          padding: 40px;
          animation: storePulse 3s ease-in-out infinite;
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '15px 40px',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            border: 'none',
            borderRadius: '50px',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
            transition: 'all 0.3s ease'
          }}
        >
          🏪 {isOpen ? 'Close Store' : 'Open Store'} 💰
        </button>
      </div>

      {isOpen && (
        <div className="store-box">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>
              🏪 <span style={{ color: '#FFD700' }}>Alpha Store</span>
            </h2>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              padding: '10px 30px',
              borderRadius: '25px',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
            }}>
              <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                💰 Your Points: {profile.points}
              </span>
            </div>
          </div>

          {message && (
            <div style={{
              padding: '15px',
              background: message.includes('✅') ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
              border: `2px solid ${message.includes('✅') ? '#2ECC71' : '#E74C3C'}`,
              borderRadius: '10px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <p style={{ color: message.includes('✅') ? '#2ECC71' : '#E74C3C', fontWeight: 'bold' }}>{message}</p>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {storeItems.map((item, index) => (
              <div key={index} style={{
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid #9B59B6',
                borderRadius: '15px',
                padding: '20px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)'
                e.target.style.boxShadow = '0 0 30px rgba(155, 89, 182, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px', textAlign: 'center' }}>{item.icon}</div>
                <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '10px', textAlign: 'center' }}>{item.name}</h3>
                <p style={{ color: '#D4A5E8', fontSize: '14px', marginBottom: '15px', textAlign: 'center' }}>{item.description}</p>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <span style={{ color: '#FFD700', fontSize: '16px', fontWeight: 'bold' }}>💰 {item.points} Points</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handlePreview(item)}
                    style={{
                      padding: '8px 15px',
                      background: 'rgba(155, 89, 182, 0.2)',
                      border: '1px solid #9B59B6',
                      borderRadius: '10px',
                      color: '#D4A5E8',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={profile.points < item.points || profile.purchasedItems.includes(item.id)}
                    style={{
                      padding: '8px 15px',
                      background: profile.points >= item.points && !profile.purchasedItems.includes(item.id)
                        ? 'linear-gradient(135deg, #9B59B6, #8E44AD)'
                        : 'rgba(155, 89, 182, 0.1)',
                      border: '1px solid #9B59B6',
                      borderRadius: '10px',
                      color: 'white',
                      cursor: profile.points >= item.points && !profile.purchasedItems.includes(item.id) ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {profile.purchasedItems.includes(item.id) ? 'Owned' : 'Buy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPreview && previewItem && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '9999'
        }}
        onClick={() => setShowPreview(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a0a2e, #2d1a4a)',
            border: '3px solid #9B59B6',
            borderRadius: '25px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%'
          }}
          onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '24px' }}>{previewItem.name}</h3>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>{previewItem.icon}</div>
            <div style={{ marginBottom: '30px' }}>{getPreviewContent(previewItem)}</div>
            <button
              onClick={() => setShowPreview(false)}
              style={{
                padding: '10px 30px',
                background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
                border: 'none',
                borderRadius: '15px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}