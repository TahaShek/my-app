"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Heart, Plus, Trash2, Search, BookOpen, Loader2 } from "lucide-react"
import type { WishlistItem } from "@/types/book"
import { supabase } from "@/lib/supabase/client"

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newAuthor, setNewAuthor] = useState("")
  const [newNotes, setNewNotes] = useState("")

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error: fetchError } = await supabase
        .from("wishlist")
        .select(`
          *,
          book:books (*)
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError
      
      const mappedItems: WishlistItem[] = (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        bookId: item.book_id,
        book: item.book ? {
          id: item.book.id,
          title: item.book.title,
          author: item.book.author,
          coverImage: item.book.cover_image,
          description: item.book.description
        } : undefined,
        createdAt: new Date(item.created_at)
      }))

      setWishlist(mappedItems)
    } catch (err: any) {
      console.error("Wishlist fetch error:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToWishlist = async (e: React.FormEvent) => {
    e.preventDefault()
    // alert("In this version, please add books to your wishlist from the Browse page by clicking the Heart icon.")
    setDialogOpen(false)
  }

  const handleRemove = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", id)

      if (deleteError) throw deleteError
      setWishlist(wishlist.filter((item) => item.id !== id))
    } catch (err: any) {
      // alert("Error removing item: " + err.message)
    }
  }

  const filteredWishlist = wishlist.filter(
    (item) =>
      item.book?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.book?.author?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-4xl font-bold text-foreground font-serif">My Wishlist</h1>
                </div>
                <p className="text-muted-foreground">Books you want to read and exchange</p>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    Add Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleAddToWishlist}>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-serif">Add to Wishlist</DialogTitle>
                      <DialogDescription>Add a book you'd like to read and exchange in the future</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">
                          Book Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="title"
                          placeholder="Enter book title"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="author">
                          Author <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="author"
                          placeholder="Author name"
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Why do you want to read this book?"
                          value={newNotes}
                          onChange={(e) => setNewNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90">
                        <Heart className="h-4 w-4 mr-2" />
                        Add to Wishlist
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
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
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl font-serif mb-1">{item.book?.title || "Unknown Book"}</CardTitle>
                            <CardDescription>by {item.book?.author || "Unknown Author"}</CardDescription>
                          </div>
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
                    </CardHeader>
                    {item.book?.description && (
                      <CardContent className="pt-0">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.book.description}</p>
                        </div>
                      </CardContent>
                    )}
                    <CardContent className="pt-2">
                      <p className="text-xs text-muted-foreground">Added {item.createdAt.toLocaleDateString()}</p>
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
                    {searchQuery ? "Try adjusting your search" : "Start adding books you'd like to read and exchange"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Book
                    </Button>
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
