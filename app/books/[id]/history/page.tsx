"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  BookOpen, 
  History as HistoryIcon, 
  MapPin, 
  Calendar, 
  User, 
  MessageSquare, 
  Loader2,
  Plus,
  CheckCircle,
  Heart,
  Download,
  Share2,
  ArrowRight
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"

interface Book {
  id: string
  title: string
  author: string
  genre: string
  condition: string
  cover_image: string
  qr_code: string
  point_value: number
  available: boolean
  owner_id: string
  owner?: {
    id: string
    name: string
    username: string
  }
}

interface HistoryEntry {
  id: string
  from_user_id: string
  to_user_id: string
  from_username: string
  to_username: string
  city: string
  notes: string
  exchanged_at: string
  from_profile?: {
    name: string
    username: string
    avatar?: string
  }
  to_profile?: {
    name: string
    username: string
    avatar?: string
  }
}

const getDisplayName = (entry: HistoryEntry, type: 'from' | 'to') => {
  const profile = type === 'from' ? entry.from_profile : entry.to_profile
  console.log("Asdsad")
  if (profile) {
    console.log(profile)
    return profile.name || profile.username || "Anonymous Reader"
  }
  
  const storedName = type === 'from' ? entry.from_username : entry.to_username
  
  // Check for UUID patterns
  if (storedName && (storedName.startsWith('user_') || (storedName.includes('-') && storedName.length === 36))) {
    return "Anonymous Reader"
  }
  
  // Handle special cases
  if (storedName === "First Listed") {
    return "First Listed"
  }
  
  return storedName || "Anonymous Reader"
}

