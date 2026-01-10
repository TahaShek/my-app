"use client"

import { useEffect, useState } from "react"
import { reverseGeocode } from "@/lib/geocoding"
import { Loader2, MapPin } from "lucide-react"

interface LocationDisplayProps {
  location: string
  className?: string
}

export function LocationDisplay({ location, className }: LocationDisplayProps) {
  const [displayLocation, setDisplayLocation] = useState(location)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if location is in coordinate format "📍 Lat: 12.345, Lng: 67.890" using regex
    // Allowing for potential variations or just "Lat: ..., Lng: ..."
    const coordRegex = /Lat:\s*([0-9.-]+),\s*Lng:\s*([0-9.-]+)/i
    const match = location.match(coordRegex)

    if (match) {
      const lat = parseFloat(match[1])
      const lng = parseFloat(match[2])

      if (!isNaN(lat) && !isNaN(lng)) {
        setIsLoading(true)
        reverseGeocode(lat, lng)
          .then(address => {
            setDisplayLocation(`📍 ${address}`)
          })
          .catch(() => {
            // Keep original if fails
            setDisplayLocation(location)
          })
          .finally(() => {
            setIsLoading(false)
          })
      }
    } else {
        // If it's not coordinates, just show it as is
        setDisplayLocation(location)
    }
  }, [location])

  if (isLoading) {
    return (
      <span className={`inline-flex items-center gap-2 text-muted-foreground ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Resolving address...
      </span>
    )
  }

  return (
    <span className={`font-medium text-foreground ${className}`}>
        {displayLocation}
    </span>
  )
}
