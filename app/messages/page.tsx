"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, Mail } from "lucide-react"

interface Message {
  id: string
  from: string
  content: string
  timestamp: Date
  sent: boolean
}

interface Conversation {
  id: string
  user: string
  lastMessage: string
  timestamp: Date
  unread: boolean
}

export default function MessagesPage() {
  const [selectedConvo, setSelectedConvo] = useState<string>("user1")
  const [newMessage, setNewMessage] = useState("")

  const conversations: Conversation[] = [
    {
      id: "user1",
      user: "@bookworm23",
      lastMessage: "Thanks for the book!",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unread: true,
    },
    {
      id: "user2",
      user: "@literature_lover",
      lastMessage: "Book arrived safely!",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unread: false,
    },
    {
      id: "user3",
      user: "@reading_enthusiast",
      lastMessage: "When can we meet?",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      unread: false,
    },
  ]

  const messages: Message[] = [
    {
      id: "1",
      from: "you",
      content:
        "Hi! I'd love to exchange books with you. The book looks amazing and I've been wanting to read it for a while.",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      sent: true,
    },
    {
      id: "2",
      from: selectedConvo,
      content: "Would love to exchange. When works for you? I'm free this weekend.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      sent: false,
    },
    {
      id: "3",
      from: "you",
      content: "Saturday afternoon at Central Library? Around 2pm?",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      sent: true,
    },
  ]

  const handleSend = () => {
    if (newMessage.trim()) {
      console.log("[v0] Sending postcard:", newMessage)
      setNewMessage("")
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <div className="inline-block bg-[#1a365d] text-[#D4AF37] px-6 py-3 border-4 border-[#D4AF37]">
            <Mail className="inline-block w-6 h-6 mr-2" />
            <h1 className="inline-block font-serif text-2xl">CORRESPONDENCES</h1>
          </div>
          <p className="mt-2 font-serif text-[#5C4033]">Postcard Exchange Bureau</p>
        </div>

        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          {/* Conversation List */}
          <div className="bg-[#FAF6F0] border-4 border-[#8B7355] p-4 shadow-[8px_8px_0px_rgba(0,0,0,0.3)]">
            <h2 className="font-serif text-lg mb-4 text-[#1a365d] border-b-2 border-[#D4AF37] pb-2">POSTCARD INBOX</h2>
            <div className="space-y-3">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConvo(convo.id)}
                  className={`w-full text-left p-3 border-2 transition-all hover:scale-105 ${
                    selectedConvo === convo.id
                      ? "bg-[#FFF8DC] border-[#D4AF37] shadow-[4px_4px_0px_rgba(212,175,55,0.3)]"
                      : "bg-white border-[#8B7355] hover:border-[#D4AF37]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-serif font-bold text-[#1a365d]">{convo.user}</div>
                      <div className="text-sm font-serif text-[#5C4033] truncate">{convo.lastMessage}</div>
                    </div>
                    {convo.unread && <div className="w-3 h-3 bg-[#DC143C] rounded-full ml-2 mt-1" />}
                  </div>
                  <div className="text-xs font-mono text-[#8B7355] mt-1">
                    {convo.timestamp.toLocaleString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Thread */}
          <div className="space-y-6">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`${msg.sent ? "ml-auto" : "mr-auto"} max-w-md`}
                  style={{ transform: `rotate(${msg.sent ? -2 + idx : 2 - idx}deg)` }}
                >
                  {/* Postcard */}
                  <div
                    className={`relative border-4 p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.2)] ${
                      msg.sent ? "bg-[#FFF8DC] border-[#D4AF37]" : "bg-white border-[#8B7355]"
                    }`}
                  >
                    {/* Postage Stamp */}
                    <div
                      className={`absolute w-12 h-12 border-2 ${
                        msg.sent ? "border-[#DC143C]" : "border-[#1a365d]"
                      } top-4 right-4 bg-white flex items-center justify-center transform rotate-6`}
                    >
                      <div className="text-xs font-serif text-center">
                        <div className="font-bold">{msg.sent ? "SENT" : "RECD"}</div>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="pr-16">
                      <div className="font-serif text-sm text-[#1a365d] mb-2">
                        {msg.sent ? "To: " : "From: "}
                        <span className="font-bold">{msg.sent ? selectedConvo : msg.from}</span>
                      </div>
                      <div
                        className="font-serif text-[#5C4033] mb-4"
                        style={{ fontFamily: "'Dancing Script', cursive" }}
                      >
                        {msg.content}
                      </div>
                      <div className="border-t-2 border-dashed border-[#8B7355] pt-2 mt-4">
                        <div className="text-xs font-mono text-[#8B7355]">
                          {msg.timestamp.toLocaleString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compose Postcard */}
            <div className="bg-[#FFF8DC] border-4 border-[#D4AF37] p-6 shadow-[8px_8px_0px_rgba(212,175,55,0.3)]">
              <h3 className="font-serif text-lg text-[#1a365d] mb-4">COMPOSE POSTCARD</h3>

              {/* Postage Stamp Icon */}
              <div className="absolute w-10 h-10 border-2 border-[#DC143C] bg-white top-4 right-4 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#DC143C]" />
              </div>

              <div className="mb-4">
                <div className="font-serif text-sm text-[#5C4033] mb-2">
                  Dear <span className="font-bold">@{selectedConvo}</span>,
                </div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write your message here..."
                  maxLength={140}
                  className="w-full h-32 p-3 border-2 border-[#8B7355] bg-white font-serif text-[#5C4033] resize-none focus:border-[#D4AF37] focus:outline-none"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                />
                <div className="text-xs font-mono text-[#8B7355] mt-1">{newMessage.length}/140 characters</div>
              </div>

              <div className="flex items-center justify-between border-t-2 border-dashed border-[#8B7355] pt-4">
                <div className="font-serif text-sm text-[#5C4033]">
                  Best regards,
                  <br />
                  <span className="font-bold">- @YourUsername</span>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="bg-[#1a365d] text-[#D4AF37] border-2 border-[#D4AF37] hover:bg-[#2d4a7c] font-serif px-6 py-2"
                >
                  <Send className="w-4 h-4 mr-2" />
                  SEND POSTCARD
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
