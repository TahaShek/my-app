"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Upload, QrCode, Loader2, MapPin, Navigation } from "lucide-react"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic";
import { z } from 'zod'

const LocationPickerModal = dynamic(
  () => import("@/components/locationPickerModal"),
  { ssr: false }
);

// Fix 1: Define the schema with proper typing
const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  genre: z.enum(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Dystopian']),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  description: z.string().max(1000).optional(),
  language: z.string().min(1, 'Language is required').default('English'),
  publicationYear: z.coerce
    .number()
    .min(1000, 'Invalid year')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional()
    .nullable(),
  location: z.string().max(200).optional(),
  pointValue: z.coerce.number().min(1).max(1000),
})

// Fix 2: Explicitly type the form data
type BookFormData = {
  title: string
  author: string
  genre: 'Fiction' | 'Non-Fiction' | 'Mystery' | 'Romance' | 'Science Fiction' | 'Fantasy' | 'Biography' | 'History' | 'Self-Help' | 'Dystopian'
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  description?: string
  language: string
  publicationYear?: number | null
  location?: string
  pointValue: number
}

// Alternative: Use z.infer if you want Zod to infer the type
// type BookFormData = z.infer<typeof bookSchema>

export default function AddBookPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [generatedBookId, setGeneratedBookId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const router = useRouter()

  // Fix 3: Use explicit typing for useForm
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      genre: "Fiction",
      condition: "Good",
      pointValue: 50,
      language: "English",
    },
    mode: "onBlur", // Validate on blur to prevent early validation errors
  })

  // Fix 4: Proper onSubmit handler with correct typing
  const onSubmit = async (data: BookFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("You must be logged in to add a book")
      }

      // Generate QR code data
      const qrData = JSON.stringify({
        bookTitle: data.title,
        author: data.author,
        ownerId: user.id,
        timestamp: new Date().toISOString(),
      })

      // Prepare book data for insertion
      const bookData = {
        title: data.title,
        author: data.author,
        genre: data.genre,
        condition: data.condition,
        description: data.description || null,
        publication_year: data.publicationYear || null,
        owner_id: user.id,
        point_value: data.pointValue,
        language: data.language || 'English',
        qr_code: qrData,
        available: true,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Create book in database
      const { data: newBook, error: dbError } = await supabase
        .from('books')
        .insert([bookData])
        .select()
        .single()

      if (dbError) throw dbError

      if (!newBook) {
        throw new Error("Failed to create book")
      }

      // Set the generated book ID for QR code display
      setGeneratedBookId(newBook.id)
      setShowQRCode(true)

    } catch (error) {
      console.error("Error adding book:", error)
      setError(error instanceof Error ? error.message : "Failed to add book")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    setShowQRCode(false)
    setGeneratedBookId("")
    setError(null)
  }

  const handleAddAnother = () => {
    handleReset()
    router.refresh()
  }

  const genre = watch("genre")
  const condition = watch("condition")
  const pointValue = watch("pointValue")

  if (showQRCode) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <QRCodeGenerator
                bookId={generatedBookId}
                bookTitle={watch("title")}
                onAddAnother={handleAddAnother}
              />
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
                <CardDescription>Fill in the information about the book you&apos;d like to share</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="title">
                        Book Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="Enter book title"
                        {...register("title")}
                        className="h-11"
                        disabled={isLoading}
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author">
                        Author <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="author"
                        type="text"
                        placeholder="Author name"
                        {...register("author")}
                        className="h-11"
                        disabled={isLoading}
                      />
                      {errors.author && (
                        <p className="text-sm text-destructive">{errors.author.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Publication Language</Label>
                      <Select
                        defaultValue="English"
                        onValueChange={(v) => setValue("language", v)}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="language" className="h-11">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {["English", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Portuguese", "Russian"].map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.language && <p className="text-sm text-destructive">{errors.language.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genre">
                        Genre <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={genre}
                        onValueChange={(value) => setValue("genre", value as BookFormData["genre"])}
                        disabled={isLoading}
                      >
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
                      {errors.genre && (
                        <p className="text-sm text-destructive">{errors.genre.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condition">
                        Condition <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={condition}
                        onValueChange={(value) => setValue("condition", value as BookFormData["condition"])}
                        disabled={isLoading}
                      >
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
                      {errors.condition && (
                        <p className="text-sm text-destructive">{errors.condition.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publicationYear">Publication Year (Optional)</Label>
                      <Input
                        id="publicationYear"
                        type="number"
                        placeholder="e.g., 2020"
                        {...register("publicationYear", {
                          setValueAs: (v) => v === "" ? null : Number(v)
                        })}
                        min="1000"
                        max={new Date().getFullYear()}
                        className="h-11"
                        disabled={isLoading}
                      />
                      {errors.publicationYear && (
                        <p className="text-sm text-destructive">{errors.publicationYear.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pointValue">Point Value</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setValue("pointValue", Math.max(1, pointValue - 10))}
                          disabled={pointValue <= 1 || isLoading}
                        >
                          -
                        </Button>
                        <Input
                          id="pointValue"
                          type="number"
                          min="1"
                          max="1000"
                          {...register("pointValue", { valueAsNumber: true })}
                          className="h-11 text-center"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setValue("pointValue", Math.min(1000, pointValue + 10))}
                          disabled={pointValue >= 1000 || isLoading}
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This determines how many points others need to exchange for this book
                      </p>
                      {errors.pointValue && (
                        <p className="text-sm text-destructive">{errors.pointValue.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        type="text"
                        placeholder="e.g., English"
                        {...register("language")}
                        className="h-11"
                        disabled={isLoading}
                      />
                      {errors.language && (
                        <p className="text-sm text-destructive">{errors.language.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Preferred Exchange Location (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="location"
                          type="text"
                          placeholder="e.g., Central Park, Coffee Shop on Main St"
                          {...register("location")}
                          className="h-11 flex-1"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 shrink-0"
                          title="Pick on Map"
                          onClick={() => setShowLocationPicker(true)}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 shrink-0"
                          title="Use Current Location"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                  setValue("location", `Lat: ${pos.coords.latitude.toFixed(5)}, Lng: ${pos.coords.longitude.toFixed(5)}`)
                                },
                                (err) => {
                                  console.error("Geolocation error:", err)
                                  alert("Could not get your location. Please check browser permissions.")
                                }
                              )
                            } else {
                              alert("Geolocation is not supported by your browser")
                            }
                          }}
                        >
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.location && (
                        <p className="text-sm text-destructive">{errors.location.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell others about this book and why you love it..."
                        {...register("description")}
                        rows={4}
                        className="resize-none"
                        disabled={isLoading}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="cover">Book Cover Image (Optional)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                        <Input
                          id="cover"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            // Handle file upload here
                            console.log("File selected:", e.target.files?.[0])
                          }}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding Book...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4" />
                          Add Book & Generate QR Code
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="sm:w-32 h-12 bg-transparent"
                      disabled={isLoading}
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
      {showLocationPicker && (
        <LocationPickerModal
          onClose={() => setShowLocationPicker(false)}
          initialPosition={(() => {
            const currentLoc = watch("location");
            if (currentLoc && currentLoc.startsWith("Lat:")) {
              const parts = currentLoc.split(",");
              if (parts.length === 2) {
                const lat = parseFloat(parts[0].split(":")[1].trim());
                const lng = parseFloat(parts[1].split(":")[1].trim());
                if (!isNaN(lat) && !isNaN(lng)) {
                  return { lat, lng };
                }
              }
            }
            return null;
          })()}
          onSelect={(coords) => {
            setValue("location", `Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`)
            setShowLocationPicker(false)
          }}
        />
      )}
    </div>
  )
}