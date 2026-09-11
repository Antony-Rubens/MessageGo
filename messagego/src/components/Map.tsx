"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type MapProps = {
  latitude?: number;
  longitude?: number;
  zoom?: number;
};

export default function Map({
  latitude = 10.8505,
  longitude = 76.2711,
  zoom = 7,
}: MapProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (
        !containerRef.current ||
        mapRef.current
      ) {
        return;
      }

      const L = (await import("leaflet")).default;

      if (
        cancelled ||
        !containerRef.current
      ) {
        return;
      }

      const map = L.map(
        containerRef.current
      ).setView(
        [latitude, longitude],
        zoom
      );

      mapRef.current = map;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; OpenStreetMap contributors',
        }
      ).addTo(map);

      L.marker([
        latitude,
        longitude,
      ])
        .addTo(map)
        .bindPopup("MessageGo Delivery");
    }

    init();

    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, zoom]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  );
}