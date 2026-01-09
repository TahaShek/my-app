'use client'

import { createClient } from '@/lib/supabase/client'
import { getOrCreateRoom, getMessages, insertMessage, getAuthUser } from '@/lib/chat-db'
import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface UseRealtimeChatProps {
  roomName: string
}

export interface ChatMessage {
  id: string
  content: string
  user: {
    id: string
    name: string
    email?: string
  }
  createdAt: string
}

const EVENT_MESSAGE_TYPE = 'message'

export function useRealtimeChat({ roomName }: UseRealtimeChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)

  // Initialize: Get user and load messages
  useEffect(() => {
    async function initialize() {
      setIsLoading(true)
      setError(null)

      // Get authenticated user
      const authUser = await getAuthUser()
      if (!authUser) {
        setError('You must be logged in to use chat')
        setIsLoading(false)
        return
      }
      setUser(authUser)

      // Get or create room
      const room = await getOrCreateRoom(roomName)
      if (!room) {
        setError('Failed to create or access chat room')
        setIsLoading(false)
        return
      }
      setRoomId(room.id)

      // Load existing messages from database
      const existingMessages = await getMessages(room.id)
      setMessages(existingMessages)

      setIsLoading(false)
    }

    initialize()
  }, [roomName])

  // Set up realtime channel
  useEffect(() => {
    if (!user || !roomId) return

    const newChannel = supabase.channel(roomName)

    newChannel
      .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload: any) => {
        const newMessage = payload.payload as ChatMessage
        // Only add if it's not from the current user (they already have it locally)
        setMessages((current) => {
          const exists = current.some(msg => msg.id === newMessage.id)
          if (exists) return current
          return [...current, newMessage]
        })
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    setChannel(newChannel)

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [roomName, user, roomId, supabase])

  const sendMessage = useCallback(
    async (content: string, targetUserId?: string) => {
      if (!channel || !isConnected || !user || !roomId) return

      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous'
      const userEmail = user.email

      // Save to database first
      const dbMessage = await insertMessage(roomId, user.id, content, userName, userEmail)
      if (!dbMessage) {
        console.error('Failed to save message to database')
        return
      }

      // Create the chat message object
      const message: ChatMessage = {
        id: dbMessage.id,
        content: dbMessage.content,
        user: {
          id: user.id,
          name: userName,
          email: userEmail,
        },
        createdAt: dbMessage.created_at,
      }

      // Update local state immediately for the sender
      setMessages((current) => [...current, message])

      // Broadcast to other users
      await channel.send({
        type: 'broadcast',
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      })

      // Send push notification to target user if provided
      if (targetUserId) {
        try {
          fetch('/api/send-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `New message from ${userName}`,
              body: content.length > 50 ? content.substring(0, 50) + '...' : content,
              targetUserId: targetUserId
            })
          })
        } catch (err) {
          console.error('Error triggering push notification:', err)
        }
      }
    },
    [channel, isConnected, user, roomId]
  )

  return { messages, sendMessage, isConnected, isLoading, error, user }
}
