"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookCard } from "@/components/book-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"
import type { Book } from "@/types/book"

// Mock data
const mockBooks: Book[] = [
  {
    id: "1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    condition: "Good",
    description: "A classic of modern American literature",
    ownerName: "Sarah Johnson",
    ownerId: "user1",
    status: "available",
    publicationYear: 1960,
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    condition: "Excellent",
    description: "A dystopian social science fiction novel",
    ownerName: "Michael Chen",
    ownerId: "user2",
    status: "available",
    publicationYear: 1949,
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    condition: "Fair",
    description: "A romantic novel of manners",
    ownerName: "Emily Watson",
    ownerId: "user3",
    status: "available",
    publicationYear: 1813,
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    condition: "Good",
    description: "A novel about the American Dream",
    ownerName: "David Martinez",
    ownerId: "user4",
    status: "available",
    publicationYear: 1925,
    createdAt: new Date(),
  },
  {
    id: "5",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Fiction",
    condition: "Good",
    description: "A story about teenage rebellion",
    ownerName: "Lisa Anderson",
    ownerId: "user5",
    status: "available",
    publicationYear: 1951,
    createdAt: new Date(),
  },
  {
    id: "6",
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    genre: "Fantasy",
    condition: "Excellent",
    description: "The first book in the Harry Potter series",
    ownerName: "James Wilson",
    ownerId: "user6",
    status: "available",
    publicationYear: 1997,
    createdAt: new Date(),
  },
  {
    id: "7",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    condition: "Good",
    description: "A fantasy adventure novel",
    ownerName: "Robert Brown",
    ownerId: "user7",
    status: "available",
    publicationYear: 1937,
    createdAt: new Date(),
  },
  {
    id: "8",
    title: "Brave New World",
    author: "Aldous Huxley",
    genre: "Dystopian",
    condition: "Fair",
    description: "A dystopian novel set in a futuristic society",
    ownerName: "Jennifer Lee",
    ownerId: "user8",
    status: "available",
    publicationYear: 1932,
    createdAt: new Date(),
  },
]

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])

  const genres = ["Fiction", "Dystopian", "Romance", "Fantasy"]
  const conditions = ["Excellent", "Good", "Fair"]

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
  }

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition],
    )
  }

  const filteredBooks = mockBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenres.length === 0 || (book.genre && selectedGenres.includes(book.genre))
    const matchesCondition =
      selectedConditions.length === 0 || (book.condition && selectedConditions.includes(book.condition))
    return matchesSearch && matchesGenre && matchesCondition
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-12 bg-[#D4CDB9]/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h1
                className="font-sans font-bold text-4xl md:text-5xl text-[#2A1810] mb-6 text-center"
                style={{ letterSpacing: "-0.5px", lineHeight: "1.2" }}
              >
                Browse Our Collection
              </h1>

              {/* Search bar styled as manila folder tab */}
              <div className="relative max-w-2xl mx-auto">
                <div className="relative bg-[#F5F0E8] border-2 border-[#C65D3B] rounded-t-lg shadow-[0_4px_0_rgba(42,24,16,0.1)]">
                  <div className="absolute -top-8 left-8 bg-[#E8DCC4] border-2 border-[#C65D3B] border-b-0 px-6 py-2 rounded-t">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#5A4E3F]">Card Catalog</span>
                  </div>
                  <div className="p-4 flex items-center gap-3">
                    <Search className="h-5 w-5 text-[#5A4E3F] flex-shrink-0" />
                    <Input
                      type="text"
                      placeholder="Type to search by title or author..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 border-0 bg-transparent font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#5A4E3F]/50 text-[#2A1810]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              {/* Left sidebar - Library card catalog drawer */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <div className="bg-[#F5F0E8] border-2 border-[#C65D3B] rounded-lg shadow-[6px_6px_0_rgba(42,24,16,0.12)] paper-texture">
                    {/* Brass drawer handle */}
                    <div className="flex justify-center pt-4">
                      <div className="w-16 h-4 bg-gradient-to-b from-[#D4A028] to-[#B8881E] border border-[#2A1810]/30 rounded-full shadow-inner" />
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Genre filter with index card dividers */}
                      <div>
                        <div className="bg-[#D4A028] px-3 py-1.5 -mx-2 mb-3 border-y-2 border-[#2A1810]/20">
                          <h3 className="font-mono text-xs uppercase tracking-widest text-[#2A1810] font-bold">
                            Genre
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {genres.map((genre) => (
                            <div key={genre} className="flex items-center gap-2">
                              <Checkbox
                                id={`genre-${genre}`}
                                checked={selectedGenres.includes(genre)}
                                onCheckedChange={() => toggleGenre(genre)}
                                className="border-2 border-[#C65D3B] data-[state=checked]:bg-[#C65D3B] data-[state=checked]:border-[#C65D3B]"
                              />
                              <Label
                                htmlFor={`genre-${genre}`}
                                className="font-serif text-sm text-[#2A1810] cursor-pointer"
                              >
                                {genre}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Condition filter */}
                      <div>
                        <div className="bg-[#9CAF88] px-3 py-1.5 -mx-2 mb-3 border-y-2 border-[#2A1810]/20">
                          <h3 className="font-mono text-xs uppercase tracking-widest text-[#2A1810] font-bold">
                            Condition
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {conditions.map((condition) => (
                            <div key={condition} className="flex items-center gap-2">
                              <Checkbox
                                id={`condition-${condition}`}
                                checked={selectedConditions.includes(condition)}
                                onCheckedChange={() => toggleCondition(condition)}
                                className="border-2 border-[#C65D3B] data-[state=checked]:bg-[#C65D3B] data-[state=checked]:border-[#C65D3B]"
                              />
                              <Label
                                htmlFor={`condition-${condition}`}
                                className="font-serif text-sm text-[#2A1810] cursor-pointer"
                              >
                                {condition}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Clear filters */}
                      {(selectedGenres.length > 0 || selectedConditions.length > 0) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedGenres([])
                            setSelectedConditions([])
                          }}
                          className="w-full border-2 border-[#B23A48] text-[#B23A48] hover:bg-[#B23A48] hover:text-[#E8DCC4] font-mono text-xs tracking-wider uppercase"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main content - Brick pattern grid */}
              <div className="flex-1">
                <div className="mb-6">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#5A4E3F]">
                    Showing {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"}
                  </p>
                </div>

                {filteredBooks.length > 0 ? (
                  <div className="space-y-6">
                    {/* Row 1: 3 full cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredBooks.slice(0, 3).map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>

                    {/* Row 2: 2 cards offset (brick pattern) */}
                    {filteredBooks.length > 3 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:pl-[16.666%] lg:pr-[16.666%]">
                        {filteredBooks.slice(3, 5).map((book) => (
                          <BookCard key={book.id} book={book} />
                        ))}
                      </div>
                    )}

                    {/* Row 3: 3 full cards */}
                    {filteredBooks.length > 5 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBooks.slice(5, 8).map((book) => (
                          <BookCard key={book.id} book={book} />
                        ))}
                      </div>
                    )}

                    {/* Continue pattern for remaining books */}
                    {filteredBooks.length > 8 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBooks.slice(8).map((book) => (
                          <BookCard key={book.id} book={book} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-block bg-[#F5F0E8] p-8 rounded double-line-border shadow-[4px_4px_0_rgba(42,24,16,0.1)] paper-texture">
                      <p className="font-serif text-lg text-[#2A1810] mb-4">No books found matching your criteria</p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("")
                          setSelectedGenres([])
                          setSelectedConditions([])
                        }}
                        className="border-2 border-[#C65D3B] text-[#C65D3B] hover:bg-[#C65D3B] hover:text-[#E8DCC4] font-mono text-xs tracking-wider uppercase"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
