"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "leaflet/dist/leaflet.css";

import { createClient } from "@/lib/supabase/client";

type Props = {
  deliveryId: string;
  carrierType: "human" | "pigeon";
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  currentLat: number | null;
  currentLng: number | null;
};

type Position = {
  lat: number;
  lng: number;
};

function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLng =
    ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return (
    2 *
    R *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

function formatDistance(distance: number) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1)} km`;
}

function formatEta(
  distanceKm: number,
  carrierType: "human" | "pigeon"
) {
  const speed =
    carrierType === "pigeon"
      ? 60
      : 20;

  const minutes = Math.max(
    1,
    Math.ceil((distanceKm / speed) * 60)
  );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (remaining === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remaining} min`;
}

export default function LiveDeliveryMap({
  deliveryId,
  carrierType,
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  currentLat,
  currentLng,
}: Props) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const mapContainer =
    useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<any>(null);

  const senderMarkerRef =
    useRef<any>(null);

  const carrierMarkerRef =
    useRef<any>(null);

  const destinationMarkerRef =
    useRef<any>(null);

  const routeRef = useRef<any>(null);

  const [mapReady, setMapReady] =
    useState(false);

  const [position, setPosition] =
    useState<Position | null>(
      currentLat !== null &&
        currentLng !== null
        ? {
            lat: Number(currentLat),
            lng: Number(currentLng),
          }
        : null
    );

  /*
   * TOTAL DISTANCE
   *
   * Sender -> Recipient
   */
  const totalDistance =
    calculateDistanceKm(
      originLat,
      originLng,
      destinationLat,
      destinationLng
    );

  /*
   * REMAINING DISTANCE
   *
   * Carrier -> Recipient
   */
  const remainingDistance =
    position
      ? calculateDistanceKm(
          position.lat,
          position.lng,
          destinationLat,
          destinationLng
        )
      : totalDistance;

  /*
   * REALTIME DELIVERY LOCATION
   */
  useEffect(() => {
    let active = true;

    const channel = supabase
      .channel(
        `live-map-${deliveryId}-${Date.now()}`
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deliveries",
          filter: `id=eq.${deliveryId}`,
        },
        (payload) => {
          if (!active) return;

          const data =
            payload.new as {
              current_lat:
                | number
                | null;
              current_lng:
                | number
                | null;
            };

          if (
            data.current_lat !== null &&
            data.current_lng !== null
          ) {
            setPosition({
              lat: Number(
                data.current_lat
              ),
              lng: Number(
                data.current_lng
              ),
            });
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [
    deliveryId,
    supabase,
  ]);

  /*
   * SYNC INITIAL POSITION
   */
  useEffect(() => {
    if (
      currentLat !== null &&
      currentLng !== null
    ) {
      setPosition({
        lat: Number(currentLat),
        lng: Number(currentLng),
      });
    }
  }, [
    currentLat,
    currentLng,
  ]);

  /*
   * INITIAL MAP
   */
  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      if (
        !mapContainer.current ||
        mapRef.current
      ) {
        return;
      }

      const L =
        (await import("leaflet")).default;

      if (cancelled) return;

      const map = L.map(
        mapContainer.current,
        {
          zoomControl: true,
          attributionControl: true,
        }
      );

      mapRef.current = map;

      /*
       * OPENSTREETMAP
       */
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }
      ).addTo(map);

      /*
       * SENDER ICON
       *
       * Custom SVG.
       * No Leaflet marker image dependency.
       */
      const senderIcon =
        L.divIcon({
          className: "",
          html: `
            <div style="
              width:48px;
              height:48px;
              border-radius:50%;
              background:#2563eb;
              border:4px solid white;
              box-shadow:0 5px 18px rgba(0,0,0,.35);
              display:flex;
              align-items:center;
              justify-content:center;
            ">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                  fill="white"
                />
                <path
                  d="M5.5 20C6.1 15.8 8.2 13.5 12 13.5C15.8 13.5 17.9 15.8 18.5 20"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

      /*
       * DESTINATION ICON
       *
       * Google Maps-style location pin.
       */
      const destinationIcon =
        L.divIcon({
          className: "",
          html: `
            <div style="
              width:46px;
              height:46px;
              display:flex;
              align-items:center;
              justify-content:center;
              filter:drop-shadow(0 5px 8px rgba(0,0,0,.35));
            ">
              <svg
                width="46"
                height="46"
                viewBox="0 0 46 46"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23 4C14.716 4 8 10.492 8 18.5C8 29.25 23 42 23 42C23 42 38 29.25 38 18.5C38 10.492 31.284 4 23 4Z"
                  fill="#EA4335"
                  stroke="white"
                  stroke-width="3"
                />
                <circle
                  cx="23"
                  cy="18"
                  r="5"
                  fill="white"
                />
              </svg>
            </div>
          `,
          iconSize: [46, 46],
          iconAnchor: [23, 42],
        });

      /*
       * SENDER MARKER
       */
      senderMarkerRef.current =
        L.marker(
          [
            originLat,
            originLng,
          ],
          {
            icon: senderIcon,
            zIndexOffset: 500,
          }
        )
          .addTo(map)
          .bindPopup(
            `
              <div style="min-width:150px">
                <strong>Sender</strong>
                <br/>
                Message origin
              </div>
            `
          );

      /*
       * DESTINATION MARKER
       */
      destinationMarkerRef.current =
        L.marker(
          [
            destinationLat,
            destinationLng,
          ],
          {
            icon: destinationIcon,
            zIndexOffset: 600,
          }
        )
          .addTo(map)
          .bindPopup(
            `
              <div style="min-width:150px">
                <strong>Recipient</strong>
                <br/>
                Delivery destination
              </div>
            `
          );

      /*
       * ROUTE
       *
       * Main route line.
       */
      const routeCoordinates: [number, number][] = [
        [originLat, originLng],
        [
          destinationLat,
          destinationLng,
        ],
      ];

      const routeBounds: [number, number][] = [
        [originLat, originLng],
        [
          destinationLat,
          destinationLng,
        ],
      ];

      /*
       * Route casing
       */
      L.polyline(
        routeCoordinates,
        {
          color: "#ffffff",
          weight: 8,
          opacity: 0.85,
        }
      ).addTo(map);

      /*
       * Main route
       */
      routeRef.current =
        L.polyline(
          routeCoordinates,
          {
            color: "#2563eb",
            weight: 4,
            opacity: 0.95,
          }
        ).addTo(map);

      /*
       * FIT MAP
       */
      map.fitBounds(
        routeBounds,
        {
          padding: [80, 80],
        }
      );

      /*
       * Make sure Leaflet calculates
       * dimensions correctly after render.
       */
      setTimeout(() => {
        if (!cancelled && mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);

      if (!cancelled) {
        setMapReady(true);
      }
    }

    initializeMap();

    return () => {
      cancelled = true;

      setMapReady(false);

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      senderMarkerRef.current = null;
      carrierMarkerRef.current = null;
      destinationMarkerRef.current = null;
      routeRef.current = null;
    };
  }, [
    originLat,
    originLng,
    destinationLat,
    destinationLng,
  ]);

  /*
   * LIVE CARRIER MARKER
   */
  useEffect(() => {
    if (
      !mapReady ||
      !mapRef.current ||
      !position
    ) {
      return;
    }

    const currentPosition = position;

    let cancelled = false;

    async function updateCarrierMarker() {
      const L =
        (await import("leaflet")).default;

      if (
        cancelled ||
        !mapRef.current
      ) {
        return;
      }

      const isPigeon =
        carrierType === "pigeon";

      /*
       * HUMAN ICON
       */
      const humanIcon =
        `
          <div style="
            width:52px;
            height:52px;
            border-radius:50%;
            background:#111827;
            border:4px solid white;
            box-shadow:0 7px 22px rgba(0,0,0,.4);
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 17L7.5 10.5L10.5 13L14 9L19 14"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                cx="12"
                cy="6"
                r="2.5"
                fill="white"
              />
            </svg>
          </div>
        `;

      /*
       * PIGEON ICON
       */
      const pigeonIcon =
        `
          <div style="
            width:52px;
            height:52px;
            border-radius:50%;
            background:white;
            border:4px solid #111;
            box-shadow:0 7px 22px rgba(0,0,0,.4);
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <svg
              width="29"
              height="29"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12C7 11.5 9 9 11 6C13 3 17 4 19 6C21 8 21 11 19 13C17 15 14 15 12 14L8 19"
                stroke="#111"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M11 6L8 4"
                stroke="#111"
                stroke-width="2"
                stroke-linecap="round"
              />
              <circle
                cx="17"
                cy="8"
                r="1"
                fill="#111"
              />
            </svg>
          </div>
        `;

      const icon = L.divIcon({
        className: "",
        html: isPigeon
          ? pigeonIcon
          : humanIcon,
        iconSize: [52, 52],
        iconAnchor: [26, 26],
      });

      if (
        !carrierMarkerRef.current
      ) {
        carrierMarkerRef.current =
          L.marker(
            [
              currentPosition.lat,
              currentPosition.lng,
            ],
            {
              icon,
              zIndexOffset: 1000,
            }
          )
            .addTo(mapRef.current)
            .bindPopup(
              isPigeon
                ? `
                  <div style="min-width:150px">
                    <strong>Pigeon Express</strong>
                    <br/>
                    Simulated GPS
                  </div>
                `
                : `
                  <div style="min-width:150px">
                    <strong>Delivery Partner</strong>
                    <br/>
                    Live GPS
                  </div>
                `
            );
      } else {
        carrierMarkerRef.current.setIcon(
          icon
        );

        carrierMarkerRef.current.setLatLng(
          [
            currentPosition.lat,
            currentPosition.lng,
          ]
        );
      }
    }

    updateCarrierMarker();

    return () => {
      cancelled = true;
    };
  }, [
    position,
    carrierType,
    mapReady,
  ]);

  /*
   * CURRENT STATUS LABEL
   */
  const trackingLabel =
    carrierType === "pigeon"
      ? "SIMULATED GPS"
      : "LIVE GPS";

  return (
    <div className="relative h-full w-full">
      <div
        ref={mapContainer}
        className="h-full w-full"
      />

      {/* TOP LEFT — LIVE STATUS */}
      <div className="absolute left-4 top-4 z-[1000] rounded-2xl border border-neutral-800 bg-neutral-950/95 px-4 py-3 text-xs text-white shadow-xl backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
          </span>

          <span className="font-semibold">
            {trackingLabel}
          </span>
        </div>

        <p className="mt-1 text-[10px] text-neutral-500">
          MessageGo tracking
        </p>
      </div>

      {/* TOP RIGHT — DISTANCE CARD */}
      <div className="absolute right-4 top-4 z-[1000] min-w-[190px] rounded-2xl border border-neutral-800 bg-white px-5 py-4 text-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-neutral-400">
              SENDER → RECIPIENT
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight">
              {formatDistance(
                totalDistance
              )}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 19L19 5"
                stroke="#111"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 5H19V12"
                stroke="#111"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="mt-3 border-t border-neutral-200 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">
              Remaining
            </span>

            <span className="font-semibold">
              {formatDistance(
                Math.max(
                  0,
                  remainingDistance
                )
              )}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-neutral-400">
              Est. travel
            </span>

            <span className="font-semibold">
              {formatEta(
                Math.max(
                  0,
                  remainingDistance
                ),
                carrierType
              )}
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT — CURRENT CARRIER */}
      {position && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-2xl border border-neutral-800 bg-neutral-950/95 px-4 py-3 text-white shadow-xl backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800">
              {carrierType === "pigeon" ? (
                <span className="text-lg">
                  🐦
                </span>
              ) : (
                <span className="text-lg">
                  •
                </span>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold">
                {carrierType === "pigeon"
                  ? "Pigeon location"
                  : "Partner location"}
              </p>

              <p className="mt-0.5 text-[10px] text-neutral-500">
                {formatDistance(
                  Math.max(
                    0,
                    remainingDistance
                  )
                )}{" "}
                from recipient
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM RIGHT — MAP LEGEND */}
      <div className="absolute bottom-4 right-4 z-[1000] rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 text-[10px] text-neutral-700 shadow-xl backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          Sender
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Recipient
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span className="h-0.5 w-4 bg-blue-600" />
          Route
        </div>
      </div>
    </div>
  );
}