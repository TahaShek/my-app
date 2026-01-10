import Link from "next/link"
import { PassportStamp } from "@/components/passport-stamp"

export function Footer() {
  return (
    <footer className="border-t-3 border-[#1B3A57] bg-[#1B3A57] mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3
              className="font-mono font-bold text-xl text-[#C5A572] uppercase tracking-wider"
              style={{ letterSpacing: "3px" }}
            >
              BooksExchange
            </h3>
            <p className="font-sans text-sm text-[#F4ECD8]/80 leading-relaxed">
              Connecting book lovers worldwide through the timeless joy of sharing stories across borders.
            </p>
            <div className="flex gap-2 flex-wrap">
              <PassportStamp text="EST 1970" variant="rectangular" rotation={-2} />
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#C5A572] mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/browse"
                  className="font-sans text-sm text-[#F4ECD8] hover:text-[#C5A572] transition-colors"
                >
                  Browse Books
                </Link>
              </li>
              <li>
                <Link
                  href="/add-book"
                  className="font-sans text-sm text-[#F4ECD8] hover:text-[#C5A572] transition-colors"
                >
                  Register Book
                </Link>
              </li>
              <li>
                <Link
                  href="/locations"
                  className="font-sans text-sm text-[#F4ECD8] hover:text-[#C5A572] transition-colors"
                >
                  Exchange Checkpoints
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#C5A572] mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="font-sans text-sm text-[#F4ECD8] hover:text-[#C5A572] transition-colors"
                >
                  My Passport
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="font-sans text-sm text-[#F4ECD8] hover:text-[#C5A572] transition-colors"
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="font-sans text-sm text-[#F4ECD8] hover:text-[#C5A572] transition-colors"
                >
                  Travel Log
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#C5A572] mb-4">Bureau Info</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="font-sans text-sm text-[#F4ECD8] hover:text-[#C5A572] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="font-sans text-sm text-[#F4ECD8] hover:text-[#C5A572] transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="font-sans text-sm text-[#F4ECD8] hover:text-[#C5A572] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-[#F4ECD8]/30 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-[10px] tracking-widest text-[#F4ECD8]/60 uppercase text-center">
              © {new Date().getFullYear()} BooksExchange International Book Bureau • Est. 1970
            </p>
            <div className="flex gap-2">
              <PassportStamp text="OFFICIAL" variant="diagonal" rotation={-5} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
