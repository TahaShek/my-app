export interface Profile {
  id: string
  name: string
  username: string
  email?: string
  avatar?: string
  bio?: string
  location?: string
  points: number
  books_owned: number
  exchanges_completed: number
  member_since: string
}

export interface Book {
  id: string
  title: string
  author: string
  genre: string
  condition: 'Mint' | 'Excellent' | 'Good' | 'Fair' | 'Poor'
  description?: string
  coverImage?: string
  language?: string
  location?: string
  publicationYear?: number
  ownerId: string
  ownerName?: string // Join result
  pointValue: number
  available: boolean
  tags?: string[]
  qrCode: string
  wishlistCount: number
  createdAt: Date
}

export interface ExchangeRequest {
  id: string
  bookId: string
  book?: Partial<Book> // Join result
  requesterId: string
  requester?: Partial<Profile> // Join result
  ownerId: string
  owner?: Partial<Profile> // Join result
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  message?: string
  meetingLocation?: string
  rejectionReason?: string
  createdAt: Date
}

export interface WishlistItem {
  id: string
  userId: string
  bookId: string
  book?: Partial<Book> // Join result
  createdAt: Date
}

export interface ExchangeHistory {
  id: string
  bookId: string
  fromUserId?: string
  toUserId?: string
  fromUsername: string
  toUsername: string
  city?: string
  notes?: string
  exchangedAt: Date
}

export interface Transaction {
  id: string
  userId: string
  amount: number
  type: 'book_added' | 'book_exchanged' | 'points_purchased'
  description?: string
  createdAt: Date
}
