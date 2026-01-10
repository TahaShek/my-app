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
import { BookOpen, Save, Loader2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter, useParams } from "next/navigation"
import { z } from 'zod'
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  genre: z.enum(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Dystopian']),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'Mint']),
  description: z.string().max(1000).optional(),
  language: z.string().min(1, 'Language is required'),
  publicationYear: z.coerce.number().nullable().optional(),
  pointValue: z.coerce.number().min(1).max(1000),
  available: z.boolean().default(true),
})

type BookFormData = z.infer<typeof bookSchema>

export default function EditBookPage() {
  const { id } = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
          available: data.available,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (updateError) throw updateError
      
      toast({
        title: "Archive Updated",
        description: "The manuscript details have been successfully amended.",
        variant: "vintage",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsSaving(false)
      toast({
        title: "Error",
        description: "Failed to update archive entry: " + err.message,
        variant: "destructive",
      })
    }
  }

  const genre = watch("genre")
  const condition = watch("condition")

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
              <h1 className="text-4xl font-bold text-foreground font-serif mb-3">Update Archive Entry</h1>
              <p className="text-lg text-muted-foreground tracking-tight">
                Amend the details of your document in the global collection.
              </p>
            </div>

            <Card className="border-2 shadow-[4px_4px_0_rgba(42,24,16,0.1)]">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Document Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...register("title")}
                        className="h-11 font-serif text-lg"
                        disabled={isSaving}
                      />
                      {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        {...register("author")}
                        className="h-11"
                        disabled={isSaving}
                      />
                      {errors.author && <p className="text-sm text-destructive">{errors.author.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genre">Genre</Label>
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

                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select
                        value={condition}
                        onValueChange={(v) => setValue("condition", v as any)}
                        disabled={isSaving}
                      >
                        <SelectTrigger id="condition" className="h-11">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Excellent", "Good", "Fair", "Poor", "Mint"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Publication Language</Label>
                      <Select
                        value={watch("language")}
                        onValueChange={(v) => setValue("language", v)}
                        disabled={isSaving}
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
                      <Label htmlFor="pointValue">Transaction Points</Label>
                      <Input
                        id="pointValue"
                        type="number"
                        {...register("pointValue")}
                        className="h-11"
                        disabled={isSaving}
                      />
                      {errors.pointValue && <p className="text-sm text-destructive">{errors.pointValue.message}</p>}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        rows={5}
                        className="resize-none font-serif text-base leading-relaxed"
                        disabled={isSaving}
                      />
                      {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 gap-2 text-lg"
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      {isSaving ? "Saving Changes..." : "Commit Update"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      className="h-12 px-8"
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
    </div>
  )
}
