'use client'

import { RealtimeChat } from '@/components/realtime-chat'
import { Header } from '@/components/header'

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen w-full">
      <Header />
      <div className="flex-1 overflow-hidden">
        <RealtimeChat />
      </div>
    </div>
  )
}
