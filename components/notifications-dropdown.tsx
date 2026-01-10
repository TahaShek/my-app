"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const channel = supabase
        .channel(`notifications-${session.user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
          () => fetchNotifications()
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const unsubPromise = setupRealtime()
    return () => {
      unsubPromise.then(unsub => unsub?.())
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching notifications:", error)
      } else {
        setNotifications(data || [])
      }
    } catch (err) {
      console.error("Notif fetch err:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(notifications.filter((n) => n.id !== id))
    await supabase.from("notifications").delete().eq("id", id)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHrs = Math.floor(diffInMs / (1000 * 60 * 60))
    
    if (diffInHrs < 1) return "JUST NOW"
    if (diffInHrs < 24) return `${diffInHrs}H AGO`
    return `${Math.floor(diffInHrs / 24)}D AGO`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#D4AF37] hover:text-[#FFD700] transition-colors"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#DC143C] border-2 border-[#D4AF37] rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">{notifications.length}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-[#FFF8DC] border-4 border-[#8B7355] shadow-[8px_8px_0px_rgba(0,0,0,0.3)] z-50 max-h-[80vh] overflow-y-auto">
            <div className="bg-[#1a365d] text-[#D4AF37] p-3 border-b-4 border-[#D4AF37]">
              <h3 className="font-serif text-lg font-bold">TELEGRAM MESSAGES</h3>
            </div>

            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 text-[#1a365d] animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 font-serif text-[#5C4033]">NO NEW TELEGRAMS</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="bg-[#FFFACD] border-2 border-[#8B7355] p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.15)]"
                  >
                    <div className="text-center font-mono text-xs text-[#1a365d] mb-2 uppercase">••• {notif.type || 'TELEGRAM'} •••</div>
                    <div className="border-b border-dashed border-[#8B7355] mb-2" />
                    <div className="font-mono text-xs text-[#5C4033] space-y-1 mb-2">
                       <div className="font-bold text-[#1a365d] uppercase">{notif.title}</div>
                      <div>DATE: {formatTime(notif.created_at)}</div>
                    </div>
                    <div className="border-b border-dashed border-[#8B7355] my-2" />
                    <div className="font-mono text-sm text-[#1a365d] mb-3 leading-relaxed uppercase">{notif.message} STOP</div>
                    <div className="border-b border-dashed border-[#8B7355] my-2" />
                    <div className="flex gap-2">
                      {notif.link && (
                        <Button
                          asChild
                          size="sm"
                          className="flex-1 bg-[#1a365d] text-[#D4AF37] border border-[#D4AF37] hover:bg-[#2d4a7c] font-serif text-xs"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href={notif.link}>VIEW</Link>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={(e) => handleDismiss(notif.id, e)}
                        className="flex-1 bg-white text-[#5C4033] border border-[#8B7355] hover:bg-[#F5EFE7] font-serif text-xs"
                      >
                        DISMISS
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
