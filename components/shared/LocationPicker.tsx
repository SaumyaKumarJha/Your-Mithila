"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Locate, Loader2 } from "lucide-react";

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  onChange: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    google: any;
    initLocationPicker: () => void;
  }
}

const DEFAULT_CENTER = { lat: 26.3544, lng: 86.0739 }; // Madhubani, Bihar

export function LocationPicker({ latitude, longitude, address, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;
    const center = coords ?? DEFAULT_CENTER;
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: coords ? 16 : 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    const marker = new window.google.maps.Marker({
      position: coords ?? DEFAULT_CENTER,
      map,
      draggable: true,
      title: "Drag to set exact location",
      visible: !!coords,
    });
    markerRef.current = marker;

    map.addListener("click", (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition({ lat, lng });
      marker.setVisible(true);
      setCoords({ lat, lng });
      onChange(lat, lng);
    });

    marker.addListener("dragend", (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setCoords({ lat, lng });
      onChange(lat, lng);
    });

    setLoaded(true);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!apiKey) return;
    if (window.google?.maps) { initMap(); return; }

    window.initLocationPicker = initMap;
    if (document.getElementById("gmap-script")) return;

    const script = document.createElement("script");
    script.id = "gmap-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initLocationPicker`;
    script.async = true;
    document.head.appendChild(script);
  }, [apiKey, initMap]);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        onChange(lat, lng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(17);
        }
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
          markerRef.current.setVisible(true);
        }
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  if (!apiKey) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300">
        📍 Map coming soon
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Click on map or drag marker to set exact location
        </p>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium border border-orange-300 rounded-lg px-2 py-1 transition-colors"
        >
          {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Locate className="w-3 h-3" />}
          Use my location
        </button>
      </div>
      <div ref={mapRef} className="w-full h-56 rounded-xl border border-gray-200 bg-gray-100" />
      {coords && (
        <p className="text-xs text-green-600 font-medium">
          ✓ Location set: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}
