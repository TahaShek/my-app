"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Flag, MessageSquare, Loader2, ChevronDown, ChevronUp, Reply, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface DiscussionReply {
  id: string
  discussion_id: string
  username: string
  user_id: string | null
  content: string
  upvotes: number
  created_at: string
}

interface Discussion {
  id: string
  username: string
  user_id: string | null
  content: string
  upvotes: number
  created_at: string
  book_id: string
  replies?: DiscussionReply[]
}

type SupabasePayload = {
  new: any
  old?: any
  eventType?: string
  schema: string
  table: string
  commit_timestamp?: string
  errors?: any[]
}

export function DiscussionsTab({ bookId }: { bookId: string }) {
  const [newComment, setNewComment] = useState("")
  const [newReplies, setNewReplies] = useState<Record<string, string>>({})
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})
  const replyRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  // Fetch discussions with replies
  const fetchDiscussions = useCallback(async () => {
    const { data: discussionsData, error: discussionsError } = await supabase
      .from("discussions")
      .select("*")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false })

    if (discussionsError) {
      console.error("Error fetching discussions:", discussionsError)
      return
    }

    if (discussionsData && discussionsData.length > 0) {
      // Fetch replies for all discussions
      const { data: repliesData, error: repliesError } = await supabase
        .from("discussion_replies")
        .select("*")
        .in("discussion_id", discussionsData.map((d: { id: any }) => d.id))
        .order("created_at", { ascending: true })

      if (repliesError) {
        console.error("Error fetching replies:", repliesError)
      }

      // Group replies by discussion_id
      const repliesByDiscussion: Record<string, DiscussionReply[]> = {}
      if (repliesData) {
        repliesData.forEach((reply: DiscussionReply) => {
          if (!repliesByDiscussion[reply.discussion_id]) {
            repliesByDiscussion[reply.discussion_id] = []
          }
          repliesByDiscussion[reply.discussion_id].push(reply)
        })
      }

      // Combine discussions with their replies
      const discussionsWithReplies: Discussion[] = discussionsData.map((discussion: Discussion) => ({
        ...discussion,
        replies: repliesByDiscussion[discussion.id] || []
      }))

      setDiscussions(discussionsWithReplies)
    } else {
      setDiscussions([])
    }
  }, [bookId])

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      await fetchDiscussions()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        setCurrentUser(profile)
      }
      setIsLoading(false)
    }
    
    loadInitialData()
  }, [bookId, fetchDiscussions])

  // Real-time subscription for discussions
  useEffect(() => {
    const channel = supabase
      .channel(`discussions:${bookId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "discussions",
          filter: `book_id=eq.${bookId}`,
        },
        (payload: SupabasePayload) => {
          // Add new discussion with empty replies array
          const newDiscussion: Discussion = {
            ...payload.new as Discussion,
            replies: []
          }
          setDiscussions(prev => [newDiscussion, ...prev])
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "discussions",
          filter: `book_id=eq.${bookId}`,
        },
        (payload: SupabasePayload) => {
          // Update specific discussion
          setDiscussions(prev =>
            prev.map(discussion =>
              discussion.id === payload.new.id
                ? { ...discussion, ...payload.new }
                : discussion
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookId])

  // Real-time subscription for replies
  useEffect(() => {
    const channel = supabase
      .channel(`discussion_replies:${bookId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "discussion_replies",
        },
        async (payload: SupabasePayload) => {
          const newReply = payload.new as DiscussionReply
          
          // Check if this reply belongs to a discussion in our current list
          const discussion = discussions.find(d => d.id === newReply.discussion_id)
          if (discussion) {
            // Add reply to the discussion
            setDiscussions(prev =>
              prev.map(discussion =>
                discussion.id === newReply.discussion_id
                  ? {
                      ...discussion,
                      replies: [...(discussion.replies || []), newReply]
                    }
                  : discussion
              )
            )
          } else {
            // If discussion not in current list, refetch to be safe
            await fetchDiscussions()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookId, discussions, fetchDiscussions])

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)

    const username = isAnonymous ? "ANONYMOUS READER" : (currentUser?.username || "Guest")
    const userId = currentUser?.id || null

    const { error } = await supabase.from("discussions").insert({
      book_id: bookId,
      user_id: userId,
      username: username,
      content: newComment.trim(),
    })

    if (error) {
      console.error("Error submitting discussion:", error)
      // alert("Failed to submit. Please try again.")
      fetchDiscussions()
    } else {
      setNewComment("")
      setIsAnonymous(false)
    }
    setIsSubmitting(false)
  }

  const handleReply = async (discussionId: string) => {
    const replyContent = newReplies[discussionId]
    if (!replyContent?.trim()) return

    const username = isAnonymous ? "ANONYMOUS READER" : (currentUser?.username || "Guest")
    const userId = currentUser?.id || null

    // Optimistically add reply
    const optimisticReply: DiscussionReply = {
      id: `temp_${Date.now()}`,
      discussion_id: discussionId,
      username,
      user_id: userId,
      content: replyContent.trim(),
      upvotes: 0,
      created_at: new Date().toISOString()
    }

    setDiscussions(prev =>
      prev.map(discussion =>
        discussion.id === discussionId
          ? {
              ...discussion,
              replies: [...(discussion.replies || []), optimisticReply]
            }
          : discussion
      )
    )

    // Clear reply input
    setNewReplies(prev => ({ ...prev, [discussionId]: "" }))
    setReplyingTo(null)

    // Submit to database
    const { error } = await supabase.from("discussion_replies").insert({
      discussion_id: discussionId,
      user_id: userId,
      username: username,
      content: replyContent.trim(),
    })

    if (error) {
      console.error("Error submitting reply:", error)
      // alert("Failed to submit reply. Please try again.")
      // Remove optimistic reply on error
      setDiscussions(prev =>
        prev.map(discussion =>
          discussion.id === discussionId
            ? {
                ...discussion,
                replies: (discussion.replies || []).filter(r => r.id !== optimisticReply.id)
              }
            : discussion
        )
      )
      fetchDiscussions()
    }
  }

  const handleUpvote = async (id: string, currentUpvotes: number, isReply: boolean = false) => {
    const { error } = await supabase
      .from(isReply ? "discussion_replies" : "discussions")
      .update({ upvotes: currentUpvotes + 1 })
      .eq("id", id)

    if (error) {
      console.error("Error upvoting:", error)
    }
  }

  const handleFlag = async (id: string, isReply: boolean = false) => {
    // Implement flagging logic here
    // alert(`${isReply ? 'Reply' : 'Comment'} has been flagged for review.`)
  }

  const toggleReplies = (discussionId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [discussionId]: !prev[discussionId]
    }))
  }

  const startReply = (discussionId: string) => {
    setReplyingTo(discussionId)
    // Focus the textarea after a small delay
    setTimeout(() => {
      replyRefs.current[discussionId]?.focus()
    }, 100)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#FAF6F0] border-4 border-[#8B7355] p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.3)]">
        <h3 className="font-serif text-xl text-[#1a365d] mb-2 border-b-2 border-[#D4AF37] pb-2">
          READER&apos;S LOUNGE
          {discussions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-[#5C4033]">
              • Live updates active
            </span>
          )}
        </h3>
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
            discussions.map((entry, idx) => {
              const hasReplies = entry.replies && entry.replies.length > 0
              const isExpanded = expandedReplies[entry.id] || false
              
              return (
                <div
                  key={entry.id}
                  className="bg-white border-2 border-[#8B7355] p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.15)]"
                >
                  {/* Main Comment */}
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
                    &quot;{entry.content}&quot;
                  </div>

                  <div className="border-t border-dashed border-[#8B7355] my-3" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={() => handleUpvote(entry.id, entry.upvotes, false)}
                        className="flex items-center gap-1 text-[#5C4033] hover:text-[#1a365d] font-serif transition-colors hover:scale-105 active:scale-95"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {entry.upvotes} Found Helpful
                      </button>
                      <button 
                        onClick={() => startReply(entry.id)}
                        className="text-[#5C4033] hover:text-[#1a365d] font-serif flex items-center gap-1 hover:scale-105 active:scale-95"
                      >
                        <Reply className="w-4 h-4" />
                        REPLY
                      </button>
                      <button 
                        onClick={() => handleFlag(entry.id, false)}
                        className="text-[#DC143C] hover:text-[#8B0000] font-serif flex items-center gap-1 hover:scale-105 active:scale-95"
                      >
                        <Flag className="w-4 h-4" />
                        FLAG
                      </button>
                    </div>
                    
                    {hasReplies && (
                      <button
                        onClick={() => toggleReplies(entry.id)}
                        className="text-sm text-[#5C4033] hover:text-[#1a365d] font-serif flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide {entry.replies?.length} {entry.replies?.length === 1 ? 'reply' : 'replies'}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show {entry.replies?.length} {entry.replies?.length === 1 ? 'reply' : 'replies'}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Reply Input */}
                  {replyingTo === entry.id && (
                    <div className="mt-4 pl-4 border-l-2 border-[#D4AF37]">
                      <div className="mb-2">
                        <div className="font-mono text-xs text-[#5C4033] mb-1 font-bold">
                          REPLY AS: @{isAnonymous ? "ANONYMOUS READER" : (currentUser?.username || "Guest")}
                        </div>
                      </div>
 <textarea
  ref={el => {
    replyRefs.current[entry.id] = el;
  }}
  value={newReplies[entry.id] || ""}
  onChange={(e) => setNewReplies(prev => ({ ...prev, [entry.id]: e.target.value }))}
  placeholder="Write your reply..."
  className="w-full h-20 p-3 border-2 border-[#8B7355] bg-white font-serif text-[#5C4033] resize-none focus:border-[#D4AF37] focus:outline-none mb-2"
  style={{ fontFamily: "'Shadows Into Light', cursive" }}
/>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleReply(entry.id)}
                          disabled={!newReplies[entry.id]?.trim()}
                          className="bg-[#1a365d] text-[#D4AF37] border-2 border-[#D4AF37] hover:bg-[#2d4a7c] font-serif px-4"
                        >
                          POST REPLY
                        </Button>
                        <Button
                          onClick={cancelReply}
                          variant="outline"
                          className="font-serif px-4"
                        >
                          <X className="w-4 h-4 mr-2" />
                          CANCEL
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies Section */}
                  {isExpanded && hasReplies && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-[#8B7355]">
                      {entry.replies?.map((reply) => (
                        <div
                          key={reply.id}
                          className={cn(
                            "bg-[#FAF8F3] border border-[#8B7355] p-3",
                            reply.id.startsWith('temp_') && "opacity-75 animate-pulse"
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-mono text-xs text-[#8B7355]">
                                REPLY BY:{" "}
                                {reply.username === "ANONYMOUS READER" ? (
                                  <span className="inline-flex items-center">
                                    ANONYMOUS READER
                                    <span className="ml-1 text-[7px] border border-[#DC143C] text-[#DC143C] px-1">INCOGNITO</span>
                                  </span>
                                ) : (
                                  `@${reply.username}`
                                )}
                              </div>
                              <div className="font-mono text-[10px] text-[#8B7355]">
                                {new Date(reply.created_at)
                                  .toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
                                  .toUpperCase()}
                              </div>
                            </div>
                          </div>

                          <div
                            className="font-serif text-[#5C4033] mb-2 text-sm leading-relaxed"
                            style={{ fontFamily: "'Shadows Into Light', cursive" }}
                          >
                            &quot;{reply.content}&quot;
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <button
                              onClick={() => handleUpvote(reply.id, reply.upvotes, true)}
                              disabled={reply.id.startsWith('temp_')}
                              className="flex items-center gap-1 text-[#5C4033] hover:text-[#1a365d] font-serif transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              {reply.upvotes}
                            </button>
                            <button 
                              onClick={() => handleFlag(reply.id, true)}
                              disabled={reply.id.startsWith('temp_')}
                              className="text-[#DC143C] hover:text-[#8B0000] font-serif flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Flag className="w-3 h-3" />
                              FLAG
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Add New Comment Form */}
        <div className="bg-[#FFF8DC] border-2 border-[#D4AF37] p-4 shadow-[4px_4px_0px_rgba(212,175,55,0.3)]">
          <h4 className="font-serif font-bold text-[#1a365d] mb-3">SIGN GUEST BOOK:</h4>

          <div className="border-t border-dashed border-[#8B7355] my-3" />

          <div className="mb-3">
            <div className="font-mono text-xs text-[#5C4033] mb-2 font-bold">
              NAME: @{isAnonymous ? "ANONYMOUS READER" : "ANONYMOUS"}

            </div>
            {currentUser && (
              <label className="flex items-center gap-2 font-serif text-sm text-[#5C4033] cursor-pointer hover:text-[#1a365d]">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-[#1a365d] cursor-pointer"
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
            className="w-full h-32 p-3 border-2 border-[#8B7355] bg-white font-serif text-[#5C4033] resize-none focus:border-[#D4AF37] focus:outline-none mb-3 transition-colors"
            style={{ fontFamily: "'Shadows Into Light', cursive" }}
          />

          <div className="border-t border-dashed border-[#8B7355] my-3" />

          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            className="w-full bg-[#1a365d] text-[#D4AF37] border-2 border-[#D4AF37] hover:bg-[#2d4a7c] font-serif h-12 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                SIGNING...
              </>
            ) : (
              "SIGN GUEST BOOK"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}