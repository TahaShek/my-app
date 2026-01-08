'use client'

import { RealtimeChat } from '@/components/realtime-chat'

export default function ChatPage() {
  return (
    <div className="h-screen w-full">
      <RealtimeChat roomName="general" />
    </div>
  )
}
