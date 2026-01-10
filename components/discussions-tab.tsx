"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Flag, MessageSquare, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface Discussion {
  id: string
  username: string
  user_id: string | null
  content: string
  upvotes: number
  created_at: string
}

export function DiscussionsTab({ bookId }: { bookId: string }) {
  const [newComment, setNewComment] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const fetchDiscussions = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("discussions")
      .select("*")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching discussions:", error)
    } else {
      setDiscussions(data || [])
    }
    setIsLoading(false)
  }, [bookId])

  useEffect(() => {
    fetchDiscussions()

    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        setCurrentUser(profile)
      }
    }
    getUser()

    // Real-time subscription
    const channel = supabase
      .channel("discussions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "discussions",
          filter: `book_id=eq.${bookId}`,
        },
        () => {
          fetchDiscussions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookId, fetchDiscussions])

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)

    const username = isAnonymous ? "ANONYMOUS READER" : (currentUser?.username || "Guest")
    const userId = isAnonymous ? null : (currentUser?.id || null)

    const { error } = await supabase.from("discussions").insert({
      book_id: bookId,
      user_id: userId,
      username: username,
      content: newComment.trim(),
    })

    if (error) {
      console.error("Error submitting discussion:", error)
      alert("Failed to submit. Please try again.")
    } else {
      setNewComment("")
      setIsAnonymous(false)
    }
    setIsSubmitting(false)
  }

  const handleUpvote = async (discussionId: string, currentUpvotes: number) => {
    const { error } = await supabase
      .from("discussions")
      .update({ upvotes: currentUpvotes + 1 })
      .eq("id", discussionId)

    if (error) {
      console.error("Error upvoting:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#FAF6F0] border-4 border-[#8B7355] p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.3)]">
        <h3 className="font-serif text-xl text-[#1a365d] mb-2 border-b-2 border-[#D4AF37] pb-2">READER'S LOUNGE</h3>
        <p className="font-serif text-sm text-[#5C4033] mb-6">Share your thoughts on this book</p>

        {/* Existing Comments */}
        <div className="space-y-4 mb-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#8B7355]" />
            </div>
          ) : discussions.length === 0 ? (
            <p className="text-center font-serif text-[#5C4033] py-8 border-2 border-dashed border-[#8B7355]">
              No entries yet. Be the first to sign the guest book!
            </p>
          ) : (
            discussions.map((entry, idx) => (
              <div
                key={entry.id}
                className="bg-white border-2 border-[#8B7355] p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.15)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-serif font-bold text-[#1a365d]">GUEST ENTRY #{discussions.length - idx}</div>
                    <div className="font-mono text-xs text-[#8B7355] mt-1">
                      NAME:{" "}
                      {entry.username === "ANONYMOUS READER" ? (
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
                      {new Date(entry.created_at)
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
                  "{entry.content}"
                </div>

                <div className="border-t border-dashed border-[#8B7355] my-3" />

                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleUpvote(entry.id, entry.upvotes)}
                    className="flex items-center gap-1 text-[#5C4033] hover:text-[#1a365d] font-serif transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {entry.upvotes} Found Helpful
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
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <div className="bg-[#FFF8DC] border-2 border-[#D4AF37] p-4 shadow-[4px_4px_0px_rgba(212,175,55,0.3)]">
          <h4 className="font-serif font-bold text-[#1a365d] mb-3">SIGN GUEST BOOK:</h4>

          <div className="border-t border-dashed border-[#8B7355] my-3" />

          <div className="mb-3">
            <div className="font-mono text-xs text-[#5C4033] mb-2 font-bold">
              NAME: @{isAnonymous ? "ANONYMOUS READER" : (currentUser?.username || "Guest")}
            </div>
            {currentUser && (
              <label className="flex items-center gap-2 font-serif text-sm text-[#5C4033] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-[#1a365d]"
                />
                Post as Anonymous
              </label>
            )}
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
            disabled={!newComment.trim() || isSubmitting}
            className="w-full bg-[#1a365d] text-[#D4AF37] border-2 border-[#D4AF37] hover:bg-[#2d4a7c] font-serif h-12"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : "SIGN GUEST BOOK"}
          </Button>
        </div>
      </div>
    </div>
  )
}
