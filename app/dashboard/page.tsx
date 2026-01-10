"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, Heart, Send, Plus, Edit, Trash2, QrCode, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"
import type { Book, ExchangeRequest } from "@/types/book"

// Mock data
const mockUser = {
  id: "current-user",
  name: "Alex Thompson",
  email: "alex@example.com",
  joinedDate: new Date("2024-01-01"),
}

const mockMyBooks: Book[] = [
  {
    id: "my-1",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    condition: "Good",
    description: "A fantasy adventure",
    ownerName: "Alex Thompson",
    ownerId: "current-user",
    status: "available",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "my-2",
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    condition: "Excellent",
    description: "Epic science fiction novel",
    ownerName: "Alex Thompson",
    ownerId: "current-user",
    status: "requested",
    createdAt: new Date("2024-02-01"),
  },
]

const mockIncomingRequests: ExchangeRequest[] = [
  {
    id: "req-1",
    bookId: "my-1",
    requesterId: "user2",
    requesterName: "Sarah Wilson",
    ownerId: "current-user",
    status: "pending",
    message: "I'd love to read this book! Can we meet at Central Park?",
    proposedLocation: "Central Park",
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "req-2",
    bookId: "my-2",
    requesterId: "user3",
    requesterName: "Mike Johnson",
    ownerId: "current-user",
    status: "pending",
    message: "Been looking for this book everywhere!",
    createdAt: new Date("2024-03-12"),
  },
]

