'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import { supabase } from '../../../utils/supabaseClient'
import { 
  getReports, 
  getBannedUsers, 
  banUser, 
  unbanUser 
} from '../../../utils/chatSystem'
import { 
  getDailyQuiz, 
  saveDailyQuiz, 
  getQuizAnswers, 
  updateQuizAnswerReply, 
  deleteQuizAnswer,
  getFeedbacks,
  updateFeedbackReply,
  deleteFeedback
} from '../../../utils/userProfile'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('quiz')
  const [quizType, setQuizType] = useState('mcq')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [answerLimit, setAnswerLimit] = useState(200)
  const [pointsAward, setPointsAward] = useState(10)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [userAnswers, setUserAnswers] = useState([])
  const [replyText, setReplyText] = useState('')
  const [bannedUsers, setBannedUsers] = useState([])
  const [banUserInput, setBanUserInput] = useState('')
  const [reports, setReports] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [feedbackReply, setFeedbackReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [alphaChatInput, setAlphaChatInput] = useState('')
  const [alphaRoom, setAlphaRoom] = useState('general')
  const [uploadingApk, setUploadingApk] = useState(false)
  const [uploadingManual, setUploadingManual] = useState(false)
  const [deletingApk, setDeletingApk] = useState(false)
  const [deletingManual, setDeletingManual] = useState(false)
  const [apkInfo, setApkInfo] = useState(null)
  const [manualInfo, setManualInfo] = useState(null)
  const apkFileInputRef = useRef(null)
  const manualFileInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/admin')
      return
    }
    
    loadAllData()
    loadFileInfo()
    
    const interval = setInterval(() => {
      loadAllData()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const loadAllData = async () => {
    const answers = await getQuizAnswers()
    const pendingAnswers = answers.filter(a => !a.reply)
    setUserAnswers(pendingAnswers)

    const bans = await getBannedUsers()
    setBannedUsers(bans.map(b => b.device_id))

    const reps = await getReports()
    setReports(reps)

    const fbs = await getFeedbacks()
    const pendingFeedback = fbs.filter(f => !f.reply)
    setFeedbacks(pendingFeedback)

    const { data: chatData } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)
    setChatMessages(chatData || [])

    setLoading(false)
  }

  const loadFileInfo = async () => {
    try {
      const apkResponse = await fetch('/downloads/alpha-optimizer.apk', { method: 'HEAD' })
      if (apkResponse.ok) {
        const size = apkResponse.headers.get('content-length')
        setApkInfo({
          size: size ? (parseInt(size) / (1024 * 1024)).toFixed(1) + ' MB' : 'Unknown',
          updated: new Date().toLocaleDateString()
        })
      } else {
        setApkInfo(null)
      }
      
      const manualResponse = await fetch('/downloads/manual/user-manual.pdf', { method: 'HEAD' })
      if (manualResponse.ok) {
        const size = manualResponse.headers.get('content-length')
        setManualInfo({
          size: size ? (parseInt(size) / (1024 * 1024)).toFixed(1) + ' MB' : 'Unknown',
          updated: new Date().toLocaleDateString()
        })
      } else {
        setManualInfo(null)
      }
    } catch (error) {
      console.log('Load file info error:', error)
    }
  }

  const handleApkUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploadingApk(true)
    setError('')
    setMessage('')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'apk')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage('✅ APK uploaded successfully! New version is now live!')
        loadFileInfo()
      } else {
        setError('❌ Upload failed: ' + result.error)
      }
    } catch (error) {
      setError('❌ Upload error: ' + error.message)
    }
    setUploadingApk(false)
  }

  const handleManualUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploadingManual(true)
    setError('')
    setMessage('')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'manual')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage('✅ User Manual uploaded successfully! New manual is now live!')
        loadFileInfo()
      } else {
        setError('❌ Upload failed: ' + result.error)
      }
    } catch (error) {
      setError('❌ Upload error: ' + error.message)
    }
    setUploadingManual(false)
  }

  const handleDeleteApk = async () => {
    if (!confirm('Are you sure you want to delete the APK? This will remove the download from your website.')) return
    
    setDeletingApk(true)
    setError('')
    setMessage('')
    
    try {
      const formData = new FormData()
      formData.append('type', 'delete-apk')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage('✅ APK deleted successfully!')
        loadFileInfo()
      } else {
        setError('❌ Delete failed: ' + result.error)
      }
    } catch (error) {
      setError('❌ Delete error: ' + error.message)
    }
    setDeletingApk(false)
  }

  const handleDeleteManual = async () => {
    if (!confirm('Are you sure you want to delete the User Manual? This will remove the download from your website.')) return
    
    setDeletingManual(true)
    setError('')
    setMessage('')
    
    try {
      const formData = new FormData()
      formData.append('type', 'delete-manual')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage('✅ User Manual deleted successfully!')
        loadFileInfo()
      } else {
        setError('❌ Delete failed: ' + result.error)
      }
    } catch (error) {
      setError('❌ Delete error: ' + error.message)
    }
    setDeletingManual(false)
  }

  const handleSaveQuiz = async () => {
    setError('')
    setMessage('')

    if (!question.trim()) {
      setError('❌ Please enter a question')
      return
    }

    if (pointsAward < 1) {
      setError('❌ Points must be at least 1')
      return
    }

    const quizData = {
      type: quizType,
      question: question.trim(),
      options: quizType === 'mcq' ? options.filter(opt => opt.trim()).map(opt => opt.trim()) : [],
      correctAnswer: quizType === 'mcq' ? correctAnswer : 0,
      answerLimit: quizType === 'written' ? answerLimit : 200,
      pointsAward: pointsAward,
      date: new Date().toISOString().split('T')[0]
    }

    await saveDailyQuiz(quizData)
    
    setMessage(`✅ Quiz published successfully! Users will earn ${pointsAward} points!`)
    
    setQuestion('')
    setOptions(['', ''])
    setCorrectAnswer(0)
    setPointsAward(10)
  }

  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      if (correctAnswer >= index) {
        setCorrectAnswer(Math.max(0, correctAnswer - 1))
      }
    }
  }

  const handleReply = async (answerId) => {
    if (!replyText.trim()) {
      setError('❌ Please enter a reply')
      return
    }
    await updateQuizAnswerReply(answerId, replyText.trim())
    setReplyText('')
    setMessage('✅ Reply sent!')
    loadAllData()
  }

  const handleRemoveAnswer = async (answerId) => {
    await deleteQuizAnswer(answerId)
    setMessage('✅ Answer removed successfully!')
    loadAllData()
  }

  const handleFeedbackReply = async (feedbackId) => {
    if (!feedbackReply.trim()) {
      setError('❌ Please enter a reply')
      return
    }
    await updateFeedbackReply(feedbackId, feedbackReply.trim())
    setFeedbackReply('')
    setMessage('✅ Feedback reply sent!')
    loadAllData()
  }

  const handleDismissFeedback = async (feedbackId) => {
    await deleteFeedback(feedbackId)
    setMessage('✅ Feedback dismissed!')
    loadAllData()
  }

  const handleBanUser = async (userId) => {
    if (userId && userId.trim()) {
      await banUser(userId.trim())
      setBanUserInput('')
      setMessage('✅ Device banned successfully!')
      loadAllData()
    }
  }

  const handleUnbanUser = async (user) => {
    await unbanUser(user)
    setMessage('✅ Device unbanned successfully!')
    loadAllData()
  }

  const handleDismissReport = async (reportId) => {
    await supabase.from('reports').delete().eq('id', reportId)
    setMessage('✅ Report dismissed successfully!')
    loadAllData()
  }

  const handleAlphaChatSend = async () => {
    if (!alphaChatInput.trim()) return

    await supabase.rpc('save_chat_message_secure', {
      p_user_id: 'ALPHA_ADMIN',
      p_user_name: 'Alpha',
      p_name_color: '#FF4500',
      p_animation: 'fire',
      p_legendary_logo: 'dragon',
      p_profile_picture: null,
      p_room: alphaRoom,
      p_text: alphaChatInput.trim()
    })
    
    setAlphaChatInput('')
    setMessage('✅ Alpha message sent!')
    loadAllData()
  }

  const handleDeleteChatMessage = async (messageId) => {
    await supabase.from('chat_messages').delete().eq('id', messageId)
    setMessage('✅ Message deleted!')
    loadAllData()
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    router.push('/admin')
  }

  const renderUserName = (item) => {
    const name = item.interaction_name || item.user_name || 'Player'
    const color = item.name_color || '#FFFFFF'
    const animation = item.animation || 'none'
    const legendaryLogo = item.legendary_logo || 'none'
    
    const logoMap = { 'dragon': '🐉', 'phoenix': '🦅', 'skull': '💀', 'none': '' }
    
    const animationStyle = {
      none: {},
      pulse: { animation: 'pulseAnim 1s ease-in-out infinite' },
      glow: { animation: 'glowAnim 1.5s ease-in-out infinite' },
      fire: { animation: 'fireAnim 1.5s ease-in-out infinite' },
      lightning: { animation: 'lightningAnim 1s ease-in-out infinite' }
    }
    
    return (
      <span style={{ color: color, fontWeight: 'bold', ...animationStyle[animation] }}>
        {logoMap[legendaryLogo] && <span style={{ marginRight: '5px' }}>{logoMap[legendaryLogo]}</span>}
        {name}
      </span>
    )
  }

  const getFeedbackTypeIcon = (type) => {
    const icons = { 'feature': '✨', 'app': '📱', 'website': '🌐', 'bug': '🐛', 'other': '💡' }
    return icons[type] || '💡'
  }

  const filteredChatMessages = chatMessages.filter(msg => msg.room === alphaRoom)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', color: 'white', fontSize: '24px' }}>
        <p>Loading admin panel...</p>
      </div>
    )
  }

  return (
    <>
      <div className="animated-grid"></div>
      <Navbar />
      <main className="container">
        <style jsx>{`
          @keyframes pulseAnim { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
          @keyframes glowAnim { 0%, 100% { text-shadow: 0 0 10px currentColor; } 50% { text-shadow: 0 0 30px currentColor, 0 0 60px currentColor; } }
          @keyframes fireAnim { 0%, 100% { text-shadow: 0 0 10px #FF4500, 0 0 20px #FF4500; } 50% { text-shadow: 0 0 30px #FF6347, 0 0 60px #FF4500; } }
          @keyframes lightningAnim { 0%, 100% { text-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF; } 50% { text-shadow: 0 0 30px #00FFFF, 0 0 60px #FFFFFF; } }
          @keyframes yinYangSpin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.3); } 100% { transform: rotate(360deg) scale(1); } }
          @keyframes fireBorder { 0%, 100% { border-color: #FF4500; box-shadow: 0 0 30px #FF4500; } 50% { border-color: #FF6347; box-shadow: 0 0 50px #FF4500; } }
        `}</style>

        <div style={{ maxWidth: '900px', margin: '60px auto', padding: '40px', background: 'linear-gradient(145deg, #1a0a2e, #2d1a4a)', border: '2px solid #9B59B6', borderRadius: '25px', boxShadow: '0 0 40px rgba(155, 89, 182, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px', color: 'white' }}>⚡ Alpha <span style={{ color: '#9B59B6' }}>Control Panel</span></h1>
            <button onClick={handleLogout} style={{ background: 'rgba(155, 89, 182, 0.2)', border: '2px solid #9B59B6', color: '#9B59B6', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('quiz')} style={{ flex: '1', minWidth: '100px', padding: '12px', background: activeTab === 'quiz' ? 'linear-gradient(135deg, #9B59B6, #8E44AD)' : 'transparent', border: '2px solid #9B59B6', borderRadius: '15px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>📝 Quiz</button>
            <button onClick={() => setActiveTab('chat')} style={{ flex: '1', minWidth: '100px', padding: '12px', background: activeTab === 'chat' ? 'linear-gradient(135deg, #FF4500, #FF6347)' : 'transparent', border: '2px solid #FF4500', borderRadius: '15px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>💬 Alpha Chat</button>
            <button onClick={() => setActiveTab('downloads')} style={{ flex: '1', minWidth: '100px', padding: '12px', background: activeTab === 'downloads' ? 'linear-gradient(135deg, #00BFFF, #1E90FF)' : 'transparent', border: '2px solid #00BFFF', borderRadius: '15px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>📥 Downloads</button>
            <button onClick={() => setActiveTab('answers')} style={{ flex: '1', minWidth: '100px', padding: '12px', background: activeTab === 'answers' ? 'linear-gradient(135deg, #9B59B6, #8E44AD)' : 'transparent', border: '2px solid #9B59B6', borderRadius: '15px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>💬 Answers ({userAnswers.length})</button>
            <button onClick={() => setActiveTab('feedbacks')} style={{ flex: '1', minWidth: '100px', padding: '12px', background: activeTab === 'feedbacks' ? 'linear-gradient(135deg, #9B59B6, #8E44AD)' : 'transparent', border: '2px solid #9B59B6', borderRadius: '15px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>📝 Feedback ({feedbacks.length})</button>
            <button onClick={() => setActiveTab('bans')} style={{ flex: '1', minWidth: '100px', padding: '12px', background: activeTab === 'bans' ? 'linear-gradient(135deg, #9B59B6, #8E44AD)' : 'transparent', border: '2px solid #9B59B6', borderRadius: '15px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🚫 Bans ({bannedUsers.length})</button>
            <button onClick={() => setActiveTab('reports')} style={{ flex: '1', minWidth: '100px', padding: '12px', background: activeTab === 'reports' ? 'linear-gradient(135deg, #9B59B6, #8E44AD)' : 'transparent', border: '2px solid #9B59B6', borderRadius: '15px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>⚠️ Reports ({reports.length})</button>
          </div>

          {/* Downloads Tab */}
          {activeTab === 'downloads' && (
            <div>
              <h2 style={{ color: '#00BFFF', marginBottom: '20px', textAlign: 'center', fontSize: '28px', fontWeight: 'bold' }}>📥 𝕱𝖎𝖑𝖊 𝕸𝖆𝖓𝖆𝖌𝖊𝖗</h2>
              
              {message && <div style={{ padding: '15px', background: 'rgba(46, 204, 113, 0.1)', border: '2px solid #2ECC71', borderRadius: '10px', marginBottom: '15px' }}><p style={{ color: '#2ECC71', fontWeight: 'bold' }}>{message}</p></div>}
              {error && <div style={{ padding: '15px', background: 'rgba(231, 76, 60, 0.1)', border: '2px solid #E74C3C', borderRadius: '10px', marginBottom: '15px' }}><p style={{ color: '#E74C3C', fontWeight: 'bold' }}>{error}</p></div>}

              {/* APK Section */}
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '2px solid #00BFFF', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ color: '#00BFFF', marginBottom: '10px' }}>📱 APK File</h3>
                {apkInfo ? (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ color: '#2ECC71', marginBottom: '5px' }}>✅ Current APK uploaded</p>
                    <p style={{ color: '#D4A5E8', fontSize: '13px' }}>Size: {apkInfo.size}</p>
                    <p style={{ color: '#D4A5E8', fontSize: '13px' }}>Updated: {apkInfo.updated}</p>
                  </div>
                ) : (
                  <p style={{ color: '#FFA500', marginBottom: '15px' }}>⚠️ No APK uploaded yet</p>
                )}
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => apkFileInputRef.current?.click()}
                    disabled={uploadingApk || deletingApk}
                    style={{ padding: '12px 25px', background: 'linear-gradient(135deg, #00BFFF, #1E90FF)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: uploadingApk ? 'not-allowed' : 'pointer', opacity: uploadingApk ? 0.5 : 1 }}
                  >
                    {uploadingApk ? '⏳ Uploading...' : '📤 Upload New APK'}
                  </button>
                  
                  {apkInfo && (
                    <button 
                      onClick={handleDeleteApk}
                      disabled={deletingApk}
                      style={{ padding: '12px 25px', background: '#E74C3C', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: deletingApk ? 0.5 : 1 }}
                    >
                      {deletingApk ? '⏳ Deleting...' : '🗑️ Delete APK'}
                    </button>
                  )}
                </div>
                <input ref={apkFileInputRef} type="file" accept=".apk" onChange={handleApkUpload} style={{ display: 'none' }} />
              </div>

              {/* Manual Section */}
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '2px solid #00BFFF', borderRadius: '15px', padding: '20px' }}>
                <h3 style={{ color: '#00BFFF', marginBottom: '10px' }}>📖 User Manual</h3>
                {manualInfo ? (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ color: '#2ECC71', marginBottom: '5px' }}>✅ Current Manual uploaded</p>
                    <p style={{ color: '#D4A5E8', fontSize: '13px' }}>Size: {manualInfo.size}</p>
                    <p style={{ color: '#D4A5E8', fontSize: '13px' }}>Updated: {manualInfo.updated}</p>
                  </div>
                ) : (
                  <p style={{ color: '#FFA500', marginBottom: '15px' }}>⚠️ No User Manual uploaded yet</p>
                )}
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => manualFileInputRef.current?.click()}
                    disabled={uploadingManual || deletingManual}
                    style={{ padding: '12px 25px', background: 'linear-gradient(135deg, #00BFFF, #1E90FF)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: uploadingManual ? 'not-allowed' : 'pointer', opacity: uploadingManual ? 0.5 : 1 }}
                  >
                    {uploadingManual ? '⏳ Uploading...' : '📤 Upload New Manual'}
                  </button>
                  
                  {manualInfo && (
                    <button 
                      onClick={handleDeleteManual}
                      disabled={deletingManual}
                      style={{ padding: '12px 25px', background: '#E74C3C', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: deletingManual ? 0.5 : 1 }}
                    >
                      {deletingManual ? '⏳ Deleting...' : '🗑️ Delete Manual'}
                    </button>
                  )}
                </div>
                <input ref={manualFileInputRef} type="file" accept=".pdf" onChange={handleManualUpload} style={{ display: 'none' }} />
              </div>
            </div>
          )}

          {/* Quiz Tab */}
          {activeTab === 'quiz' && (
            <div>
              <div style={{ marginBottom: '30px' }}>
                <label style={{ color: '#D4A5E8', marginBottom: '10px', display: 'block' }}>Select Quiz Type:</label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button onClick={() => setQuizType('mcq')} style={{ flex: '1', padding: '15px', background: quizType === 'mcq' ? 'linear-gradient(135deg, #9B59B6, #8E44AD)' : 'transparent', border: '2px solid #9B59B6', borderRadius: '15px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>🎯 MCQ Quiz</button>
                  <button onClick={() => setQuizType('written')} style={{ flex: '1', padding: '15px', background: quizType === 'written' ? 'linear-gradient(135deg, #9B59B6, #8E44AD)' : 'transparent', border: '2px solid #9B59B6', borderRadius: '15px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>✍️ Written Quiz</button>
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ color: '#FFD700', marginBottom: '10px', display: 'block', fontWeight: 'bold' }}>💰 Points to Award:</label>
                <input type="number" value={pointsAward} onChange={(e) => setPointsAward(parseInt(e.target.value) || 0)} min="1" max="1000" style={{ width: '100%', padding: '15px', background: 'rgba(0,0,0,0.3)', border: '2px solid #FFD700', borderRadius: '15px', color: '#FFD700', fontSize: '20px', fontWeight: 'bold', outline: 'none', textAlign: 'center' }} />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ color: '#D4A5E8', marginBottom: '10px', display: 'block' }}>Question:</label>
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter your quiz question here..." style={{ width: '100%', padding: '15px', background: 'rgba(0,0,0,0.3)', border: '2px solid #9B59B6', borderRadius: '15px', color: 'white', fontSize: '16px', minHeight: '100px', resize: 'vertical', outline: 'none' }} />
              </div>

              {quizType === 'mcq' && (
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ color: '#D4A5E8', marginBottom: '10px', display: 'block' }}>Options (click ✓ to mark correct):</label>
                  {options.map((option, index) => (
                    <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                      <input type="text" value={option} onChange={(e) => { const newOptions = [...options]; newOptions[index] = e.target.value; setOptions(newOptions) }} placeholder={`Option ${index + 1}`} style={{ flex: '1', padding: '12px', background: 'rgba(0,0,0,0.3)', border: `2px solid ${correctAnswer === index ? '#2ECC71' : '#9B59B6'}`, borderRadius: '10px', color: 'white', fontSize: '16px', outline: 'none' }} />
                      <button onClick={() => setCorrectAnswer(index)} style={{ width: '50px', background: correctAnswer === index ? '#2ECC71' : 'transparent', border: `2px solid ${correctAnswer === index ? '#2ECC71' : '#9B59B6'}`, borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '18px' }}>{correctAnswer === index ? '✓' : ''}</button>
                      {options.length > 2 && <button onClick={() => handleRemoveOption(index)} style={{ width: '50px', background: 'transparent', border: '2px solid #E74C3C', borderRadius: '10px', color: '#E74C3C', cursor: 'pointer', fontSize: '18px' }}>×</button>}
                    </div>
                  ))}
                  <button onClick={handleAddOption} style={{ marginTop: '10px', padding: '10px 20px', background: 'transparent', border: '2px dashed #9B59B6', borderRadius: '10px', color: '#9B59B6', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Option</button>
                </div>
              )}

              {quizType === 'written' && (
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ color: '#D4A5E8', marginBottom: '10px', display: 'block' }}>Answer Character Limit:</label>
                  <input type="number" value={answerLimit} onChange={(e) => setAnswerLimit(parseInt(e.target.value))} min="50" max="1000" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '2px solid #9B59B6', borderRadius: '10px', color: 'white', fontSize: '16px', outline: 'none' }} />
                </div>
              )}

              <button onClick={handleSaveQuiz} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #9B59B6, #8E44AD)', border: 'none', borderRadius: '15px', color: 'white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 20px rgba(155, 89, 182, 0.3)' }}>🚀 Publish Quiz (+{pointsAward} Points)</button>
            </div>
          )}

          {/* Alpha Chat Tab */}
          {activeTab === 'chat' && (
            <div>
              <h2 style={{ color: '#FF4500', marginBottom: '20px', textAlign: 'center', fontFamily: 'Gothic, cursive', fontSize: '28px', animation: 'fireAnim 1.5s ease-in-out infinite' }}>💬 𝕬𝖑𝖕𝖍𝖆'𝖘 𝕷𝖊𝖌𝖊𝖓𝖉𝖆𝖗𝖞 𝕮𝖍𝖆𝖙</h2>
              <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                <select value={alphaRoom} onChange={(e) => setAlphaRoom(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '2px solid #FF4500', borderRadius: '10px', fontSize: '14px' }}>
                  <option value="general">#general</option>
                  <option value="gaming">#gaming</option>
                  <option value="help">#help</option>
                  <option value="off-topic">#off-topic</option>
                </select>
              </div>
              <div style={{ height: '350px', overflowY: 'auto', marginBottom: '15px', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '2px solid #FF4500', borderRadius: '10px', scrollbarWidth: 'none' }}>
                {filteredChatMessages.map((msg, index) => (
                  <div key={index} style={{ marginBottom: '10px', padding: '10px', background: msg.user_id === 'ALPHA_ADMIN' ? 'linear-gradient(135deg, #1a0000, #2d0000)' : 'rgba(255, 69, 0, 0.05)', border: msg.user_id === 'ALPHA_ADMIN' ? '3px solid #FF4500' : '1px solid rgba(255, 69, 0, 0.3)', borderRadius: '10px', position: 'relative', animation: msg.user_id === 'ALPHA_ADMIN' ? 'fireBorder 2s ease-in-out infinite' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      {msg.user_id === 'ALPHA_ADMIN' ? <span style={{ fontSize: '24px', animation: 'yinYangSpin 3s ease-in-out infinite', display: 'inline-block' }}>☯</span> : msg.profile_picture ? <img src={msg.profile_picture} alt="" style={{ width: '25px', height: '25px', borderRadius: '50%', objectFit: 'cover' }} /> : <span style={{ fontSize: '20px' }}>👤</span>}
                      <span style={{ color: msg.name_color || '#FFFFFF', fontWeight: 'bold', fontSize: msg.user_id === 'ALPHA_ADMIN' ? '16px' : '13px', ...(msg.user_id === 'ALPHA_ADMIN' ? { animation: 'fireAnim 1.5s ease-in-out infinite', fontFamily: 'Gothic, cursive' } : {}) }}>
                        {msg.legendary_logo && msg.legendary_logo !== 'none' && <span>{msg.legendary_logo === 'dragon' ? '🐉' : msg.legendary_logo === 'phoenix' ? '🦅' : msg.legendary_logo === 'skull' ? '💀' : ''}</span>}
                        {msg.user_name}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '9px', marginLeft: 'auto' }}>{new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ color: msg.user_id === 'ALPHA_ADMIN' ? '#FFD700' : 'white', fontSize: '12px', marginLeft: '32px', fontStyle: msg.user_id === 'ALPHA_ADMIN' ? 'italic' : 'normal' }}>{msg.text}</p>
                    {msg.user_id !== 'ALPHA_ADMIN' && (
                      <div style={{ display: 'flex', gap: '5px', marginTop: '5px', marginLeft: '32px' }}>
                        <button onClick={() => handleDeleteChatMessage(msg.id)} style={{ padding: '3px 10px', background: '#E67E22', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Delete</button>
                        <button onClick={() => handleBanUser(msg.user_id)} style={{ padding: '3px 10px', background: '#E74C3C', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Ban</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={alphaChatInput} onChange={(e) => setAlphaChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAlphaChatSend()} placeholder={`Chat as Alpha in #${alphaRoom}...`} style={{ flex: '1', padding: '12px', background: '#1a0000', border: '3px solid #FF4500', borderRadius: '10px', color: '#FFD700', fontSize: '14px', outline: 'none', fontFamily: 'Gothic, cursive', boxShadow: '0 0 20px rgba(255, 69, 0, 0.3)', animation: 'fireBorder 2s ease-in-out infinite' }} />
                <button onClick={handleAlphaChatSend} style={{ padding: '12px 25px', background: 'linear-gradient(135deg, #FF4500, #FF6347)', border: '2px solid #FF4500', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', fontFamily: 'Gothic, cursive', boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)', animation: 'fireAnim 2s ease-in-out infinite' }}>🔥 Send</button>
              </div>
            </div>
          )}

          {/* Answers Tab */}
          {activeTab === 'answers' && (
            <div>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>Pending Answers ({userAnswers.length})</h2>
              {userAnswers.length === 0 ? <p style={{ color: '#D4A5E8' }}>No pending answers.</p> : userAnswers.map((answer) => (
                <div key={answer.id} style={{ background: 'rgba(0,0,0,0.3)', border: '2px solid #9B59B6', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ color: '#D4A5E8', fontSize: '12px' }}><strong>Device ID:</strong> {answer.user_id}</p>
                    <p style={{ fontSize: '18px' }}>{renderUserName(answer)}</p>
                  </div>
                  <p style={{ color: '#D4A5E8', marginBottom: '10px' }}><strong>Question:</strong> {answer.question}</p>
                  <p style={{ color: 'white', marginBottom: '10px' }}><strong>Answer:</strong> {answer.answer}</p>
                  <p style={{ color: '#D4A5E8', fontSize: '12px', marginBottom: '15px' }}>Submitted: {new Date(answer.created_at).toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply..." style={{ flex: '1', minWidth: '200px', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '2px solid #9B59B6', borderRadius: '10px', color: 'white' }} />
                    <button onClick={() => handleReply(answer.id)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #9B59B6, #8E44AD)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Reply</button>
                    <button onClick={() => handleRemoveAnswer(answer.id)} style={{ padding: '10px 20px', background: '#E67E22', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                    <button onClick={() => handleBanUser(answer.user_id)} style={{ padding: '10px 20px', background: '#E74C3C', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Ban Device</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedbacks' && (
            <div>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>📝 Pending Feedback ({feedbacks.length})</h2>
              {feedbacks.length === 0 ? <p style={{ color: '#D4A5E8' }}>No pending feedback.</p> : feedbacks.map((fb) => (
                <div key={fb.id} style={{ background: 'rgba(0,0,0,0.3)', border: '2px solid #FFD700', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ color: '#FFD700', fontSize: '12px' }}><strong>Device ID:</strong> {fb.user_id}</p>
                    <p style={{ fontSize: '18px' }}>{renderUserName(fb)}</p>
                  </div>
                  <p style={{ color: '#FFD700', marginBottom: '10px' }}>{getFeedbackTypeIcon(fb.type)} <strong>Type:</strong> {fb.type}</p>
                  <p style={{ color: 'white', marginBottom: '10px' }}><strong>Feedback:</strong> {fb.text}</p>
                  <p style={{ color: '#D4A5E8', fontSize: '12px', marginBottom: '15px' }}>Submitted: {new Date(fb.created_at).toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="text" value={feedbackReply} onChange={(e) => setFeedbackReply(e.target.value)} placeholder="Write your reply to user..." style={{ flex: '1', minWidth: '200px', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '2px solid #FFD700', borderRadius: '10px', color: 'white' }} />
                    <button onClick={() => handleFeedbackReply(fb.id)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', border: 'none', borderRadius: '10px', color: '#1a0a2e', cursor: 'pointer', fontWeight: 'bold' }}>Reply</button>
                    <button onClick={() => handleDismissFeedback(fb.id)} style={{ padding: '10px 20px', background: '#95A5A6', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bans Tab */}
          {activeTab === 'bans' && (
            <div>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>Device Ban Management</h2>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input type="text" value={banUserInput} onChange={(e) => setBanUserInput(e.target.value)} placeholder="Enter device ID to ban" style={{ flex: '1', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '2px solid #E74C3C', borderRadius: '10px', color: 'white', outline: 'none' }} />
                <button onClick={() => handleBanUser(banUserInput)} style={{ padding: '12px 25px', background: '#E74C3C', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Ban Device</button>
              </div>
              <h3 style={{ color: '#D4A5E8', marginBottom: '15px' }}>Banned Devices ({bannedUsers.length}):</h3>
              {bannedUsers.length === 0 ? <p style={{ color: '#D4A5E8' }}>No banned devices.</p> : bannedUsers.map((user, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #E74C3C', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
                  <p style={{ color: '#E74C3C' }}>🚫 {user}</p>
                  <button onClick={() => handleUnbanUser(user)} style={{ padding: '5px 15px', background: '#2ECC71', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer' }}>Unban</button>
                </div>
              ))}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>⚠️ Reports & Violations ({reports.length})</h2>
              {reports.length === 0 ? <p style={{ color: '#D4A5E8' }}>No reports.</p> : reports.map((report, index) => (
                <div key={report.id || index} style={{ background: 'rgba(0,0,0,0.3)', border: '2px solid #E74C3C', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
                  <p style={{ color: '#E74C3C', fontWeight: 'bold', marginBottom: '10px' }}>{report.type === 'auto_ban' ? '🚫 Auto-Ban' : report.type === 'nsfw_warning' ? '⚠️ NSFW Warning' : '👤 User Report'}</p>
                  <p style={{ color: '#D4A5E8', marginBottom: '5px' }}><strong>User:</strong> {report.user_name} (ID: {report.user_id})</p>
                  <p style={{ color: '#D4A5E8', marginBottom: '5px' }}><strong>Message:</strong> {report.message}</p>
                  <p style={{ color: '#D4A5E8', marginBottom: '5px' }}><strong>Reason:</strong> {report.reason}</p>
                  <p style={{ color: '#D4A5E8', marginBottom: '15px' }}><strong>Time:</strong> {new Date(report.created_at).toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleBanUser(report.user_id)} style={{ padding: '10px 20px', background: '#E74C3C', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Ban This User</button>
                    <button onClick={() => handleDismissReport(report.id)} style={{ padding: '10px 20px', background: '#95A5A6', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}