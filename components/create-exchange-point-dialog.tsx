"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

const LocationPicker = dynamic(
  () => import("@/components/location-picker"),
  { ssr: false }
)

interface CreateExchangePointDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPointCreated: (point: any) => void
}

export default function CreateExchangePointDialog({ open, onOpenChange, onPointCreated }: CreateExchangePointDialogProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please select a location on the map",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("You must be logged in")
      }

      const { data: newPoint, error } = await supabase
        .from("exchange_locations")
        .insert({
          name,
          address,
          city,
          description,
          latitude: location.lat,
          longitude: location.lng,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      onPointCreated(newPoint)
      
      // Reset form
      setName("")
      setAddress("")
      setCity("")
      setDescription("")
      setLocation(null)
      
    } catch (err: any) {
      console.error("Error creating exchange point:", err)
      toast({
        title: "Failed to Create Point",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Create Exchange Point</DialogTitle>
          <DialogDescription>
            Add a new location where books can be exchanged
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Point Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Central Cafe Book Exchange"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="Lahore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe this exchange point..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Location on Map <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Click on the map to set the exact location
            </p>
            <div className="border-2 border-primary/20 rounded-lg overflow-hidden">
              <LocationPicker
                initialPosition={location}
                onLocationSelect={setLocation}
                className="h-[300px] w-full"
              />
            </div>
            {location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Selected: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name || !address || !city || !location}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Exchange Point"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}