"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, MapPin, ArrowRight, ArrowLeft, BookOpen, Loader2 } from "lucide-react"
import type { Book } from "@/types/book"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ExchangeHistoryItem extends Book {
  exchangedAt: Date
  direction: 'given' | 'received'
  otherParty: string
  meetingLocation: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ExchangeHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadHistoryData()

    // Subscribe to history changes
    const channel = supabase
      .channel('history-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'exchange_history' },
        () => loadHistoryData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadHistoryData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push("/login")
        return
      }

      const { data, error: fetchError } = await supabase
        .from("exchange_history")
        .select(`
          *,
          book:books(*)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order("exchanged_at", { ascending: false })

      if (fetchError) throw fetchError

      const mappedHistory: ExchangeHistoryItem[] = (data || []).map((h: any) => ({
        id: h.book?.id || h.book_id,
        title: h.book?.title || 'Unknown Book',
        author: h.book?.author || 'Unknown Author',
        genre: h.book?.genre || '',
        condition: h.book?.condition || 'Good',
        description: h.book?.description || '',
        coverImage: h.book?.cover_image || '',
        language: h.book?.language || 'English',
        publicationYear: h.book?.publication_year || 0,
        pointValue: h.book?.point_value || 0,
        available: false,
        tags: h.book?.tags || [],
        qrCode: h.book?.qr_code || '',
        wishlistCount: h.book?.wishlist_count || 0,
        ownerId: h.book?.owner_id || '',
        createdAt: new Date(h.exchanged_at),
        exchangedAt: new Date(h.exchanged_at),
        direction: h.from_user_id === user.id ? 'given' : 'received',
        otherParty: h.from_user_id === user.id ? h.to_username : h.from_username,
        meetingLocation: h.city || "Various Locations"
      }))

      setHistory(mappedHistory)
    } catch (err: any) {
      console.error("Error loading history:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-serif">Retrieving your archives...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const givenCount = history.filter(h => h.direction === 'given').length
  const receivedCount = history.filter(h => h.direction === 'received').length

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground font-serif">Exchange History</h1>
              </div>
              <p className="text-muted-foreground font-serif">Your book exchange journey documented in the archives</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive font-serif">
                Error retrieving history: {error}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <Card className="border-2 border-[#1B3A57]/20 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary mb-1">{history.length}</p>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">Total Exchanges</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-[#1B3A57]/20 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#C1403D] mb-1">{givenCount}</p>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">Books Given</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-[#1B3A57]/20 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600 mb-1">{receivedCount}</p>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">Books Received</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-border/50" />

              <div className="space-y-8">
                {history.map((exchange) => (
                  <div key={exchange.id} className="relative pl-16">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 top-6 h-12 w-12 rounded-full border-4 border-background flex items-center justify-center shadow-md ${
                        exchange.direction === "given" 
                          ? "bg-[#C1403D] text-white" 
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {exchange.direction === "given" ? (
                        <ArrowRight className="h-5 w-5" />
                      ) : (
                        <ArrowLeft className="h-5 w-5" />
                      )}
                    </div>

                    <Card className="border-2 border-[#1B3A57]/20 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={exchange.direction === "given" ? "default" : "secondary"} className="font-mono text-[10px] uppercase tracking-tighter">
                                {exchange.direction === "given" ? "Outgoing" : "Incoming"}
                              </Badge>
                              <p className="text-xs text-muted-foreground font-mono">{exchange.exchangedAt.toLocaleDateString()}</p>
                            </div>
                            <h3 className="text-xl font-semibold font-serif mb-1">{exchange.title}</h3>
                            <p className="text-muted-foreground font-serif italic text-sm">by {exchange.author}</p>
                          </div>
                          <div className="h-20 w-16 bg-muted rounded-md overflow-hidden border border-border shadow-inner flex-shrink-0">
                            {exchange.coverImage ? (
                              <img src={exchange.coverImage} alt={exchange.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                <BookOpen className="h-6 w-6 text-primary/30" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border-2 border-border">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {exchange.otherParty
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-serif font-medium">
                              {exchange.direction === "given" ? "Transferred to" : "Acquired from"} <span className="text-primary">{exchange.otherParty}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-serif">
                          <MapPin className="h-4 w-4 text-primary/60" />
                          <span>{exchange.meetingLocation}</span>
                        </div>

                        {exchange.description && (
                          <div className="bg-[#FAF6F0] border-l-4 border-primary/20 rounded-r-lg p-3 italic">
                            <p className="text-sm text-muted-foreground font-serif">"{exchange.description}"</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty state fallback */}
            {history.length === 0 && (
              <Card className="border-2 border-dashed border-[#1B3A57]/20">
                <CardContent className="pt-16 pb-16 text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-10 w-10 text-primary/20" />
                  </div>
                  <h3 className="text-2xl font-serif mb-2">The archives are silent</h3>
                  <p className="text-muted-foreground font-serif max-w-sm mx-auto">
                    Your journeys have yet to begin. Complete your first exchange to see your story unfold here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
