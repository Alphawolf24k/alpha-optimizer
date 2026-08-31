'use client'
import { useState, useEffect, useRef } from 'react'
import { getOrCreateDeviceId } from '../utils/deviceId'
import { supabase } from '../utils/supabaseClient'
import { getUserProfile, addPoints } from '../utils/userProfile'
import { 
  isUserBanned, 
  checkExplicitContent, 
  getUserWarnings, 
  addUserWarning, 
  banUser, 
  saveReport 
} from '../utils/chatSystem'
import FixedPortal from './FixedPortal'

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
]

function checkWinner(board) {
  for (let line of WIN_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return board.every(cell => cell) ? 'Draw' : null
}

function getEmptyIndices(board) {
  const out = []
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) out.push(i)
  }
  return out
}

function minimax(board, depth, isMaximizing, aiSymbol, humanSymbol) {
  const result = checkWinner(board)
  if (result === aiSymbol) return 10 - depth
  if (result === humanSymbol) return depth - 10
  if (result === 'Draw') return 0

  const empties = getEmptyIndices(board)

  if (isMaximizing) {
    let best = -Infinity
    for (let idx of empties) {
      board[idx] = aiSymbol
      const score = minimax(board, depth + 1, false, aiSymbol, humanSymbol)
      board[idx] = ''
      best = Math.max(best, score)
    }
    return best
  } else {
    let best = Infinity
    for (let idx of empties) {
      board[idx] = humanSymbol
      const score = minimax(board, depth + 1, true, aiSymbol, humanSymbol)
      board[idx] = ''
      best = Math.min(best, score)
    }
    return best
  }
}

function getAiMove(board, aiSymbol, humanSymbol, difficulty) {
  const empties = getEmptyIndices(board)
  if (empties.length === 0) return null

  if (difficulty === 'easy') {
    if (Math.random() < 0.75) {
      return empties[Math.floor(Math.random() * empties.length)]
    }
  }

  if (difficulty === 'medium') {
    for (let idx of empties) {
      const copy = [...board]
      copy[idx] = aiSymbol
      if (checkWinner(copy) === aiSymbol) return idx
    }
    for (let idx of empties) {
      const copy = [...board]
      copy[idx] = humanSymbol
      if (checkWinner(copy) === humanSymbol) return idx
    }
    if (Math.random() < 0.5) {
      return empties[Math.floor(Math.random() * empties.length)]
    }
  }

  let bestScore = -Infinity
  let bestMove = empties[0]
  for (let idx of empties) {
    const copy = [...board]
    copy[idx] = aiSymbol
    const score = minimax(copy, 0, false, aiSymbol, humanSymbol)
    if (score > bestScore) {
      bestScore = score
      bestMove = idx
    }
  }
  return bestMove
}

const EMPTY_BOARD = () => Array(9).fill('')

const winSounds = ['/sounds/win1.mp3', '/sounds/win2.mp3', '/sounds/win3.mp3']
const loseSounds = ['/sounds/lose1.mp3', '/sounds/lose2.mp3', '/sounds/lose3.mp3']

function generatePlayerId() {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
}

