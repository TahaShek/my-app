"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import L from "leaflet";
import { Loader2 } from "lucide-react";

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

function LocationMarker({
  initialPosition,
  onPick,
  setParentPosition
}: {
  initialPosition: [number, number] | null,
  onPick: (coords: [number, number]) => void,
  setParentPosition: (pos: [number, number] | null) => void
}) {
  const [position, setPosition] = useState<[number, number] | null>(initialPosition);

  // Sync internal state if initialPosition changes (e.g. from parent auto-locate)
  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  useMapEvents({
    click(e) {
      const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(coords);
      setParentPosition(coords);
      onPick(coords);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

export default function LocationPickerModal({
  onClose,
  onSelect,
  initialPosition,
}: {
  onClose: () => void;
  onSelect: (coords: { lat: number; lng: number }) => void;
  initialPosition?: { lat: number; lng: number } | null;
}) {
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]); // Default fallback
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    initialPosition ? [initialPosition.lat, initialPosition.lng] : null
  );

  useEffect(() => {
    // If we have an initial position, center on it and stop loading
    if (initialPosition) {
      setCenter([initialPosition.lat, initialPosition.lng]);
      setLoadingLocation(false);
      return;
    }

    // Otherwise try to geolocate
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCenter([lat, lng]);

          // Auto-place marker at current location if no initial position existed
          if (!markerPosition) {
            setMarkerPosition([lat, lng]);
            // Optional: immediately select this location? 
            // Maybe better to wait for user confirmation/click, but user asked for "show exact location".
            // We won't call onSelect yet, just show the marker.
          }
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLocation(false);
        }
      );
    } else {
      setLoadingLocation(false);
    }
  }, [initialPosition]); // Removed markerPosition from dependency to avoid loop

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-serif">Select Location</h2>
          {loadingLocation && (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Locating you...
            </span>
          )}
        </div>

        {/* Fixed height container to ensure map visibility */}
        <div className="h-[500px] w-full border rounded-md overflow-hidden relative z-0">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <RecenterAutomatically lat={center[0]} lng={center[1]} />
            <LocationMarker
              initialPosition={markerPosition}
              setParentPosition={setMarkerPosition}
              onPick={(coords: [number, number]) => {
                // We update local state in LocationMarker via setParentPosition
                // But we don't close modal yet - user might want to adjust
              }}
            />
          </MapContainer>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (markerPosition) {
                onSelect({ lat: markerPosition[0], lng: markerPosition[1] });
              } else {
                // Fallback if no marker, maybe center?
                onSelect({ lat: center[0], lng: center[1] });
              }
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}