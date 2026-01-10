// components/exchange-points-map.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Book, MapPin } from "lucide-react";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
  iconUrl: "/leaflet/images/marker-icon.png",
  shadowUrl: "/leaflet/images/marker-shadow.png",
});

interface ExchangePoint {
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

interface Book {
  exchange_point_id: string;
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
}

interface ExchangePointsMapProps {
  points: ExchangePoint[];
  books: any[];
}

export default function ExchangePointsMap({ points, books }: ExchangePointsMapProps) {
  const defaultCenter: [number, number] = [31.5497, 74.3436]; // Default to Lahore coordinates
  const defaultZoom = 12;

  // Custom icons
  const exchangePointIcon = L.divIcon({
    html: `
      <div class="relative">
        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="absolute -top-1 -right-1 w-4 h-4 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center justify-center font-bold">
          ${books.length}
        </div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const bookIcon = L.divIcon({
    html: `
      <div class="relative">
        <div class="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.969 7.969 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        </div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  // Create a map of books by their coordinates
  const booksByCoordinate: Record<string, Book[]> = {};
  books.forEach(book => {
    if (book.exchange_location) {
      const key = `${book.exchange_location.latitude},${book.exchange_location.longitude}`;
      if (!booksByCoordinate[key]) {
        booksByCoordinate[key] = [];
      }
      booksByCoordinate[key].push(book);
    }
  });

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border shadow-lg">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render exchange points */}
        {points.map((point) => (
          <Marker
            key={`point-${point.id}`}
            position={[point.latitude, point.longitude]}
            icon={exchangePointIcon}
          >
            <Popup>
              <div className="p-2 max-w-xs">
                <h3 className="font-bold text-lg mb-1">{point.name || "Exchange Point"}</h3>
                {point.description && (
                  <p className="text-sm text-gray-600 mb-2">{point.description}</p>
                )}
                {point.address && (
                  <p className="text-sm mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {point.address}
                    {point.city && `, ${point.city}`}
                  </p>
                )}
                
                {/* Show books at this location */}
                {point.books && point.books.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm mb-2">Books Available ({point.books.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {point.books.map((book) => (
                        <div key={book.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          {book.cover_image ? (
                            <img
                              src={book.cover_image}
                              alt={book.title}
                              className="w-10 h-14 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded border flex items-center justify-center">
                              <Book className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm truncate">{book.title}</h5>
                            <p className="text-xs text-gray-500 truncate">by {book.author}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                                {book.genre}
                              </span>
                              <span className="text-xs font-bold text-amber-600">
                                ⚡{book.point_value}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!point.books || point.books.length === 0) && (
                  <p className="text-sm text-gray-500 italic mt-2">
                    No books available at this location yet.
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Optionally render individual book markers */}
        {Object.entries(booksByCoordinate).map(([coords, booksAtLocation]) => {
          const [lat, lng] = coords.split(",").map(Number);
          
          // Only show book markers if there are fewer than 5 books at this location
          // to avoid clutter
          if (booksAtLocation.length < 5) {
            return booksAtLocation.map((book) => (
              <Marker
                key={`book-${book.id}`}
                position={[lat, lng]}
                icon={bookIcon}
              >
                <Popup>
                  <div className="p-2 max-w-xs">
                    <div className="flex items-start gap-2">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded border flex items-center justify-center">
                          <Book className="h-6 w-6 text-green-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm">{book.title}</h4>
                        <p className="text-xs text-gray-600">by {book.author}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                            {book.genre}
                          </span>
                          <span className="text-xs font-bold text-amber-600">
                            ⚡{book.point_value}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Available at: {points.find(p => p.id === book.exchange_point_id)?.name || "Exchange Point"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ));
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}