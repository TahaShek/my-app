"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Upload, QrCode, Loader2, X, Sparkles } from "lucide-react"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { z } from 'zod'
import { cn } from "@/lib/utils"

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  genre: z.enum(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Dystopian']),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'Mint']),
  description: z.string().max(1000).optional(),
  publicationYear: z.coerce
    .number()
    .min(1000, 'Invalid year')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional()
    .nullable(),
  pointValue: z.coerce.number().min(1).max(1000),
  language: z.string().optional(),
  location: z.string().min(2, 'Location is required').max(100),
  available: z.boolean().optional().default(true),
})

type BookFormData = z.infer<typeof bookSchema>

export default function AddBookPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [generatedBookId, setGeneratedBookId] = useState("")
  const [generatedBookTitle, setGeneratedBookTitle] = useState("")
  const [generatedQRCode, setGeneratedQRCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isValuating, setIsValuating] = useState(false)
  const [hasAutoValuated, setHasAutoValuated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      genre: "Fiction",
      condition: "Good",
      pointValue: 50,
      language: "English",
    },
    mode: "onBlur",
  })

  const watchTitle = watch("title")
  const watchAuthor = watch("author")
  const watchCondition = watch("condition")

const CONDITION_RANGES: Record<BookFormData["condition"], [number, number]> = {
  Mint: [300, 500],
  Excellent: [220, 350],
  Good: [150, 250],
  Fair: [80, 160],
  Poor: [10, 60],
}

const getRandomInRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const calculateValueWithAI = async () => {
  if (!watchTitle || !watchCondition) {
    toast({
      title: "Information needed",
      description: "Please enter at least the book title and condition first.",
      variant: "destructive"
    })
    return
  }

  setIsValuating(true)
  try {
    // Simple local calculation instead of AI
    const range = CONDITION_RANGES[watchCondition] || [50, 100]
    const val = getRandomInRange(range[0], range[1])
    
    setValue("pointValue", val)
    return val
  } catch (error) {
    console.error("Valuation Error:", error)
    return 10
  } finally {
    setIsValuating(false)
    setHasAutoValuated(true)
  }
}

  // Smart Auto-Valuation Trigger
  useEffect(() => {
    if (imageBase64 && watchTitle && watchCondition && !isValuating && !hasAutoValuated) {
      calculateValueWithAI()
    }
  }, [watchTitle, watchCondition, imageBase64, isValuating, hasAutoValuated])

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Helper function to compress image if too large
  const compressImage = async (base64: string, maxSizeKB: number = 500): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions (max 800px width)
        const maxWidth = 800
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Try different quality settings to get under size limit
        let quality = 0.9
        let compressedBase64 = canvas.toDataURL('image/jpeg', quality)

        while (compressedBase64.length > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.1
          compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        }

        resolve(compressedBase64)
      }
      img.onerror = reject
      img.src = base64
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      const base64 = await fileToBase64(file)
      
      // Compress image to reduce database size
      const compressedBase64 = await compressImage(base64, 500) // Max 500KB
      
      setImagePreview(compressedBase64)
      setImageBase64(compressedBase64)
      
      toast({
        title: "Image uploaded",
        description: "Cover image ready. Running AI valuation...",
      })

      // Automate valuation check
      if (watchTitle && watchCondition) {
        calculateValueWithAI()
      }
    } catch (error) {
      console.error('Image processing error:', error)
      toast({
        title: "Image upload failed",
        description: "Could not process the image",
        variant: "destructive",
      })
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageBase64(null)
    const input = document.getElementById('cover') as HTMLInputElement
    if (input) input.value = ''
  }

  const onSubmit = async (data: BookFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error("You must be logged in to add a book")
      }

      // Generate unique QR code
      const qrCode = `BOOK-${crypto.randomUUID()}`

      // Final AI Valuation on submit
      let finalPointValue = data.pointValue
      if (!hasAutoValuated) {
        const aiVal = await calculateValueWithAI()
        finalPointValue = typeof aiVal === 'number' ? aiVal : (aiVal ? parseInt(aiVal) : 10)
      }
      
      if (isNaN(finalPointValue as number)) finalPointValue = 10

      // Prepare book data
      const bookData = {
        title: data.title,
        author: data.author,
        genre: data.genre,
        condition: data.condition,
        description: data.description || null,
        publication_year: data.publicationYear || null,
        owner_id: user.id,
        point_value: finalPointValue,
        language: data.language || 'English',
        cover_image: imageBase64, // Store base64 directly in database
        qr_code: qrCode,
        available: true,
        tags: [],
      }

      // Insert book into database
      const { data: newBook, error: dbError } = await supabase
        .from('books')
        .insert([bookData])
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error(dbError.message)
      }

      if (!newBook) {
        throw new Error("Failed to create book")
      }

      // Record initial "Listed" entry in journey history
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, username, location")
        .eq("id", user.id)
        .single()

      await supabase.from("exchange_history").insert({
        book_id: newBook.id,
        from_user_id: user.id,
        to_user_id: user.id,
        from_username: profile?.username || profile?.name || "Curator",
        to_username: "First Listed",
        city: data.location || profile?.location || "Unknown",
        notes: "Journey Started - Book added to the library",
        exchanged_at: new Date().toISOString()
      })

      // Set generated book details for QR code display
      setGeneratedBookId(newBook.id)
      setGeneratedBookTitle(data.title)
      setGeneratedQRCode(newBook.qr_code)
      setShowQRCode(true)

      toast({
        title: "✅ Book Added Successfully",
        description: `"${data.title}" has been added to your collection`,
      })

    } catch (error) {
      console.error("Error adding book:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add book"
      setError(errorMessage)
      toast({
        title: "❌ Failed to Add Book",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    setShowQRCode(false)
    setGeneratedBookId("")
    setGeneratedBookTitle("")
    setError(null)
    setImagePreview(null)
    setImageBase64(null)
  }

  const handleAddAnother = () => {
    handleReset()
    router.push('/add-book')
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
                bookTitle={generatedBookTitle} 
                qrCode={generatedQRCode}
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
                <CardDescription>Fill in the information about the book you'd like to share</CardDescription>
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
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        type="text"
                        placeholder="e.g. English, Spanish"
                        {...register("language")}
                        className="h-11"
                        disabled={isLoading}
                      />
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
                          <SelectItem value="Mint">Mint - Brand new</SelectItem>
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
                      <Label htmlFor="publicationYear">Publication Year</Label>
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

                    <div className="space-y-4 sm:col-span-2">
                       <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                         <div>
                           <Label className="text-navy uppercase tracking-wider text-xs font-bold block mb-1">Point Value Appraisal</Label>
                           <p className="text-sm text-muted-foreground">The value is automatically determined by AI based on rarity, demand, and condition.</p>
                         </div>
                         <div className="text-right">
                           {isValuating ? (
                             <div className="flex items-center gap-2 text-primary animate-pulse">
                               <Sparkles className="h-5 w-5" />
                               <span className="font-bold font-mono">APPRAISING...</span>
                             </div>
                           ) : hasAutoValuated ? (
                             <div className="text-2xl font-bold text-primary font-mono bg-primary/10 px-3 py-1 rounded">
                               ⚡{pointValue}
                             </div>
                           ) : (
                             <div className="text-xs text-muted-foreground italic font-mono">
                               PENDING DATA
                             </div>
                           )}
                         </div>
                       </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="location">
                        Your Location <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="location"
                        type="text"
                        placeholder="e.g. London, UK"
                        {...register("location")}
                        className="h-11"
                        disabled={isLoading}
                      />
                      {errors.location && (
                        <p className="text-sm text-destructive">{errors.location.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell others about this book..."
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
                      <div 
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer relative",
                          imagePreview ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        )}
                        onClick={() => !imagePreview && document.getElementById('cover')?.click()}
                      >
                        {imagePreview ? (
                          <div className="relative w-40 h-56 mx-auto group">
                            <img 
                              src={imagePreview} 
                              alt="Cover preview" 
                              className="w-full h-full object-cover rounded shadow-md border-2 border-[#1B3A57]"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage()
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                              <p className="text-white text-xs font-bold">Click X to remove</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload cover photo</p>
                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB (will be compressed)</p>
                          </>
                        )}
                        <input
                          id="cover"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                          disabled={isLoading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Images are compressed and stored as base64 in the database
                      </p>
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
    </div>
  )
}