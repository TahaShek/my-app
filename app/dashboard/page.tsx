"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, Heart, Send, Plus, Edit, Trash2, QrCode, CheckCircle, Clock, XCircle, Loader2, Coins, History } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Book, ExchangeRequest, Profile } from "@/types/book"
import { useToast } from "@/hooks/use-toast"

interface ExchangeHistoryItem extends Book {
  exchangedAt: Date
  direction: 'given' | 'received'
  otherParty: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("my-books")
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myBooks, setMyBooks] = useState<Book[]>([])
  const [incomingRequests, setIncomingRequests] = useState<ExchangeRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<ExchangeRequest[]>([])
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()

    // Realtime subscriptions
    const setupSubscriptions = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const channel = supabase
        .channel('dashboard-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'exchange_requests' },
          () => loadDashboardData(true)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'books' },
          () => loadDashboardData(true)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'exchange_history' },
          () => loadDashboardData(true)
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${authUser.id}` },
          () => loadDashboardData(true)
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const cleanup = setupSubscriptions()
    return () => {
      cleanup.then(unsub => unsub?.())
    }
  }, [])

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)
    
    setError(null)
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        router.push("/login")
        return
      }
      setUser(authUser)

      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()
      
      if (profileError) throw profileError
      setProfile(profileData)

      // Fetch My Books - ONLY books currently owned by user AND available
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*")
        .eq("owner_id", authUser.id)
        .eq("available", true)  // Only show available books
        .order("created_at", { ascending: false })

      if (booksError) throw booksError
      setMyBooks((booksData || []).map((b: any) => ({
        ...b,
        id: b.id,
        title: b.title,
        author: b.author,
        genre: b.genre,
        condition: b.condition,
        description: b.description,
        coverImage: b.cover_image,
        language: b.language,
        publicationYear: b.publication_year,
        pointValue: b.point_value,
        available: b.available,
        tags: b.tags || [],
        qrCode: b.qr_code,
        wishlistCount: b.wishlist_count,
        owner_id: b.owner_id,
        createdAt: new Date(b.created_at)
      })))

      // Fetch Exchange History - books you've given away OR received
      const { data: historyData, error: historyError } = await supabase
        .from("exchange_history")
        .select(`
          *,
          book:books(*)
        `)
        .or(`from_user_id.eq.${authUser.id},to_user_id.eq.${authUser.id}`)
        .order("exchanged_at", { ascending: false })

      if (historyError) throw historyError
      
      setExchangeHistory((historyData || []).map((h: any) => ({
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
        owner_id: h.book?.owner_id || '',
        createdAt: new Date(h.exchanged_at),
        exchangedAt: new Date(h.exchanged_at),
        direction: h.from_user_id === authUser.id ? 'given' : 'received',
        otherParty: h.from_user_id === authUser.id ? h.to_username : h.from_username
      })))

      // Fetch Incoming Requests
      const { data: incomingData, error: incomingError } = await supabase
        .from("exchange_requests")
        .select(`
          *,
          book:books(*),
          requester:profiles!exchange_requests_requester_id_fkey(id, name, username, avatar, location)
        `)
        .eq("owner_id", authUser.id)
        .order("created_at", { ascending: false })

      if (incomingError) throw incomingError
      setIncomingRequests((incomingData || []).map((r: any) => ({
        id: r.id,
        bookId: r.book_id,
        requesterId: r.requester_id,
        ownerId: r.owner_id,
        status: r.status,
        message: r.message,
        meetingLocation: r.meeting_location,
        rejectionReason: r.rejection_reason,
        createdAt: new Date(r.created_at),
        book: r.book ? {
          id: r.book.id,
          title: r.book.title,
          author: r.book.author,
          genre: r.book.genre,
          condition: r.book.condition,
          description: r.book.description,
          coverImage: r.book.cover_image,
          language: r.book.language,
          publicationYear: r.book.publication_year,
          pointValue: r.book.point_value,
          available: r.book.available,
          tags: r.book.tags || [],
          qrCode: r.book.qr_code,
          wishlistCount: r.book.wishlist_count,
          owner_id: r.book.owner_id,
          createdAt: new Date(r.book.created_at)
        } : null,
        requester: r.requester ? {
          id: r.requester.id,
          name: r.requester.name,
          username: r.requester.username,
          avatar: r.requester.avatar,
          location: r.requester.location
        } : null
      })))

      // Fetch Outgoing Requests
      const { data: outgoingData, error: outgoingError } = await supabase
        .from("exchange_requests")
        .select(`
          *,
          book:books(*),
          owner:profiles!exchange_requests_owner_id_fkey(id, name, username, avatar)
        `)
        .eq("requester_id", authUser.id)
        .order("created_at", { ascending: false })

      if (outgoingError) throw outgoingError
      setOutgoingRequests((outgoingData || []).map((r: any) => ({
        id: r.id,
        bookId: r.book_id,
        requesterId: r.requester_id,
        ownerId: r.owner_id,
        status: r.status,
        message: r.message,
        meetingLocation: r.meeting_location,
        rejectionReason: r.rejection_reason,
        createdAt: new Date(r.created_at),
        book: r.book ? {
          id: r.book.id,
          title: r.book.title,
          author: r.book.author,
          genre: r.book.genre,
          condition: r.book.condition,
          description: r.book.description,
          coverImage: r.book.cover_image,
          language: r.book.language,
          publicationYear: r.book.publication_year,
          pointValue: r.book.point_value,
          available: r.book.available,
          tags: r.book.tags || [],
          qrCode: r.book.qr_code,
          wishlistCount: r.book.wishlist_count,
          owner_id: r.book.owner_id,
          createdAt: new Date(r.book.created_at)
        } : null,
        owner: r.owner ? {
          id: r.owner.id,
          name: r.owner.name,
          username: r.owner.username,
          avatar: r.owner.avatar
        } : null
      })))

    } catch (err: any) {
      console.error("Dashboard load error:", err)
      setError(err.message)
    } finally {
      if (!silent) setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to remove this book from your collection?")) return

    try {
      const { error: deleteError } = await supabase
        .from("books")
        .delete()
        .eq("id", bookId)
        .eq("owner_id", user.id)

      if (deleteError) throw deleteError

      setMyBooks(prev => prev.filter(b => b.id !== bookId))
      toast({
        title: "Record Deleted",
        description: "The book has been successfully removed from your bureau archives.",
        variant: "vintage",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to delete book: " + err.message,
        variant: "destructive",
      })
    }
  }

  const handleUpdateRequestStatus = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from("exchange_requests")
        .update({ status: newStatus })
        .eq("id", requestId)
        .eq("owner_id", user.id)

      if (updateError) throw updateError

      setIncomingRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: newStatus } : r
      ))
      
      if (newStatus === 'accepted') {
        toast({
          title: "Request Accepted",
          description: "You can now proceed to complete the exchange.",
          variant: "vintage",
        })
        
        // Find the request to get requesterId and book title
        const request = incomingRequests.find(r => r.id === requestId)
        if (request) {
           fetch("/api/send-push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Request Approved! ✈️",
              body: `Good news! Your request for "${request.book?.title}" has been accepted. Visit your dashboard to complete the journey.`,
              targetUserId: request.requesterId
            }),
          }).catch(e => console.warn("Push error:", e));

          // Create in-app notification
          supabase.from("notifications").insert({
            user_id: request.requesterId,
            type: 'system',
            title: 'Request Approved!',
            message: `Your request for "${request.book?.title}" was accepted.`,
            link: '/dashboard'
          }).catch((e: Error) => console.warn("Notif error:", e));
        }
      } else {
        toast({
          title: "Request Declined",
          description: "The exchange request has been archived as rejected.",
          variant: "default",
        })
        
        const request = incomingRequests.find(r => r.id === requestId)
        if (request) {
           fetch("/api/send-push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Update on your request 📮",
              body: `Your exchange request for "${request.book?.title}" was declined. Keep browsing for more exciting reads!`,
              targetUserId: request.requesterId
            }),
          }).catch(e => console.warn("Push error:", e));

          // Create in-app notification
          supabase.from("notifications").insert({
            user_id: request.requesterId,
            type: 'system',
            title: 'Request Declined',
            message: `Your request for "${request.book?.title}" was declined.`,
            link: '/browse'
          }).catch((e: Error) => console.warn("Notif error:", e));
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Error updating request: " + err.message,
        variant: "destructive",
      })
    }
  }

  const handleCompleteExchange = async (request: ExchangeRequest) => {
    if (!request.book) {
      toast({
        title: "Data Error",
        description: "Book information is missing from the request archives.",
        variant: "destructive",
      })
      return
    }
    
    if (!confirm("Confirm exchange completion? This will transfer points and book ownership. This cannot be undone!")) return
    
    try {
      // 1. Get book details
      const { data: bookData } = await supabase
        .from("books")
        .select("point_value, title, owner_id")
        .eq("id", request.bookId)
        .single()
      
      if (!bookData) {
        throw new Error("Book not found")
      }
      
      // Verify current user is still the owner
      if (bookData.owner_id !== user.id) {
        throw new Error("You no longer own this book")
      }
      
      const bookValue = bookData.point_value || 10
      
      // 2. Transfer Book Ownership (using database function - bypasses RLS)
      const { error: transferError } = await supabase.rpc('transfer_book_ownership', {
        p_book_id: request.bookId,
        p_from_user_id: user.id,
        p_to_user_id: request.requesterId
      })
      
      if (transferError) {
        console.error("Book transfer error:", transferError)
        throw new Error("Failed to transfer book ownership: " + transferError.message)
      }
      
      // 3. Transfer Points
      const { error: pointsError } = await supabase.rpc('transfer_points', {
        from_user: request.requesterId,
        to_user: user.id,
        amount: bookValue
      })
      
      if (pointsError) {
        console.error("Points transfer error:", pointsError)
        throw new Error("Failed to transfer points: " + pointsError.message)
      }
      
      // 4. Update exchange stats
      await supabase.rpc('increment_exchanges', { user_id: user.id })
      await supabase.rpc('increment_exchanges', { user_id: request.requesterId })
      
      // 5. Mark request as completed
      const { error: reqError } = await supabase
        .from("exchange_requests")
        .update({ status: 'completed' })
        .eq("id", request.id)
      
      if (reqError) throw reqError
      
      // 6. Record in exchange history
      const { error: historyError } = await supabase
        .from("exchange_history")
        .insert({
          book_id: request.bookId,
          from_user_id: user.id,
          to_user_id: request.requesterId,
          from_username: profile?.username || profile?.name || 'Unknown',
          to_username: request.requester?.username || request.requester?.name || 'Unknown',
          city: profile?.location || 'Unknown',
          notes: null,
          exchanged_at: new Date().toISOString()
        })
      
      if (historyError) {
        console.error("History insert error:", historyError)
        // Non-critical, continue anyway
      }
      
      // 7. Create transactions
      await supabase.from("transactions").insert([
        {
          user_id: user.id,
          amount: bookValue,
          type: 'book_exchanged',
          description: `Gave "${bookData.title}"`
        },
        {
          user_id: request.requesterId,
          amount: -bookValue,
          type: 'book_exchanged',
          description: `Received "${bookData.title}"`
        }
      ])
      
      // 8. Create in-app notifications
      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          type: 'exchange_completed',
          title: 'Exchange Completed',
          message: `You exchanged "${bookData.title}" and earned ${bookValue} points`,
          link: '/history'
        },
        {
          user_id: request.requesterId,
          type: 'exchange_completed',
          title: 'Book Received',
          message: `You received "${bookData.title}"!`,
          link: '/dashboard'
        }
      ])
      
      // 9. Send Push Notification to recipient
      fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Exchange Success! 🎊",
          body: `The journey is complete! You have received "${bookData.title}". Check your new collection in the library.`,
          targetUserId: request.requesterId
        }),
      }).catch(e => console.warn("Push error:", e));
      
      toast({
        title: "Exchange Complete",
        description: `You earned ${bookValue} points. Happy reading!`,
        variant: "vintage",
      })
      
      // 9. Reload dashboard data to reflect changes
      await loadDashboardData(true)
      
    } catch (err: any) {
      console.error("Complete exchangwhy e error:", err)
      toast({
        title: "Exchange Failed",
        description: "Error completing exchange: " + err.message,
        variant: "destructive",
      })
    }
  }

  const getActualBooksOwned = () => {
  return myBooks.length  // This already filters by owner_id and available=true
}

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-2 shadow-xl">
            <CardContent className="pt-10 pb-10 text-center space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-xl font-serif text-[#1a365d] uppercase tracking-widest">Consulting Archives...</p>
              <p className="text-sm text-muted-foreground font-mono italic">Synchronizing your bureau collection stop</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 border-[#1a365d] text-[#1a365d] font-mono text-[10px]"
                onClick={() => {
                  console.log("Forcing load dismissal")
                  setIsLoading(false)
                }}
              >
                UNSTICK BUREAU ARCHIVE
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-destructive mb-4">Error: {error}</p>
              <Button onClick={() => loadDashboardData()}>Retry</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* User Profile Header */}
            <Card className="border-2 mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                      {profile?.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                       <h1 className="text-3xl font-bold font-serif">{profile?.name}</h1>
                    </div>
                    <p className="text-muted-foreground mb-4">{user?.email}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
  <div className="flex items-center gap-2">
  <BookOpen className="h-4 w-4 text-primary" />
  <span className="font-medium">{getActualBooksOwned()}</span> Books Listed
</div>
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-primary" />
                        <span className="font-medium">{outgoingRequests.length}</span> Requests Sent
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="font-medium">{profile?.exchanges_completed || 0}</span> Exchanges Completed
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-[#C5A572]" />
                        <span className="font-medium text-[#C65D3B] font-bold">{profile?.points || 0}</span> Points Available
                      </div>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                <TabsTrigger value="my-books" className="gap-2 py-3">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">My Books</span>
                  <span className="sm:hidden">Books</span>
                </TabsTrigger>
                <TabsTrigger value="exchange-history" className="gap-2 py-3">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                  <span className="sm:hidden">History</span>
                  {exchangeHistory.length > 0 && (
                    <Badge variant="outline" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs border-green-300 text-green-700">
                      {exchangeHistory.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="incoming" className="gap-2 py-3">
                  <Send className="h-4 w-4 rotate-180" />
                  <span className="hidden sm:inline">Received</span>
                  <span className="sm:hidden">Received</span>
                  {incomingRequests.filter((r) => r.status === "pending").length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {incomingRequests.filter((r) => r.status === "pending").length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="outgoing" className="gap-2 py-3">
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Sent</span>
                  <span className="sm:hidden">Sent</span>
                </TabsTrigger>
              </TabsList>

              {/* My Books Tab */}
              <TabsContent value="my-books" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-serif">My Books</h2>
                    <p className="text-muted-foreground">Manage your available book collection</p>
                  </div>
                  <Button asChild className="gap-2">
                    <Link href="/add-book">
                      <Plus className="h-4 w-4" />
                      Add Book
                    </Link>
                  </Button>
                </div>

                {myBooks.length > 0 ? (
                  <div className="grid gap-4">
                    {myBooks.map((book) => (
                      <Card key={book.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-24 h-32 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {book.coverImage ? (
                                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="h-10 w-10 text-primary/40" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <Link
                                    href={`/books/${book.id}`}
                                    className="text-xl font-semibold font-serif hover:text-primary transition-colors"
                                  >
                                    {book.title}
                                  </Link>
                                  <p className="text-muted-foreground">{book.author}</p>
                                </div>
                                <Badge
                                  variant="default"
                                  className="shrink-0"
                                >
                                  Available
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {book.genre && <Badge variant="outline">{book.genre}</Badge>}
                                {book.condition && <Badge variant="outline">Condition: {book.condition}</Badge>}
                                <div className="flex items-center gap-1.5 bg-[#C5A572]/10 px-2 py-1 rounded border border-[#C5A572]/20 shadow-sm transition-all hover:bg-[#C5A572]/20">
                                  <Coins className="h-3.5 w-3.5 text-[#1B3A57]" />
                                  <span className="text-sm font-bold text-[#1B3A57]">⚡{book.pointValue || 0}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-2">
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/books/${book.id}`}>
                                    <QrCode className="h-3 w-3 mr-1" />
                                    View QR
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/books/${book.id}/edit`}>
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:text-destructive bg-transparent"
                                  onClick={() => handleDeleteBook(book.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">No books yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start building your collection by adding your first book
                      </p>
                      <Button asChild>
                        <Link href="/add-book">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Book
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Exchange History Tab */}
              <TabsContent value="exchange-history" className="mt-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif">Exchange History</h2>
                  <p className="text-muted-foreground">Books you've exchanged</p>
                </div>

                {exchangeHistory.length > 0 ? (
                  <div className="grid gap-4">
                    {exchangeHistory.map((book) => (
                      <Card key={book.id + book.exchangedAt.getTime()} className="border-2 border-green-100 bg-green-50/50">
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-24 h-32 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-green-200">
                              {book.coverImage ? (
                                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover opacity-70" />
                              ) : (
                                <BookOpen className="h-10 w-10 text-green-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <Link
                                    href={`/books/${book.id}`}
                                    className="text-xl font-semibold font-serif text-green-800 hover:text-green-700 transition-colors"
                                  >
                                    {book.title}
                                  </Link>
                                  <p className="text-green-600">{book.author}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0 border-green-300 text-green-700 bg-green-100">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {book.direction === 'given' ? 'Given' : 'Received'}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {book.genre && <Badge variant="outline" className="border-green-200">{book.genre}</Badge>}
                                <div className="flex items-center gap-1.5 bg-green-100 px-2 py-1 rounded border border-green-200">
                                  <Coins className="h-3.5 w-3.5 text-green-700" />
                                  <span className="text-sm font-bold text-green-700">⚡{book.pointValue || 0}</span>
                                </div>
                              </div>
                              <div className="pt-2">
                                <p className="text-sm text-green-700">
                                  {book.direction === 'given' 
                                    ? `Given to ${book.otherParty}` 
                                    : `Received from ${book.otherParty}`}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                  Exchanged on {book.exchangedAt.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                      <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">No exchanged books yet</h3>
                      <p className="text-muted-foreground">Books you exchange will appear here</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Incoming Requests Tab */}
              <TabsContent value="incoming" className="mt-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif">Requests Received</h2>
                  <p className="text-muted-foreground">People interested in your books</p>
                </div>

                {incomingRequests.length > 0 ? (
                  <div className="grid gap-4">
                    {incomingRequests.map((request) => {
                      // Only show requests for books that are still available and owned by user
                      const bookStillAvailable = myBooks.some(b => b.id === request.bookId)
                      
                      if (!bookStillAvailable && request.status !== 'completed') {
                        return null
                      }
                      
                      return (
                        <Card key={request.id} className="border-2">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-border">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {request.requester?.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("") || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{request.requester?.name || "Anonymous Reader"}</CardTitle>
                                  <CardDescription className="flex items-center gap-2 mt-1">
                                    <div className="w-8 h-10 bg-muted rounded overflow-hidden flex-shrink-0 border border-border">
                                      {request.book?.coverImage ? (
                                        <img src={request.book.coverImage} alt={request.book.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                          <BookOpen className="h-4 w-4 text-primary/30" />
                                        </div>
                                      )}
                                    </div>
                                    <span>Wants: <span className="font-medium">{request.book?.title || "Unknown Book"}</span></span>
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  request.status === "pending"
                                    ? "default"
                                    : request.status === "accepted"
                                      ? "default"
                                      : request.status === "completed"
                                        ? "outline"
                                        : "secondary"
                                }
                                className={cn(
                                  "shrink-0",
                                  request.status === "completed" && "bg-green-100 text-green-700 border-green-200"
                                )}
                              >
                                {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                {request.status === "accepted" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {request.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                                {request.status === "completed" && <CheckCircle className="h-3 w-3 mr-1 fill-current" />}
                                {request.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {request.message && (
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm">{request.message}</p>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              {request.meetingLocation ? (
                                <p className="text-sm text-muted-foreground">
                                  Proposed location:{" "}
                                  <span className="font-medium text-foreground">{request.meetingLocation}</span>
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">No location specified</p>
                              )}
                              <div className="flex items-center gap-1.5 bg-[#C5A572]/10 px-2 py-1 rounded border border-[#C5A572]/20 shadow-sm transition-all hover:bg-[#C5A572]/20">
                                <Coins className="h-3.5 w-3.5 text-[#1B3A57]" />
                                <span className="text-sm font-bold text-[#1B3A57]">⚡{request.book?.pointValue || 0}</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Requested {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                            {request.status === "pending" && (
                              <div className="flex gap-2 pt-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-primary hover:bg-primary/90"
                                  onClick={() => handleUpdateRequestStatus(request.id, 'accepted')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1 bg-transparent"
                                  onClick={() => handleUpdateRequestStatus(request.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Decline
                                </Button>
                              </div>
                            )}
                            {request.status === "accepted" && bookStillAvailable && (
                              <div className="pt-2">
                                <Button 
                                  size="sm" 
                                  className="w-full bg-[#D4AF37] hover:bg-[#C5A028] text-[#1a365d] border-b-4 border-[#B8881E] active:border-b-0"
                                  onClick={() => handleCompleteExchange(request)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Completed (Swap Done)
                                </Button>
                                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                                  Points will be transferred upon completion
                                </p>
                              </div>
                            )}
                            {request.status === "completed" && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800 font-medium">
                                  ✅ Exchange completed! Book transferred.
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50 rotate-180" />
                      <h3 className="text-xl font-semibold mb-2">No requests yet</h3>
                      <p className="text-muted-foreground">When others request your books, they'll appear here</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Outgoing Requests Tab */}
              <TabsContent value="outgoing" className="mt-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif">Requests Sent</h2>
                  <p className="text-muted-foreground">Books you've requested from others</p>
                </div>

                {outgoingRequests.length > 0 ? (
                  <div className="grid gap-4">
                    {outgoingRequests.map((request) => (
                      <Card key={request.id} className="border-2">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <CardTitle className="text-lg">Request to exchange book</CardTitle>
                              <CardDescription>With {request.owner?.name || "Collector"}</CardDescription>
                            </div>
                            <Badge
                              variant={
                                request.status === "pending"
                                  ? "default"
                                  : request.status === "accepted"
                                    ? "default"
                                    : request.status === "completed"
                                      ? "outline"
                                      : "secondary"
                              }
                              className={cn(
                                "shrink-0",
                                request.status === "completed" && "bg-green-100 text-green-700 border-green-200"
                              )}
                            >
                              {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                              {request.status === "accepted" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {request.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                              {request.status === "completed" && <CheckCircle className="h-3 w-3 mr-1 fill-current" />}
                              {request.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0 border-2 border-[#1B3A57]/20 shadow-sm">
                              {request.book?.coverImage ? (
                                <img src={request.book.coverImage} alt={request.book.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                  <BookOpen className="h-6 w-6 text-primary/30" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1B3A57]">{request.book?.title}</p>
                              <p className="text-xs text-muted-foreground">by {request.book?.author}</p>
                            </div>
                          </div>
                          {request.message && (
                            <div className="bg-muted/50 rounded-lg p-4">
                              <p className="text-sm">{request.message}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            {request.meetingLocation ? (
                              <p className="text-sm text-muted-foreground">
                                Proposed location:{" "}
                                <span className="font-medium text-foreground">{request.meetingLocation}</span>
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No location specified</p>
                            )}
                            <div className="flex items-center gap-1.5 bg-[#C5A572]/10 px-2 py-1 rounded border border-[#C5A572]/20 shadow-sm transition-all hover:bg-[#C5A572]/20">
                              <Coins className="h-3.5 w-3.5 text-[#1B3A57]" />
                              <span className="text-sm font-bold text-[#1B3A57]">⚡{request.book?.pointValue || 0}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">Sent {new Date(request.createdAt).toLocaleDateString()}</p>
                          {request.status === "accepted" && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm text-green-800 font-medium">
                                ✅ Request accepted! The owner will complete the exchange when ready.
                              </p>
                            </div>
                          )}
                          {request.status === "completed" && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm text-green-800 font-medium">
                                🎉 Exchange completed! Check your dashboard for the book.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">No requests sent</h3>
                      <p className="text-muted-foreground mb-6">
                        Browse books and send exchange requests to start swapping
                      </p>
                      <Button asChild>
                        <Link href="/browse">Browse Books</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}