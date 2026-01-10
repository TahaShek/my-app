"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Flag, MessageSquare } from "lucide-react"

interface Discussion {
  id: string
  username: string
  date: Date
  comment: string
  helpful: number
  isAnonymous: boolean
}

export function DiscussionsTab({ bookId }: { bookId: string }) {
  const [newComment, setNewComment] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)

  const discussions: Discussion[] = [
    {
      id: "1",
      username: "bookworm23",
      date: new Date("2024-03-12"),
      comment:
        "This book changed my perspective on life. The characters felt so real and their journey resonated deeply with me.",
      helpful: 15,
      isAnonymous: false,
    },
    {
      id: "2",
      username: "anonymous",
      date: new Date("2024-03-10"),
      comment: "A masterpiece of modern literature. Couldn't put it down once I started reading.",
      helpful: 8,
      isAnonymous: true,
    },
  ]

  const handleSubmit = () => {
    if (newComment.trim()) {
      console.log("[v0] Signing guest book:", { comment: newComment, anonymous: isAnonymous })
      setNewComment("")
      setIsAnonymous(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#FAF6F0] border-4 border-[#8B7355] p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.3)]">
        <h3 className="font-serif text-xl text-[#1a365d] mb-2 border-b-2 border-[#D4AF37] pb-2">READER'S LOUNGE</h3>
        <p className="font-serif text-sm text-[#5C4033] mb-6">Share your thoughts on this book</p>

        {/* Existing Comments */}
        <div className="space-y-4 mb-6">
          {discussions.map((entry, idx) => (
            <div
              key={entry.id}
              className="bg-white border-2 border-[#8B7355] p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.15)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-serif font-bold text-[#1a365d]">GUEST ENTRY #{47 - idx}</div>
                  <div className="font-mono text-xs text-[#8B7355] mt-1">
                    NAME:{" "}
                    {entry.isAnonymous ? (
                      <span className="inline-flex items-center">
                        ANONYMOUS READER
                        <span className="ml-2 text-[8px] border border-[#DC143C] text-[#DC143C] px-1">INCOGNITO</span>
                      </span>
                    ) : (
                      `@${entry.username}`
                    )}
                  </div>
                  <div className="font-mono text-xs text-[#8B7355]">
                    DATE:{" "}
                    {entry.date
                      .toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
                      .toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-[#8B7355] my-3" />

              <div
                className="font-serif text-[#5C4033] mb-3 leading-relaxed"
                style={{ fontFamily: "'Shadows Into Light', cursive" }}
              >
                "{entry.comment}"
              </div>

              <div className="border-t border-dashed border-[#8B7355] my-3" />

              <div className="flex items-center gap-4 text-sm">
                <button className="flex items-center gap-1 text-[#5C4033] hover:text-[#1a365d] font-serif">
                  <ThumbsUp className="w-4 h-4" />
                  {entry.helpful} Found Helpful
                </button>
                <button className="text-[#5C4033] hover:text-[#1a365d] font-serif flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  REPLY
                </button>
                <button className="text-[#DC143C] hover:text-[#8B0000] font-serif flex items-center gap-1">
                  <Flag className="w-4 h-4" />
                  FLAG
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment Form */}
        <div className="bg-[#FFF8DC] border-2 border-[#D4AF37] p-4 shadow-[4px_4px_0px_rgba(212,175,55,0.3)]">
          <h4 className="font-serif font-bold text-[#1a365d] mb-3">SIGN GUEST BOOK:</h4>

          <div className="border-t border-dashed border-[#8B7355] my-3" />

          <div className="mb-3">
            <div className="font-mono text-xs text-[#5C4033] mb-2">NAME: @YourUsername</div>
            <label className="flex items-center gap-2 font-serif text-sm text-[#5C4033]">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4"
              />
              Post as Anonymous
            </label>
          </div>

          <div className="border-t border-dashed border-[#8B7355] my-3" />

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-32 p-3 border-2 border-[#8B7355] bg-white font-serif text-[#5C4033] resize-none focus:border-[#D4AF37] focus:outline-none mb-3"
            style={{ fontFamily: "'Shadows Into Light', cursive" }}
          />

          <div className="border-t border-dashed border-[#8B7355] my-3" />

          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="w-full bg-[#1a365d] text-[#D4AF37] border-2 border-[#D4AF37] hover:bg-[#2d4a7c] font-serif"
          >
            SIGN GUEST BOOK
          </Button>
        </div>
      </div>
    </div>
  )
}
