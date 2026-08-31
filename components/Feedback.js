'use client'
import { useState, useEffect } from 'react'
import { getOrCreateDeviceId } from '../utils/deviceId'
import { getUserProfile, saveFeedback, getFeedbacks } from '../utils/userProfile'

export default function Feedback() {
  const [deviceId, setDeviceId] = useState('')
  const [profile, setProfile] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState('feature')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [userReplies, setUserReplies] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
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
      const allFeedback = await getFeedbacks()
      const userFeedbacks = allFeedback.filter(f => f.user_id === id && f.reply)
      setUserReplies(userFeedbacks)
    }
    init()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!profile) return null

  const checkExplicitContent = (text) => {
    const explicitWords = ['fuck', 'shit', 'ass', 'bitch', 'dick', 'pussy', 'cock', 'cunt', 'bastard', 'whore', 'slut', 'nigger', 'faggot', 'retard', 'motherfucker', 'asshole', 'douchebag', 'dumbass', 'jackass', 'sex', 'porn', 'nude', 'naked', 'xxx', 'nsfw', 'hentai']
    const lowerText = text.toLowerCase()
    return explicitWords.some(word => lowerText.includes(word))
  }

  const handleSubmitFeedback = async () => {
    setError('')
    setMessage('')
    if (!feedback.trim()) { setError('❌ Please write your feedback first'); return }
    if (feedback.trim().length < 10) { setError('❌ Feedback must be at least 10 characters'); return }
    if (checkExplicitContent(feedback)) { setError('⚠️ Your feedback contains inappropriate content. Please keep it clean!'); return }
    const feedbackData = {
      userId: deviceId,
      userName: profile.interactionName || 'Player',
      nameColor: profile.nameColor || '#FFFFFF',
      animation: profile.animation || 'none',
      legendaryLogo: profile.legendaryLogo || 'none',
      profilePicture: profile.profilePicture || null,
      type: feedbackType,
      text: feedback.trim()
    }
    await saveFeedback(feedbackData)
    setFeedback('')
    setMessage('✅ Feedback submitted successfully! Alpha will review it soon.')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <>
      {/* Feedback button - In NAVBAR, not fixed */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          style={{
            padding: isMobile ? '4px 8px' : '8px 12px',
            background: showFeedback ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'linear-gradient(145deg, #1a0a2e, #2d1a4a)',
            border: '2px solid #FFD700',
            borderRadius: '50px',
            color: 'white',
            fontSize: isMobile ? '9px' : '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          📝 Feedback
        </button>
      </div>

      {showFeedback && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '1000', width: '95%', maxWidth: isMobile ? '380px' : '480px', maxHeight: '80vh', overflowY: 'auto', background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1a4a 50%, #1a0a2e 100%)', border: '3px solid #FFD700', borderRadius: '15px', padding: isMobile ? '15px' : '20px', boxShadow: '0 0 60px rgba(255, 215, 0, 0.5)' }}>
          <h3 style={{ color: '#FFD700', textAlign: 'center', marginBottom: '12px', fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold' }}>📝 Feedback</h3>
          <p style={{ color: '#D4A5E8', textAlign: 'center', marginBottom: '12px', fontSize: isMobile ? '11px' : '13px' }}>Tell us what features you want in future updates!</p>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ color: '#FFD700', marginBottom: '5px', display: 'block', fontSize: isMobile ? '11px' : '13px' }}>Feedback Type:</label>
            <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.3)', border: '2px solid #FFD700', borderRadius: '8px', color: 'white', fontSize: isMobile ? '11px' : '13px', outline: 'none' }}>
              <option value="feature">✨ New Feature Request</option>
              <option value="app">📱 App Improvement</option>
              <option value="website">🌐 Website Improvement</option>
              <option value="bug">🐛 Bug Report</option>
              <option value="other">💡 Other</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write your feedback here..." rows="3" maxLength="500" style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '2px solid #FFD700', borderRadius: '8px', color: 'white', fontSize: isMobile ? '11px' : '13px', resize: 'vertical', outline: 'none' }} />
            <p style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'right', marginTop: '4px' }}>{feedback.length}/500</p>
          </div>
          {error && <div style={{ padding: '8px', background: 'rgba(231, 76, 60, 0.1)', border: '2px solid #E74C3C', borderRadius: '8px', marginBottom: '10px' }}><p style={{ color: '#E74C3C', fontSize: '11px', fontWeight: 'bold' }}>{error}</p></div>}
          {message && <div style={{ padding: '8px', background: 'rgba(46, 204, 113, 0.1)', border: '2px solid #2ECC71', borderRadius: '8px', marginBottom: '10px' }}><p style={{ color: '#2ECC71', fontSize: '11px', fontWeight: 'bold' }}>{message}</p></div>}
          <button onClick={handleSubmitFeedback} style={{ width: '100%', padding: '8px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', border: 'none', borderRadius: '8px', color: '#1a0a2e', fontSize: isMobile ? '13px' : '15px', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Submit Feedback</button>
          {userReplies.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <h4 style={{ color: '#FFD700', marginBottom: '6px', fontSize: isMobile ? '11px' : '13px' }}>💬 Alpha's Replies to You:</h4>
              {userReplies.map((fb, index) => (
                <div key={index} style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1px solid #FFD700', borderRadius: '8px', padding: '6px', marginBottom: '6px' }}>
                  <p style={{ color: '#D4A5E8', fontSize: '10px', marginBottom: '3px' }}><strong>Your feedback:</strong> {fb.text}</p>
                  <p style={{ color: '#FFD700', fontSize: '10px' }}><strong>Alpha's reply:</strong> {fb.reply}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setShowFeedback(false)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'transparent', border: 'none', color: '#FFD700', fontSize: '16px', cursor: 'pointer' }}>✕</button>
        </div>
      )}
      {showFeedback && <div onClick={() => setShowFeedback(false)} style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: '999' }} />}
    </>
  )
}