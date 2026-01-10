"use client"
import { PassportStamp } from "@/components/passport-stamp"
import { Heart } from "lucide-react"
import Link from "next/link"
import type { Book } from "@/types/book"

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="group">
      <Link href={`/books/${book.id}`}>
        <div
          className="relative bg-[#F4ECD8] border-3 border-[#1B3A57] shadow-lg passport-watermark passport-page-flip overflow-hidden"
          style={{ width: "320px", height: "450px" }}
        >
          {/* Passport header - Navy with gold text */}
          <div className="bg-[#1B3A57] h-10 px-4 flex items-center justify-between border-b-2 border-[#1A1613]">
            <span className="font-display text-[#C5A572] text-[11px] uppercase tracking-[3px]">📖 BOOK PASSPORT</span>
            {/* Small seal/crest */}
            <div className="w-5 h-5 border-2 border-[#C5A572] rounded-full flex items-center justify-center">
              <span className="text-[#C5A572] text-[8px]">★</span>
            </div>
          </div>

          {/* Wishlist heart icon */}
          <button
            className="absolute top-12 right-2 z-10 w-5 h-5 text-[#1A1613] hover:text-[#C1403D] transition-colors"
            onClick={(e) => {
              e.preventDefault()
              // Add wishlist functionality
            }}
          >
            <Heart className="w-5 h-5" strokeWidth={2} />
          </button>

          <div className="p-4 space-y-3">
            {/* Book cover photo with L-shaped brackets */}
            <div className="relative mx-auto" style={{ width: "280px", height: "180px" }}>
              <div className="w-full h-full bg-[#E5DCC8] border border-[#1B3A57]/20 flex items-center justify-center passport-corner-brackets">
                {book.coverImage ? (
                  <img
                    src={book.coverImage || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📚</div>
                    <div
                      className="font-display text-[#C1403D] text-[9px] uppercase tracking-wider transform -rotate-7"
                      style={{ letterSpacing: "2px" }}
                    >
                      PHOTO PENDING
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ruled lines with info */}
            <div className="space-y-0">
              <div className="border-b border-[#1A1613]/20 pb-1">
                <div className="font-mono text-[10px] text-[#6B5E4F] uppercase tracking-wider">Title:</div>
                <div
                  className="font-serif italic text-[16px] text-[#1A1613] leading-tight line-clamp-2"
                  style={{ letterSpacing: "-0.3px" }}
                >
                  {book.title}
                </div>
              </div>

              <div className="border-b border-[#1A1613]/20 pb-1 pt-1">
                <div className="font-mono text-[10px] text-[#6B5E4F] uppercase tracking-wider">Author:</div>
                <div className="font-sans text-[13px] text-[#1A1613]">{book.author}</div>
              </div>

              <div className="border-b border-[#1A1613]/20 pb-1 pt-1">
                <div className="font-mono text-[10px] text-[#6B5E4F] uppercase tracking-wider">Issued:</div>
                <div className="font-mono text-[10px] text-[#1A1613] tabular-nums">
                  {book.createdAt ? new Date(book.createdAt).toLocaleDateString("en-GB") : "01/01/2024"}
                </div>
              </div>
            </div>

            {/* Condition stamp - diagonal */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <PassportStamp
                  text={`CONDITION: ${book.condition?.toUpperCase() || "GOOD"}`}
                  variant="diagonal"
                  rotation={-7}
                />
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] text-[#6B5E4F] uppercase">Points</div>
                <div className="font-display text-[#C5A572] text-[24px] leading-none">⚡{book.points || 150}</div>
              </div>
            </div>

            {/* Location */}
            <div className="pt-1">
              <div className="font-mono text-[10px] text-[#6B5E4F] uppercase tracking-wider">Location:</div>
              <div className="font-mono text-[11px] text-[#1A1613]">📍 {book.location || "New York"}</div>
            </div>

            {/* Visa stamps (cities visited) */}
            <div className="border-t border-[#1A1613]/20 pt-2">
              <div className="flex gap-1 flex-wrap">
                {["NYC", "LA", "CHI"].map((city, i) => (
                  <PassportStamp key={city} text={city} date="12 MAY" variant="circular" rotation={i * 3 - 3} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
