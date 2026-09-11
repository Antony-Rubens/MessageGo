"use client";

import {
  useEffect,
  useMemo,
  useState,
  type SVGProps,
} from "react";

import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { calculateDistance } from "@/lib/distance";
import { isWithinRadius } from "@/lib/geofence";
import LiveDeliveryMap from "@/components/LiveDeliveryMap";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function Icon({
  size = 24,
  children,
  ...props
}: IconProps & {
  children: React.ReactNode;
}) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const ArrowLeft = (props: IconProps) => (
  <Icon {...props}>
    <path d="m15 18-6-6 6-6" />
    <path d="M9 12h12" />
  </Icon>
);

const ArrowRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 12h18" />
    <path d="m15 6 6 6" />
  </Icon>
);

const Check = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 12 4 4L19 6" />
  </Icon>
);

const Lock = (props: IconProps) => (
  <Icon {...props}>
    <rect
      width="16"
      height="11"
      x="4"
      y="11"
      rx="2"
    />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
);

const MapPin = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2" />
  </Icon>
);

const Navigation = (props: IconProps) => (
  <Icon {...props}>
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </Icon>
);

const Package = (props: IconProps) => (
  <Icon {...props}>
    <path d="m16.5 9.4-9-5.19" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </Icon>
);

const ShieldCheck = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

type Delivery = {
  id: string;
  carrier_type: "human" | "pigeon";
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  distance_total: number;
  distance_remaining: number;
  eta: string;
  status: string;
  created_at: string;
  message_id: string;
  handoff_code?: string | null;
  current_lat?: number | null;
  current_lng?: number | null;
};

