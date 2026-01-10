"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Shield, Coffee, BookOpen, Building2, Trees } from "lucide-react"

interface Location {
  id: string
  name: string
  address: string
  type: "library" | "cafe" | "park" | "community" | "mall"
  description: string
  hours: string
  safetyRating: number
  popularTimes: string
}

const locations: Location[] = [
  {
    id: "1",
    name: "Central Public Library",
    address: "123 Main Street, Downtown",
    type: "library",
    description: "Quiet, public space with comfortable seating areas. Perfect for book exchanges.",
    hours: "Mon-Sat: 9AM-8PM, Sun: 12PM-6PM",
    safetyRating: 5,
    popularTimes: "Weekday afternoons",
  },
  {
    id: "2",
    name: "Central Park Main Entrance",
    address: "Central Park, North Gate",
    type: "park",
    description: "Open-air meeting spot with benches near the main entrance. Well-lit and monitored.",
    hours: "6AM-10PM daily",
    safetyRating: 4,
    popularTimes: "Weekends, mornings",
  },
  {
    id: "3",
    name: "The Book Nook Cafe",
    address: "456 Coffee Lane",
    type: "cafe",
    description: "Cozy coffee shop that welcomes book lovers. Great atmosphere for exchanges.",
    hours: "Mon-Fri: 7AM-9PM, Weekends: 8AM-10PM",
    safetyRating: 5,
    popularTimes: "Mornings and evenings",
  },
  {
    id: "4",
    name: "Community Center",
    address: "789 Community Drive",
    type: "community",
    description: "Safe, public community space with security. Free parking available.",
    hours: "Mon-Fri: 8AM-9PM, Weekends: 9AM-6PM",
    safetyRating: 5,
    popularTimes: "Weekday evenings",
  },
  {
    id: "5",
    name: "Riverside Shopping Mall Food Court",
    address: "321 Shopping Boulevard",
    type: "mall",
    description: "Busy public area with plenty of seating. Security on-site 24/7.",
    hours: "10AM-9PM daily",
    safetyRating: 5,
    popularTimes: "Afternoons and weekends",
  },
]

const typeIcons = {
  library: BookOpen,
  cafe: Coffee,
  park: Trees,
  community: Building2,
  mall: Building2,
}

const typeColors = {
  library: "bg-blue-100 text-blue-700 border-blue-200",
  cafe: "bg-amber-100 text-amber-700 border-amber-200",
  park: "bg-green-100 text-green-700 border-green-200",
  community: "bg-purple-100 text-purple-700 border-purple-200",
  mall: "bg-pink-100 text-pink-700 border-pink-200",
}

export default function LocationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-2">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground font-serif">Exchange Locations</h1>
              <p className="text-lg text-muted-foreground text-pretty">
                Safe, public places recommended for book exchanges in your area
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="border-2 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Safety First</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Always meet in public, well-lit areas during business hours. Let someone know where you're
                        going, and trust your instincts. These locations are suggestions - choose what feels safest for
                        you.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {locations.map((location) => {
                const Icon = typeIcons[location.type]
                return (
                  <Card key={location.id} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center border ${typeColors[location.type]}`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl font-serif mb-2">{location.name}</CardTitle>
                            <CardDescription className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              {location.address}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize shrink-0">
                          {location.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">{location.description}</p>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Hours</p>
                            <p className="text-sm text-muted-foreground">{location.hours}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Popular Times</p>
                            <p className="text-sm text-muted-foreground">{location.popularTimes}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 w-2 rounded-full ${
                                i < location.safetyRating ? "bg-primary" : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">Safety Rating</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
