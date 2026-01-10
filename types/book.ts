export interface Book {
  id: string
  title: string
  author: string
  genre?: string
  condition?: string
  description?: string
  coverImage?: string
  language?: string
  publicationYear?: number

  // Ownership
  ownerName: string
  ownerId: string

  // Exchange metadata
  location?: string
  status: "available" | "exchanged" | "requested"

  // Gamification
  points?: number  

  createdAt: Date
}


export interface ExchangeRequest {
  id: string
  bookId: string
  requesterId: string
  requesterName: string
  ownerId: string
  status: "pending" | "accepted" | "declined" | "completed"
  message?: string
  proposedLocation?: string
  proposedDate?: Date
  createdAt: Date
}

export interface WishlistItem {
  id: string
  userId: string
  title: string
  author: string
  notes?: string
  createdAt: Date
}

export interface ExchangeHistory {
  id: string
  bookTitle: string
  bookAuthor: string
  exchangedWith: string
  exchangedWithId: string
  location: string
  date: Date
  type: "given" | "received"
  notes?: string
}
