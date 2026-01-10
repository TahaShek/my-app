"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

interface Notification {
  id: string
  from: string
  time: string
  message: string
  type: "request" | "system" | "message"
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      from: "@bookworm23",
      time: "2H AGO",
      message: "EXCHANGE REQUEST RECEIVED STOP REVIEW NOW STOP",
      type: "request",
    },
    {
      id: "2",
      from: "SYSTEM",
      time: "5H AGO",
      message: "BOOK EXCHANGED SUCCESSFULLY STOP PLUS 150 POINTS STOP",
      type: "system",
    },
    {
      id: "3",
      from: "@literature_lover",
      time: "1D AGO",
      message: "NEW MESSAGE RECEIVED STOP CHECK CORRESPONDENCES STOP",
      type: "message",
    },
  ])

  const handleDismiss = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
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
              {notifications.length === 0 ? (
                <div className="text-center py-8 font-serif text-[#5C4033]">NO NEW TELEGRAMS</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="bg-[#FFFACD] border-2 border-[#8B7355] p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.15)]"
                  >
                    <div className="text-center font-mono text-xs text-[#1a365d] mb-2">••• TELEGRAM •••</div>
                    <div className="border-b border-dashed border-[#8B7355] mb-2" />
                    <div className="font-mono text-xs text-[#5C4033] space-y-1 mb-2">
                      <div>FROM: {notif.from}</div>
                      <div>TIME: {notif.time}</div>
                    </div>
                    <div className="border-b border-dashed border-[#8B7355] my-2" />
                    <div className="font-mono text-sm text-[#1a365d] mb-3 leading-relaxed">{notif.message}</div>
                    <div className="border-b border-dashed border-[#8B7355] my-2" />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-[#1a365d] text-[#D4AF37] border border-[#D4AF37] hover:bg-[#2d4a7c] font-serif text-xs"
                      >
                        VIEW
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDismiss(notif.id)}
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