export default function PartnerPage() {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [status, setStatus] = useState<
    | "loading"
    | "available"
    | "pickup"
    | "picked-up"
    | "delivering"
    | "none"
  >("loading");

  const [delivery, setDelivery] =
    useState<Delivery | null>(null);

  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const [partnerName, setPartnerName] =
    useState("Delivery Partner");

  /*
   * LOAD DELIVERY
   */
  useEffect(() => {
    let cancelled = false;

    async function loadDelivery() {
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setError(
            "Please log in as a delivery partner."
          );
          setStatus("none");
        }
        return;
      }

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .maybeSingle();

      if (!cancelled && profile) {
        setPartnerName(profile.name);
      }

      const { data, error } =
        await supabase
          .from("deliveries")
          .select(`
            id,
            carrier_type,
            origin_lat,
            origin_lng,
            destination_lat,
            destination_lng,
            current_lat,
            current_lng,
            distance_total,
            distance_remaining,
            eta,
            status,
            created_at,
            message_id,
            handoff_code
          `)
          .eq("carrier_id", user.id)
          .in("status", [
            "partner_assigned",
            "accepted",
            "pickup_verified",
            "in_transit",
            "arrived",
          ])
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setStatus("none");
        return;
      }

      if (!data) {
        setStatus("none");
        return;
      }

      const d = data as Delivery;

      setDelivery(d);

      if (d.status === "partner_assigned") {
        setStatus("available");
      } else if (d.status === "accepted") {
        setStatus("pickup");
      } else if (
        d.status === "pickup_verified"
      ) {
        setStatus("picked-up");
      } else if (
        d.status === "in_transit"
      ) {
        setStatus("delivering");
      } else if (
        d.status === "arrived"
      ) {
        setStatus("delivering");
      }
    }

    loadDelivery();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  /*
   * REALTIME DELIVERY UPDATES
   */
  useEffect(() => {
    if (!delivery?.id) {
      return;
    }

    let active = true;

    const channel = supabase
      .channel(
        `partner-delivery-${delivery.id}-${Date.now()}`
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deliveries",
          filter: `id=eq.${delivery.id}`,
        },
        (payload) => {
          if (!active) return;

          const updated =
            payload.new as Delivery;

          /*
           * SENDER CANCELLED DELIVERY
           */
          if (updated.status === "cancelled") {
            setDelivery(null);
            setStatus("none");
            setError(
              "This delivery was cancelled by the sender."
            );
            return;
          }

          setDelivery(updated);

          if (
            updated.status ===
            "partner_assigned"
          ) {
            setStatus("available");
          }

          if (
            updated.status === "accepted"
          ) {
            setStatus("pickup");
          }

          if (
            updated.status ===
            "pickup_verified"
          ) {
            setStatus("picked-up");
          }

          if (
            updated.status === "in_transit"
          ) {
            setStatus("delivering");
          }

          if (
            updated.status === "arrived"
          ) {
            setStatus("delivering");
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [
    delivery?.id,
    supabase,
  ]);

  /*
   * REAL GPS
   */
  useEffect(() => {
    if (
      !delivery ||
      ![
        "pickup",
        "picked-up",
        "delivering",
      ].includes(status)
    ) {
      return;
    }

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported."
      );
      return;
    }

    const deliveryId = delivery.id;

    const originLat = Number(
      delivery.origin_lat
    );

    const originLng = Number(
      delivery.origin_lng
    );

    const destinationLat = Number(
      delivery.destination_lat
    );

    const destinationLng = Number(
      delivery.destination_lng
    );

    let watcherActive = true;

    const watchId =
      navigator.geolocation.watchPosition(
        async (position) => {
          if (!watcherActive) return;

          const {
            latitude,
            longitude,
          } = position.coords;

          const distanceToPickup =
            calculateDistance(
              latitude,
              longitude,
              originLat,
              originLng
            );

          const distanceToDestination =
            calculateDistance(
              latitude,
              longitude,
              destinationLat,
              destinationLng
            );

          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user || !watcherActive) return;

          /*
           * RECHECK DATABASE STATUS
           *
           * Prevents GPS updates after
           * sender/partner cancellation.
           */
          const { data: latestDelivery } =
            await supabase
              .from("deliveries")
              .select("status, carrier_id")
              .eq("id", deliveryId)
              .maybeSingle();

          if (
            !latestDelivery ||
            latestDelivery.carrier_id !== user.id
          ) {
            return;
          }

          if (
            latestDelivery.status ===
            "cancelled"
          ) {
            watcherActive = false;
            setDelivery(null);
            setStatus("none");
            setError(
              "This delivery was cancelled."
            );
            return;
          }

          if (
            latestDelivery.status ===
            "delivered"
          ) {
            watcherActive = false;
            return;
          }

          /*
           * PICKUP GEOFENCE
           */
          if (
            status === "pickup" &&
            latestDelivery.status ===
              "accepted" &&
            isWithinRadius(
              latitude,
              longitude,
              originLat,
              originLng,
              0.1
            )
          ) {
            const { error } =
              await supabase
                .from("deliveries")
                .update({
                  status:
                    "pickup_verified",
                  picked_up_at:
                    new Date().toISOString(),
                  current_lat:
                    latitude,
                  current_lng:
                    longitude,
                })
                .eq(
                  "id",
                  deliveryId
                )
                .eq(
                  "carrier_id",
                  user.id
                )
                .eq(
                  "status",
                  "accepted"
                );

            if (!error) {
              setStatus("picked-up");

              setDelivery(
                (current) =>
                  current
                    ? {
                        ...current,
                        status:
                          "pickup_verified",
                        current_lat:
                          latitude,
                        current_lng:
                          longitude,
                      }
                    : current
              );
            }
          }

          /*
           * DESTINATION GEOFENCE
           */
          if (
            status === "delivering" &&
            latestDelivery.status ===
              "in_transit" &&
            isWithinRadius(
              latitude,
              longitude,
              destinationLat,
              destinationLng,
              0.1
            )
          ) {
            const { error } =
              await supabase
                .from("deliveries")
                .update({
                  status: "arrived",
                  current_lat:
                    latitude,
                  current_lng:
                    longitude,
                  distance_remaining: 0,
                })
                .eq(
                  "id",
                  deliveryId
                )
                .eq(
                  "carrier_id",
                  user.id
                )
                .eq(
                  "status",
                  "in_transit"
                );

            if (!error) {
              setDelivery(
                (current) =>
                  current
                    ? {
                        ...current,
                        status: "arrived",
                        current_lat:
                          latitude,
                        current_lng:
                          longitude,
                        distance_remaining: 0,
                      }
                    : current
              );
            }
          }

          /*
           * UPDATE GPS
           */
          const { error: gpsError } =
            await supabase
              .from("deliveries")
              .update({
                current_lat:
                  latitude,
                current_lng:
                  longitude,
                distance_remaining:
                  distanceToDestination,
              })
              .eq(
                "id",
                deliveryId
              )
              .eq(
                "carrier_id",
                user.id
              )
              .not(
                "status",
                "in",
                "(cancelled,delivered)"
              );

          if (gpsError) {
            console.error(
              "GPS update error:",
              gpsError
            );
            return;
          }

          setDelivery(
            (current) =>
              current
                ? {
                    ...current,
                    current_lat:
                      latitude,
                    current_lng:
                      longitude,
                    distance_remaining:
                      distanceToDestination,
                  }
                : current
          );
        },
        (geoError) => {
          if (!watcherActive) return;

          setError(
            `GPS error: ${geoError.message}`
          );
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );

    return () => {
      watcherActive = false;

      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, [
    delivery?.id,
    delivery?.origin_lat,
    delivery?.origin_lng,
    delivery?.destination_lat,
    delivery?.destination_lng,
    status,
    supabase,
  ]);

  /*
   * LOADING
   */
  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p className="text-sm text-neutral-500">
          Checking for delivery requests...
        </p>
      </main>
    );
  }

  /*
   * NO DELIVERY
   */
  if (
    !delivery ||
    status === "none"
  ) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <header className="border-b border-neutral-900">
          <div className="mx-auto flex max-w-6xl justify-between px-6 py-5">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-neutral-400"
            >
              <ArrowLeft size={18} />
              Exit
            </Link>

            <strong>
              MESSAGEGO
            </strong>

            <span className="text-xs text-green-400">
              ● Online
            </span>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h1 className="text-3xl font-bold">
            No delivery requests
          </h1>

          <p className="mt-3 text-neutral-500">
            You&apos;re online,{" "}
            {partnerName}.
          </p>

          {error && (
            <p className="mt-6 text-sm text-red-400">
              {error}
            </p>
          )}
        </section>
      </main>
    );
  }

  const remaining = Number(
    delivery.distance_remaining ?? 0
  );

  const carrierName =
    delivery.carrier_type ===
    "pigeon"
      ? "Pigeon Express"
      : "Human Express";

  const hasLiveLocation =
    delivery.current_lat !== null &&
    delivery.current_lat !==
      undefined &&
    delivery.current_lng !== null &&
    delivery.current_lng !==
      undefined;

  const canCancel =
    !cancelling &&
    [
      "partner_assigned",
      "accepted",
      "pickup_verified",
      "in_transit",
    ].includes(delivery.status);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-900">
        <div className="mx-auto flex max-w-6xl justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-neutral-400"
          >
            <ArrowLeft size={18} />
            Exit
          </Link>

          <strong>
            MESSAGEGO
          </strong>

          <span className="text-xs text-green-400">
            ● Online
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm text-neutral-500">
          DELIVERY PARTNER
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-bold">
              Good morning,{" "}
              {partnerName}.
            </h1>

            <p className="mt-2 text-neutral-500">
              Someone has decided that texting is
              too convenient.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-900 bg-green-950/30 px-4 py-2 text-xs text-green-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            {hasLiveLocation
              ? "GPS LIVE"
              : "Waiting for GPS"}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* LIVE MAP */}
          <div className="relative min-h-[560px] overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900">
            <LiveDeliveryMap
              deliveryId={
                delivery.id
              }
              carrierType={
                delivery.carrier_type
              }
              originLat={Number(
                delivery.origin_lat
              )}
              originLng={Number(
                delivery.origin_lng
              )}
              destinationLat={Number(
                delivery.destination_lat
              )}
              destinationLng={Number(
                delivery.destination_lng
              )}
              currentLat={
                delivery.current_lat !==
                  null &&
                delivery.current_lat !==
                  undefined
                  ? Number(
                      delivery.current_lat
                    )
                  : null
              }
              currentLng={
                delivery.current_lng !==
                  null &&
                delivery.current_lng !==
                  undefined
                  ? Number(
                      delivery.current_lng
                    )
                  : null
              }
            />
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-5">
            {/* LIVE LOCATION */}
            <div className="rounded-3xl border border-green-900 bg-green-950/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs tracking-widest text-green-400">
                    LIVE LOCATION
                  </p>

                  <h3 className="mt-1 font-semibold">
                    Your location is live
                  </h3>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-full bg-green-950 px-3 py-1.5 text-xs text-green-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  LIVE
                </div>
              </div>

              {hasLiveLocation && (
                <div className="mt-4 rounded-2xl bg-neutral-950/60 p-4">
                  <p className="text-xs text-neutral-600">
                    CURRENT COORDINATES
                  </p>

                  <p className="mt-1 font-mono text-xs text-neutral-400">
                    {Number(
                      delivery.current_lat
                    ).toFixed(5)}
                    ,{" "}
                    {Number(
                      delivery.current_lng
                    ).toFixed(5)}
                  </p>
                </div>
              )}

              {!hasLiveLocation && (
                <p className="mt-4 text-sm text-neutral-500">
                  GPS location will appear when
                  the delivery starts.
                </p>
              )}
            </div>

            {/* DELIVERY CARD */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-xs text-neutral-600">
                DELIVERY #
                {delivery.id
                  .slice(0, 8)
                  .toUpperCase()}
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Message Delivery
              </h2>

              <div className="mt-7 space-y-5">
                <Location
                  icon={
                    <Package size={16} />
                  }
                  label="PICKUP"
                  place={`${Number(
                    delivery.origin_lat
                  ).toFixed(
                    5
                  )}, ${Number(
                    delivery.origin_lng
                  ).toFixed(5)}`}
                />

                <div className="ml-3 h-8 border-l border-dashed border-neutral-700" />

                <Location
                  icon={
                    <MapPin size={16} />
                  }
                  label="DROP-OFF"
                  place={`${Number(
                    delivery.destination_lat
                  ).toFixed(
                    5
                  )}, ${Number(
                    delivery.destination_lng
                  ).toFixed(5)}`}
                />
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <Stat
                  label="Remaining"
                  value={`${remaining.toFixed(
                    1
                  )} km`}
                />

                <Stat
                  label="Carrier"
                  value={
                    carrierName
                  }
                />
              </div>

              <div className="mt-3 rounded-2xl bg-neutral-800/50 p-4">
                <p className="text-xs text-neutral-600">
                  STATUS
                </p>

                <p className="mt-1 font-semibold capitalize">
                  {delivery.status.replace(
                    /_/g,
                    " "
                  )}
                </p>
              </div>
            </div>

            {/* SEALED MESSAGE */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-800">
                  <Lock size={20} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Sealed Message
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    You cannot read this
                    message. You only deliver
                    it.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-neutral-700 p-5 text-center">
                <ShieldCheck
                  size={24}
                  className="mx-auto text-neutral-500"
                />

                <p className="mt-3 text-sm">
                  Message sealed
                </p>
              </div>
            </div>

            {/* HANDOFF CODE */}
            {delivery.status ===
              "arrived" && (
              <div className="rounded-3xl border border-green-900 bg-green-950/30 p-6 text-center">
                <p className="text-xs tracking-[0.2em] text-green-400">
                  HANDOFF CODE
                </p>

                <p className="mt-3 font-mono text-4xl font-bold tracking-[0.3em]">
                  {
                    delivery.handoff_code
                  }
                </p>

                <p className="mt-3 text-sm text-neutral-500">
                  Give this code to the
                  recipient.
                </p>
              </div>
            )}

            {/* PARTNER CANCELLATION */}
            {delivery.status !==
              "arrived" && (
              <button
                type="button"
                disabled={!canCancel}
                onClick={async () => {
                  if (
                    !delivery ||
                    cancelling
                  ) {
                    return;
                  }

                  const confirmed =
                    window.confirm(
                      "Cancel this delivery? The sender will be notified and this delivery request will be released."
                    );

                  if (!confirmed) {
                    return;
                  }

                  setCancelling(true);
                  setError("");

                  const {
                    data: {
                      user,
                    },
                  } =
                    await supabase.auth.getUser();

                  if (!user) {
                    setError(
                      "Authentication failed."
                    );
                    setCancelling(false);
                    return;
                  }

                  /*
                   * RECHECK DELIVERY
                   *
                   * Prevents cancellation if the
                   * sender/recipient changed it
                   * while this page was open.
                   */
                  const {
                    data: latest,
                    error: latestError,
                  } =
                    await supabase
                      .from(
                        "deliveries"
                      )
                      .select(
                        "status, carrier_id"
                      )
                      .eq(
                        "id",
                        delivery.id
                      )
                      .eq(
                        "carrier_id",
                        user.id
                      )
                      .maybeSingle();

                  if (latestError) {
                    setError(
                      latestError.message
                    );
                    setCancelling(false);
                    return;
                  }

                  if (!latest) {
                    setError(
                      "This delivery is no longer assigned to you."
                    );
                    setCancelling(false);
                    return;
                  }

                  if (
                    [
                      "arrived",
                      "delivered",
                      "cancelled",
                    ].includes(
                      latest.status
                    )
                  ) {
                    setError(
                      latest.status ===
                        "cancelled"
                        ? "This delivery has already been cancelled."
                        : "This delivery can no longer be cancelled."
                    );

                    setCancelling(false);
                    return;
                  }

                  /*
                   * CANCEL DELIVERY
                   */
                  const {
                    error:
                      cancelError,
                  } =
                    await supabase
                      .from(
                        "deliveries"
                      )
                      .update({
                        status:
                          "cancelled",
                      })
                      .eq(
                        "id",
                        delivery.id
                      )
                      .eq(
                        "carrier_id",
                        user.id
                      )
                      .in(
                        "status",
                        [
                          "partner_assigned",
                          "accepted",
                          "pickup_verified",
                          "in_transit",
                        ]
                      );

                  if (cancelError) {
                    setError(
                      cancelError.message
                    );
                    setCancelling(false);
                    return;
                  }

                  /*
                   * LOG EVENT
                   *
                   * Event failure does not
                   * invalidate cancellation.
                   */
                  await supabase
                    .from(
                      "delivery_events"
                    )
                    .insert({
                      delivery_id:
                        delivery.id,
                      event_type:
                        "cancelled_by_partner",
                      metadata: {
                        cancelled_by:
                          user.id,
                      },
                    });

                  setDelivery(null);
                  setStatus("none");
                  setError(
                    "Delivery cancelled. You are available for the next request."
                  );
                  setCancelling(false);
                }}
                className="w-full rounded-full border border-red-900 bg-red-950/20 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Delivery"}
              </button>
            )}

            {/* ACCEPT / START BUTTON */}
            <button
              disabled={
                status === "pickup" ||
                (status ===
                  "delivering" &&
                  delivery.status !==
                    "arrived")
              }
              onClick={async () => {
                if (!delivery) return;

                const {
                  data: {
                    user,
                  },
                } =
                  await supabase.auth.getUser();

                if (!user) {
                  setError(
                    "Authentication failed."
                  );
                  return;
                }

                /*
                 * ACCEPT
                 */
                if (
                  status ===
                  "available"
                ) {
                  const {
                    error,
                  } =
                    await supabase
                      .from(
                        "deliveries"
                      )
                      .update({
                        status:
                          "accepted",
                      })
                      .eq(
                        "id",
                        delivery.id
                      )
                      .eq(
                        "carrier_id",
                        user.id
                      )
                      .eq(
                        "status",
                        "partner_assigned"
                      );

                  if (error) {
                    setError(
                      error.message
                    );
                    return;
                  }

                  setDelivery(
                    (current) =>
                      current
                        ? {
                            ...current,
                            status:
                              "accepted",
                          }
                        : current
                  );

                  setStatus(
                    "pickup"
                  );

                  return;
                }

                /*
                 * START DELIVERY
                 */
                if (
                  status ===
                  "picked-up"
                ) {
                  const {
                    error,
                  } =
                    await supabase
                      .from(
                        "deliveries"
                      )
                      .update({
                        status:
                          "in_transit",
                      })
                      .eq(
                        "id",
                        delivery.id
                      )
                      .eq(
                        "carrier_id",
                        user.id
                      )
                      .eq(
                        "status",
                        "pickup_verified"
                      );

                  if (error) {
                    setError(
                      error.message
                    );
                    return;
                  }

                  setDelivery(
                    (current) =>
                      current
                        ? {
                            ...current,
                            status:
                              "in_transit",
                          }
                        : current
                  );

                  setStatus(
                    "delivering"
                  );
                }
              }}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-white py-4 font-bold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status ===
                "available" &&
                "Accept Delivery"}

              {status === "pickup" &&
                "Going to Pickup..."}

              {status ===
                "picked-up" && (
                <>
                  Start Delivery
                  <ArrowRight
                    size={18}
                  />
                </>
              )}

              {status ===
                "delivering" &&
                delivery.status ===
                  "in_transit" && (
                  <>
                    Delivery In Transit
                    <Navigation
                      size={18}
                    />
                  </>
                )}

              {status ===
                "delivering" &&
                delivery.status ===
                  "arrived" && (
                  <>
                    Handoff Ready
                    <Check
                      size={18}
                    />
                  </>
                )}
            </button>

            {error && (
              <p className="text-center text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Location({
  icon,
  label,
  place,
}: {
  icon: React.ReactNode;
  label: string;
  place: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-800">
        {icon}
      </div>

      <div>
        <p className="text-[10px] tracking-wider text-neutral-600">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium">
          {place}
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-800/50 p-4">
      <p className="text-xs text-neutral-600">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}