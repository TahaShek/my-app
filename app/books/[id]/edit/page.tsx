"use client"

import { useState, useEffect } from "react"
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
import { BookOpen, Save, Loader2, ArrowLeft, MapPin, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter, useParams } from "next/navigation"
import { z } from 'zod'
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

const CreateExchangePointDialog = dynamic(
  () => import("@/components/create-exchange-point-dialog"),
  { ssr: false }
)

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  genre: z.enum(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Dystopian']),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'Mint']),
  description: z.string().max(1000).optional(),
  language: z.string().min(1, 'Language is required'),
  publicationYear: z.coerce.number().nullable().optional(),
  pointValue: z.coerce.number().min(1).max(1000),
  exchangePointId: z.string().min(1, 'Please select an exchange point'),
  available: z.boolean().default(true),
})

type BookFormData = z.infer<typeof bookSchema>

interface ExchangePoint {
  id: string
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
}

export default function EditBookPage() {
  const { id } = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exchangePoints, setExchangePoints] = useState<ExchangePoint[]>([])
  const [loadingPoints, setLoadingPoints] = useState(true)
  const [showCreatePoint, setShowCreatePoint] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
  })

  // Fetch exchange points
  useEffect(() => {
    const fetchExchangePoints = async () => {
      setLoadingPoints(true)
      const { data, error } = await supabase
        .from("exchange_locations")
        .select("*")
        .order("name")

      if (error) {
        console.error("Error fetching exchange points:", error)
      } else {
        setExchangePoints(data || [])
      }
      setLoadingPoints(false)
    }

    fetchExchangePoints()
  }, [])

  useEffect(() => {
    loadBook()
  }, [id])

  const loadBook = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Unauthorized")

      const { data: book, error: fetchError } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .eq("owner_id", user.id)
        .single()

      if (fetchError || !book) throw new Error("Book not found or access denied")

      reset({
        title: book.title,
        author: book.author,
        genre: book.genre,
        condition: book.condition,
        description: book.description || "",
        language: book.language || 'English',
        publicationYear: book.publication_year,
        pointValue: book.point_value,
        exchangePointId: book.exchange_point_id || "",
        available: book.available,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: BookFormData) => {
    setIsSaving(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("books")
        .update({
          title: data.title,
          author: data.author,
          genre: data.genre,
          condition: data.condition,
          description: data.description,
          language: data.language,
          publication_year: data.publicationYear,
          point_value: data.pointValue,
          exchange_point_id: data.exchangePointId, // ✅ UPDATE EXCHANGE POINT
          available: data.available,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (updateError) throw updateError

      // Get exchange point info for success message
      const selectedPoint = exchangePoints.find(p => p.id === data.exchangePointId)
      
      toast({
        title: "✅ Book Updated",
        description: `"${data.title}" details updated${selectedPoint ? ` and relocated to ${selectedPoint.name}` : ''}`,
      })

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsSaving(false)
      toast({
        title: "❌ Update Failed",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handlePointCreated = async (newPoint: ExchangePoint) => {
    setExchangePoints([...exchangePoints, newPoint])
    setValue("exchangePointId", newPoint.id)
    setShowCreatePoint(false)
    toast({
      title: "✅ Exchange Point Created",
      description: `${newPoint.name} has been added`,
    })
  }

  const genre = watch("genre")
  const condition = watch("condition")
  const exchangePointId = watch("exchangePointId")

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
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Button variant="ghost" asChild className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground font-serif mb-3">Edit Book Details</h1>
              <p className="text-lg text-muted-foreground">
                Update information and change the exchange point location
              </p>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Book Information</CardTitle>
                <CardDescription>Modify the details of your listed book</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="title">
                        Book Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        {...register("title")}
                        className="h-11"
                        disabled={isSaving}
                      />
                      {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    {/* Author */}
                    <div className="space-y-2">
                      <Label htmlFor="author">
                        Author <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="author"
                        {...register("author")}
                        className="h-11"
                        disabled={isSaving}
                      />
                      {errors.author && <p className="text-sm text-destructive">{errors.author.message}</p>}
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                      <Label htmlFor="language">
                        Language <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={watch("language")}
                        onValueChange={(v) => setValue("language", v)}
                        disabled={isSaving}
                      >
                        <SelectTrigger id="language" className="h-11">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {["English", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Portuguese", "Russian", "Urdu", "Hindi"].map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.language && <p className="text-sm text-destructive">{errors.language.message}</p>}
                    </div>

                    {/* Genre */}
                    <div className="space-y-2">
                      <Label htmlFor="genre">
                        Genre <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={genre}
                        onValueChange={(v) => setValue("genre", v as any)}
                        disabled={isSaving}
                      >
                        <SelectTrigger id="genre" className="h-11">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction", "Fantasy", "Biography", "History", "Self-Help", "Dystopian"].map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.genre && <p className="text-sm text-destructive">{errors.genre.message}</p>}
                    </div>

                    {/* Condition */}
                    <div className="space-y-2">
                      <Label htmlFor="condition">
                        Condition <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={condition}
                        onValueChange={(v) => setValue("condition", v as any)}
                        disabled={isSaving}
                      >
                        <SelectTrigger id="condition" className="h-11">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Mint", "Excellent", "Good", "Fair", "Poor"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
                    </div>

                    {/* Publication Year */}
                    <div className="space-y-2">
                      <Label htmlFor="publicationYear">Publication Year</Label>
                      <Input
                        id="publicationYear"
                        type="number"
                        {...register("publicationYear", {
                          setValueAs: (v) => v === "" ? null : Number(v)
                        })}
                        min="1000"
                        max={new Date().getFullYear()}
                        className="h-11"
                        disabled={isSaving}
                      />
                      {errors.publicationYear && <p className="text-sm text-destructive">{errors.publicationYear.message}</p>}
                    </div>

                    {/* Point Value */}
                    <div className="space-y-2">
                      <Label htmlFor="pointValue">
                        Point Value <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="pointValue"
                        type="number"
                        {...register("pointValue")}
                        className="h-11"
                        disabled={isSaving}
                        min="1"
                        max="1000"
                      />
                      {errors.pointValue && <p className="text-sm text-destructive">{errors.pointValue.message}</p>}
                    </div>

                    {/* ✅ EXCHANGE POINT SELECTOR */}
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="exchangePoint">
                        Exchange Point Location <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Where is this book currently located for pickup?
                      </p>
                      
                      {loadingPoints ? (
                        <div className="flex items-center justify-center h-11 border rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">Loading locations...</span>
                        </div>
                      ) : (
                        <>
                          <Select
                            value={exchangePointId}
                            onValueChange={(value) => {
                              if (value === "create_new") {
                                setShowCreatePoint(true)
                              } else {
                                setValue("exchangePointId", value)
                              }
                            }}
                            disabled={isSaving}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select an exchange point" />
                            </SelectTrigger>
                            <SelectContent>
                              {exchangePoints.map(point => (
                                <SelectItem key={point.id} value={point.id}>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    <span className="font-medium">{point.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      - {point.city || point.address}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                              <SelectItem value="create_new">
                                <div className="flex items-center gap-2 text-primary font-medium">
                                  <Plus className="h-3 w-3" />
                                  Create New Exchange Point
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.exchangePointId && (
                            <p className="text-sm text-destructive">{errors.exchangePointId.message}</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        rows={4}
                        className="resize-none"
                        disabled={isSaving}
                      />
                      {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 gap-2"
                      disabled={isSaving || !exchangePointId}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      className="sm:w-32 h-12"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* Create Exchange Point Dialog */}
      {showCreatePoint && (
        <CreateExchangePointDialog
          open={showCreatePoint}
          onOpenChange={setShowCreatePoint}
          onPointCreated={handlePointCreated}
        />
      )}
    </div>
  )
}