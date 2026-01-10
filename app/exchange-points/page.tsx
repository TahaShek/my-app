"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { supabase } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// @/types/exchange.ts

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  condition: string;
  point_value: number;
  cover_image?: string;
  owner?: {
    name: string;
    avatar?: string;
  };
   exchange_point_id: string;
    exchange_location?: {
      id: string;
      city: string;
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      created_at: string;
      created_by: string;
      description: string | null;
    };
}

export interface ExchangePoint {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  created_at: string;
  books?: Book[];
}
// Dynamically import map to avoid SSR issues with Leaflet
const ExchangePointsMap = dynamic(
  () => import("@/components/exchange-points-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }
);

export default function ExchangePointsPage() {
  const [points, setPoints] = useState<ExchangePoint[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch exchange points
        const { data: pointsData, error: pointsError } = await supabase
          .from("exchange_locations")
          .select("*")
          .order("created_at", { ascending: false });

        if (pointsError) {
          console.error("Error points:", pointsError);
          return;
        }

        // Fetch all available books with their exchange point info
        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select(`
            *,
            owner:profiles(name, avatar),
            exchange_location:exchange_locations!inner(*)
          `)
          .eq("available", true);

        if (booksError) {
          console.error("Error books:", booksError);
        }

        // Group books by exchange point
        const booksByPoint: Record<string, Book[]> = {};
        const booksList: Book[] = [];
        
        if (booksData) {
          booksData.forEach((book: any) => {
            if (book.exchange_location?.id) {
              const pointId = book.exchange_location.id;
              if (!booksByPoint[pointId]) {
                booksByPoint[pointId] = [];
              }
              
              const bookObj: Book = {
                id: book.id,
                title: book.title,
                author: book.author,
                genre: book.genre,
                condition: book.condition,
                point_value: book.point_value,
                cover_image: book.cover_image,
                owner: {
                  name: book.owner?.name || "Unknown",
                  avatar: book.owner?.avatar
                },
                exchange_point_id: pointId // This is now required
              };
              
              booksByPoint[pointId].push(bookObj);
              booksList.push(bookObj);
            }
          });
        }

        // Combine points with their books
        const pointsWithBooks = pointsData?.map((point: ExchangePoint) => ({
          ...point,
          books: booksByPoint[point.id] || []
        })) || [];

        setPoints(pointsWithBooks);
        setAllBooks(booksList);

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);
useEffect(() => {
  if (points.length > 0) {
    console.log("Points data:", points);
    console.log("Total points:", points.length);
    points.forEach((point, index) => {
      console.log(`Point ${index}:`, {
        id: point.id,
        name: point.name,
        latitude: point.latitude,
        longitude: point.longitude,
        booksCount: point.books?.length || 0
      });
    });
  }
}, [points]);

useEffect(() => {
  if (allBooks.length > 0) {
    console.log("All books:", allBooks);
    console.log("Total books:", allBooks.length);
  }
}, [allBooks]);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif mb-2">Exchange Points</h1>
            <p className="text-muted-foreground">
              Discover safe and convenient locations for your book exchanges.
            </p>
          </div>
          <Link href="/exchange-points/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Point
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section - Will show both points and books */}
          <div className="lg:col-span-2">
            <ExchangePointsMap points={points} books={allBooks} />
          </div>

          {/* List Section - Only exchange points, no books */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            <h2 className="text-xl font-semibold mb-4">Available Locations ({points.length})</h2>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : points.length > 0 ? (
              <div className="space-y-4">
                {points.map((point) => (
                  <div
                    key={point.id}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{point.name || "Exchange Point"}</h3>
                          <Badge variant="outline" className="text-xs">
                            {point.books?.length || 0} books
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {point.description || "No description provided."}
                        </p>
                        {point.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {point.address}
                            {point.city && `, ${point.city}`}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          📚 {point.books?.length || 0} books available
                        </p>
                      </div>
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No exchange points found yet.</p>
                <Link href="/exchange-points/add">
                  <Button variant="outline" size="sm">
                    Be the first to add one!
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}