# BooksExchange - Project Structure & Documentation

## 🎨 Design Theme
**1970s Library Card Catalog meets International Passport Bureau**
- Navy blue (#1e3a5f), cream (#f5f1e8), gold (#d4af37), burgundy (#8b4513)
- Fonts: Courier Prime (monospace), EB Garamond (serif), Caveat (handwriting)
- Vintage stamps, passport aesthetics, travel bureau styling

---

## 📁 Project Structure

```
booksexchange/
├── app/
│   ├── page.tsx                    # Landing page (Travel Agency Desk)
│   ├── layout.tsx                  # Root layout with fonts & metadata
│   ├── globals.css                 # Global styles & design tokens
│   │
│   ├── login/
│   │   ├── page.tsx               # Login page (Passport Application)
│   │   └── loading.tsx            # Loading state
│   │
│   ├── signup/
│   │   └── page.tsx               # Signup page (New Passport Application)
│   │
│   ├── browse/
│   │   ├── page.tsx               # Browse books (Customs Arrivals Hall)
│   │   └── loading.tsx            # Loading state
│   │
│   ├── books/
│   │   └── [id]/
│   │       └── page.tsx           # Book detail page (Open Passport)
│   │
│   ├── add-book/
│   │   └── page.tsx               # Add book form (Book Passport Application)
│   │
│   ├── dashboard/
│   │   └── page.tsx               # User dashboard (Personal Passport & Travel Log)
│   │
│   ├── wishlist/
│   │   ├── page.tsx               # Wishlist (Books you want)
│   │   └── loading.tsx            # Loading state
│   │
│   ├── history/
│   │   └── page.tsx               # Exchange history (Travel Log with Stamps)
│   │
│   ├── messages/
│   │   └── page.tsx               # Direct messages (Postcard Correspondence)
│   │
│   ├── buy-points/
│   │   └── page.tsx               # Currency Exchange Bureau (Buy Points)
│   │
│   ├── locations/
│   │   └── page.tsx               # Exchange locations (Public meeting spots)
│   │
│   ├── profile/
│   │   └── [id]/
│   │       └── page.tsx           # User profile (view/edit)
│   │
│   └── api/
│       └── auth/
│           └── check/
│               └── route.ts        # Auth check API endpoint
│
├── components/
│   ├── header.tsx                  # Main navigation header
│   ├── footer.tsx                  # Footer
│   ├── auth-guard.tsx              # Route protection wrapper
│   ├── login-form.tsx              # Login form component
│   ├── book-card.tsx               # Book card (Passport document style)
│   ├── passport-stamp.tsx          # Decorative passport stamp
│   ├── vintage-stamp.tsx           # Vintage stamp component
│   ├── qr-code-generator.tsx       # QR code generation
│   ├── exchange-request-dialog.tsx # Exchange request modal
│   ├── discussions-tab.tsx         # Book discussions (Guest Book)
│   ├── notifications-dropdown.tsx  # Notifications (Telegram style)
│   └── ui/                         # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── tabs.tsx
│       ├── badge.tsx
│       ├── avatar.tsx
│       ├── dropdown-menu.tsx
│       ├── sheet.tsx
│       ├── textarea.tsx
│       ├── select.tsx
│       ├── checkbox.tsx
│       ├── separator.tsx
│       ├── scroll-area.tsx
│       └── ... (other shadcn components)
│
├── lib/
│   ├── auth.ts                     # Authentication utilities
│   └── utils.ts                    # Utility functions (cn, etc.)
│
├── types/
│   └── book.ts                     # TypeScript types for Book
│
├── public/
│   └── diverse-user-avatars.png    # User avatar images
│
├── proxy.ts                        # Middleware for route protection
└── package.json                    # Dependencies

```

---

## 🛣️ Routes Breakdown

### PUBLIC ROUTES (No authentication required)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Travel Agency Desk - Welcome page with features |
| `/login` | Login | Passport Application Form - User login |
| `/signup` | Signup | New Passport Application - User registration |
| `/browse` | Browse Books | Customs Arrivals Hall - Search & filter all books |
| `/books/[id]` | Book Detail | Open Passport - View book details & discussions |
| `/locations` | Exchange Locations | Public meeting spots for exchanges |
| `/profile/[id]` | User Profile | View other user profiles (read-only) |

### PROTECTED ROUTES (Require authentication)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Personal Passport & Travel Log - Manage books & requests |
| `/add-book` | Add Book | Book Passport Application - Add new book with QR code |
| `/wishlist` | Wishlist | Books you want - Manage wishlist |
| `/history` | Exchange History | Travel Log with Stamps - View past exchanges |
| `/messages` | Messages | Postcard Correspondence - Direct messaging |
| `/buy-points` | Buy Points | Currency Exchange Bureau - Purchase travel points |
| `/profile/edit` | Edit Profile | Edit your own profile |

### API ROUTES

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/check` | GET | Check authentication status |

---

## 🎯 Key Features

### 1. Authentication System
- Mock authentication with localStorage
- Protected routes via middleware (proxy.ts)
- Auto-redirect for auth/unauth users
- Session management

### 2. Book Management
- Add books with QR code generation
- Browse with search & filters (Genre, Condition, Location)
- Book cards styled as passport documents
- Catalog drawer sidebar navigation

### 3. Exchange System
- Request book exchanges
- Accept/reject requests
- Track sent and received requests
- Suggested exchange locations

### 4. Points & Payment System
- Buy points (Currency Exchange Bureau)
- Traveler's check packages (Starter, Popular, Premium)
- Mock Stripe integration
- Transaction receipts with approval stamps

### 5. Social Features
- Book discussions (Guest Book style)
- Direct messages (Postcard correspondence)
- Notifications (Telegram delivery)
- User profiles with avatars

### 6. Wishlist & History
- Save desired books
- Track exchange history
- Visual timeline with vintage stamps

---

## 📦 NPM Packages Required

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "typescript": "^5.0.0",
    
    "lucide-react": "^0.460.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0",
    
    "qrcode.react": "^4.1.0",
    "date-fns": "^3.0.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-sheet": "^1.0.4"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### Package Installation Commands

```bash
# Install all dependencies
npm install

# Or install individually:
npm install next@16 react@19.2 react-dom@19.2 typescript

# UI & Icons
npm install lucide-react clsx tailwind-merge class-variance-authority

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# QR Code Generation
npm install qrcode.react

# Date utilities
npm install date-fns

# Radix UI Components (shadcn/ui)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-avatar @radix-ui/react-separator @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-scroll-area @radix-ui/react-sheet

# Dev Dependencies
npm install -D @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer
```

---

## 🗂️ Type Definitions

### Book Type
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
  owner: {
    id: string
    name: string
    avatar: string
    location: string
  }
  pointValue: number
  available: boolean
  tags: string[]
  addedDate: string
}
```

### User Type
```typescript
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

## 🎨 Design Tokens (globals.css)

```css
--navy-blue: #1e3a5f
--cream: #f5f1e8
--gold: #d4af37
--burgundy: #8b4513
--ink-black: #2c2c2c

--font-sans: "Courier Prime"
--font-serif: "EB Garamond"
--font-handwriting: "Caveat"
```

---

## 🔐 Authentication Flow

1. User visits protected route → Middleware checks auth
2. If not authenticated → Redirect to `/login?redirect=/original-url`
3. User logs in → Set auth cookie → Redirect to original URL
4. Protected pages use `<AuthGuard>` component for client-side check
5. Logout → Clear cookie → Redirect to landing page

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📝 Notes for Implementation

### For Database Integration (Supabase):
Replace mock data in:
- `lib/auth.ts` - Real Supabase Auth
- All pages with mock data - Real database queries
- Add Supabase client in `lib/supabase.ts`

### For Stripe Integration:
Replace mock payment in:
- `app/buy-points/page.tsx` - Real Stripe checkout
- Add webhook handler in `app/api/webhooks/stripe/route.ts`

### Environment Variables Needed:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
STRIPE_SECRET_KEY=your-stripe-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-public-key
```

---

## 🎯 Future Enhancements
- Real-time messaging with WebSockets
- Push notifications for exchange requests
- Advanced search with filters
- Book recommendations AI
- Multi-language support
- Mobile app (React Native)
```

```json file="" isHidden
