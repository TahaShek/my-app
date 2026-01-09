import { cn } from '@/lib/utils'
import { ChatMessageItem } from '@/components/chat-message'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import {
  type ChatMessage,
  useRealtimeChat,
} from '@/hooks/use-realtime-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, User as UserIcon, Users, Search, Hash, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getProfiles } from '@/lib/chat-db'
import type { Profile } from '@/lib/types/database'
import { supabase } from '@/lib/supabase/client'
import { handleForegroundMessage } from '@/lib/push'
import { messaging } from '@/lib/firebase'

export const RealtimeChat = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const currentRoomName = useMemo(() => {
    if (!selectedProfile) return 'general'
    // Temporary convention until we have the ID. 
    // Wait, we need the currentUser ID to make the direct room name.
    // The hook will resolve the roomId anyway.
    return 'loading'
  }, [selectedProfile])

  // We better handle the room switching logic inside the component 
  // and pass the correct roomName to the hook.
  // But the hook needs the roomName immediately.

  // Let's first get all profiles and the current user to form the correct room name
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
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={cn(
        "flex-col border-r bg-muted/30 transition-all duration-300",
        isSidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Chats
            </h2>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search users..."
              className="pl-9 bg-background/50 border-muted-foreground/20 rounded-xl h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
          <button
            onClick={() => setSelectedProfile(null)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-muted group text-left",
              !selectedProfile && "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
            )}
          >
            <div className={cn(
              "size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-colors",
              !selectedProfile && "bg-primary text-primary-foreground"
            )}>
              <Hash className="size-5" />
            </div>
            <div className="flex-1 truncate">
              <div className="font-semibold text-sm">General Room</div>
              <div className="text-xs text-muted-foreground truncate">Global conversation</div>
            </div>
          </button>

          <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4 mb-1">
            Direct Messages
          </div>

          {filteredProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-muted group text-left",
                selectedProfile?.id === profile.id && "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
              )}
            >
              <div className={cn(
                "size-10 rounded-xl bg-muted border flex items-center justify-center text-muted-foreground transition-all group-hover:scale-105",
                selectedProfile?.id === profile.id && "bg-primary text-primary-foreground border-primary"
              )}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="size-full object-cover rounded-xl" />
                ) : (
                  <UserIcon className="size-5" />
                )}
              </div>
              <div className="flex-1 truncate">
                <div className="font-semibold text-sm truncate">
                  {profile.name || profile.email?.split('@')[0] || 'Unknown User'}
                </div>
                <div className="text-xs text-muted-foreground truncate">{profile.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <div className="h-16 border-b flex items-center px-6 gap-4 bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg text-muted-foreground"
          >
            <Users className="size-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {selectedProfile ? (
                selectedProfile.avatar_url ? (
                  <img src={selectedProfile.avatar_url} alt="" className="size-full object-cover rounded-xl" />
                ) : <UserIcon className="size-5" />
              ) : <Hash className="size-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {selectedProfile ? (selectedProfile.name || selectedProfile.email?.split('@')[0]) : 'General Room'}
              </h3>
              <div className="flex items-center gap-1.5">
                <div className={cn("size-2 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30")} />
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <Loader2 className="size-5 animate-spin mr-2" />
              Loading messages...
            </div>
          )}

          {!isLoading && sortedMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-50 grayscale">
              <div className="size-16 rounded-3xl bg-muted flex items-center justify-center mb-4">
                <Send className="size-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs">Start a conversation to see it here</p>
            </div>
          )}

          {!isLoading && sortedMessages.map((message, index) => {
            const prevMessage = index > 0 ? sortedMessages[index - 1] : null
            const showHeader = !prevMessage || prevMessage.user.id !== message.user.id

            return (
              <ChatMessageItem
                key={message.id}
                message={message}
                isOwnMessage={message.user.id === user?.id}
                showHeader={showHeader}
              />
            )
          })}
        </div>

        {/* Input */}
        <div className="p-4 bg-background">
          <form
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 max-w-4xl mx-auto w-full group"
          >
            <div className="relative flex-1">
              <Input
                className="pr-12 py-6 rounded-2xl bg-muted/50 border-muted-foreground/10 focus:bg-background transition-all"
                placeholder={selectedProfile ? `Message ${selectedProfile.name || 'User'}...` : "Message in #general"}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!isConnected}
              />
              <div className="absolute right-2 bottom-2">
                <Button
                  size="icon"
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className={cn(
                    "size-8 rounded-xl transition-all active:scale-95",
                    newMessage.trim() ? "bg-primary opacity-100" : "bg-muted opacity-0 translate-y-1"
                  )}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
