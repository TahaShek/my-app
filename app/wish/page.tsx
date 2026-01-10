"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Heart, Plus, Trash2, Search, BookOpen, Loader2, ExternalLink, Coins } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface WishlistItem {
  id: string
  user_id: string
  book_id: string
  created_at: string
  book?: {
    id: string
    title: string
    author: string
    genre: string
    condition: string
    cover_image: string
    description: string
    point_value: number
    available: boolean
    owner: {
      id: string
      name: string
      username: string
      location: string
    }
  }
}

interface SearchBook {
  id: string
  title: string
  author: string
  genre: string
  condition: string
  cover_image: string
  point_value: number
  available: boolean
  owner: {
    name: string
    location: string
  }
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  
  // For adding books
  const [bookSearchQuery, setBookSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchBook[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuthAndFetchWishlist()
  }, [])

  const checkAuthAndFetchWishlist = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      setUser(authUser)
      await fetchWishlist(authUser.id)
    }
    setIsLoading(false)
  }

  const fetchWishlist = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          *,
          book:books (
            *,
            owner:profiles!books_owner_id_fkey(id, name, username, location)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setWishlist(data || [])
    } catch (err: any) {
      console.error("Wishlist fetch error:", err)
      toast({
        title: "Error",
        description: "Error loading wishlist from archives.",
        variant: "destructive",
      })
    }
  }

  const searchBooks = async (query: string) => {
    if (!query.trim() || !user) return

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from("books")
        .select(`
          *,
          owner:profiles!books_owner_id_fkey(name, location)
        `)
        .neq("owner_id", user.id) // Don't show user's own books
        .eq("available", true)
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
        .limit(10)

      if (error) throw error

      // Filter out books already in wishlist
      const wishlistBookIds = wishlist.map(w => w.book_id)
      const filtered = (data || []).filter((book: any) => !wishlistBookIds.includes(book.id))
      
      setSearchResults(filtered)
    } catch (err: any) {
      console.error("Search error:", err)
      toast({
        title: "Search Error",
        description: "Failed to query the community archives.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToWishlist = async (bookId: string) => {
    if (!user) return

    try {
      // Check if already in wishlist
      const { data: existing } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .single()

      if (existing) {
        toast({
          title: "Already Logged",
          description: "This book is already in your wishlist tracking.",
          variant: "default",
        })
        return
      }

      // Add to wishlist
      const { error } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          book_id: bookId
        })

      if (error) throw error

      toast({
        title: "Added to Wishlist",
        description: "The book has been added to your collection for tracking.",
        variant: "vintage",
      })
      
      // Refresh wishlist
      await fetchWishlist(user.id)
      setDialogOpen(false)
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to add to wishlist: " + err.message,
        variant: "destructive",
      })
    }
  }

  const handleRemove = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", wishlistId)

      if (error) throw error

      setWishlist(wishlist.filter((item) => item.id !== wishlistId))
      toast({
        title: "Removed",
        description: "The book has been removed from your wishlist.",
        variant: "vintage",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Error removing from wishlist: " + err.message,
        variant: "destructive",
      })
    }
  }

  const filteredWishlist = wishlist.filter(
    (item) =>
      item.book?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.book?.author?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your wishlist...</p>
          </div>
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary fill-current" />
                  </div>
                  <h1 className="text-4xl font-bold text-foreground font-serif">My Wishlist</h1>
                </div>
                <p className="text-muted-foreground">
                  {wishlist.length} {wishlist.length === 1 ? 'book' : 'books'} you want to read
                </p>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    Add Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">Add to Wishlist</DialogTitle>
                    <DialogDescription>
                      Search for books available in the community
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Search Input */}
                    <div className="space-y-2">
                      <Label htmlFor="book-search">Search for a book</Label>
                      <div className="flex gap-2">
                        <Input
                          id="book-search"
                          placeholder="Enter book title or author..."
                          value={bookSearchQuery}
                          onChange={(e) => setBookSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              searchBooks(bookSearchQuery)
                            }
                          }}
                        />
                        <Button 
                          onClick={() => searchBooks(bookSearchQuery)}
                          disabled={isSearching || !bookSearchQuery.trim()}
                        >
                          {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Search Results */}
                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                      {searchResults.length > 0 ? (
                        searchResults.map((book) => (
                          <Card key={book.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded flex-shrink-0 flex items-center justify-center">
                                  {book.cover_image ? (
                                    <img 
                                      src={book.cover_image} 
                                      alt={book.title}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    <BookOpen className="h-6 w-6 text-primary/40" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm mb-1 truncate">{book.title}</h4>
                                  <p className="text-xs text-muted-foreground mb-2">by {book.author}</p>
                                  <div className="flex flex-wrap gap-1.5 items-center">
                                    <Badge variant="outline" className="text-xs">{book.genre}</Badge>
                                    <Badge variant="outline" className="text-xs">{book.condition}</Badge>
                                    <div className="flex items-center gap-1 bg-[#C5A572]/10 px-1.5 py-0.5 rounded text-xs">
                                      <Coins className="h-3 w-3 text-[#1B3A57]" />
                                      <span className="font-bold text-[#1B3A57]">{book.point_value}</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Owner: {book.owner.name} • {book.owner.location}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddToWishlist(book.id)}
                                  className="shrink-0"
                                >
                                  <Heart className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : bookSearchQuery && !isSearching ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No books found matching "{bookSearchQuery}"</p>
                          <p className="text-xs mt-1">Try a different search term</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Search for books to add to your wishlist</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setDialogOpen(false)
                      setBookSearchQuery("")
                      setSearchResults([])
                    }}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search Wishlist */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search your wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Wishlist Items */}
            {filteredWishlist.length > 0 ? (
              <div className="space-y-4">
                {filteredWishlist.map((item) => (
                  <Card key={item.id} className="border-2 hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Book Cover */}
                        <div className="w-20 h-28 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {item.book?.cover_image ? (
                            <img 
                              src={item.book.cover_image} 
                              alt={item.book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-8 w-8 text-primary/40" />
                          )}
                        </div>

                        {/* Book Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link
                                href={`/books/${item.book_id}`}
                                className="text-xl font-semibold font-serif hover:text-primary transition-colors inline-flex items-center gap-2"
                              >
                                {item.book?.title || "Unknown Book"}
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                              <p className="text-muted-foreground">{item.book?.author || "Unknown Author"}</p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                              onClick={() => handleRemove(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            {item.book?.genre && <Badge variant="outline">{item.book.genre}</Badge>}
                            {item.book?.condition && <Badge variant="outline">Condition: {item.book.condition}</Badge>}
                            {item.book?.available !== undefined && (
                              <Badge variant={item.book.available ? "default" : "secondary"}>
                                {item.book.available ? "Available" : "Not Available"}
                              </Badge>
                            )}
                            {item.book?.point_value && (
                              <div className="flex items-center gap-1.5 bg-[#C5A572]/10 px-2 py-1 rounded border border-[#C5A572]/20">
                                <Coins className="h-3.5 w-3.5 text-[#1B3A57]" />
                                <span className="text-sm font-bold text-[#1B3A57]">⚡{item.book.point_value}</span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {item.book?.description && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm text-muted-foreground line-clamp-2">{item.book.description}</p>
                            </div>
                          )}

                          {/* Owner & Date */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                            <span>
                              Owner: {item.book?.owner?.name || "Unknown"} • {item.book?.owner?.location || "Unknown location"}
                            </span>
                            <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
                          </div>

                          {/* Action Button */}
                          {item.book?.available && (
                            <div className="pt-2">
                              <Button asChild size="sm">
                                <Link href={`/books/${item.book_id}`}>
                                  View Book Details
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? "No books found" : "Your wishlist is empty"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery 
                      ? "Try adjusting your search" 
                      : "Start adding books you'd like to read and exchange"}
                  </p>
                  {!searchQuery && (
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Books
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/browse">
                          Browse Books
                        </Link>
                      </Button>
                    </div>
                  )}
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