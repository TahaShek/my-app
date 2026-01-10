"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import { Loader2, Navigation, MapPin } from "lucide-react";
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
  const markerRef = useRef<L.Marker>(null);

  // Sync internal state if initialPosition changes
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

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          const coords: [number, number] = [lat, lng];
          setPosition(coords);
          setParentPosition(coords);
          onPick(coords);
        }
      },
    }),
    [onPick, setParentPosition]
  );

  return position ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  ) : null;
}

function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

interface LocationPickerProps {
  initialPosition?: { lat: number; lng: number } | null;
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  className?: string;
}

export default function LocationPicker({
  initialPosition,
  onLocationSelect,
  className = "h-[400px] w-full"
}: LocationPickerProps) {
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]); // Default fallback
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    initialPosition ? [initialPosition.lat, initialPosition.lng] : null
  );

  // Locate user
  const handleLocateMe = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCenter([lat, lng]);
          setMarkerPosition([lat, lng]);
          onLocationSelect({ lat, lng });
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
  };

  useEffect(() => {
    // If we have an initial position, use it
    if (initialPosition) {
      setCenter([initialPosition.lat, initialPosition.lng]);
      setLoadingLocation(false);
      return;
    }

    // Otherwise auto-locate on mount
    handleLocateMe();
  }, []);

  return (
    <div className={`relative border rounded-md overflow-hidden z-0 ${className}`}>
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
          setParentPosition={(pos) => setMarkerPosition(pos)}
          onPick={(coords) => {
            onLocationSelect({ lat: coords[0], lng: coords[1] });
          }}
        />
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleLocateMe}
          title="Locate Me"
          className="bg-white shadow-md hover:bg-gray-100"
        >
          {loadingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Instruction Overlay (fades out or persistent small text) */}
      {!markerPosition && !loadingLocation && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded shadow-sm text-sm z-[1000]">
          Click map to pin location
        </div>
      )}
    </div>
  );
}
