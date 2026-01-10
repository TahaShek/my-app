"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface WishlistToggleProps {
  bookId: string
  initialCount?: number
}

export function WishlistToggle({ bookId, initialCount = 0 }: WishlistToggleProps) {
  const { toast } = useToast()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      setUserId(user.id)

      const { data, error } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .maybeSingle()

      if (!error && data) {
        setIsInWishlist(true)
      }
      setIsLoading(false)
    }

    checkWishlistStatus()
  }, [bookId])

  const handleToggle = async () => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please log in to add books to your wishlist.",
        variant: "default",
      })
      return
    }

    setIsToggling(true)
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error: deleteError } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", userId)
          .eq("book_id", bookId)

        if (deleteError) throw deleteError

        // Update count in books table
        await supabase.from("books")
          .update({ wishlist_count: Math.max(0, count - 1) })
          .eq("id", bookId)

        setIsInWishlist(false)
        setCount(prev => Math.max(0, prev - 1))
      } else {
        // Add to wishlist
        const { error: insertError } = await supabase
          .from("wishlist")
          .insert({
            user_id: userId,
            book_id: bookId
          })

        if (insertError) throw insertError

         // Update count in books table
         await supabase.from("books")
           .update({ wishlist_count: count + 1 })
           .eq("id", bookId)

        setIsInWishlist(true)
        setCount(prev => prev + 1)
        toast({
          title: "Added",
          description: "Book added to your wishlist bureau.",
          variant: "vintage",
        })
      }
    } catch (err: any) {
      console.error("Wishlist toggle error:", err)
      toast({
        title: "Error",
        description: "Could not update your wishlist status.",
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full h-12 gap-2 bg-transparent disabled:opacity-50" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  return (
    <Button 
      variant="outline" 
      className={cn(
        "w-full h-12 gap-2 transition-all duration-300",
        isInWishlist ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-300" : "bg-transparent"
      )}
      onClick={handleToggle}
      disabled={isToggling}
    >
      <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
      {isToggling ? "Updating..." : isInWishlist ? "In Wishlist" : "Add to Wishlist"}
    </Button>
  )
}