export default function BookHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  
  // Add entry form
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [city, setCity] = useState("")
  const [notes, setNotes] = useState("")
  const [readingDays, setReadingDays] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadBookHistory()
  }, [bookId])

  const loadBookHistory = async () => {
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      // Get user profile if logged in
      if (authUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()
        
        setUserProfile(profileData)
        if (profileData?.location && !city) {
          setCity(profileData.location)
        }
      }

      // Fetch book details with owner profile
      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select(`
          *,
          owner:profiles(id, name, username)
        `)
        .eq("id", bookId)
        .single()

      if (bookError) throw bookError
      
      // Handle the profiles join result (might be object or array)
      const owner = Array.isArray(bookData.owner) ? bookData.owner[0] : bookData.owner
      const bookWithOwner = { ...bookData, owner }
      
      setBook(bookWithOwner)

      // Check if current user is the owner
      if (authUser && bookData) {
        setIsOwner(bookData.owner_id === authUser.id)
      }

      // Fetch exchange history
      const { data: historyData, error: historyError } = await supabase
        .from("exchange_history")
        .select("*")
        .eq("book_id", bookId)
        .order("exchanged_at", { ascending: true })

      if (historyError) throw historyError

      // Get ALL user IDs from history entries (including from_user_id and to_user_id)
      const userIds = new Set<string>()
      historyData?.forEach((entry: { from_user_id: string; to_user_id: string }) => {
        if (entry.from_user_id && entry.from_user_id !== entry.to_user_id) {
          userIds.add(entry.from_user_id)
        }
        if (entry.to_user_id && entry.from_user_id !== entry.to_user_id) {
          userIds.add(entry.to_user_id)
        }
      })

      // Also add the book owner to the list
      if (bookData?.owner_id) {
        userIds.add(bookData.owner_id)
      }

      // Fetch profiles for all users in history
      let profilesMap = new Map<string, { name: string; username: string; avatar?: string }>()
      if (userIds.size > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name, username")
          .in("id", Array.from(userIds))
        
        if (profilesData) {
          profilesData.forEach((profile: { id: string; name: any; username: any; avatar_url: any }) => {
            profilesMap.set(profile.id, {
              name: profile.name  || "Anonymous Reader",
              username: profile.username || "",
              avatar: profile.avatar_url
            })
          })
        }
      }

      // Enhance history entries with profile data
      const enhancedHistory = historyData?.map((entry: { from_user_id: string; to_user_id: string }) => {
        // Get profile for from_user
        let fromProfile = undefined
        if (entry.from_user_id && entry.from_user_id !== entry.to_user_id) {
          fromProfile = profilesMap.get(entry.from_user_id)
        }

        // Get profile for to_user
        let toProfile = undefined
        if (entry.to_user_id && entry.from_user_id !== entry.to_user_id) {
          toProfile = profilesMap.get(entry.to_user_id)
        }

        // For self-entries (reading entries), use current user's profile
        if (entry.from_user_id === entry.to_user_id && authUser?.id === entry.from_user_id) {
          fromProfile = {
            name: userProfile?.name || userProfile?.username || "Reader",
            username: userProfile?.username || "",
            avatar: userProfile?.avatar_url
          }
        }

        return {
          ...entry,
          from_profile: fromProfile,
          to_profile: toProfile
        }
      }) || []

      setHistory(enhancedHistory)

    } catch (error) {
      console.error("Error loading book history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEntry = async () => {
    if (!user || !isOwner) {
      alert("Only the current owner can add reading entries")
      return
    }

    if (!city.trim()) {
      alert("Please enter the city where you read this book")
      return
    }

    setIsSubmitting(true)
    try {
      const notesWithDuration = readingDays 
        ? `[Read for ${readingDays} days] ${notes}`.trim()
        : notes

      // Get current user's profile name
      const displayName = userProfile?.name || userProfile?.username || "Reader"

      // Add entry to history
      const { error } = await supabase
        .from("exchange_history")
        .insert({
          book_id: bookId,
          from_user_id: user.id,
          to_user_id: user.id, // Same user (reading entry)
          from_username: displayName, // Store the actual name
          to_username: "Currently Reading",
          city: city,
          notes: notesWithDuration || null,
          exchanged_at: new Date().toISOString()
        })

      if (error) throw error

      // Reset form
      setCity(userProfile?.location || "")
      setNotes("")
      setReadingDays("")
      setShowAddEntry(false)

      // Reload history
      await loadBookHistory()

    } catch (error) {
      console.error("Error adding entry:", error)
      alert("Failed to add entry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-journey")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    canvas.width = 512
    canvas.height = 512

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, 512, 512)
        ctx.drawImage(img, 0, 0)
        
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `${book?.title.toLowerCase().replace(/\s+/g, "-")}-qr.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  // const getDisplayName = (entry: HistoryEntry, type: 'from' | 'to') => {
  //   const profile = type === 'from' ? entry.from_profile : entry.to_profile
    
  //   if (profile) {
  //     return profile.name || profile.username || "Anonymous Reader"
  //   }
    
  //   // Fallback to stored username (check if it's a UUID)
  //   const storedName = type === 'from' ? entry.from_username : entry.to_username
    
  //   // Check if it's a UUID (starts with 'user_' or is 36 chars with hyphens)
  //   if (storedName && (storedName.startsWith('user_') || (storedName.includes('-') && storedName.length === 36))) {
  //     return "Anonymous Reader"
  //   }
    
  //   // Check if it's "First Listed" or other special names
  //   if (storedName === "First Listed") {
  //     return "First Listed"
  //   }
    
  //   return storedName || "Anonymous Reader"
  // }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-serif">Retrieving the book's chronicles...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md border-2">
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold font-serif mb-2">Book Not Found</h3>
              <p className="text-muted-foreground mb-6">This volume doesn't exist in our archives.</p>
              <Button asChild>
                <Link href="/browse">Browse More Books</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const bookHistoryUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/books/${bookId}/history`
  const uniqueCities = new Set(history.map(h => h.city))
  const totalReaders = new Set(history.map(h => h.from_profile?.name || h.from_username)).size

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                  <HistoryIcon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold font-serif text-[#1B3A57]">Book Chronicles</h1>
                  <p className="text-muted-foreground font-serif italic">Trace the unique journey of this physical volume</p>
                </div>
              </div>
            </div>

            {/* Book Info Card */}
            <Card className="border-2 border-[#1B3A57]/20 mb-8 shadow-xl overflow-hidden passport-corner-brackets">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Book Cover & QR */}
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-40 h-56 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg flex items-center justify-center overflow-hidden border-2 border-[#1B3A57]/20 shadow-lg relative">
                      {book.cover_image ? (
                        <img 
                          src={book.cover_image} 
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-16 w-16 text-primary/30" />
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-white/90 text-primary border-primary/20 backdrop-blur-sm shadow-sm font-mono text-[10px]">
                          {book.qr_code}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-xl border-2 border-[#1B3A57]/10 shadow-md group relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-sm">
                        Passport
                      </div>
                      <QRCodeSVG
                        id="qr-code-journey"
                        value={bookHistoryUrl}
                        size={120}
                        level="H"
                        includeMargin={false}
                      />
                      <div className="mt-3 flex gap-2">
                        <Button onClick={handleDownloadQR} size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => {
                          navigator.clipboard.writeText(bookHistoryUrl)
                          alert("Link copied!")
                        }} size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h2 className="text-4xl font-bold font-serif mb-2 text-[#1B3A57]">{book.title}</h2>
                      <p className="text-xl text-muted-foreground font-serif italic">by {book.author}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-[#1B3A57]/30 text-[#1B3A57] bg-[#1B3A57]/5 uppercase tracking-tighter text-[10px] font-mono">{book.genre}</Badge>
                      <Badge variant="outline" className="border-[#1B3A57]/30 text-[#1B3A57] bg-[#1B3A57]/5 uppercase tracking-tighter text-[10px] font-mono">Condition: {book.condition}</Badge>
                      <Badge variant={book.available ? "default" : "secondary"} className="uppercase tracking-tighter text-[10px] font-mono">
                        {book.available ? "Available for Trade" : "Currently with Reader"}
                      </Badge>
                      <Badge variant="outline" className="bg-[#C5A572]/10 border-[#C5A572]/30 text-[#1B3A57] uppercase tracking-tighter text-[10px] font-mono">
                        {book.point_value} Points
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF6F0] rounded-xl p-5 border border-[#1B3A57]/10 shadow-inner">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Curator</p>
                        <p className="flex items-center gap-2 font-serif font-medium text-[#1B3A57]">
                          <User className="h-4 w-4 text-primary/60" />
                          {book.owner?.name || book.owner?.username || "Unknown"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Cities Visited</p>
                        <p className="flex items-center gap-2 font-serif font-medium text-[#1B3A57]">
                          <MapPin className="h-4 w-4 text-primary/60" />
                          {uniqueCities.size} {uniqueCities.size === 1 ? 'city' : 'cities'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Fellow Readers</p>
                        <p className="flex items-center gap-2 font-serif font-medium text-[#1B3A57]">
                          <BookOpen className="h-4 w-4 text-primary/60" />
                          {totalReaders} {totalReaders === 1 ? 'reader' : 'readers'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Stops</p>
                        <p className="flex items-center gap-2 font-serif font-medium text-[#1B3A57]">
                          <HistoryIcon className="h-4 w-4 text-primary/60" />
                          {history.length} {history.length === 1 ? 'entry' : 'entries'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Entry Button (Only for owner) */}
            {isOwner && (
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 mb-8 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-serif flex items-center gap-2 text-[#1B3A57]">
                    <Plus className="h-5 w-5 text-primary" />
                    Record Your Chapter
                  </CardTitle>
                  <CardDescription className="italic font-serif">
                    Add your reading experience to the book's permanent chronicles.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showAddEntry ? (
                    <Button onClick={() => setShowAddEntry(true)} className="w-full h-12 text-base font-serif bg-[#1B3A57] hover:bg-[#1B3A57]/90 text-white shadow-md">
                      Add My Reading Entry
                    </Button>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-xs uppercase tracking-widest font-bold">Current City *</Label>
                          <Input
                            id="city"
                            placeholder="e.g. New York, USA"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="h-11 border-[#1B3A57]/20 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="days" className="text-xs uppercase tracking-widest font-bold">Reading Duration (Days)</Label>
                          <Input
                            id="days"
                            type="number"
                            placeholder="How many days?"
                            value={readingDays}
                            onChange={(e) => setReadingDays(e.target.value)}
                            className="h-11 border-[#1B3A57]/20 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-xs uppercase tracking-widest font-bold">Chronicle Notes (Tips, Thoughts, Quotes)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Share your experience for future readers..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          className="resize-none border-[#1B3A57]/20 focus:ring-primary font-serif italic"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button 
                          onClick={handleAddEntry}
                          disabled={isSubmitting || !city.trim()}
                          className="flex-1 h-12 bg-[#1B3A57] hover:bg-[#1B3A57]/90 text-white shadow-md"
                        >
                          {isSubmitting ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Recording...</>
                          ) : (
                            <><CheckCircle className="h-4 w-4 mr-2" /> Save Chronicle Entry</>
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setShowAddEntry(false)}
                          className="px-8 border-[#1B3A57]/20"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* History Timeline */}
            <div className="space-y-8">
              <h3 className="text-3xl font-bold font-serif flex items-center gap-4 text-[#1B3A57]">
                <HistoryIcon className="h-8 w-8 text-primary" />
                The Chronicles
              </h3>

              {history.length > 0 ? (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-7 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />

                  {/* Timeline Entries */}
                  <div className="space-y-8">
                    {history.map((entry, index) => {
                      const fromName = getDisplayName(entry, 'from')
                      const toName = getDisplayName(entry, 'to')
                      
                      return (
                        <div key={entry.id} className="relative pl-20 group">
                          {/* Timeline Dot */}
                          <div className="absolute left-4 top-8 w-7 h-7 rounded-full bg-white border-4 border-primary shadow-md flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>

                          <Card className="border-2 border-[#1B3A57]/10 hover:border-primary/30 shadow-md hover:shadow-xl transition-all passport-corner-brackets bg-white/50 backdrop-blur-sm">
                            <CardHeader className="pb-3 px-6 pt-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <CardTitle className="text-xl font-serif text-[#1B3A57]">
                                    {toName === "Currently Reading" ? (
                                      <span className="flex items-center gap-2">
                                        {fromName} <span className="text-sm font-normal text-muted-foreground italic">shared their chapter</span>
                                      </span>
                                    ) : toName === "First Listed" ? (
                                      <span className="text-sm font-normal text-muted-foreground italic">
                                        Journey started by {fromName}
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-2">
                                        {fromName} <ArrowRight className="h-4 w-4 text-primary" /> {toName}
                                      </span>
                                    )}
                                  </CardTitle>
                                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                                    <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-bold">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {entry.city}
                                    </span>
                                    <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {new Date(entry.exchanged_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <Badge 
                                  variant={index === history.length - 1 ? "default" : "outline"}
                                  className="shrink-0 font-mono text-[9px] uppercase tracking-widest"
                                >
                                  {index === history.length - 1 ? "Present" : `Chapter ${index + 1}`}
                                </Badge>
                              </div>
                            </CardHeader>
                            {entry.notes && (
                              <CardContent className="px-6 pb-6">
                                <div className="flex items-start gap-4 bg-[#FAF6F0] rounded-xl p-5 border border-[#1B3A57]/5 shadow-inner">
                                  <MessageSquare className="h-5 w-5 text-primary/40 mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-sm text-[#1B3A57] italic font-serif leading-relaxed line-height-relaxed">"{entry.notes}"</p>
                                  </div>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        </div>
                      )
                    })}
                  </div>

                  {/* Journey Started Marker */}
                  <div className="relative pl-20 mt-12">
                    <div className="absolute left-4 top-4 w-7 h-7 rounded-full bg-green-500 border-4 border-background shadow-lg flex items-center justify-center z-10">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-green-50/50 border-2 border-green-200/50 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-xs font-bold text-green-800 uppercase tracking-widest">Inception</p>
                        <p className="text-sm font-serif italic text-green-700">
                          The journey began. This volume was first chronicled by {book.owner?.name || book.owner?.username || "its original curator"}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="border-2 border-dashed border-[#1B3A57]/20 bg-[#FAF6F0]/30 mr-12 ml-10">
                  <CardContent className="pt-20 pb-20 text-center">
                    <HistoryIcon className="h-20 w-20 text-primary/20 mx-auto mb-6" />
                    <h4 className="text-2xl font-serif font-bold text-[#1B3A57] mb-2">The Pages are Blank</h4>
                    <p className="text-muted-foreground font-serif italic max-w-sm mx-auto">
                      {isOwner 
                        ? "You are the first to hold this chronicle. Add your entry to start the book's legacy." 
                        : "This volume is waiting for its first reader to write its story."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 pt-8 border-t border-border">
              <Button asChild variant="outline" className="h-12 border-[#1B3A57]/20 font-serif">
                <Link href={`/books/${bookId}`}>
                  <BookOpen className="h-4 w-4 mr-2 text-primary" />
                  Details
                </Link>
              </Button>
              {!isOwner && book.available && (
                <Button asChild className="h-12 bg-[#1B3A57] hover:bg-[#1B3A57]/90 text-white font-serif shadow-md">
                  <Link href={`/books/${bookId}`}>
                    <Heart className="h-4 w-4 mr-2 text-white" />
                    Request Exchange
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="h-12 border-[#1B3A57]/20 font-serif">
                <Link href="/browse">Archives</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}