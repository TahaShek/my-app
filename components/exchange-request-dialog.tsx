"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, MapPin, Loader2, AlertTriangle, ExternalLink } from "lucide-react"
import type { Book } from "@/types/book"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface ExchangeRequestDialogProps {
  book: Book & { exchange_point?: { name: string; address: string; city: string; latitude: number; longitude: number } }
  trigger?: React.ReactNode
}

export function ExchangeRequestDialog({ book, trigger }: ExchangeRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error("Please log in to request an exchange")
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", session.user.id)
        .single()
      
      if (profile && profile.points < book.pointValue) {
        // throw new Error(
        //   // `Insufficient points. You need ${book.pointValue} PTS, but only have ${profile.points} PTS.`
        // )
      }

      // Create exchange request (NO meeting_location needed)
      const { data: newRequest, error: insertError } = await supabase
        .from("exchange_requests")
        .insert({
          book_id: book.id,
          owner_id: book.ownerId,
          requester_id: session.user.id,
          message: message,
          status: "pending"
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(`Failed to create request: ${insertError.message}`)
      }

      const requesterName = session.user.user_metadata?.full_name || 
                           session.user.user_metadata?.name || 
                           session.user.email?.split('@')[0] ||
                           "Someone"

      // Create notification
      await supabase
        .from("notifications")
        .insert({
          user_id: book.ownerId,
          type: "request",
          title: "New Exchange Request",
          message: `${requesterName} requested "${book.title}"`,
          link: "/dashboard?tab=incoming",
          read: false
        })

      // Send push notification
      try {
        await fetch("/api/send-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "New Exchange Request! 📚",
            body: `${requesterName} wants to exchange "${book.title}". Check your dashboard!`,
            targetUserId: book.ownerId
          }),
        })
      } catch (pushErr) {
        console.error("Push notification error:", pushErr)
      }

      setMessage("")
      setOpen(false)
      
      toast({
        title: "✅ Request Sent!",
        description: `Your exchange request for "${book.title}" has been sent to ${book.ownerName}.`,
      })

    } catch (err: any) {
      console.error("Exchange request error:", err)
      setError(err.message)
      
      toast({
        title: "❌ Request Failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDirectionsUrl = () => {
    if (!book.exchange_point) return ""
    return `https://www.google.com/maps/dir/?api=1&destination=${book.exchange_point.latitude},${book.exchange_point.longitude}`
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) setError(null)
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full h-12 bg-primary hover:bg-primary/90 gap-2">
            <Send className="h-4 w-4" />
            Request Exchange
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Request Exchange</DialogTitle>
            <DialogDescription>
              Request to exchange <span className="font-semibold text-foreground">{book.title}</span> with{" "}
              {book.ownerName}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-6">
            {/* ✅ PICKUP LOCATION - NO OPTION TO CHANGE */}
            {book.exchange_point && (
              <Alert className="border-primary/20 bg-primary/5">
                <MapPin className="h-4 w-4 text-primary" />
                <AlertTitle className="text-sm font-semibold">Pickup Location</AlertTitle>
                <AlertDescription className="space-y-2 mt-2">
                  <p className="font-medium">{book.exchange_point.name}</p>
                  <p className="text-xs">{book.exchange_point.address}, {book.exchange_point.city}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => window.open(getDirectionsUrl(), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Get Directions
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">
                Message to Owner <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you'd like this book..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                The owner will review your request and arrange the exchange at the pickup location above.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90" 
              disabled={!message.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}