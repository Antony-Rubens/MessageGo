"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import "leaflet/dist/leaflet.css";

type Props = {
  latitude: number;
  longitude: number;
  onLocationSelect: (
    latitude: number,
    longitude: number
  ) => void;
};

type Point = {
  lat: number;
  lng: number;
};

function formatDistance(
  meters: number
): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationSelect,
}: Props) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<any>(null);

  const senderMarkerRef =
    useRef<any>(null);

  const destinationMarkerRef =
    useRef<any>(null);

  const routeRef =
    useRef<any>(null);

  const routeGlowRef =
    useRef<any>(null);

  const distanceMarkerRef =
    useRef<any>(null);

  const [senderLocation, setSenderLocation] =
    useState<Point | null>(null);

  const [roadDistance, setRoadDistance] =
    useState<number | null>(null);

  const [loadingRoute, setLoadingRoute] =
    useState(false);

  /*
   * GET SENDER LOCATION
   */
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSenderLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setSenderLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  /*
   * INITIALIZE MAP
   */
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (
        !containerRef.current ||
        mapRef.current
      ) {
        return;
      }

      const L =
        (await import("leaflet")).default;

      if (cancelled) return;

      /*
       * CREATE MAP
       */
      const map = L.map(
        containerRef.current,
        {
          zoomControl: false,
          attributionControl: true,
        }
      );

      mapRef.current = map;

      /*
       * ZOOM CONTROL
       */
      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(map);

      /*
       * OPENSTREETMAP TILES
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
       */
      const senderIcon =
        L.divIcon({
          className: "",
          html: `
            <div style="
              width:46px;
              height:46px;
              border-radius:50%;
              background:#2563eb;
              border:4px solid white;
              box-shadow:
                0 4px 14px rgba(0,0,0,.35);
              display:flex;
              align-items:center;
              justify-content:center;
              color:white;
              font-size:21px;
            ">
              👤
            </div>
          `,
          iconSize: [46, 46],
          iconAnchor: [23, 23],
        });

      /*
       * RECIPIENT ICON
       */
      const destinationIcon =
        L.divIcon({
          className: "",
          html: `
            <div style="
              position:relative;
              width:46px;
              height:58px;
            ">
              <div style="
                position:absolute;
                left:1px;
                top:1px;
                width:44px;
                height:44px;
                border-radius:50% 50% 50% 0;
                background:#dc2626;
                border:4px solid white;
                box-shadow:
                  0 4px 14px rgba(0,0,0,.35);
                transform:rotate(-45deg);
              "></div>

              <div style="
                position:absolute;
                left:17px;
                top:17px;
                width:12px;
                height:12px;
                border-radius:50%;
                background:white;
                z-index:2;
              "></div>
            </div>
          `,
          iconSize: [46, 58],
          iconAnchor: [23, 48],
        });

      /*
       * DESTINATION MARKER
       */
      destinationMarkerRef.current =
        L.marker(
          [
            latitude,
            longitude,
          ],
          {
            icon: destinationIcon,
            zIndexOffset: 600,
          }
        )
          .addTo(map)
          .bindPopup(
            "<b>Recipient</b><br/>Drop-off location"
          );

      /*
       * SENDER MARKER
       *
       * If GPS is already available.
       */
      if (senderLocation) {
        senderMarkerRef.current =
          L.marker(
            [
              senderLocation.lat,
              senderLocation.lng,
            ],
            {
              icon: senderIcon,
              zIndexOffset: 700,
            }
          )
            .addTo(map)
            .bindPopup(
              "<b>You</b><br/>Sender location"
            );
      }

      /*
       * INITIAL VIEW
       */
      if (senderLocation) {
        const bounds =
          L.latLngBounds([
            [
              senderLocation.lat,
              senderLocation.lng,
            ],
            [
              latitude,
              longitude,
            ],
          ]);

        map.fitBounds(bounds, {
          padding: [70, 70],
        });
      } else {
        map.setView(
          [
            latitude,
            longitude,
          ],
          13
        );
      }

      /*
       * CLICK TO SELECT DESTINATION
       */
      map.on(
        "click",
        (event: any) => {
          const lat =
            event.latlng.lat;

          const lng =
            event.latlng.lng;

          onLocationSelect(
            lat,
            lng
          );

          if (
            destinationMarkerRef.current
          ) {
            destinationMarkerRef.current.setLatLng(
              [lat, lng]
            );
          }
        }
      );
    }

    initialize();

    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      senderMarkerRef.current =
        null;

      destinationMarkerRef.current =
        null;

      routeRef.current = null;
      routeGlowRef.current = null;
      distanceMarkerRef.current =
        null;
    };
  }, []);

  /*
   * UPDATE SENDER MARKER
   */
  useEffect(() => {
    if (
      !mapRef.current ||
      !senderLocation
    ) {
      return;
    }

    const currentSenderLocation =
      senderLocation;

    async function updateSender() {
      const L =
        (await import("leaflet")).default;

      const senderIcon =
        L.divIcon({
          className: "",
          html: `
            <div style="
              width:46px;
              height:46px;
              border-radius:50%;
              background:#2563eb;
              border:4px solid white;
              box-shadow:
                0 4px 14px rgba(0,0,0,.35);
              display:flex;
              align-items:center;
              justify-content:center;
              color:white;
              font-size:21px;
            ">
              👤
            </div>
          `,
          iconSize: [46, 46],
          iconAnchor: [23, 23],
        });

      if (
        !senderMarkerRef.current
      ) {
        senderMarkerRef.current =
          L.marker(
            [
              currentSenderLocation.lat,
              currentSenderLocation.lng,
            ],
            {
              icon: senderIcon,
              zIndexOffset: 700,
            }
          )
            .addTo(mapRef.current)
            .bindPopup(
              "<b>You</b><br/>Sender location"
            );
      } else {
        senderMarkerRef.current.setLatLng(
          [
            currentSenderLocation.lat,
            currentSenderLocation.lng,
          ]
        );
      }
    }

    updateSender();
  }, [senderLocation]);

  /*
   * UPDATE DESTINATION MARKER
   */
  useEffect(() => {
    if (
      !mapRef.current ||
      !destinationMarkerRef.current
    ) {
      return;
    }

    destinationMarkerRef.current.setLatLng(
      [
        latitude,
        longitude,
      ]
    );
  }, [
    latitude,
    longitude,
  ]);

  /*
   * GET ROAD ROUTE
   *
   * OSRM gives us an actual road-following
   * route instead of a straight line.
   */
  useEffect(() => {
    if (
      !mapRef.current ||
      !senderLocation
    ) {
      return;
    }

    const currentSenderLocation =
      senderLocation;

    let cancelled = false;

    async function loadRoute() {
      setLoadingRoute(true);

      try {
        const start =
          `${currentSenderLocation.lng},${currentSenderLocation.lat}`;

        const end =
          `${longitude},${latitude}`;

        const url =
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Unable to load route"
          );
        }

        const data =
          await response.json();

        if (
          cancelled ||
          !data.routes ||
          !data.routes[0]
        ) {
          return;
        }

        const route =
          data.routes[0];

        const coordinates =
          route.geometry
            .coordinates;

        const latLngs =
          coordinates.map(
            (coordinate: [
              number,
              number
            ]) => [
              coordinate[1],
              coordinate[0],
            ]
          );

        const L =
          (await import("leaflet")).default;

        /*
         * REMOVE OLD ROUTE
         */
        if (routeGlowRef.current) {
          routeGlowRef.current.remove();
        }

        if (routeRef.current) {
          routeRef.current.remove();
        }

        if (
          distanceMarkerRef.current
        ) {
          distanceMarkerRef.current.remove();
        }

        /*
         * OUTER ROUTE GLOW
         */
        routeGlowRef.current =
          L.polyline(
            latLngs,
            {
              color: "#ffffff",
              weight: 10,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }
          ).addTo(
            mapRef.current
          );

        /*
         * MAIN BLUE ROUTE
         */
        routeRef.current =
          L.polyline(
            latLngs,
            {
              color: "#2563eb",
              weight: 6,
              opacity: 1,
              lineCap: "round",
              lineJoin: "round",
            }
          ).addTo(
            mapRef.current
          );

        /*
         * DISTANCE
         */
        const distance =
          Number(route.distance);

        setRoadDistance(distance);

        /*
         * DISTANCE LABEL
         */
        const middleIndex =
          Math.floor(
            latLngs.length / 2
          );

        const middlePoint =
          latLngs[middleIndex];

        const distanceIcon =
          L.divIcon({
            className: "",
            html: `
              <div style="
                background:#111;
                color:white;
                padding:7px 12px;
                border-radius:999px;
                font-size:12px;
                font-weight:700;
                white-space:nowrap;
                box-shadow:
                  0 4px 14px rgba(0,0,0,.3);
                border:2px solid white;
              ">
                ${formatDistance(
                  distance
                )}
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

        distanceMarkerRef.current =
          L.marker(
            middlePoint,
            {
              icon: distanceIcon,
              interactive: false,
              zIndexOffset: 400,
            }
          ).addTo(
            mapRef.current
          );

        /*
         * FIT ROUTE
         */
        const bounds =
          L.latLngBounds(
            latLngs
          );

        mapRef.current.fitBounds(
          bounds,
          {
            padding: [70, 70],
            maxZoom: 15,
          }
        );
      } catch (error) {
        console.error(
          "MESSAGEGO ROUTE ERROR:",
          error
        );

        /*
         * FALLBACK:
         * straight line if routing API fails.
         */
        try {
          const L =
            (await import("leaflet")).default;

          if (!currentSenderLocation) {
            return;
          }

          const fallback =
            [
              [
                currentSenderLocation.lat,
                currentSenderLocation.lng,
              ],
              [
                latitude,
                longitude,
              ],
            ];

          if (routeGlowRef.current) {
            routeGlowRef.current.remove();
          }

          if (routeRef.current) {
            routeRef.current.remove();
          }

          routeGlowRef.current =
            L.polyline(
              fallback as [number, number][],
              {
                color: "#ffffff",
                weight: 10,
                opacity: 0.9,
              }
            ).addTo(
              mapRef.current
            );

          routeRef.current =
            L.polyline(
              fallback as [number, number][],
              {
                color: "#2563eb",
                weight: 6,
                opacity: 1,
              }
            ).addTo(
              mapRef.current
            );
        } catch {}
      } finally {
        if (!cancelled) {
          setLoadingRoute(false);
        }
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [
    senderLocation,
    latitude,
    longitude,
  ]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* MAP */}
      <div
        ref={containerRef}
        className="h-full w-full"
      />

      {/* TOP LEFT LOCATION STATUS */}
      <div className="absolute left-4 top-4 z-[1000] rounded-full border border-white/20 bg-white/95 px-4 py-2 text-xs font-semibold text-neutral-900 shadow-lg backdrop-blur">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-600" />
        {senderLocation
          ? "Your location detected"
          : "Finding your location..."}
      </div>

      {/* ROUTE INFO */}
      {senderLocation && (
        <div className="absolute bottom-4 left-4 z-[1000] min-w-[210px] rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 text-neutral-900 shadow-xl backdrop-blur">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Delivery route
          </p>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
              👤
            </div>

            <div className="h-px flex-1 bg-neutral-300" />

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              ●
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs text-neutral-500">
                Sender → Recipient
              </p>

              <p className="mt-1 text-xl font-bold">
                {roadDistance !== null
                  ? formatDistance(
                      roadDistance
                    )
                  : "Calculating..."}
              </p>
            </div>

            {loadingRoute && (
              <div className="pb-1 text-[10px] text-neutral-500">
                Mapping route...
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAP INSTRUCTION */}
      <div className="absolute right-4 bottom-4 z-[1000] rounded-full border border-neutral-200 bg-white/95 px-4 py-2 text-xs text-neutral-600 shadow-lg backdrop-blur">
        Click the map to change drop-off
      </div>
    </div>
  );
}