import Link from "next/link"
import { Plane, Coins, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

export function Header() {
  const userPoints = 540

  return (
    <header className="border-b-3 border-[#1B3A57] bg-[#F4ECD8] sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              {/* Passport-style logo */}
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
              <p className="font-mono text-[9px] tracking-widest text-[#6B5E4F] uppercase">International Book Bureau</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/browse"
              className="font-mono text-[11px] tracking-wider uppercase text-[#1B3A57] hover:text-[#C1403D] transition-colors"
            >
              Arrivals
            </Link>
            <Link
              href="/wishlist"
              className="font-mono text-[11px] tracking-wider uppercase text-[#1B3A57] hover:text-[#C1403D] transition-colors"
            >
              Wishlist
            </Link>
            <Link
              href="/messages"
              className="font-mono text-[11px] tracking-wider uppercase text-[#1B3A57] hover:text-[#C1403D] transition-colors flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              Messages
            </Link>
            <Link
              href="/dashboard"
              className="font-mono text-[11px] tracking-wider uppercase text-[#1B3A57] hover:text-[#C1403D] transition-colors"
            >
              My Passport
            </Link>
            <Link
              href="/buy-points"
              className="font-mono text-[11px] tracking-wider uppercase text-[#1B3A57] hover:text-[#C1403D] transition-colors"
            >
              Currency Exchange
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/buy-points"
              className="hidden sm:flex items-center gap-2 bg-[#C5A572] border-2 border-[#1B3A57] px-3 py-1.5 hover:scale-105 transition-transform"
            >
              <Coins className="h-4 w-4 text-[#1B3A57]" />
              <span className="font-bold text-[#1B3A57] text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                ⚡{userPoints}
              </span>
            </Link>

            <div className="hidden sm:block">
              <NotificationsDropdown />
            </div>

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
          </div>
        </div>
      </div>
    </header>
  )
}
