import { createClient } from '@/lib/supabase/client'
import type { ChatRoom, Message, ChatMessage, Profile } from '@/lib/types/database'

/**
 * Get or create a chat room by name
 */
export async function getOrCreateRoom(roomName: string): Promise<ChatRoom | null> {
  const supabase = createClient()

  // First, try to get the room
  const { data: existingRoom, error: fetchError } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('name', roomName)
    .single()

  if (existingRoom) {
    return existingRoom
  }

  // If room doesn't exist, create it
  if (fetchError?.code === 'PGRST116') {
    const { data: newRoom, error: createError } = await supabase
      .from('chat_rooms')
      .insert({ name: roomName })
      .select()
      .single()

    if (createError) {
      console.error('Error creating room:', createError)
      return null
    }

    return newRoom
  }

  console.error('Error fetching room:', fetchError)
  return null
}

/**
 * Get all messages for a room
 */
export async function getMessages(roomId: string): Promise<ChatMessage[]> {
  const supabase = createClient()

  // Fetch messages with user email/name stored in the message
  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, content, created_at, user_id, user_name, user_email')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  // Transform database messages to ChatMessage format
  return (messages || []).map((msg: any) => ({
    id: msg.id,
    content: msg.content,
    createdAt: msg.created_at,
    user: {
      id: msg.user_id,
      name: msg.user_name || msg.user_email?.split('@')[0] || 'Anonymous',
      email: msg.user_email,
    },
  }))
}

/**
 * Insert a new message
 */
export async function insertMessage(
  roomId: string,
  userId: string,
  content: string,
  userName?: string,
  userEmail?: string
): Promise<Message | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      room_id: roomId,
      user_id: userId,
      content,
      user_name: userName,
      user_email: userEmail,
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting message:', error)
    return null
  }

  return data
}

/**
 * Get all user profiles except the current user
 */
export async function getProfiles(): Promise<Profile[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const query = supabase
    .from('profiles')
    .select('*')
    .order('name', { ascending: true })

  if (user) {
    query.neq('id', user.id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  return data || []
}

/**
 * Get or create a direct chat room between the current user and another user
 */
export async function getOrCreateDirectRoom(otherUserId: string): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Try to find an existing direct room between these two users
  // We use the unique room name convention for performance and simplicity
  const roomName = `direct:${[user.id, otherUserId].sort().join('-')}`

  const { data: existingRoom } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('name', roomName)
    .single()

  if (existingRoom) {
    return existingRoom.id
  }

  // 2. If no room found, create a new one
  const { data: newRoom, error: createError } = await supabase
    .from('chat_rooms')
    .insert({
      name: roomName,
      is_direct: true
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating direct room:', createError)
    return null
  }

  // 3. Add both users as members
  await supabase
    .from('room_members')
    .insert([
      { room_id: newRoom.id, user_id: user.id },
      { room_id: newRoom.id, user_id: otherUserId }
    ])

  return newRoom.id
}

/**
 * Get the current authenticated user
 */
export async function getAuthUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  return user
}
