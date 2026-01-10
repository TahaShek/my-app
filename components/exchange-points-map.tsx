"use client";

import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Point {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  description?: string;
  created_by?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover_image?: string;
  location?: string;
  owner_id: string;
  owner?: {
    name: string;
    avatar?: string;
  };
}

// User location marker icon (blue)
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for exchange points (green)
const exchangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

export default function ExchangePointsMap({ points, books = [] }: { points: Point[], books?: Book[] }) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(true);

  // Default center: User location if known, else first point, else fallback
  const center: [number, number] = userLocation
    ? userLocation
    : points.length > 0
      ? [points[0].latitude, points[0].longitude]
      : [51.505, -0.09];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLoadingLoc(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoadingLoc(false);
        }
      );
    } else {
      setLoadingLoc(false);
    }
  }, []);

  // Filter books by owner_id matching the point's created_by
  const getBooksAtPoint = (pointCreatorId?: string) => {
    if (!pointCreatorId) return [];
    return books.filter(book => book.owner_id === pointCreatorId);
  };

  return (
    <div className="h-[600px] w-full border rounded-lg overflow-hidden z-0 bg-gray-100 relative">
      {loadingLoc && (
        <div className="absolute top-2 right-2 z-[1000] bg-white px-3 py-1 rounded shadow text-xs flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Locating you...
        </div>
      )}

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Helper to fly to user location when found */}
        {userLocation && <RecenterMap lat={userLocation[0]} lng={userLocation[1]} />}

        {/* User Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Exchange Points */}
        {points.map((point) => {
          const booksAtLocation = getBooksAtPoint(point.created_by);
          const bookTitles = booksAtLocation.map(b => b.title).join(", ");

          return (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={exchangeIcon}
            >
              {booksAtLocation.length > 0 && (
                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                  <div className="font-semibold text-sm">
                    {booksAtLocation.length === 1
                      ? booksAtLocation[0].title
                      : `${booksAtLocation.length} Books: ${bookTitles.substring(0, 30)}${bookTitles.length > 30 ? '...' : ''}`}
                  </div>
                </Tooltip>
              )}

              <Popup className="min-w-[300px]">
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="mb-3 border-b pb-2">
                    <h3 className="font-bold text-lg">{point.name || "Exchange Point"}</h3>
                    {point.description && (
                      <p className="text-sm text-gray-600">{point.description}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Available Books ({booksAtLocation.length})
                    </h4>

                    {booksAtLocation.length > 0 ? (
                      <div className="grid gap-2">
                        {booksAtLocation.map(book => (
                          <div key={book.id} className="flex gap-3 bg-gray-50 p-2 rounded border">
                            {book.cover_image && (
                              <img src={book.cover_image} alt={book.title} className="w-12 h-16 object-cover rounded" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate" title={book.title}>{book.title}</p>
                              <p className="text-xs text-gray-500 truncate">{book.author}</p>
                              <Link href={`/books/${book.id}`} className="block mt-1">
                                <Button size="sm" variant="secondary" className="h-6 text-xs w-full">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No books listed by this location's owner.</p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