const mockOutgoingRequests: ExchangeRequest[] = [
  {
    id: "req-3",
    bookId: "other-1",
    requesterId: "current-user",
    requesterName: "Alex Thompson",
    ownerId: "user5",
    status: "accepted",
    message: "Would love to exchange this book",
    proposedLocation: "Downtown Library",
    createdAt: new Date("2024-03-08"),
  },
  {
    id: "req-4",
    bookId: "other-2",
    requesterId: "current-user",
    requesterName: "Alex Thompson",
    ownerId: "user6",
    status: "pending",
    message: "Interested in reading this",
    createdAt: new Date("2024-03-11"),
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("my-books")

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* User Profile Header */}
            <Card className="border-2 mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                      {mockUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold font-serif mb-2">{mockUser.name}</h1>
                    <p className="text-muted-foreground mb-4">{mockUser.email}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-medium">{mockMyBooks.length}</span> Books Listed
                      </div>
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-primary" />
                        <span className="font-medium">{mockOutgoingRequests.length}</span> Requests Sent
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="font-medium">12</span> Exchanges Completed
                      </div>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                <TabsTrigger value="my-books" className="gap-2 py-3">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">My Books</span>
                  <span className="sm:hidden">Books</span>
                </TabsTrigger>
                <TabsTrigger value="incoming" className="gap-2 py-3">
                  <Send className="h-4 w-4 rotate-180" />
                  <span className="hidden sm:inline">Requests Received</span>
                  <span className="sm:hidden">Received</span>
                  {mockIncomingRequests.filter((r) => r.status === "pending").length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {mockIncomingRequests.filter((r) => r.status === "pending").length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="outgoing" className="gap-2 py-3">
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Requests Sent</span>
                  <span className="sm:hidden">Sent</span>
                </TabsTrigger>
              </TabsList>

              {/* My Books Tab */}
              <TabsContent value="my-books" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-serif">My Books</h2>
                    <p className="text-muted-foreground">Manage your book collection</p>
                  </div>
                  <Button asChild className="gap-2">
                    <Link href="/add-book">
                      <Plus className="h-4 w-4" />
                      Add Book
                    </Link>
                  </Button>
                </div>

                {mockMyBooks.length > 0 ? (
                  <div className="grid gap-4">
                    {mockMyBooks.map((book) => (
                      <Card key={book.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-24 h-32 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <BookOpen className="h-10 w-10 text-primary/40" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <Link
                                    href={`/books/${book.id}`}
                                    className="text-xl font-semibold font-serif hover:text-primary transition-colors"
                                  >
                                    {book.title}
                                  </Link>
                                  <p className="text-muted-foreground">{book.author}</p>
                                </div>
                                <Badge
                                  variant={book.status === "available" ? "default" : "secondary"}
                                  className="shrink-0"
                                >
                                  {book.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {book.genre && <Badge variant="outline">{book.genre}</Badge>}
                                {book.condition && <Badge variant="outline">Condition: {book.condition}</Badge>}
                              </div>
                              <div className="flex flex-wrap gap-2 pt-2">
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/books/${book.id}`}>
                                    <QrCode className="h-3 w-3 mr-1" />
                                    View QR
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/books/${book.id}/edit`}>
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:text-destructive bg-transparent"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">No books yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start building your collection by adding your first book
                      </p>
                      <Button asChild>
                        <Link href="/add-book">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Book
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Incoming Requests Tab */}
              <TabsContent value="incoming" className="mt-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif">Requests Received</h2>
                  <p className="text-muted-foreground">People interested in your books</p>
                </div>

                {mockIncomingRequests.length > 0 ? (
                  <div className="grid gap-4">
                    {mockIncomingRequests.map((request) => {
                      const book = mockMyBooks.find((b) => b.id === request.bookId)
                      return (
                        <Card key={request.id} className="border-2">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-border">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {request.requesterName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{request.requesterName}</CardTitle>
                                  <CardDescription>
                                    Wants to exchange: <span className="font-medium">{book?.title}</span>
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  request.status === "pending"
                                    ? "default"
                                    : request.status === "accepted"
                                      ? "default"
                                      : "secondary"
                                }
                                className="shrink-0"
                              >
                                {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                {request.status === "accepted" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {request.status === "declined" && <XCircle className="h-3 w-3 mr-1" />}
                                {request.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {request.message && (
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm">{request.message}</p>
                              </div>
                            )}
                            {request.proposedLocation && (
                              <p className="text-sm text-muted-foreground">
                                Proposed location:{" "}
                                <span className="font-medium text-foreground">{request.proposedLocation}</span>
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Requested {request.createdAt.toLocaleDateString()}
                            </p>
                            {request.status === "pending" && (
                              <div className="flex gap-2 pt-2">
                                <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Decline
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50 rotate-180" />
                      <h3 className="text-xl font-semibold mb-2">No requests yet</h3>
                      <p className="text-muted-foreground">When others request your books, they'll appear here</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Outgoing Requests Tab */}
              <TabsContent value="outgoing" className="mt-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif">Requests Sent</h2>
                  <p className="text-muted-foreground">Books you've requested from others</p>
                </div>

                {mockOutgoingRequests.length > 0 ? (
                  <div className="grid gap-4">
                    {mockOutgoingRequests.map((request) => (
                      <Card key={request.id} className="border-2">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <CardTitle className="text-lg">Request to exchange book</CardTitle>
                              <CardDescription>With {request.ownerId}</CardDescription>
                            </div>
                            <Badge
                              variant={
                                request.status === "pending"
                                  ? "default"
                                  : request.status === "accepted"
                                    ? "default"
                                    : "secondary"
                              }
                              className="shrink-0"
                            >
                              {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                              {request.status === "accepted" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {request.status === "declined" && <XCircle className="h-3 w-3 mr-1" />}
                              {request.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {request.message && (
                            <div className="bg-muted/50 rounded-lg p-4">
                              <p className="text-sm">{request.message}</p>
                            </div>
                          )}
                          {request.proposedLocation && (
                            <p className="text-sm text-muted-foreground">
                              Proposed location:{" "}
                              <span className="font-medium text-foreground">{request.proposedLocation}</span>
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">Sent {request.createdAt.toLocaleDateString()}</p>
                          {request.status === "accepted" && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm text-green-800 font-medium">
                                Request accepted! Contact the owner to arrange the exchange.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">No requests sent</h3>
                      <p className="text-muted-foreground mb-6">
                        Browse books and send exchange requests to start swapping
                      </p>
                      <Button asChild>
                        <Link href="/browse">Browse Books</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
