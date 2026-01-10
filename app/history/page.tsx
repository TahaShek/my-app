import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, MapPin, ArrowRight, ArrowLeft, BookOpen } from "lucide-react"
import type { ExchangeHistory } from "@/types/book"

// Mock history data
const mockHistory: ExchangeHistory[] = [
  {
    id: "h1",
    bookTitle: "The Alchemist",
    bookAuthor: "Paulo Coelho",
    exchangedWith: "Emma Wilson",
    exchangedWithId: "user7",
    location: "Central Park, Main Entrance",
    date: new Date("2024-03-01"),
    type: "given",
    notes: "Great exchange! Emma was very friendly and on time.",
  },
  {
    id: "h2",
    bookTitle: "Atomic Habits",
    bookAuthor: "James Clear",
    exchangedWith: "David Lee",
    exchangedWithId: "user8",
    location: "Public Library, Downtown",
    date: new Date("2024-02-20"),
    type: "received",
    notes: "Book was in excellent condition.",
  },
  {
    id: "h3",
    bookTitle: "The Hobbit",
    bookAuthor: "J.R.R. Tolkien",
    exchangedWith: "Sarah Martinez",
    exchangedWithId: "user9",
    location: "Coffee House on Main Street",
    date: new Date("2024-02-15"),
    type: "given",
  },
  {
    id: "h4",
    bookTitle: "Educated",
    bookAuthor: "Tara Westover",
    exchangedWith: "Michael Chen",
    exchangedWithId: "user10",
    location: "Community Center",
    date: new Date("2024-02-01"),
    type: "received",
    notes: "Inspiring read, highly recommend!",
  },
  {
    id: "h5",
    bookTitle: "1984",
    bookAuthor: "George Orwell",
    exchangedWith: "Jessica Brown",
    exchangedWithId: "user11",
    location: "Central Park, Main Entrance",
    date: new Date("2024-01-20"),
    type: "given",
  },
]

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground font-serif">Exchange History</h1>
              </div>
              <p className="text-muted-foreground">Your book exchange journey over time</p>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary mb-1">{mockHistory.length}</p>
                    <p className="text-sm text-muted-foreground">Total Exchanges</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary mb-1">
                      {mockHistory.filter((h) => h.type === "given").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Books Given</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary mb-1">
                      {mockHistory.filter((h) => h.type === "received").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Books Received</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-8">
                {mockHistory.map((exchange, index) => (
                  <div key={exchange.id} className="relative pl-16">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 top-6 h-12 w-12 rounded-full border-4 border-background flex items-center justify-center ${
                        exchange.type === "given" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                      }`}
                    >
                      {exchange.type === "given" ? (
                        <ArrowRight className="h-5 w-5" />
                      ) : (
                        <ArrowLeft className="h-5 w-5" />
                      )}
                    </div>

                    <Card className="border-2">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={exchange.type === "given" ? "default" : "secondary"}>
                                {exchange.type === "given" ? "Given" : "Received"}
                              </Badge>
                              <p className="text-sm text-muted-foreground">{exchange.date.toLocaleDateString()}</p>
                            </div>
                            <h3 className="text-xl font-semibold font-serif mb-1">{exchange.bookTitle}</h3>
                            <p className="text-muted-foreground">by {exchange.bookAuthor}</p>
                          </div>
                          <div className="h-16 w-16 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-8 w-8 text-primary/40" />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border-2 border-border">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {exchange.exchangedWith
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {exchange.type === "given" ? "Given to" : "Received from"} {exchange.exchangedWith}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{exchange.location}</span>
                        </div>

                        {exchange.notes && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm text-muted-foreground">{exchange.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty state fallback (hidden when there's data) */}
            {mockHistory.length === 0 && (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No exchange history yet</h3>
                  <p className="text-muted-foreground">
                    Your completed book exchanges will appear here in a beautiful timeline
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
