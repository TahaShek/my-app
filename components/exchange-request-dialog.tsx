"use client"

import type React from "react"
import { useState } from "react"
import dynamic from "next/dynamic"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Send, MapPin, CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import type { Book } from "@/types/book"

// Dynamic import for LocationPicker to avoid SSR issues
const LocationPicker = dynamic(
  () => import("@/components/location-picker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Map...</span>
      </div>
    )
  }
)

interface ExchangeRequestDialogProps {
  book: Book
  trigger?: React.ReactNode
}

export function ExchangeRequestDialog({ book, trigger }: ExchangeRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  // Store location as "Lat: XX, Lng: YY" or generic string
  const [location, setLocation] = useState("")
  const [date, setDate] = useState<Date>()
  const [showMap, setShowMap] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requestData = {
      bookId: book.id,
      ownerId: book.ownerId,
      message,
      proposedLocation: location,
      proposedDate: date,
    }

    console.log("[v0] Exchange request submitted:", requestData)

    // Reset form
    setMessage("")
    setLocation("")
    setDate(undefined)
    setOpen(false)
    setShowMap(false)

    // In production, this would create a request in Supabase
    alert("Exchange request sent successfully!")
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setShowMap(false); // Reset map view on close
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full h-12 bg-primary hover:bg-primary/90 gap-2">
            <Send className="h-4 w-4" />
            Request Exchange
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Request Exchange</DialogTitle>
            <DialogDescription>
              Send a request to exchange <span className="font-semibold text-foreground">{book.title}</span> with{" "}
              {book.ownerName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="message">Message to Owner</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you'd like this book..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Proposed Exchange Location</Label>

              {!showMap ? (
                <div className="flex flex-col gap-2">
                  {location ? (
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{location}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setShowMap(true)}>
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMap(true)}
                      className="w-full justify-start gap-2 h-12"
                    >
                      <MapPin className="h-4 w-4" />
                      Pick a location on map
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Click on map to select</span>
                    <Button variant="ghost" size="sm" onClick={() => setShowMap(false)} className="h-6 text-xs">
                      Cancel
                    </Button>
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <LocationPicker
                      initialPosition={null}
                      onLocationSelect={(coords) => {
                        const locString = `Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`;
                        setLocation(locString);
                        setShowMap(false);
                      }}
                      className="h-[300px] w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Preferred Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-transparent"
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={!message || !location}>
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
