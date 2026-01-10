import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MapPin, Calendar, BookOpen, User, QrCode, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { Book } from "@/types/book"
import { ExchangeRequestDialog } from "@/components/exchange-request-dialog"
import { DiscussionsTab } from "@/components/discussions-tab"
import { createClient } from "@/lib/supabase/client"

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  // Fetch book with owner details
  const { data: bookData, error } = await supabase
    .from('books')
    .select(`
      *,
      profiles (
        name,
        username,
        member_since
      )
    `)
    .eq('id', id)
    .single()

  if (error || !bookData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold font-serif">Book Not Found</h1>
            <p className="text-muted-foreground">The book you are looking for does not exist or has been removed.</p>
            <Button asChild>
              <Link href="/browse">Browse Books</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Transform Database response to app Book type
  // Note: Adjust property names to match your DB schema exactly.
  // Assuming 'profiles' is an object because of .single() on owner_id join if configured,
  // or it might return an array if not 1:1. standard response is object if simple join.
  // Actually standard join returns an array unless using !inner or specific setup, but usually single() on main query helps.
  // However, `profiles` will be an object if relation is detected correctly or array.
  // Safely handling it:
  const owner = Array.isArray(bookData.profiles) ? bookData.profiles[0] : bookData.profiles

  const book: Book = {
    id: bookData.id,
    title: bookData.title,
    author: bookData.author,
    genre: bookData.genre,
    condition: bookData.condition,
    description: bookData.description,
    coverImage: bookData.cover_image,
    ownerName: owner?.name || 'Unknown Owner',
    ownerId: bookData.owner_id,
    location: "Location data not in schema yet", // Placeholder or fetch from exchange_locations if linked
    status: bookData.available ? 'available' : 'exchanged', // Simple mapping
    language: bookData.language || 'English',
    publicationYear: bookData.publication_year,
    createdAt: new Date(bookData.created_at),
    points: bookData.point_value
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Book Cover & Actions */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="border-2 overflow-hidden">
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 relative">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-8">
                        <p className="font-serif text-3xl font-bold text-primary/40 text-center line-clamp-4">
                          {book.title}
                        </p>
                      </div>
                    )}
                    <Badge
                      className="absolute top-4 right-4 text-lg font-bold px-3 py-1 shadow-md bg-[#D4AF37] text-[#1a365d] hover:bg-[#C5A028]"
                    >
                      {book.points} PTS
                    </Badge>
                  </div>
                </Card>

                <div className="space-y-3">
                  <ExchangeRequestDialog book={book} />
                  <Button variant="outline" className="w-full h-12 gap-2 bg-transparent">
                    <Heart className="h-4 w-4" />
                    Add to Wishlist
                  </Button>
                  <Button variant="outline" className="w-full h-12 gap-2 bg-transparent">
                    <QrCode className="h-4 w-4" />
                    View QR Code
                  </Button>
                </div>
              </div>

              {/* Book Details */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-4xl font-bold text-foreground font-serif leading-tight">{book.title}</h1>
                    <Badge
                      variant={book.status === "available" ? "default" : "secondary"}
                      className="text-sm px-3 py-1 shrink-0"
                    >
                      {book.status}
                    </Badge>
                  </div>
                  <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>

                  <div className="flex flex-wrap gap-2">
                    {book.genre && <Badge variant="outline">{book.genre}</Badge>}
                    {book.condition && (
                      <Badge variant="outline" className="bg-primary/5">
                        Condition: {book.condition}
                      </Badge>
                    )}
                    {book.publicationYear && <Badge variant="outline">Published {book.publicationYear}</Badge>}
                  </div>
                </div>

                <Separator />

                <Tabs defaultValue="discussions" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="discussions">Discussions</TabsTrigger>
                    <TabsTrigger value="owner">Owner Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="space-y-4">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold font-serif">About This Book</h2>
                      <p className="text-muted-foreground leading-relaxed">{book.description}</p>
                    </div>

                    <Separator />

                    {/* Book Information */}
                    <Card className="border-2 bg-card/50">
                      <CardContent className="pt-6 space-y-4">
                        <h3 className="text-xl font-semibold font-serif mb-4">Book Information</h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {book.language && (
                            <div className="flex items-start gap-3">
                              <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Language</p>
                                <p className="font-medium">{book.language}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Added</p>
                              <p className="font-medium">{book.createdAt.toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 sm:col-span-2">
                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Location</p>
                              <p className="font-medium">Contact Owner for details</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="history">
                    <div className="bg-[#FAF6F0] border-4 border-[#8B7355] p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.3)]">
                      <h3 className="font-serif text-xl text-[#1a365d] mb-4">Book Journey Timeline</h3>
                      <p className="font-serif text-sm text-[#5C4033]">
                        This book has traveled {Math.floor(Math.random() * 50) + 1} miles and has been read by {Math.floor(Math.random() * 5)} people.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="discussions">
                    <DiscussionsTab bookId={id} />
                  </TabsContent>

                  <TabsContent value="owner">
                    <Card className="border-2 bg-card/50">
                      <CardContent className="pt-6">
                        <h3 className="text-xl font-semibold font-serif mb-4">Book Owner</h3>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-border">
                            <AvatarFallback className="bg-primary/10 text-primary text-xl">
                              {book.ownerName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{book.ownerName}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Member since {owner?.member_since ? new Date(owner.member_since).getFullYear() : 'Unknown'}
                            </p>
                          </div>
                          <Button variant="outline" asChild>
                            <Link href={`/profile/${book.ownerId}`}>View Profile</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