export default function GameChat() {
  const [deviceId, setDeviceId] = useState('')
  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [gameState, setGameState] = useState({ board: EMPTY_BOARD(), currentPlayer: 'X', winner: null, moves: 0 })
  const [gameMode, setGameMode] = useState(null)
  const [aiDifficulty, setAiDifficulty] = useState('hard')
  const [aiBoard, setAiBoard] = useState(EMPTY_BOARD())
  const [aiTurn, setAiTurn] = useState('human')
  const [aiWinner, setAiWinner] = useState(null)
  const [aiThinking, setAiThinking] = useState(false)
  const HUMAN_SYMBOL = 'X'
  const AI_SYMBOL = 'O'
  const [warning, setWarning] = useState('')
  const [isBanned, setIsBanned] = useState(false)
  const [showGame, setShowGame] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [mySymbol, setMySymbol] = useState('X')
  const [currentRoom, setCurrentRoom] = useState('general')
  const [rooms] = useState(['general', 'gaming', 'help', 'off-topic'])
  const [gameChatMessages, setGameChatMessages] = useState([])
  const [gameChatInput, setGameChatInput] = useState('')
  const [onlineCount, setOnlineCount] = useState(0)
  const [showWarningPopup, setShowWarningPopup] = useState(false)
  const [warningData, setWarningData] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [opponentLeft, setOpponentLeft] = useState(false)
  const [opponentName, setOpponentName] = useState('')
  const [gameRoomId, setGameRoomId] = useState(null)
  const playerIdRef = useRef('')
  const lastSoundRef = useRef(null)
  const winSoundIndexRef = useRef(0)
  const loseSoundIndexRef = useRef(0)
  const soundLockRef = useRef(false)
  const lastWinnerRef = useRef(null)
  const gameChatEndRef = useRef(null)
  const deviceIdRef = useRef('')
  const profileRef = useRef(null)
  const myRoomIdRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const playSequentialSound = (type) => {
    if (soundLockRef.current) return
    soundLockRef.current = true
    try {
      if (lastSoundRef.current) {
        lastSoundRef.current.pause()
        lastSoundRef.current.currentTime = 0
      }
      const sounds = type === 'win' ? winSounds : loseSounds
      let soundIndex
      if (type === 'win') {
        soundIndex = winSoundIndexRef.current
        winSoundIndexRef.current = (winSoundIndexRef.current + 1) % winSounds.length
      } else {
        soundIndex = loseSoundIndexRef.current
        loseSoundIndexRef.current = (loseSoundIndexRef.current + 1) % loseSounds.length
      }
      const audio = new Audio(sounds[soundIndex])
      lastSoundRef.current = audio
      audio.play()
      audio.onended = () => { soundLockRef.current = false }
      setTimeout(() => { soundLockRef.current = false }, 3000)
    } catch (error) {
      soundLockRef.current = false
    }
  }

  const awardPoints = async (points) => {
    await addPoints(deviceIdRef.current, points)
    const updatedProfile = await getUserProfile(deviceIdRef.current)
    setProfile(updatedProfile)
  }

  const updateOnlineStatus = async (id, userProfile) => {
    try {
      await supabase.from('online_users').upsert([{
        device_id: id,
        user_name: userProfile?.interactionName || 'Player',
        name_color: userProfile?.nameColor || '#FFFFFF',
        animation: userProfile?.animation || 'none',
        legendary_logo: userProfile?.legendaryLogo || 'none',
        profile_picture: userProfile?.profilePicture || null,
        last_seen: new Date().toISOString()
      }], { onConflict: 'device_id' })
    } catch (error) {}
  }

  const fetchOnlineCount = async () => {
    try {
      const { data } = await supabase.from('online_users').select('*').gt('last_seen', new Date(Date.now() - 60000).toISOString())
      setOnlineCount(data ? data.length : 0)
    } catch (error) {}
  }

  const checkWarnings = async (id) => {
    try {
      const { data: warnings } = await supabase.from('warning_notifications').select('*').eq('device_id', id).eq('is_read', false)
      if (warnings && warnings.length > 0) {
        const latestWarning = warnings[warnings.length - 1]
        setWarningData(latestWarning)
        setShowWarningPopup(true)
        await supabase.from('warning_notifications').update({ is_read: true }).eq('id', latestWarning.id)
        if (latestWarning.warning_count >= 3) setIsBanned(true)
      }
    } catch (error) {}
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      if (deviceIdRef.current && profileRef.current) {
        await updateOnlineStatus(deviceIdRef.current, profileRef.current)
      }
      await fetchOnlineCount()
      if (deviceIdRef.current) {
        await checkWarnings(deviceIdRef.current)
      }
      try {
        const { data: chatData } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(100)
        setMessages(chatData || [])
        const { data: gameChatData } = await supabase.from('game_chat_messages').select('*').order('created_at', { ascending: true }).limit(50)
        setGameChatMessages(gameChatData || [])
      } catch (error) {}
      
      if (myRoomIdRef.current) {
        try {
          const { data: roomData } = await supabase.from('game_rooms').select('*').eq('id', myRoomIdRef.current)
          if (roomData && roomData.length > 0) {
            const room = roomData[0]
            setGameState({
              board: room.board || EMPTY_BOARD(),
              currentPlayer: room.current_turn || 'X',
              winner: room.winner || null,
              moves: room.moves || 0
            })
            
            if (room.player_left && room.player_left !== playerIdRef.current) {
              setOpponentLeft(true)
              setOpponentName(room.player_left_name || 'Opponent')
            }
            
            if (room.winner && room.winner !== 'Draw' && room.winner !== mySymbol && lastWinnerRef.current !== room.winner) {
              lastWinnerRef.current = room.winner
              playSequentialSound('lose')
            }
            
            if (room.player_x_device && room.player_o_device) {
              if (!isConnected) {
                setIsConnected(true)
                setIsWaiting(false)
                const oppName = room.player_x_device === playerIdRef.current ? room.player_o_name : room.player_x_name
                if (oppName) setOpponentName(oppName)
              }
            }
          } else {
            myRoomIdRef.current = null
            setGameRoomId(null)
            setIsConnected(false)
            setIsWaiting(false)
          }
        } catch (error) {}
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isConnected, mySymbol])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (myRoomIdRef.current && isConnected) {
        supabase.from('game_rooms').update({
          player_left: playerIdRef.current,
          player_left_name: profileRef.current?.interactionName || 'Player',
          player_left_at: new Date().toISOString()
        }).eq('id', myRoomIdRef.current).then(() => {})
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isConnected])

  useEffect(() => {
    const init = async () => {
      playerIdRef.current = generatePlayerId()
      const id = getOrCreateDeviceId()
      deviceIdRef.current = id
      setDeviceId(id)
      const userProfile = await getUserProfile(id)
      profileRef.current = userProfile
      setProfile(userProfile)
      const banned = await isUserBanned(id)
      if (banned) { setIsBanned(true); return }
      await updateOnlineStatus(id, userProfile)
      await fetchOnlineCount()
      const { data: chatData } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(100)
      setMessages(chatData || [])
      const { data: gameChatData } = await supabase.from('game_chat_messages').select('*').order('created_at', { ascending: true }).limit(50)
      setGameChatMessages(gameChatData || [])
    }
    init()
  }, [])

  useEffect(() => {
    if (gameMode !== 'ai') return
    if (aiWinner) return
    if (aiTurn !== 'ai') return
    setAiThinking(true)
    const timer = setTimeout(() => {
      setAiBoard(prevBoard => {
        const move = getAiMove(prevBoard, AI_SYMBOL, HUMAN_SYMBOL, aiDifficulty)
        if (move === null) return prevBoard
        const newBoard = [...prevBoard]
        newBoard[move] = AI_SYMBOL
        const result = checkWinner(newBoard)
        if (result) {
          setAiWinner(result)
          if (result === AI_SYMBOL) playSequentialSound('lose')
        }
        setAiTurn('human')
        return newBoard
      })
      setAiThinking(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [gameMode, aiTurn, aiWinner, aiDifficulty])

  if (isBanned) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '40px', background: 'linear-gradient(135deg, #1a0000, #2d0000)', border: '3px solid #E74C3C', borderRadius: '25px', textAlign: 'center' }}>
        <h2 style={{ color: '#E74C3C', fontSize: '28px' }}>🚫 BANNED</h2>
        <p style={{ color: 'white', marginTop: '20px' }}>Your device has been banned.</p>
      </div>
    )
  }

  if (!profile) return null

  const getLogoEmoji = (logo) => {
    const logoMap = { 'dragon': '🐉', 'phoenix': '🦅', 'skull': '💀', 'none': '' }
    return logoMap[logo] || ''
  }

  const getNameAnimation = (animation) => {
    const animations = {
      none: {},
      pulse: { animation: 'chatPulse 1s ease-in-out infinite' },
      glow: { animation: 'chatGlow 1.5s ease-in-out infinite' },
      fire: { animation: 'chatFire 1.5s ease-in-out infinite' },
      lightning: { animation: 'chatLightning 1s ease-in-out infinite' }
    }
    return animations[animation] || {}
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    if (checkExplicitContent(newMessage)) {
      const warningCount = await addUserWarning(deviceIdRef.current)
      if (warningCount >= 3) { await banUser(deviceIdRef.current); setIsBanned(true) }
      else setWarning(`⚠️ WARNING ${warningCount}/3: NSFW content detected!`)
      setNewMessage('')
      return
    }
    await supabase.rpc('save_chat_message_secure', {
      p_user_id: deviceIdRef.current,
      p_user_name: profile.interactionName || 'Player',
      p_name_color: profile.nameColor || '#FFFFFF',
      p_animation: profile.animation || 'none',
      p_legendary_logo: profile.legendaryLogo || 'none',
      p_profile_picture: profile.profilePicture || null,
      p_room: currentRoom,
      p_text: newMessage.trim()
    })
    setNewMessage('')
    setWarning('')
  }

  const handleGameChatSend = async () => {
    if (!gameChatInput.trim()) return
    if (checkExplicitContent(gameChatInput)) {
      const warningCount = await addUserWarning(deviceIdRef.current)
      if (warningCount >= 3) { await banUser(deviceIdRef.current); setIsBanned(true) }
      else setWarning(`⚠️ WARNING ${warningCount}/3: NSFW content detected!`)
      setGameChatInput('')
      return
    }
    await supabase.from('game_chat_messages').insert([{
      user_id: deviceIdRef.current,
      user_name: profile.interactionName || 'Player',
      name_color: profile.nameColor || '#FFFFFF',
      animation: profile.animation || 'none',
      legendary_logo: profile.legendaryLogo || 'none',
      profile_picture: profile.profilePicture || null,
      text: gameChatInput.trim()
    }])
    setGameChatInput('')
  }

  const handleReportUser = async (message) => {
    await saveReport({
      type: 'user_report',
      user_id: message.user_id,
      user_name: message.user_name,
      reported_by: deviceIdRef.current,
      reported_by_name: profile.interactionName || 'Player',
      message: message.text,
      reason: 'User reported this message'
    })
    alert('✅ User reported to admin!')
  }

  const clearGameChat = async () => {
    await supabase.from('game_chat_messages').delete().neq('id', 0)
    setGameChatMessages([])
  }

  const handleConnect = async () => {
    setOpponentLeft(false)
    setOpponentName('')
    
    const playerId = playerIdRef.current
    
    try {
      await supabase.from('game_rooms').delete().eq('player_x_device', playerId)
    } catch (e) {}
    try {
      await supabase.from('game_rooms').delete().eq('player_o_device', playerId)
    } catch (e) {}
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const { data: allWaitingRooms } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('status', 'waiting')
      .is('player_o_device', null)
      .limit(10)
    
    const validRooms = (allWaitingRooms || []).filter(room => room.player_x_device !== playerId)

    if (validRooms.length > 0) {
      const room = validRooms[0]
      await supabase.from('game_rooms').update({
        player_o_device: playerId,
        player_o_name: profile.interactionName || 'Player',
        status: 'playing',
        player_left: null,
        player_left_name: null,
        player_left_at: null
      }).eq('id', room.id)
      
      await clearGameChat()
      myRoomIdRef.current = room.id
      setGameRoomId(room.id)
      setMySymbol('O')
      setIsConnected(true)
      setIsWaiting(false)
      setOpponentName(room.player_x_name || 'Player')
      lastWinnerRef.current = null
      setGameState({ board: room.board || EMPTY_BOARD(), currentPlayer: 'X', winner: null, moves: 0 })
      setWarning(`✅ Connected! You are O vs ${room.player_x_name || 'Player'}`)
    } else {
      const roomCode = Math.random().toString(36).substring(2, 10).toUpperCase()
      const { data: newRoom } = await supabase.from('game_rooms').insert([{
        room_code: roomCode,
        player_x_device: playerId,
        player_x_name: profile.interactionName || 'Player',
        board: EMPTY_BOARD(),
        current_turn: 'X',
        winner: null,
        moves: 0,
        status: 'waiting',
        player_left: null
      }]).select()
      
      if (newRoom && newRoom.length > 0) {
        await clearGameChat()
        myRoomIdRef.current = newRoom[0].id
        setGameRoomId(newRoom[0].id)
        setMySymbol('X')
        setIsWaiting(true)
        setIsConnected(false)
        setOpponentName('')
        lastWinnerRef.current = null
        setWarning('⏳ Waiting for opponent to join...')
      }
    }
  }

  const disconnectPvp = async () => {
    if (myRoomIdRef.current) {
      await supabase.from('game_rooms').update({
        player_left: playerIdRef.current,
        player_left_name: profileRef.current?.interactionName || 'Player',
        player_left_at: new Date().toISOString()
      }).eq('id', myRoomIdRef.current)
      
      setTimeout(async () => {
        await supabase.from('game_rooms').delete().eq('id', myRoomIdRef.current)
      }, 1000)
    }
    myRoomIdRef.current = null
    setGameRoomId(null)
    setIsConnected(false)
    setIsWaiting(false)
    setOpponentLeft(false)
    setOpponentName('')
    lastWinnerRef.current = null
    setGameState({ board: EMPTY_BOARD(), currentPlayer: 'X', winner: null, moves: 0 })
  }

  const handlePvpCellClick = async (index) => {
    if (!isConnected || !myRoomIdRef.current) return
    if (gameState.board[index] || gameState.winner) return
    if (gameState.currentPlayer !== mySymbol) return

    const newBoard = [...gameState.board]
    newBoard[index] = mySymbol
    const winner = checkWinner(newBoard)
    const nextTurn = mySymbol === 'X' ? 'O' : 'X'
    const newMoves = gameState.moves + 1

    if (winner && winner !== 'Draw') {
      playSequentialSound('win')
      await awardPoints(10)
    }

    await supabase.from('game_rooms').update({
      board: newBoard,
      current_turn: nextTurn,
      winner: winner,
      moves: newMoves
    }).eq('id', myRoomIdRef.current)

    setGameState({ board: newBoard, currentPlayer: nextTurn, winner: winner, moves: newMoves })
  }

  const resetPvpGame = async () => {
    if (!myRoomIdRef.current) return
    await supabase.from('game_rooms').update({
      board: EMPTY_BOARD(),
      current_turn: 'X',
      winner: null,
      moves: 0,
      player_left: null,
      player_left_name: null
    }).eq('id', myRoomIdRef.current)
    setGameState({ board: EMPTY_BOARD(), currentPlayer: 'X', winner: null, moves: 0 })
    setOpponentLeft(false)
    lastWinnerRef.current = null
    soundLockRef.current = false
    await clearGameChat()
  }

  const handleAiCellClick = async (index) => {
    if (aiBoard[index] || aiWinner || aiTurn !== 'human' || aiThinking) return
    const newBoard = [...aiBoard]
    newBoard[index] = HUMAN_SYMBOL
    setAiBoard(newBoard)
    const result = checkWinner(newBoard)
    if (result) {
      setAiWinner(result)
      if (result === HUMAN_SYMBOL) {
        playSequentialSound('win')
        const pointsMap = { easy: 2, medium: 5, hard: 10 }
        await awardPoints(pointsMap[aiDifficulty] || 5)
      }
      return
    }
    setAiTurn('ai')
  }

  const resetAiGame = () => {
    setAiBoard(EMPTY_BOARD())
    setAiWinner(null)
    setAiTurn('human')
    setAiThinking(false)
    soundLockRef.current = false
  }

  const backToMenu = () => {
    setGameMode(null)
    resetAiGame()
    disconnectPvp()
  }

  const board = gameMode === 'ai' ? aiBoard : gameState.board
  const winner = gameMode === 'ai' ? aiWinner : gameState.winner
  const onCellClick = gameMode === 'ai' ? handleAiCellClick : handlePvpCellClick
  const onReset = gameMode === 'ai' ? resetAiGame : resetPvpGame

  const statusText = () => {
    if (winner) return winner === 'Draw' ? "It's a Draw!" : `Player ${winner} Wins!`
    if (gameMode === 'ai') {
      if (aiTurn === 'ai' || aiThinking) return "🤖 AI is thinking..."
      return "Your turn (X)"
    }
    if (isWaiting) return "⏳ Waiting for opponent..."
    if (!isConnected) return "Click Connect to find opponent"
    return `You are ${mySymbol} | Turn: ${gameState.currentPlayer}`
  }

  const filteredMessages = (messages || []).filter(msg => msg.room === currentRoom)

  return (
    <>
      <style jsx>{`
        @keyframes chatPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
        @keyframes chatGlow { 0%, 100% { text-shadow: 0 0 5px currentColor; } 50% { text-shadow: 0 0 20px currentColor, 0 0 40px currentColor; } }
        @keyframes chatFire { 0%, 100% { text-shadow: 0 0 10px #FF4500, 0 0 20px #FF4500; } 50% { text-shadow: 0 0 30px #FF6347, 0 0 60px #FF4500; } }
        @keyframes chatLightning { 0%, 100% { text-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF; } 50% { text-shadow: 0 0 30px #00FFFF, 0 0 60px #FFFFFF; } }
        @keyframes yinYangSpin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.3); } 100% { transform: rotate(360deg) scale(1); } }
        @keyframes fireAnim { 0%, 100% { text-shadow: 0 0 10px #FF4500, 0 0 20px #FF4500; } 50% { text-shadow: 0 0 30px #FF6347, 0 0 60px #FF4500; } }
        @keyframes fireBorder { 0%, 100% { border-color: #FF4500; box-shadow: 0 0 30px #FF4500; } 50% { border-color: #FF6347; box-shadow: 0 0 50px #FF4500; } }
      `}</style>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button onClick={() => { setShowGame(!showGame); setShowChat(false) }} style={{ padding: isMobile ? '4px 8px' : '8px 12px', background: showGame ? 'linear-gradient(135deg, #8B0000, #FF4500)' : 'linear-gradient(145deg, #1a0000, #2d0000)', border: '2px solid #8B0000', borderRadius: '50px', color: 'white', fontSize: isMobile ? '9px' : '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(139, 0, 0, 0.3)', whiteSpace: 'nowrap' }}>🎯 Tic Tac Toe</button>
        <button onClick={() => { setShowChat(!showChat); setShowGame(false) }} style={{ padding: isMobile ? '4px 8px' : '8px 12px', background: showChat ? 'linear-gradient(135deg, #00FFFF, #00BFFF)' : 'linear-gradient(145deg, #0a1a2e, #1a2d4a)', border: '2px solid #00FFFF', borderRadius: '50px', color: 'white', fontSize: isMobile ? '9px' : '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)', whiteSpace: 'nowrap' }}>💬 Chat</button>
      </div>

      <FixedPortal>
        {opponentLeft && isConnected && (
          <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '9999' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a0000 0%, #2d0000 50%, #1a0000 100%)', border: '4px double #E74C3C', borderRadius: '0', padding: isMobile ? '20px' : '30px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 0 80px rgba(231, 76, 60, 0.7)' }}>
              <svg width={isMobile ? '50px' : '70px'} height={isMobile ? '50px' : '70px'} viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2" style={{ margin: '0 auto 15px', display: 'block' }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <h2 style={{ color: '#E74C3C', fontFamily: 'Gothic, cursive', fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', marginBottom: '10px' }}>𝕻𝖑𝖆𝖞𝖊𝖗 𝕷𝖊𝖋𝖙</h2>
              <p style={{ color: '#FFD700', fontSize: isMobile ? '13px' : '16px', marginBottom: '20px' }}>{opponentName} has left the game</p>
              <button onClick={() => { setOpponentLeft(false); disconnectPvp(); setShowGame(false) }} style={{ padding: '10px 30px', background: 'linear-gradient(135deg, #E74C3C, #C0392B)', border: '2px solid #E74C3C', borderRadius: '0', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', fontFamily: 'Gothic, cursive' }}>𝕺𝕶</button>
            </div>
          </div>
        )}

        {showWarningPopup && warningData && (
          <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '9999' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a0000 0%, #2d0000 50%, #1a0000 100%)', border: '4px double #FFA500', borderRadius: '0', padding: isMobile ? '20px' : '30px', maxWidth: '420px', width: '90%', textAlign: 'center', boxShadow: '0 0 80px rgba(255, 165, 0, 0.7)' }}>
              <div style={{ fontSize: isMobile ? '35px' : '50px', marginBottom: '10px' }}>⚠️</div>
              <h2 style={{ color: '#FFA500', fontFamily: 'Gothic, cursive', fontSize: isMobile ? '20px' : '28px', fontWeight: 'bold', marginBottom: '15px' }}>𝖂𝖆𝖗𝖓𝖎𝖓𝖌 {warningData.warning_count}/3</h2>
              <p style={{ color: '#FFD700', fontSize: isMobile ? '12px' : '14px', fontStyle: 'italic', marginBottom: '20px' }}>{warningData.warning_message}</p>
              <button onClick={() => setShowWarningPopup(false)} style={{ marginTop: '20px', padding: '10px 30px', background: 'linear-gradient(135deg, #FFA500, #FF4500)', border: '2px solid #FFA500', borderRadius: '0', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', fontFamily: 'Gothic, cursive' }}>𝕴 𝖀𝖓𝖉𝖊𝖗𝖘𝖙𝖆𝖓𝖉</button>
            </div>
          </div>
        )}

        <div style={{ position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: '850' }}>
          <div style={{ padding: isMobile ? '4px 10px' : '6px 15px', background: 'rgba(11, 14, 20, 0.95)', border: '2px solid #2ECC71', borderRadius: '50px', color: '#2ECC71', fontSize: isMobile ? '10px' : '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>🟢 {onlineCount} Online</div>
        </div>

        {showGame && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '1000', width: isMobile ? '98%' : '95%', maxWidth: isMobile ? '400px' : '520px', maxHeight: isMobile ? '80vh' : '85vh', overflowY: 'auto', background: 'linear-gradient(135deg, #0a0000 0%, #1a0000 30%, #2d0a0a 50%, #1a0000 70%, #0a0000 100%)', border: '4px double #8B0000', borderRadius: '0', padding: isMobile ? '12px' : '20px', boxShadow: '0 0 60px rgba(139, 0, 0, 0.7)' }}>
            <h3 style={{ color: '#FF4500', textAlign: 'center', marginBottom: '10px', fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold', fontFamily: 'Gothic, cursive' }}>🎯 𝕿𝖎𝖈 𝕿𝖆𝖈 𝕿𝖔𝖊</h3>
            {!gameMode ? (
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => { setGameMode('pvp'); disconnectPvp() }} style={{ width: '100%', padding: isMobile ? '8px' : '10px', marginBottom: '8px', background: 'linear-gradient(135deg, #8B0000, #FF4500)', border: '2px solid #8B0000', borderRadius: '0', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px' }}>👥 𝕳𝖚𝖒𝖆𝖓 𝖛𝖘 𝕳𝖚𝖒𝖆𝖓 (+10)</button>
                <button onClick={() => { setGameMode('ai'); resetAiGame() }} style={{ width: '100%', padding: isMobile ? '8px' : '10px', background: 'linear-gradient(135deg, #2ECC71, #27AE60)', border: '2px solid #2ECC71', borderRadius: '0', color: '#1a0a2e', fontWeight: 'bold', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px' }}>🤖 𝕳𝖚𝖒𝖆𝖓 𝖛𝖘 𝕬𝕴</button>
                <p style={{ color: '#2ECC71', marginTop: '8px', fontSize: isMobile ? '10px' : '12px' }}>🟢 {onlineCount} players online</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: isMobile ? '8px' : '10px', flexWrap: isMobile ? 'wrap' : 'nowrap', justifyContent: 'center' }}>
                <div style={{ flex: '1', minWidth: isMobile ? '100%' : '240px' }}>
                  {gameMode === 'ai' && (
                    <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                      <select value={aiDifficulty} onChange={(e) => { setAiDifficulty(e.target.value); resetAiGame() }} style={{ background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid #8B0000', padding: '2px 4px', fontSize: isMobile ? '9px' : '10px' }}>
                        <option value="easy">Easy (+2)</option>
                        <option value="medium">Medium (+5)</option>
                        <option value="hard">Hard (+10)</option>
                      </select>
                    </div>
                  )}
                  {gameMode === 'pvp' && !isConnected && !isWaiting && (
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                      <button onClick={handleConnect} style={{ padding: isMobile ? '6px 15px' : '8px 20px', background: 'linear-gradient(135deg, #8B0000, #FF4500)', border: '2px solid #8B0000', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: isMobile ? '10px' : '12px' }}>🔗 𝕮𝖔𝖓𝖓𝖊𝖈𝖙</button>
                    </div>
                  )}
                  {gameMode === 'pvp' && isWaiting && !isConnected && (
                    <div style={{ textAlign: 'center', marginBottom: '8px', padding: '6px', background: 'rgba(255, 165, 0, 0.1)', border: '1px solid #FFA500' }}>
                      <p style={{ color: '#FFA500', fontWeight: 'bold', fontSize: isMobile ? '9px' : '11px' }}>⏳ Waiting for opponent...</p>
                    </div>
                  )}
                  {gameMode === 'pvp' && isConnected && !opponentLeft && (
                    <p style={{ color: '#2ECC71', textAlign: 'center', marginBottom: '8px', fontSize: isMobile ? '9px' : '11px' }}>✅ Connected! You: {mySymbol} vs {opponentName}</p>
                  )}
                  {winner ? (
                    <div style={{ textAlign: 'center', marginBottom: '8px', padding: '6px', background: winner === 'Draw' ? 'rgba(255, 165, 0, 0.1)' : 'rgba(46, 204, 113, 0.1)', border: `2px solid ${winner === 'Draw' ? '#FFA500' : '#2ECC71'}` }}>
                      <p style={{ color: winner === 'Draw' ? '#FFA500' : '#2ECC71', fontWeight: 'bold', fontSize: isMobile ? '10px' : '12px' }}>{statusText()}</p>
                    </div>
                  ) : (
                    <p style={{ color: '#FFD700', textAlign: 'center', marginBottom: '8px', fontSize: isMobile ? '9px' : '10px' }}>{statusText()}</p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', marginBottom: '8px' }}>
                    {board.map((cell, index) => {
                      const cellDisabled = !!cell || !!winner || (gameMode === 'ai' && (aiTurn !== 'human' || aiThinking)) || (gameMode === 'pvp' && (!isConnected || gameState.currentPlayer !== mySymbol || opponentLeft))
                      return (
                        <button key={index} onClick={() => onCellClick(index)} disabled={cellDisabled} style={{ aspectRatio: '1', background: cell ? 'rgba(139, 0, 0, 0.4)' : 'rgba(0,0,0,0.4)', border: '2px solid #8B0000', color: cell === 'X' ? '#FF4500' : '#2ECC71', fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold', cursor: cellDisabled ? 'not-allowed' : 'pointer' }}>{cell}</button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={onReset} style={{ flex: 1, padding: isMobile ? '5px' : '6px', background: 'linear-gradient(135deg, #8B0000, #FF4500)', border: '1px solid #8B0000', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: isMobile ? '9px' : '11px' }}>🔄 Reset</button>
                    <button onClick={backToMenu} style={{ flex: 1, padding: isMobile ? '5px' : '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid #8B0000', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: isMobile ? '9px' : '11px' }}>⬅ Menu</button>
                  </div>
                </div>

                {gameMode === 'pvp' && isConnected && !opponentLeft && (
                  <div style={{ flex: '1', minWidth: isMobile ? '100%' : '200px', background: '#000000', border: '2px solid #00FF00', borderRadius: '0', padding: '8px', display: 'flex', flexDirection: 'column', height: isMobile ? '180px' : '230px' }}>
                    <h4 style={{ color: '#00FF00', textAlign: 'center', marginBottom: '6px', fontFamily: 'Courier New, monospace', fontSize: '10px' }}>▓▒░ 𝕲𝖆𝖒𝖊 𝕮𝖍𝖆𝖙 ░▒▓</h4>
                    <div style={{ flex: '1', overflowY: 'auto', marginBottom: '6px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {(gameChatMessages || []).map((msg, index) => (
                        <div key={index} style={{ marginBottom: '3px' }}>
                          <span style={{ color: msg.name_color || '#00FF00', fontFamily: 'Courier New, monospace', fontSize: '9px', fontWeight: 'bold', ...getNameAnimation(msg.animation) }}>
                            {msg.legendary_logo && msg.legendary_logo !== 'none' && <span>{getLogoEmoji(msg.legendary_logo)}</span>}
                            {msg.user_name}:
                          </span>
                          <span style={{ color: '#00FF00', fontFamily: 'Courier New, monospace', fontSize: '9px' }}> {msg.text}</span>
                        </div>
                      ))}
                      <div ref={gameChatEndRef} />
                    </div>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      <input type="text" value={gameChatInput} onChange={(e) => setGameChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleGameChatSend()} placeholder="Type..." style={{ flex: '1', padding: '5px', background: '#001100', border: '1px solid #00FF00', borderRadius: '0', color: '#00FF00', fontFamily: 'Courier New, monospace', fontSize: '9px', outline: 'none', minWidth: '0' }} />
                      <button onClick={handleGameChatSend} style={{ padding: '5px 8px', background: '#003300', border: '1px solid #00FF00', borderRadius: '0', color: '#00FF00', fontFamily: 'Courier New, monospace', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button onClick={() => { setShowGame(false); disconnectPvp() }} style={{ position: 'absolute', top: '5px', right: '5px', background: 'transparent', border: 'none', color: '#8B0000', fontSize: isMobile ? '14px' : '18px', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {showChat && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '1000', width: isMobile ? '98%' : '95%', maxWidth: isMobile ? '400px' : '450px', maxHeight: isMobile ? '75vh' : '80vh', overflow: 'hidden', background: 'linear-gradient(135deg, #0a1a2e 0%, #1a2d4a 50%, #0a1a2e 100%)', border: '3px solid #00FFFF', borderRadius: isMobile ? '15px' : '20px', padding: isMobile ? '12px' : '20px', boxShadow: '0 0 60px rgba(0, 255, 255, 0.5)' }}>
            <h3 style={{ color: '#00FFFF', textAlign: 'center', marginBottom: '6px', fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold' }}>💬 Chat Rooms</h3>
            <p style={{ color: '#2ECC71', textAlign: 'center', marginBottom: '8px', fontSize: isMobile ? '10px' : '12px' }}>🟢 {onlineCount} online</p>
            <div style={{ marginBottom: '6px', textAlign: 'center' }}>
              <select value={currentRoom} onChange={(e) => setCurrentRoom(e.target.value)} style={{ width: '100%', padding: '5px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid #00FFFF', borderRadius: '8px', fontSize: isMobile ? '12px' : '14px' }}>
                {rooms.map(room => <option key={room} value={room}>#{room}</option>)}
              </select>
            </div>
            <div style={{ height: isMobile ? '150px' : '200px', overflowY: 'auto', marginBottom: '6px', padding: '6px', scrollbarWidth: 'none' }}>
              {filteredMessages.map((msg, index) => (
                <div key={index} style={{ 
                  marginBottom: '5px', 
                  padding: msg.user_id === 'ALPHA_ADMIN' ? '10px' : '5px', 
                  background: msg.user_id === 'ALPHA_ADMIN' ? 'linear-gradient(135deg, #1a0000 0%, #2d0000 50%, #1a0000 100%)' : 'rgba(0, 255, 255, 0.05)', 
                  border: msg.user_id === 'ALPHA_ADMIN' ? '3px solid #FF4500' : '1px solid #00FFFF', 
                  borderRadius: msg.user_id === 'ALPHA_ADMIN' ? '0' : '6px', 
                  position: 'relative',
                  animation: msg.user_id === 'ALPHA_ADMIN' ? 'fireBorder 2s ease-in-out infinite' : 'none',
                  boxShadow: msg.user_id === 'ALPHA_ADMIN' ? '0 0 30px rgba(255, 69, 0, 0.5)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    {msg.user_id === 'ALPHA_ADMIN' ? (
                      <span style={{ fontSize: '20px', animation: 'yinYangSpin 3s ease-in-out infinite', display: 'inline-block' }}>☯</span>
                    ) : msg.profile_picture ? (
                      <img src={msg.profile_picture} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '14px' }}>👤</span>
                    )}
                    <span style={{ 
                      color: msg.user_id === 'ALPHA_ADMIN' ? '#FF4500' : (msg.name_color || '#FFFFFF'), 
                      fontWeight: 'bold', 
                      fontSize: msg.user_id === 'ALPHA_ADMIN' ? '14px' : (isMobile ? '9px' : '11px'),
                      fontFamily: msg.user_id === 'ALPHA_ADMIN' ? 'Gothic, cursive' : 'inherit',
                      animation: msg.user_id === 'ALPHA_ADMIN' ? 'fireAnim 1.5s ease-in-out infinite' : 'none'
                    }}>
                      {msg.legendary_logo && msg.legendary_logo !== 'none' && <span>{msg.legendary_logo === 'dragon' ? '🐉' : msg.legendary_logo === 'phoenix' ? '🦅' : msg.legendary_logo === 'skull' ? '💀' : ''}</span>}
                      {msg.user_name}
                    </span>
                  </div>
                  <p style={{ 
                    color: msg.user_id === 'ALPHA_ADMIN' ? '#FFD700' : 'white', 
                    fontSize: msg.user_id === 'ALPHA_ADMIN' ? '12px' : (isMobile ? '9px' : '11px'), 
                    marginLeft: msg.user_id === 'ALPHA_ADMIN' ? '24px' : '20px',
                    fontStyle: msg.user_id === 'ALPHA_ADMIN' ? 'italic' : 'normal',
                    textShadow: msg.user_id === 'ALPHA_ADMIN' ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
                  }}>
                    {msg.text}
                  </p>
                  {msg.user_id === 'ALPHA_ADMIN' && (
                    <div style={{ marginTop: '5px', textAlign: 'right' }}>
                      <span style={{ color: '#FF4500', fontSize: '9px', fontFamily: 'Gothic, cursive', animation: 'fireAnim 2s ease-in-out infinite' }}>
                        ~ 𝕬𝖑𝖕𝖍𝖆 𝖔𝖋 𝕬𝖑𝖕𝖍𝖆𝖘 ~
                      </span>
                    </div>
                  )}
                  <button onClick={() => handleReportUser(msg)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'transparent', border: 'none', color: '#E74C3C', cursor: 'pointer', fontSize: '8px' }}>⚠️</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={`Message #${currentRoom}`} style={{ flex: '1', padding: '5px', background: 'rgba(0,0,0,0.3)', border: '2px solid #00FFFF', borderRadius: '6px', color: 'white', fontSize: isMobile ? '11px' : '13px' }} />
              <button onClick={handleSendMessage} style={{ padding: '5px 10px', background: 'linear-gradient(135deg, #00FFFF, #00BFFF)', border: 'none', borderRadius: '6px', color: '#1a0a2e', fontWeight: 'bold', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px' }}>Send</button>
            </div>
            <button onClick={() => setShowChat(false)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'transparent', border: 'none', color: '#00FFFF', fontSize: isMobile ? '14px' : '18px', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {(showGame || showChat) && (
          <div onClick={() => { setShowGame(false); setShowChat(false); disconnectPvp() }} style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: '999' }} />
        )}
      </FixedPortal>
    </>
  )
}