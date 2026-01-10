"use client"

import Link from "next/link"
import { Plane, Coins, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function Header() {
  const [userPoints, setUserPoints] = useState<number | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let profileSubscription: any = null

    const setup = async () => {
      // Fetch current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      setIsLoggedIn(true)

      // Fetch initial points
      const { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", session.user.id)
        .single()
      
      if (profile?.points !== undefined) {
        setUserPoints(profile.points)
      }

      // Setup real-time subscription to profile updates
      profileSubscription = supabase
        .channel(`profile-updates-${session.user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${session.user.id}`,
          },
          (payload: any) => {
            if (payload.new?.points !== undefined) {
              setUserPoints(payload.new.points)
            }
          }
        )
        .subscribe()
    }

    setup()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session) {
        setIsLoggedIn(true)
        setup() // re-setup subscription for new user
      } else {
        setIsLoggedIn(false)
        setUserPoints(null)
        if (profileSubscription) profileSubscription.unsubscribe()
      }
    })

    return () => {
      subscription.unsubscribe()
      if (profileSubscription) profileSubscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: "Logged Out",
        description: "Your session has been terminated. Safe travels!",
        variant: "vintage",
      })
      router.push("/")
      router.refresh()
    } catch (err: any) {
      toast({
        title: "Logout Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  return (
    <header className="border-b-3 border-[#1B3A57] bg-[#F4ECD8] sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-[#1B3A57] border-2 border-[#C5A572] flex items-center justify-center relative">
                <Plane className="h-6 w-6 text-[#C5A572]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#C1403D] border border-[#F4ECD8]" />
              </div>
            </div>
            <div>
              <h1
                className="font-mono font-bold text-xl md:text-2xl text-[#1B3A57] tracking-wider uppercase"
                style={{ letterSpacing: "3px" }}
              >
                BooksExchange
              </h1>
              <p className="font-mono text-[9px] tracking-widest text-[#6B5E4F] uppercase">
                International Book Bureau
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="font-mono text-[11px] tracking-wider uppercase text-[#1B3A57] hover:text-[#C1403D] transition-colors">
              Arrivals
            </Link>
            <Link href="/wish" className="font-mono text-[11px] tracking-wider uppercase text-[#1B3A57] hover:text-[#C1403D] transition-colors">
              Wishlist
            </Link>
            <Link href="/messages" className="font-mono text-[11px] tracking-wider uppercase text-[#1B3A57] hover:text-[#C1403D] transition-colors flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Messages
            </Link>
            <Link href="/dashboard" className="font-mono text-[11px] tracking-wider uppercase text-[#1B3A57] hover:text-[#C1403D] transition-colors">
              My Passport
            </Link>
            <Link href="/buy-points" className="font-mono text-[11px] tracking-wider uppercase text-[#1B3A57] hover:text-[#C1403D] transition-colors">
              Currency Exchange
            </Link>
            <Link href="/exchange-points" className="font-mono text-[11px] tracking-wider uppercase text-[#1B3A57] hover:text-[#C1403D] transition-colors">
              Nearby Books
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn && userPoints !== null && (
              <Link href="/buy-points" className="hidden sm:flex items-center gap-2 bg-[#C5A572] border-2 border-[#1B3A57] px-3 py-1.5 hover:scale-105 transition-transform">
                <Coins className="h-4 w-4 text-[#1B3A57]" />
                <span className="font-bold text-[#1B3A57] text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  ⚡{userPoints}
                </span>
              </Link>
            )}

            {!isLoggedIn ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex bg-transparent border-2 border-[#1B3A57] text-[#1B3A57] hover:bg-[#1B3A57] hover:text-[#F4ECD8] font-mono text-[10px] tracking-widest uppercase"
                  asChild
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-[#C1403D] hover:bg-[#C1403D]/90 text-[#F4ECD8] border-2 border-[#1A1613] font-mono text-[10px] tracking-widest uppercase"
                  asChild
                >
                  <Link href="/signup">Apply Now</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex bg-transparent border-2 border-[#1B3A57] text-[#1B3A57] hover:bg-[#1B3A57] hover:text-[#F4ECD8] font-mono text-[10px] tracking-widest uppercase"
                  asChild
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-transparent border-2 border-[#C1403D] text-[#C1403D] hover:bg-[#C1403D] hover:text-[#F4ECD8] font-mono text-[10px] tracking-widest uppercase"
                >
                  Log Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
