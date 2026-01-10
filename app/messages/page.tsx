"use client"

import { cn } from "@/lib/utils"
import { ChatMessageItem } from "@/components/chat-message"
import { useChatScroll } from "@/hooks/use-chat-scroll"
import {
  type ChatMessage,
  useRealtimeChat,
} from "@/hooks/use-realtime-chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User as UserIcon, Users, Search, Hash, Loader2, Mail } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { getProfiles } from "@/lib/chat-db"
import type { Profile } from "@/lib/types/database"
import { supabase } from "@/lib/supabase/client"
import { handleForegroundMessage } from "@/lib/push"
import { messaging } from "@/lib/firebase"
import { Header } from "@/components/header"

export default function MessagesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      const allProfiles = await getProfiles()
      setProfiles(allProfiles)

      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!messaging) return
    const unsubscribe = handleForegroundMessage(messaging)
    return () => unsubscribe()
  }, [])

  const roomName = useMemo(() => {
    if (!selectedProfile || !currentUser) return 'general'
    return `direct:${[currentUser.id, selectedProfile.id].sort().join('-')}`
  }, [selectedProfile, currentUser])

  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
    isLoading,
    error,
    user,
  } = useRealtimeChat({
    roomName,
  })

  const { containerRef, scrollToBottom } = useChatScroll()
  const [newMessage, setNewMessage] = useState('')

  const sortedMessages = useMemo(() => {
    return [...realtimeMessages].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [realtimeMessages])

  useEffect(() => {
    scrollToBottom()
  }, [sortedMessages, scrollToBottom])

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!newMessage.trim() || !isConnected) return
      sendMessage(newMessage, selectedProfile?.id)
      setNewMessage('')
    },
    [newMessage, isConnected, sendMessage, selectedProfile]
  )

  const filteredProfiles = profiles.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
    <div className="flex flex-col h-screen bg-[#F5EFE7]">
      <div className="bg-[#1a365d] text-[#D4AF37] px-6 py-3 shadow-md border-b-4 border-[#D4AF37] z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6" />
          <h1 className="font-serif text-2xl tracking-wide">CORRESPONDENCES</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "flex-col border-r border-[#8B7355] bg-[#FAF6F0] transition-all duration-300 md:flex z-10",
          isSidebarOpen ? "w-80 absolute md:relative h-full shadow-xl" : "hidden w-0"
        )}>
          <div className="p-4 border-b border-[#8B7355] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-[#1a365d] flex items-center gap-2">
                <Users className="size-5" />
                POSTCARD INBOX
              </h2>
              <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                X
              </Button>
            </div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8B7355]" />
              <Input
                placeholder="Search correspondents..."
                className="pl-9 bg-white border-[#8B7355] rounded-none focus:ring-[#D4AF37] font-serif placeholder:font-sans"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">


            <div className="px-3 py-2 text-[10px] font-bold text-[#8B7355] uppercase tracking-widest mt-4 font-mono border-b border-dashed border-[#8B7355] mb-2">
              Direct Correspondences
            </div>

            {filteredProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => { setSelectedProfile(profile); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 border-2 transition-all hover:scale-105 text-left group",
                  selectedProfile?.id === profile.id
                    ? "bg-[#FFF8DC] border-[#D4AF37] shadow-[4px_4px_0px_rgba(212,175,55,0.3)]"
                    : "bg-white border-[#8B7355] hover:border-[#D4AF37]"
                )}
              >
                <div className={cn(
                  "size-10 flex items-center justify-center border-2 transition-colors overflow-hidden",
                  selectedProfile?.id === profile.id
                    ? "border-[#1a365d]"
                    : "border-[#8B7355]"
                )}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    <UserIcon className="size-5 text-[#8B7355]" />
                  )}
                </div>
                <div className="flex-1 truncate">
                  <div className="font-serif font-bold text-[#1a365d] truncate">
                    {profile.name || profile.email?.split('@')[0] || 'Unknown User'}
                  </div>
                  <div className="text-xs font-mono text-[#8B7355] truncate">{profile.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full relative bg-[#F5EFE7] overflow-hidden">
          {/* Header */}
          <div className="h-16 border-b-2 border-[#8B7355] flex items-center px-6 gap-4 bg-[#FAF6F0] shadow-sm flex-shrink-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#E8DFC5] rounded-none border border-[#8B7355] text-[#1a365d] md:hidden"
            >
              <Users className="size-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="size-10 border-2 border-[#1a365d] flex items-center justify-center bg-white text-[#1a365d]">
                {selectedProfile ? (
                  selectedProfile.avatar_url ? (
                    <img src={selectedProfile.avatar_url} alt="" className="size-full object-cover" />
                  ) : <UserIcon className="size-5" />
                ) : <Hash className="size-5" />}
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1a365d] leading-none">
                  {selectedProfile ? (selectedProfile.name || selectedProfile.email?.split('@')[0]) : 'General Bureau'}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={cn("size-2 rounded-full", isConnected ? "bg-green-600 animate-pulse" : "bg-gray-400")} />
                  <span className="text-[10px] font-mono text-[#8B7355] uppercase">
                    {isConnected ? 'Telegraph Online' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-6">
            {isLoading && (
              <div className="flex items-center justify-center h-full text-[#8B7355] font-serif">
                <Loader2 className="size-6 animate-spin mr-2" />
                Fetching correspondences...
              </div>
            )}

            {!isLoading && sortedMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-60">
                <div className="size-20 border-4 border-[#8B7355] bg-[#FAF6F0] flex items-center justify-center mb-4 transform rotate-3 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
                  <Send className="size-8 text-[#8B7355]" />
                </div>
                <p className="font-serif text-lg text-[#5C4033]">No postcards yet</p>
                <p className="font-mono text-xs text-[#8B7355]">Be the first to write!</p>
              </div>
            )}

            {!isLoading && sortedMessages.map((message, index) => {
              const prevMessage = index > 0 ? sortedMessages[index - 1] : null
              const showHeader = !prevMessage || prevMessage.user.id !== message.user.id
              const isOwn = message.user.id === user?.id

              return (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-md w-full",
                    isOwn ? "ml-auto" : "mr-auto"
                  )}
                  style={{ transform: `rotate(${isOwn ? -1 : 1}deg)` }}
                >
                  <div className={cn(
                    "relative border-4 p-5 shadow-[8px_8px_0px_rgba(0,0,0,0.15)] transition-transform hover:scale-[1.01]",
                    isOwn
                      ? "bg-[#FFF8DC] border-[#D4AF37]"
                      : "bg-white border-[#8B7355]"
                  )}>
                    {/* Stamp */}
                    <div
                      className={cn(
                        "absolute w-10 h-10 border-2 top-3 right-3 flex items-center justify-center bg-white transform rotate-6",
                        isOwn ? "border-[#DC143C]" : "border-[#1a365d]"
                      )}
                    >
                      <div className="text-[8px] font-serif font-bold text-center leading-tight">
                        {isOwn ? "AIR\nMAIL" : "POST"}
                      </div>
                    </div>

                    {showHeader && (
                      <div className="mb-2 pr-12">
                        <span className="font-serif font-bold text-[#1a365d] text-sm block">
                          {isOwn ? "From: You" : `From: ${message.user.name}`}
                        </span>
                      </div>
                    )}

                    <div className="font-serif text-[#5C4033] text-base leading-relaxed" style={{ fontFamily: "'Dancing Script', cursive" }}>
                      {message.content}
                    </div>

                    <div className="mt-3 pt-2 border-t border-dashed border-[#8B7355]/50 flex justify-end">
                      <span className="font-mono text-[10px] text-[#8B7355]">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Input */}
          <div className="p-4 bg-[#FAF6F0] border-t-4 border-[#D4AF37] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
            <form
              onSubmit={handleSendMessage}
              className="flex items-end gap-3 max-w-4xl mx-auto w-full"
            >
              <div className="relative flex-1 group">
                <div className="absolute top-0 right-0 p-2 pointer-events-none">
                  <div className="w-8 h-8 border border-[#DC143C] opacity-20 rotate-12" />
                </div>
                <Input
                  className="pr-12 md:py-6 py-4 rounded-none border-2 border-[#8B7355] bg-white focus:bg-[#FFF8DC] focus:border-[#D4AF37] transition-all font-serif text-lg placeholder:font-sans placeholder:text-sm"
                  placeholder={selectedProfile ? `Write to @${selectedProfile.name || 'User'}...` : "Write to everyone..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!isConnected}
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                />
              </div>
              <Button
                size="icon"
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className={cn(
                  "h-12 w-12 rounded-none border-2 border-[#1a365d] shadow-[4px_4px_0px_rgba(26,54,93,0.3)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(26,54,93,0.3)] transition-all",
                  newMessage.trim() ? "bg-[#1a365d] text-[#D4AF37]" : "bg-[#8B7355] text-[#FAF6F0] border-[#8B7355] opacity-80"
                )}
              >
                <Send className="size-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>

  )
}
