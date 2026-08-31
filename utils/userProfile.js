import { supabase } from './supabaseClient'
import { ensureAnonymousAuth } from './supabaseClient'

export async function getUserProfile(deviceId) {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('device_id', deviceId)
  
  if (data && data.length > 0) {
    return {
      deviceId: data[0].device_id,
      points: data[0].points || 0,
      interactionName: data[0].interaction_name || 'Player',
      nameColor: data[0].name_color || '#FFFFFF',
      animation: data[0].animation || 'none',
      legendaryLogo: data[0].legendary_logo || 'none',
      answerBox: data[0].answer_box || 'none',
      profilePicture: data[0].profile_picture || null,
      purchasedItems: data[0].purchased_items || []
    }
  }
  
  // Create default profile using RPC (secure)
  const { data: insertData, error: insertError } = await supabase
    .from('user_profiles')
    .insert([{
      device_id: deviceId,
      points: 0,
      interaction_name: 'Player',
      name_color: '#FFFFFF',
      animation: 'none',
      legendary_logo: 'none',
      answer_box: 'none',
      profile_picture: null,
      purchased_items: []
    }])
  
  return {
    deviceId: deviceId,
    points: 0,
    interactionName: 'Player',
    nameColor: '#FFFFFF',
    animation: 'none',
    legendaryLogo: 'none',
    answerBox: 'none',
    profilePicture: null,
    purchasedItems: []
  }
}

export async function saveUserProfile(profile) {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert([{
      device_id: profile.deviceId,
      interaction_name: profile.interactionName,
      name_color: profile.nameColor,
      animation: profile.animation,
      legendary_logo: profile.legendaryLogo,
      answer_box: profile.answerBox,
      profile_picture: profile.profilePicture,
      purchased_items: profile.purchasedItems
    }], { onConflict: 'device_id' })
  
  return { data, error }
}

// SECURE: Add points through RPC function
export async function addPoints(deviceId, points) {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .rpc('add_points_secure', {
      user_id_param: deviceId,
      points_to_add: points
    })
  
  if (error) {
    console.error('Add points error:', error)
    return null
  }
  
  return getUserProfile(deviceId)
}

// SECURE: Deduct points (for store purchases)
export async function deductPoints(deviceId, points) {
  const profile = await getUserProfile(deviceId)
  if (profile.points >= points) {
    await supabase.rpc('add_points_secure', {
      user_id_param: deviceId,
      points_to_add: -points
    })
    return { success: true, profile: await getUserProfile(deviceId) }
  }
  return { success: false, profile }
}

export async function purchaseItem(deviceId, itemId, pointsCost) {
  const profile = await getUserProfile(deviceId)
  if (profile.points >= pointsCost && !profile.purchasedItems.includes(itemId)) {
    await supabase.rpc('add_points_secure', {
      user_id_param: deviceId,
      points_to_add: -pointsCost
    })
    profile.purchasedItems.push(itemId)
    await saveUserProfile(profile)
    return { success: true, profile: await getUserProfile(deviceId) }
  }
  return { success: false, profile }
}

// Quiz Functions
export async function getDailyQuiz() {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .from('daily_quiz')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
  
  if (data && data.length > 0) {
    return {
      type: data[0].type,
      question: data[0].question,
      options: data[0].options || [],
      correctAnswer: data[0].correct_answer || 0,
      answerLimit: data[0].answer_limit || 200,
      pointsAward: data[0].points_award || 10,
      date: data[0].quiz_date || new Date().toISOString().split('T')[0]
    }
  }
  
  return null
}

export async function saveDailyQuiz(quiz) {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .from('daily_quiz')
    .insert([{
      type: quiz.type,
      question: quiz.question,
      options: quiz.options,
      correct_answer: quiz.correctAnswer,
      answer_limit: quiz.answerLimit,
      points_award: quiz.pointsAward,
      quiz_date: quiz.date
    }])
  
  return { data, error }
}

// SECURE: Save quiz answer through RPC
export async function saveQuizAnswer(answer) {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .rpc('save_quiz_answer_secure', {
      p_user_id: answer.userId,
      p_quiz_date: answer.quizDate,
      p_question: answer.question,
      p_answer: answer.answer,
      p_selected_option: answer.selectedOption !== undefined ? answer.selectedOption : null,
      p_interaction_name: answer.interactionName || 'Player',
      p_name_color: answer.nameColor || '#FFFFFF',
      p_animation: answer.animation || 'none',
      p_legendary_logo: answer.legendaryLogo || 'none',
      p_answer_box: answer.answerBox || 'none',
      p_profile_picture: answer.profilePicture || null
    })
  
  console.log('Secure quiz answer save:', { data, error })
  return { data, error }
}

export async function getQuizAnswers() {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .from('quiz_answers')
    .select('*')
    .order('created_at', { ascending: false })
  
  return data || []
}

export async function updateQuizAnswerReply(answerId, reply) {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .from('quiz_answers')
    .update({ reply: reply, replied_at: new Date().toISOString() })
    .eq('id', answerId)
  
  return { data, error }
}

export async function deleteQuizAnswer(answerId) {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .from('quiz_answers')
    .delete()
    .eq('id', answerId)
  
  return { data, error }
}

// SECURE: Save feedback through RPC
export async function saveFeedback(feedback) {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .rpc('save_feedback_secure', {
      p_user_id: feedback.userId,
      p_user_name: feedback.userName,
      p_name_color: feedback.nameColor,
      p_animation: feedback.animation,
      p_legendary_logo: feedback.legendaryLogo,
      p_profile_picture: feedback.profilePicture,
      p_type: feedback.type,
      p_text: feedback.text
    })
  
  return { data, error }
}

export async function getFeedbacks() {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false })
  
  return data || []
}

export async function updateFeedbackReply(feedbackId, reply) {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .from('feedbacks')
    .update({ reply: reply, replied_at: new Date().toISOString() })
    .eq('id', feedbackId)
  
  return { data, error }
}

export async function deleteFeedback(feedbackId) {
  await ensureAnonymousAuth()
  
  const { data, error } = await supabase
    .from('feedbacks')
    .delete()
    .eq('id', feedbackId)
  
  return { data, error }
}