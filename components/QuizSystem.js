'use client'
import { useState, useEffect } from 'react'
import { getOrCreateDeviceId } from '../utils/deviceId'
import { supabase } from '../utils/supabaseClient'
import { getUserProfile, getDailyQuiz, saveQuizAnswer, addPoints } from '../utils/userProfile'
import { isUserBanned, checkExplicitContent } from '../utils/chatSystem'

export default function QuizSystem() {
  const [quizData, setQuizData] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [writtenAnswer, setWrittenAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [warning, setWarning] = useState('')
  const [userReply, setUserReply] = useState(null)
  const [isBanned, setIsBanned] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const id = getOrCreateDeviceId()
      setDeviceId(id)
      
      const userProfile = await getUserProfile(id)
      setProfile(userProfile)
      
      const banned = await isUserBanned(id)
      if (banned) {
        setIsBanned(true)
        setLoading(false)
        return
      }

      const quiz = await getDailyQuiz()
      if (quiz && quiz.question && quiz.question.trim()) {
        setQuizData(quiz)
        
        // Check if user already submitted FOR THIS SPECIFIC QUIZ
        const { data: existingAnswers } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('user_id', id)
          .eq('quiz_date', quiz.date)
          .eq('question', quiz.question)
        
        if (existingAnswers && existingAnswers.length > 0) {
          setSubmitted(true)
          const existing = existingAnswers[0]
          if (existing.selected_option !== null && existing.selected_option !== undefined) {
            setSelectedOption(existing.selected_option)
          }
          if (existing.answer) {
            setWrittenAnswer(existing.answer)
          }
          if (existing.reply) {
            setUserReply(existing.reply)
          }
        } else {
          // Fresh quiz for this user
          setSubmitted(false)
          setSelectedOption(null)
          setWrittenAnswer('')
          setUserReply(null)
        }
      } else {
        setQuizData(null)
      }
      setLoading(false)
    }
    init()
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#D4A5E8' }}>
        <p>Loading quiz...</p>
      </div>
    )
  }

  if (isBanned) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '60px auto',
        padding: '40px',
        background: 'linear-gradient(135deg, #1a0000 0%, #2d0000 50%, #1a0000 100%)',
        border: '3px solid #E74C3C',
        borderRadius: '25px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#E74C3C', fontSize: '28px', marginBottom: '20px' }}>
          🚫 ACCESS DENIED
        </h2>
        <p style={{ color: 'white', fontSize: '18px' }}>
          Your device has been banned from accessing quizzes and website features.
        </p>
        <p style={{ color: '#E74C3C', marginTop: '20px' }}>
          Device ID: {deviceId}
        </p>
      </div>
    )
  }

  if (!quizData) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '60px auto',
        padding: '40px',
        background: 'linear-gradient(135deg, #1a0a2e, #2d1a4a)',
        border: '3px solid #9B59B6',
        borderRadius: '25px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '15px' }}>
          📝 No Quiz Available
        </h2>
        <p style={{ color: '#D4A5E8' }}>
          Alpha hasn't posted a quiz yet. Check back soon!
        </p>
      </div>
    )
  }

  if (!profile) return null

  const handleOptionSelect = async (index) => {
    if (!submitted) {
      setSelectedOption(index)
      setSubmitted(true)
      
      if (index === quizData.correctAnswer) {
        const pointsToAward = quizData.pointsAward || 10
        await addPoints(deviceId, pointsToAward)
        setEarnedPoints(pointsToAward)
      }
      
      const answerData = {
        userId: deviceId,
        quizDate: quizData.date,
        question: quizData.question,
        answer: quizData.options[index],
        selectedOption: index,
        interactionName: profile.interactionName || 'Player',
        nameColor: profile.nameColor || '#FFFFFF',
        animation: profile.animation || 'none',
        legendaryLogo: profile.legendaryLogo || 'none',
        answerBox: profile.answerBox || 'none',
        profilePicture: profile.profilePicture || null
      }
      
      const result = await saveQuizAnswer(answerData)
      console.log('Answer saved:', result)
    }
  }

  const handleWrittenSubmit = async () => {
    if (checkExplicitContent(writtenAnswer)) {
      setWarning('⚠️ WARNING: Explicit content detected!')
      setWrittenAnswer('')
      return
    }
    
    if (writtenAnswer.length > quizData.answerLimit) {
      setWarning(`⚠️ Your answer exceeds the ${quizData.answerLimit} character limit.`)
      return
    }
    
    const pointsToAward = quizData.pointsAward || 5
    await addPoints(deviceId, pointsToAward)
    setEarnedPoints(pointsToAward)
    
    const answerData = {
      userId: deviceId,
      quizDate: quizData.date,
      question: quizData.question,
      answer: writtenAnswer,
      selectedOption: null,
      interactionName: profile.interactionName || 'Player',
      nameColor: profile.nameColor || '#FFFFFF',
      animation: profile.animation || 'none',
      legendaryLogo: profile.legendaryLogo || 'none',
      answerBox: profile.answerBox || 'none',
      profilePicture: profile.profilePicture || null
    }
    
    const result = await saveQuizAnswer(answerData)
    console.log('Written answer saved:', result)
    
    setSubmitted(true)
    setWarning('')
  }

  const getAnswerBoxStyle = (answerBoxType) => {
    const styles = {
      'fire': {
        background: 'linear-gradient(135deg, #1a0000, #2d0000)',
        border: '2px solid #FF4500',
        boxShadow: '0 0 30px rgba(255, 69, 0, 0.5)',
        animation: 'fireBoxAnim 1.5s ease-in-out infinite'
      },
      'ice': {
        background: 'linear-gradient(135deg, #001a1a, #002d2d)',
        border: '2px solid #00FFFF',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
        animation: 'iceBoxAnim 1.5s ease-in-out infinite'
      },
      'lightning': {
        background: 'linear-gradient(135deg, #1a1a00, #2d2d00)',
        border: '2px solid #FFFF00',
        boxShadow: '0 0 30px rgba(255, 255, 0, 0.5)',
        animation: 'lightningBoxAnim 1s ease-in-out infinite'
      },
      'rainbow': {
        background: 'linear-gradient(135deg, #1a001a, #2d002d)',
        border: '2px solid #FF00FF',
        boxShadow: '0 0 30px rgba(255, 0, 255, 0.5)',
        animation: 'rainbowBoxAnim 3s ease-in-out infinite'
      },
      'neon': {
        background: 'linear-gradient(135deg, #0a0a1a, #1a1a2d)',
        border: '2px solid #9B59B6',
        boxShadow: '0 0 30px rgba(155, 89, 182, 0.5)',
        animation: 'neonBoxAnim 2s ease-in-out infinite'
      },
      'none': {
        background: 'rgba(0,0,0,0.3)',
        border: '2px solid #9B59B6',
        boxShadow: 'none'
      }
    }
    return styles[answerBoxType] || styles['none']
  }

  if (quizData.type === 'mcq') {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '60px auto',
        padding: '0 20px'
      }}>
        <style jsx>{`
          @keyframes quizBoxPulse {
            0%, 100% { box-shadow: 0 0 40px rgba(155, 89, 182, 0.4); }
            50% { box-shadow: 0 0 60px rgba(155, 89, 182, 0.6); }
          }
          @keyframes pointsEarned {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.5); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <div style={{
          background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1a4a 50%, #1a0a2e 100%)',
          border: '3px solid #9B59B6',
          borderRadius: '25px',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden',
          animation: 'quizBoxPulse 3s ease-in-out infinite'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '25px',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            boxShadow: '0 0 25px rgba(155, 89, 182, 0.5)',
            zIndex: '2'
          }}>
            🎯 DAILY QUIZ
          </div>

          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            color: '#FFD700',
            fontSize: '14px',
            zIndex: '2',
            fontWeight: 'bold'
          }}>
            💰 +{quizData.pointsAward || 10} Points
          </div>

          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '30px',
            marginTop: '50px',
            color: 'white',
            textShadow: '0 0 20px rgba(155, 89, 182, 0.5)'
          }}>
            {quizData.question}
          </h2>

          <div style={{ marginTop: '20px' }}>
            {quizData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={submitted}
                style={{
                  background: selectedOption === index ? 'linear-gradient(135deg, #9B59B6, #8E44AD)' : 'rgba(0,0,0,0.3)',
                  border: '2px solid #9B59B6',
                  borderRadius: '15px',
                  padding: '15px 20px',
                  margin: '10px 0',
                  width: '100%',
                  textAlign: 'left',
                  color: 'white',
                  fontSize: '16px',
                  cursor: submitted ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <strong style={{ marginRight: '10px' }}>{String.fromCharCode(65 + index)}.</strong>
                {option}
              </button>
            ))}
          </div>

          {submitted && selectedOption !== null && (
            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: selectedOption === quizData.correctAnswer ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
              border: `2px solid ${selectedOption === quizData.correctAnswer ? '#2ECC71' : '#E74C3C'}`,
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              {selectedOption === quizData.correctAnswer ? (
                <div>
                  <p style={{ color: '#2ECC71', fontWeight: 'bold', fontSize: '18px' }}>✅ Correct Answer!</p>
                  {earnedPoints > 0 && (
                    <p style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '20px', marginTop: '10px', animation: 'pointsEarned 1s ease-out' }}>
                      💰 +{earnedPoints} Points Earned!
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ color: '#E74C3C', fontWeight: 'bold', fontSize: '18px' }}>
                  ❌ Wrong Answer! The correct answer is: {quizData.options[quizData.correctAnswer]}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const answerBoxStyle = getAnswerBoxStyle(profile.answerBox || 'none')

  return (
    <div style={{
      maxWidth: '800px',
      margin: '60px auto',
      padding: '0 20px'
    }}>
      <style jsx>{`
        @keyframes quizBoxPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(155, 89, 182, 0.4); }
          50% { box-shadow: 0 0 60px rgba(155, 89, 182, 0.6); }
        }
        @keyframes fireAnimation {
          0%, 100% { text-shadow: 0 0 10px #FF4500, 0 0 20px #FF4500; }
          50% { text-shadow: 0 0 30px #FF6347, 0 0 60px #FF4500; }
        }
        @keyframes yinYangSpin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.3); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes fireBorder {
          0%, 100% { border-color: #FF4500; box-shadow: 0 0 30px #FF4500; }
          50% { border-color: #FF6347; box-shadow: 0 0 50px #FF4500; }
        }
        @keyframes fireBoxAnim {
          0%, 100% { box-shadow: 0 0 30px rgba(255, 69, 0, 0.5); }
          50% { box-shadow: 0 0 60px rgba(255, 69, 0, 0.8); }
        }
        @keyframes iceBoxAnim {
          0%, 100% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.5); }
          50% { box-shadow: 0 0 60px rgba(0, 255, 255, 0.8); }
        }
        @keyframes lightningBoxAnim {
          0%, 100% { box-shadow: 0 0 30px rgba(255, 255, 0, 0.5); }
          50% { box-shadow: 0 0 60px rgba(255, 255, 0, 0.8); }
        }
        @keyframes rainbowBoxAnim {
          0%, 100% { border-color: #FF0000; }
          20% { border-color: #FF7F00; }
          40% { border-color: #FFFF00; }
          60% { border-color: #00FF00; }
          80% { border-color: #0000FF; }
        }
        @keyframes neonBoxAnim {
          0%, 100% { box-shadow: 0 0 30px rgba(155, 89, 182, 0.5); }
          50% { box-shadow: 0 0 60px rgba(155, 89, 182, 0.8); }
        }
        @keyframes pointsEarned {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1a4a 50%, #1a0a2e 100%)',
        border: '3px solid #9B59B6',
        borderRadius: '25px',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
        animation: 'quizBoxPulse 3s ease-in-out infinite'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '25px',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          zIndex: '2'
        }}>
          ✍️ WRITTEN QUIZ
        </div>

        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: '#FFD700',
          fontSize: '14px',
          zIndex: '2',
          fontWeight: 'bold'
        }}>
          💰 +{quizData.pointsAward || 5} Points
        </div>

        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '30px',
          marginTop: '50px',
          color: 'white'
        }}>
          {quizData.question}
        </h2>

        {submitted ? (
          <div>
            <div style={{
              borderRadius: '15px',
              padding: '15px',
              color: 'white',
              fontSize: '16px',
              marginBottom: '20px',
              ...answerBoxStyle
            }}>
              <p style={{ color: '#D4A5E8', marginBottom: '10px' }}><strong>Your Answer:</strong></p>
              <p>{writtenAnswer}</p>
            </div>
            
            {earnedPoints > 0 && (
              <div style={{ textAlign: 'center', marginBottom: '20px', animation: 'pointsEarned 1s ease-out' }}>
                <p style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '20px' }}>💰 +{earnedPoints} Points Earned!</p>
              </div>
            )}
            
            {userReply && (
              <div style={{
                background: 'linear-gradient(135deg, #1a0000, #2d0000)',
                border: '3px solid #FF4500',
                borderRadius: '20px',
                padding: '30px',
                marginTop: '25px',
                animation: 'fireBorder 2s ease-in-out infinite'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '40px', animation: 'yinYangSpin 3s ease-in-out infinite', display: 'inline-block' }}>☯</span>
                  <span style={{ fontFamily: 'Gothic, cursive', fontSize: '32px', fontWeight: 'bold', color: '#FF4500', animation: 'fireAnimation 1.5s ease-in-out infinite' }}>
                    𝕬𝖑𝖕𝖍𝖆'𝖘 𝕽𝖊𝖕𝖑𝖞
                  </span>
                </div>
                <div style={{ background: 'rgba(255, 69, 0, 0.1)', border: '1px solid #FF4500', borderRadius: '15px', padding: '20px' }}>
                  <p style={{ color: '#FFD700', fontSize: '18px', fontStyle: 'italic' }}>{userReply}</p>
                </div>
                <div style={{ marginTop: '15px', textAlign: 'right' }}>
                  <p style={{ color: '#FF4500', fontFamily: 'Gothic, cursive', animation: 'fireAnimation 2s ease-in-out infinite' }}>
                    ~ 𝕬𝖑𝖕𝖍𝖆 𝖔𝖋 𝕬𝖑𝖕𝖍𝖆𝖘 ~
                  </p>
                </div>
              </div>
            )}
            
            {!userReply && (
              <div style={{
                background: 'rgba(155, 89, 182, 0.1)',
                border: '2px solid #9B59B6',
                borderRadius: '15px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#D4A5E8' }}>✅ Answer submitted! Waiting for Alpha's reply...</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <textarea
              value={writtenAnswer}
              onChange={(e) => setWrittenAnswer(e.target.value)}
              placeholder="Write your answer here..."
              maxLength={quizData.answerLimit}
              style={{
                width: '100%',
                padding: '15px',
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid #9B59B6',
                borderRadius: '15px',
                color: 'white',
                fontSize: '16px',
                minHeight: '120px',
                resize: 'vertical',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <p style={{ color: '#D4A5E8', fontSize: '14px' }}>{writtenAnswer.length}/{quizData.answerLimit}</p>
              <button
                onClick={handleWrittenSubmit}
                style={{
                  padding: '12px 25px',
                  background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Submit Answer
              </button>
            </div>
            {warning && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: 'rgba(231, 76, 60, 0.1)',
                border: '2px solid #E74C3C',
                borderRadius: '15px'
              }}>
                <p style={{ color: '#E74C3C', fontWeight: 'bold' }}>{warning}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}