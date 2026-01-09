export interface Profile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  updated_at?: string
  created_at?: string
}
export interface ChatRoom {
  id: string
  name: string
  created_at: string
}

export interface Message {
  id: string
  room_id: string
  user_id: string
  content: string
  user_name?: string
  user_email?: string
  created_at: string
}

// Extended type for UI with user details
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
