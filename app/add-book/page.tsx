"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Upload, QrCode } from "lucide-react"
import { QRCodeGenerator } from "@/components/qr-code-generator"

export default function AddBookPage() {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [genre, setGenre] = useState("")
  const [condition, setCondition] = useState("")
  const [description, setDescription] = useState("")
  const [isbn, setIsbn] = useState("")
  const [publicationYear, setPublicationYear] = useState("")
  const [location, setLocation] = useState("")
  const [showQRCode, setShowQRCode] = useState(false)
  const [generatedBookId, setGeneratedBookId] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Generate a mock book ID for QR code
    const bookId = `book-${Date.now()}`
    setGeneratedBookId(bookId)
    setShowQRCode(true)

    console.log("[v0] Book added:", {
      title,
      author,
      genre,
      condition,
      description,
      isbn,
      publicationYear,
      location,
      bookId,
    })

    // In production, this would save to Supabase and then show the QR code
  }

  const handleReset = () => {
    setTitle("")
    setAuthor("")
    setGenre("")
    setCondition("")
    setDescription("")
    setIsbn("")
    setPublicationYear("")
    setLocation("")
    setShowQRCode(false)
    setGeneratedBookId("")
  }

  if (showQRCode) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <QRCodeGenerator bookId={generatedBookId} bookTitle={title} onAddAnother={handleReset} />
            </div>
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
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground font-serif mb-3">Add a Book</h1>
              <p className="text-lg text-muted-foreground">
                Share your books with the community and generate a QR code for easy exchanges
              </p>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Book Details</CardTitle>
                <CardDescription>Fill in the information about the book you'd like to share</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="title">
                        Book Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="Enter book title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author">
                        Author <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="author"
                        type="text"
                        placeholder="Author name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        type="text"
                        placeholder="ISBN number"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genre">
                        Genre <span className="text-destructive">*</span>
                      </Label>
                      <Select value={genre} onValueChange={setGenre} required>
                        <SelectTrigger id="genre" className="h-11">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fiction">Fiction</SelectItem>
                          <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                          <SelectItem value="Mystery">Mystery</SelectItem>
                          <SelectItem value="Romance">Romance</SelectItem>
                          <SelectItem value="Science Fiction">Science Fiction</SelectItem>
                          <SelectItem value="Fantasy">Fantasy</SelectItem>
                          <SelectItem value="Biography">Biography</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Self-Help">Self-Help</SelectItem>
                          <SelectItem value="Dystopian">Dystopian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condition">
                        Condition <span className="text-destructive">*</span>
                      </Label>
                      <Select value={condition} onValueChange={setCondition} required>
                        <SelectTrigger id="condition" className="h-11">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">Excellent - Like new</SelectItem>
                          <SelectItem value="Good">Good - Minor wear</SelectItem>
                          <SelectItem value="Fair">Fair - Visible wear</SelectItem>
                          <SelectItem value="Poor">Poor - Heavy wear</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Publication Year</Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="e.g., 2020"
                        value={publicationYear}
                        onChange={(e) => setPublicationYear(e.target.value)}
                        min="1000"
                        max={new Date().getFullYear()}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="location">Preferred Exchange Location</Label>
                      <Input
                        id="location"
                        type="text"
                        placeholder="e.g., Central Park, Coffee Shop on Main St"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell others about this book and why you love it..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="cover">Book Cover Image (Optional)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="submit" className="flex-1 h-12 bg-primary hover:bg-primary/90 gap-2">
                      <QrCode className="h-4 w-4" />
                      Add Book & Generate QR Code
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="sm:w-32 h-12 bg-transparent"
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
