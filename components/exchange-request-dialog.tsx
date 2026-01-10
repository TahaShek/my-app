"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Send, MapPin, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { Book } from "@/types/book"

interface ExchangeRequestDialogProps {
  book: Book
  trigger?: React.ReactNode
}

const suggestedLocations = [
  "Central Park, Main Entrance",
  "Public Library, Downtown",
  "Coffee House on Main Street",
  "Community Center",
  "Shopping Mall Food Court",
]

export function ExchangeRequestDialog({ book, trigger }: ExchangeRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [location, setLocation] = useState("")
  const [customLocation, setCustomLocation] = useState("")
  const [date, setDate] = useState<Date>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requestData = {
      bookId: book.id,
      ownerId: book.ownerId,
      message,
      proposedLocation: location === "custom" ? customLocation : location,
      proposedDate: date,
    }

    console.log("[v0] Exchange request submitted:", requestData)

    // Reset form
    setMessage("")
    setLocation("")
    setCustomLocation("")
    setDate(undefined)
    setOpen(false)

    // In production, this would create a request in Supabase
    alert("Exchange request sent successfully!")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Label htmlFor="location">Proposed Exchange Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {suggestedLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {loc}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {location === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customLocation">Custom Location</Label>
                <Input
                  id="customLocation"
                  placeholder="Enter your preferred location"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                />
              </div>
            )}

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
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
