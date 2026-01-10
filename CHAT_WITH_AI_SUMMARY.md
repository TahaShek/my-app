# BooksExchange - Quick Reference for AI Assistants

## Project Overview
A vintage-themed book exchange platform styled as a 1970s passport/travel bureau system where users can exchange books using a points-based system.

---

## All Routes & Protection Status

### ✅ PUBLIC ROUTES (No Auth Required)
```
/ - Landing page with features
/login - User login (Passport Application)
/signup - User registration
/browse - Browse all books with search/filters
/books/[id] - Individual book details with discussions tab
/locations - Suggested exchange meeting spots
/profile/[id] - View other user profiles (public viewing)
```

### 🔒 PROTECTED ROUTES (Auth Required)
```
/dashboard - User dashboard (My Books, Requests Received, Requests Sent)
/add-book - Add new book with QR code generation
/wishlist - User's wishlist of desired books
/history - Exchange history timeline
/messages - Direct messaging (Postcard style)
/buy-points - Currency Exchange Bureau (buy points with mock Stripe)
/profile/edit - Edit your own profile
```

---

## File Structure (Key Files Only)

```
app/
├── page.tsx                        # Landing
├── layout.tsx                      # Root layout
├── globals.css                     # Global styles
├── login/page.tsx                  # Login
├── signup/page.tsx                 # Signup
├── browse/page.tsx                 # Browse books
├── books/[id]/page.tsx            # Book detail
├── add-book/page.tsx              # Add book
├── dashboard/page.tsx             # Dashboard
├── wishlist/page.tsx              # Wishlist
├── history/page.tsx               # History
├── messages/page.tsx              # Messages
├── buy-points/page.tsx            # Buy points
├── locations/page.tsx             # Locations
├── profile/[id]/page.tsx          # Profile
└── api/auth/check/route.ts        # Auth API

components/
├── header.tsx                      # Nav header
├── footer.tsx                      # Footer
├── auth-guard.tsx                  # Route protection
├── login-form.tsx                  # Login form
├── book-card.tsx                   # Book card (passport style)
├── passport-stamp.tsx              # Passport stamp decoration
├── vintage-stamp.tsx               # Vintage stamp
├── qr-code-generator.tsx          # QR code gen
├── exchange-request-dialog.tsx    # Exchange modal
├── discussions-tab.tsx            # Book discussions
├── notifications-dropdown.tsx     # Notifications
└── ui/                            # shadcn components

lib/
├── auth.ts                         # Auth utilities (mock)
└── utils.ts                        # Utility functions

types/
└── book.ts                         # TypeScript types

proxy.ts                            # Middleware (route protection)
```

---

## Key Features Implemented

1. **Authentication System**
   - Mock authentication with localStorage
   - Middleware protection (proxy.ts)
   - Auto-redirect for protected routes

2. **Book Management**
   - Add books with QR code generation
   - Browse with filters (Genre, Condition, Location)
   - Book cards styled as passport documents (320×450px)
   - Catalog drawer sidebar with index tabs

3. **Exchange System**
   - Request exchanges
   - Accept/reject requests
   - Track sent/received requests
   - Suggested meeting locations

4. **Points & Payment**
   - Buy points (Currency Exchange Bureau)
   - 3 packages: Starter (100pts/$5), Popular (500pts/$20), Premium (1200pts/$40)
   - Mock Stripe integration
   - Traveler's check design

5. **Social Features**
   - Book discussions (Guest Book style with upvotes)
   - Direct messages (Postcard correspondence, 140 chars)
   - Notifications (Telegram delivery style)
   - User profiles with avatars

6. **Wishlist & History**
   - Save desired books
   - Track exchange history timeline
   - Vintage stamps for each exchange

---

## Design System

**Colors:**
- Navy Blue: #1e3a5f (primary)
- Cream: #f5f1e8 (background)
- Gold: #d4af37 (accents)
- Burgundy: #8b4513 (stamps)

**Fonts:**
- Courier Prime (monospace) - body text
- EB Garamond (serif) - headings
- Caveat (handwriting) - signatures, postcards

**Visual Style:**
- 1970s library card catalog
- International passport aesthetics
- Travel bureau branding
- Vintage stamps and postal marks

---

## NPM Packages (Already Installed)

```json
{
  "qrcode.react": "4.2.0",           // QR code generation
  "date-fns": "4.1.0",               // Date formatting
  "react-hook-form": "^7.60.0",      // Form handling
  "zod": "3.25.76",                  // Validation
  "@hookform/resolvers": "^3.10.0",  // RHF + Zod
  "lucide-react": "^0.454.0",        // Icons
  "next": "16.0.10",                 // Framework
  "react": "19.2.0",                 // React
  "tailwindcss": "^4.1.9"            // Styling
}
```

All Radix UI components (@radix-ui/*) for shadcn/ui are already installed.

---

## TypeScript Types

```typescript
interface Book {
  id: string
  title: string
  author: string
  genre: string
  condition: 'Mint' | 'Excellent' | 'Good' | 'Fair' | 'Poor'
  description: string
  coverImage: string
  language: string
  publicationYear: number
  owner: { id: string; name: string; avatar: string; location: string }
  pointValue: number
  available: boolean
  tags: string[]
  addedDate: string
}

interface User {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  location: string
  memberSince: string
  points: number
  booksOwned: number
  exchangesCompleted: number
}
```

---

## Current State

✅ All pages created and styled with passport theme
✅ Mock authentication working
✅ Route protection with middleware
✅ QR code generation for books
✅ Points system with buy-points page
✅ Book discussions (guest book)
✅ Direct messaging (postcards)
✅ Notifications (telegram style)
✅ Exchange request system
✅ Wishlist and history pages

⚠️ Using mock data (not connected to real database)
⚠️ Mock Stripe payment (not real transactions)

---

## What Needs Real Implementation

1. **Database (Supabase recommended)**
   - Replace mock data with real queries
   - Add Supabase Auth to replace mock auth in `lib/auth.ts`
   - Create tables: users, books, exchanges, messages, discussions, wishlist

2. **Stripe Integration**
   - Replace mock payment in `/buy-points`
   - Add webhook handler for payment confirmation
   - Update user points in database after purchase

3. **Real-time Features**
   - WebSocket/Supabase Realtime for messages
   - Live notifications
   - Real-time exchange status updates

---

## Questions to Ask AI Assistants

1. "Help me integrate Supabase authentication to replace the mock auth"
2. "Create the database schema for BooksExchange with RLS policies"
3. "Implement real Stripe payment integration for the buy-points page"
4. "Add real-time messaging with Supabase Realtime"
5. "Create API routes for book CRUD operations"
6. "Add image upload for book covers using Vercel Blob"

---

## Running the Project

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm start            # Run production build
```

---

## Notes
- All UI components are from shadcn/ui (already installed)
- Middleware uses Next.js 16's proxy.ts (not middleware.ts)
- Authentication stores user in localStorage (temp solution)
- All pages follow the vintage passport/travel bureau aesthetic
