import { supabase } from './supabaseClient'
import { ensureAnonymousAuth } from './supabaseClient'

// Chat Messages
export async function getChatMessages() {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(100)
  return data || []
}

// SECURE: Save chat message through RPC
export async function saveChatMessage(message) {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .rpc('save_chat_message_secure', {
      p_user_id: message.user_id,
      p_user_name: message.user_name,
      p_name_color: message.name_color,
      p_animation: message.animation,
      p_legendary_logo: message.legendary_logo,
      p_profile_picture: message.profile_picture,
      p_room: message.room,
      p_text: message.text
    })
  return { data, error }
}

// Game Chat Messages
export async function getGameChatMessages() {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .from('game_chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(100)
  return data || []
}

// Reports
export async function getReports() {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

// SECURE: Save report through RPC
export async function saveReport(report) {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .rpc('save_report_secure', {
      p_type: report.type,
      p_user_id: report.user_id,
      p_user_name: report.user_name,
      p_reported_by: report.reported_by,
      p_reported_by_name: report.reported_by_name,
      p_message: report.message,
      p_reason: report.reason
    })
  return { data, error }
}

// Game State
export async function getGameState() {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .from('game_state')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
  
  if (data && data.length > 0) {
    return {
      board: data[0].board || Array(9).fill(''),
      currentPlayer: data[0].current_player || 'X',
      winner: data[0].winner || null,
      moves: data[0].moves || 0
    }
  }
  
  return { board: Array(9).fill(''), currentPlayer: 'X', winner: null, moves: 0 }
}

// Waiting Players
export async function getWaitingPlayers() {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .from('waiting_players')
    .select('*')
  return data || []
}

export async function addWaitingPlayer(player) {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .from('waiting_players')
    .insert([player])
  return { data, error }
}

export async function removeWaitingPlayer(deviceId) {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .from('waiting_players')
    .delete()
    .eq('device_id', deviceId)
  return { data, error }
}

// Banned Users
export async function getBannedUsers() {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .from('banned_users')
    .select('*')
  return data || []
}

export async function isUserBanned(deviceId) {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .from('banned_users')
    .select('*')
    .eq('device_id', deviceId)
  return data && data.length > 0
}

// SECURE: Ban user through RPC
export async function banUser(deviceId) {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .rpc('ban_user_secure', { p_device_id: deviceId })
  return { data, error }
}

// SECURE: Unban user through RPC
export async function unbanUser(deviceId) {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .rpc('unban_user_secure', { p_device_id: deviceId })
  return { data, error }
}

// User Warnings
export async function getUserWarnings(deviceId) {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .rpc('get_user_warnings_secure', { p_device_id: deviceId })
  return data || 0
}

// SECURE: Add warning through RPC
export async function addUserWarning(deviceId) {
  await ensureAnonymousAuth()
  const { data, error } = await supabase
    .rpc('add_user_warning_secure', { p_device_id: deviceId })
  return data || 0
}

// NSFW Detection
export function checkExplicitContent(text) {
  const explicitWords = [
    'fuck', 'shit', 'ass', 'bitch', 'dick', 'pussy', 'cock', 'cunt',
    'bastard', 'whore', 'slut', 'nigger', 'faggot', 'retard',
    'motherfucker', 'asshole', 'douchebag', 'dumbass', 'jackass',
    'sex', 'porn', 'nude', 'naked', 'xxx', 'nsfw', 'hentai',
    'boobs', 'tits', 'penis', 'vagina', 'masturbate', 'orgasm'
  ]
  
  const lowerText = text.toLowerCase()
  return explicitWords.some(word => lowerText.includes(word))
}

// SECURE: Auto ban through RPC
export async function autoBanUser(deviceId) {
  await banUser(deviceId)
}