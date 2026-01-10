"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Save, ArrowLeft, Camera, ShieldCheck, MapPin, User, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Passport ID (Username) must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only alphanumeric and underscores allowed"),
  bio: z.string().max(200, "Bio must be under 200 characters").optional().or(z.literal("")),
  location: z.string().min(2, "Dispatch Location must be at least 2 characters").optional().or(z.literal("")),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true)
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !authUser) {
          router.push("/login")
          return
        }
        setUser(authUser)

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (error) throw error
        setProfile(data)
        reset({
          name: data.name || "",
          username: data.username || "",
          bio: data.bio || "",
          location: data.location || "",
        })
      } catch (err) {
        console.error("Error loading profile:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [reset, router])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          username: data.username,
          bio: data.bio,
          location: data.location,
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Passport Updated",
        description: "Your bureau archives have been successfully renewed.",
        variant: "vintage",
      })
      router.push("/dashboard")
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Error renewing passport: " + err.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f1e8]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-[#1e3a5f] animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f1e8] font-serif">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" asChild className="mb-8 hover:bg-[#1e3a5f]/5 text-[#1e3a5f]">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Bureau
            </Link>
          </Button>

          <Card className="border-2 border-[#1e3a5f]/20 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm relative">
            {/* Decorative Bureau Stripe */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1e3a5f] via-[#d4af37] to-[#1e3a5f]" />
            
            <CardHeader className="bg-[#1e3a5f]/5 border-b border-[#1e3a5f]/10 pb-8 pt-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-3xl font-bold font-serif text-[#1e3a5f]">Passport Renewal</CardTitle>
                <div className="bg-[#d4af37]/20 px-3 py-1 rounded border border-[#d4af37]/30 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
                  <span className="text-[10px] uppercase tracking-tighter font-sans font-bold text-[#1e3a5f]">Valid Identity Document</span>
                </div>
              </div>
              <CardDescription className="text-[#1e3a5f]/70 italic">
                Central International Book Bureau - Identity Verification Form
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8 space-y-8">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 border-b border-dashed border-[#1e3a5f]/20 pb-8">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-[#1e3a5f]/10 shadow-inner">
                    <AvatarImage src={profile?.avatar} />
                    <AvatarFallback className="bg-[#1e3a5f]/5 text-[#1e3a5f] text-4xl">
                      {profile?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-2 bg-[#d4af37] text-white rounded-full shadow-lg border-2 border-white hover:bg-[#b8881e] transition-colors group-hover:scale-110">
                    <Camera className="h-5 w-5" />
                  </button>
                  <div className="mt-2 text-center text-[10px] uppercase tracking-widest text-[#1e3a5f]/50 font-sans">
                    Official Photo
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-bold font-serif text-[#1e3a5f]">Identity Credentials</h3>
                  <p className="text-sm text-[#1e3a5f]/60 leading-relaxed font-sans mt-2">
                    Ensure all information matches your Traveler's Log. Incorrect information may delay book exchanges within the bureau.
                  </p>
                  <div className="pt-4 flex items-center gap-4 text-xs font-sans uppercase tracking-tighter">
                    <span className="text-[#d4af37] font-bold">Member Since:</span>
                    <span className="text-[#1e3a5f]">{new Date(profile?.member_since || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#1e3a5f] font-bold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    BUREAU NAME (FULL LEGAL)
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    className={cn(
                      "bg-[#f5f1e8]/30 font-sans text-lg border-[#1e3a5f]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20",
                      errors.name && "border-red-500"
                    )}
                    placeholder="E.g. Irtaza Ahmad"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1 italic font-sans">{errors.name.message}</p>}
                </div>

                {/* Passport ID / Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[#1e3a5f] font-bold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    PASSPORT ID (USERNAME)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1e3a5f]/40 font-sans">@</span>
                    <Input
                      id="username"
                      {...register("username")}
                      className={cn(
                        "bg-[#f5f1e8]/30 font-sans text-lg border-[#1e3a5f]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20 pl-8",
                        errors.username && "border-red-500"
                      )}
                      placeholder="username"
                    />
                  </div>
                  {errors.username && <p className="text-red-500 text-xs mt-1 italic font-sans">{errors.username.message}</p>}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-[#1e3a5f] font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    DISPATCH LOCATION (CITY)
                  </Label>
                  <Input
                    id="location"
                    {...register("location")}
                    className={cn(
                      "bg-[#f5f1e8]/30 font-sans text-lg border-[#1e3a5f]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20",
                      errors.location && "border-red-500"
                    )}
                    placeholder="E.g. London, UK"
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1 italic font-sans">{errors.location.message}</p>}
                </div>

                {/* Biography */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[#1e3a5f] font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    TRAVELER'S NOTES (BIOGRAPHY)
                  </Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    className={cn(
                      "bg-[#f5f1e8]/30 font-sans text-lg border-[#1e3a5f]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20 min-h-[120px] resize-none",
                      errors.bio && "border-red-500"
                    )}
                    placeholder="Briefly describe your literary voyage..."
                  />
                  {errors.bio && <p className="text-red-500 text-xs mt-1 italic font-sans">{errors.bio.message}</p>}
                  <p className="text-right text-[10px] text-[#1e3a5f]/40 font-sans uppercase">Character Limit: 200</p>
                </div>

                {/* Actions */}
                <div className="pt-8 flex flex-col sm:flex-row gap-4 pt-8 border-t border-dashed border-[#1e3a5f]/20">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-[#f5f1e8] h-12 text-lg font-serif border-b-4 border-[#0a1b2e] active:border-b-0 active:translate-y-[2px] transition-all"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        PROCESSING RENEWAL...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        APPLY FOR RENEWAL
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="flex-1 h-12 text-lg font-serif border-2 border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/5 text-[#1e3a5f]"
                  >
                    <Link href="/dashboard">CANCEL APPLICATION</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
            
            {/* Decorative Footnote */}
            <div className="bg-[#1e3a5f] py-3 px-6 flex justify-between items-center text-[10px] text-[#f5f1e8]/50 uppercase tracking-[0.2em] font-sans">
              <span>Identity Sec: 40168-A9BF</span>
              <span>Prop of International Book Bureau</span>
              <span>© 1974 REVS</span>
            </div>
          </Card>

          {/* Bureau Stamp Visual */}
          <div className="mt-12 opacity-10 flex justify-center selection:bg-transparent pointer-events-none">
            <div className="border-4 border-[#1e3a5f] p-4 rounded-xl rotate-[-5deg] scale-150">
              <div className="border-2 border-[#1e3a5f] p-2 flex flex-col items-center">
                <span className="font-bold text-2xl tracking-[0.2em]">APPROVED</span>
                <span className="text-[8px] tracking-widest mt-1">BUREAU OF RECORDS</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
