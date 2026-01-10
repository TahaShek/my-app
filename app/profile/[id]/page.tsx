import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Calendar, MapPin, Star } from "lucide-react"
import { BookCard } from "@/components/book-card"
import Link from "next/link"
import type { Book } from "@/types/book"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

// Mock data removed

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !profile) {
    notFound()
  }

  const { data: booksData } = await supabase
    .from("books")
    .select("*")
    .eq("owner_id", id)

  const user = {
    id: profile.id,
    name: profile.name || profile.username || "Local Collector",
    bio: profile.bio || "No biography provided yet.",
    joinedDate: new Date(profile.created_at || Date.now()),
    location: profile.location || "Unknown Location",
  }

  const userBooks: Book[] = (booksData || []).map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    genre: book.genre,
    condition: book.condition,
    description: book.description,
    coverImage: book.cover_image,
    ownerName: user.name,
    ownerId: book.owner_id,
    available: book.available,
    pointValue: book.point_value,
    qrCode: book.qr_code,
    wishlistCount: 0,
    createdAt: new Date(book.created_at),
  }))

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold font-serif">User Not Found</h1>
            <Button asChild>
              <Link href="/browse">Browse Books</Link>
            </Button>
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
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Profile Header */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                      {user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold font-serif mb-2">{user.name}</h1>
                    <p className="text-muted-foreground mb-4">{user.bio}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{user.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Joined {user.joinedDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        <span>5.0 Rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* User's Books */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold font-serif">Books Available</h2>
                  <p className="text-muted-foreground">{userBooks.length} books for exchange</p>
                </div>
              </div>

              {userBooks.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-12 pb-12 text-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No books available</h3>
                    <p className="text-muted-foreground">This user hasn't listed any books yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
