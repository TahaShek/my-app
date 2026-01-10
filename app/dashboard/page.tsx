"use client"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Heart, Send, Plus, Edit, Trash2, QrCode, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Book, ExchangeRequest } from "@/types/book"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("my-books")
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [myBooks, setMyBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) throw new Error("Unauthorized")
      setUser(authUser)

      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()
      
      if (profileError) throw profileError
      setProfile(profileData)

      // Fetch My Books
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*")
        .eq("owner_id", authUser.id)
        .order("created_at", { ascending: false })

      if (booksError) throw booksError

      const mappedBooks: Book[] = (booksData || []).map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        genre: b.genre,
        condition: b.condition,
        description: b.description,
        coverImage: b.cover_image,
        ownerName: profileData.name,
        ownerId: b.owner_id,
        status: b.available ? "available" : "exchanged",
        createdAt: new Date(b.created_at),
        points: b.point_value
      }))
      setMyBooks(mappedBooks)

    } catch (err: any) {
      console.error("Dashboard load error:", err)
      setError(err.message)
      if (err.message === "Unauthorized") {
        router.push("/login")
      }
    } finally {
      setIsLoading(false)
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
    } catch (err: any) {
      alert("Error deleting book: " + err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
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
                    <AvatarImage src={profile?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                      {profile?.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold font-serif mb-2">{profile?.name}</h1>
                    <p className="text-muted-foreground mb-4">{user?.email}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-medium">{myBooks.length}</span> Books Listed
                      </div>
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-primary" />
                        <span className="font-medium text-[#C65D3B] font-bold">{profile?.points || 0}</span> Points Available
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="font-medium">Direct Connection Established</span>
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
              <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                <TabsTrigger value="my-books" className="gap-2 py-3">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">My Books</span>
                  <span className="sm:hidden">Books</span>
                </TabsTrigger>
                <TabsTrigger value="incoming" className="gap-2 py-3">
                  <Send className="h-4 w-4 rotate-180" />
                  <span className="hidden sm:inline">Requests Received</span>
                  <span className="sm:hidden">Received</span>
                </TabsTrigger>
                <TabsTrigger value="outgoing" className="gap-2 py-3">
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Requests Sent</span>
                  <span className="sm:hidden">Sent</span>
                </TabsTrigger>
              </TabsList>

              {/* My Books Tab */}
              <TabsContent value="my-books" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-serif">My Books</h2>
                    <p className="text-muted-foreground">Manage your book collection</p>
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
                                <div className="flex flex-col items-end gap-2">
                                  <Badge
                                    variant={book.status === "available" ? "default" : "secondary"}
                                    className="shrink-0"
                                  >
                                    {book.status}
                                  </Badge>
                                  <span className="font-mono text-xs font-bold text-[#C65D3B]">
                                    {book.points} PTS
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {book.genre && <Badge variant="outline">{book.genre}</Badge>}
                                {book.condition && <Badge variant="outline">Condition: {book.condition}</Badge>}
                              </div>
                              <div className="flex flex-wrap gap-2 pt-2">
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/books/${book.id}`}>
                                    <QrCode className="h-3 w-3 mr-1" />
                                    View Details
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

              {/* Incoming Requests Tab */}
              <TabsContent value="incoming" className="mt-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif">Requests Received</h2>
                  <p className="text-muted-foreground">People interested in your books</p>
                </div>

                <Card className="border-2 border-dashed">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50 rotate-180" />
                    <h3 className="text-xl font-semibold mb-2">No active requests</h3>
                    <p className="text-muted-foreground">When others request your documents, they will be archived here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Outgoing Requests Tab */}
              <TabsContent value="outgoing" className="mt-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif">Requests Sent</h2>
                  <p className="text-muted-foreground">Books you've requested from others</p>
                </div>

                <Card className="border-2 border-dashed">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No documents requested</h3>
                    <p className="text-muted-foreground mb-6">
                      Browse the archive and send exchange requests to commence swapping.
                    </p>
                    <Button asChild>
                      <Link href="/browse">Consult Collection</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
