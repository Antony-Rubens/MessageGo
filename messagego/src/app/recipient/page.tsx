"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Delivery = {
  id: string;
  carrier_type: "human" | "pigeon";
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  distance_total: number | null;
  distance_remaining: number | null;
  eta: string | null;
  status: string;
  created_at: string;
  message_id: string;
};

type Message = {
  id: string;
  recipient_name: string | null;
  created_at: string;
};

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m15 18-6-6 6-6" />
      <path d="M9 12h12" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="m16.5 9.4-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M10 17h4V5H2v12h3" />
      <path d="M14 9h4l4 4v4h-3" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function BirdIcon() {
  return (
    <span className="text-xl">
      🐦
    </span>
  );
}

function MapPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

export default function RecipientDashboard() {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [userName, setUserName] =
    useState("Recipient");

  const [deliveries, setDeliveries] =
    useState<Delivery[]>([]);

  const [messages, setMessages] =
    useState<Record<string, Message>>({});

  const [error, setError] =
    useState("");

  /*
   * LOAD RECIPIENT DATA
   */
  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      /*
       * PROFILE
       */
      const { data: profile } =
        await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .maybeSingle();

      if (!cancelled && profile) {
        setUserName(profile.name);
      }

      /*
       * MESSAGES
       */
      const {
        data: messageData,
        error: messageError,
      } = await supabase
        .from("messages")
        .select(
          "id, recipient_name, created_at"
        )
        .eq("recipient_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (messageError) {
        if (!cancelled) {
          setError(
            messageError.message
          );
          setLoading(false);
        }

        return;
      }

      /*
       * DELIVERIES
       */
      const {
        data: deliveryData,
        error: deliveryError,
      } = await supabase
        .from("deliveries")
        .select(`
          id,
          carrier_type,
          origin_lat,
          origin_lng,
          destination_lat,
          destination_lng,
          distance_total,
          distance_remaining,
          eta,
          status,
          created_at,
          message_id
        `)
        .in(
          "message_id",
          (messageData ?? []).map(
            (message) => message.id
          )
        )
        .order("created_at", {
          ascending: false,
        });

      if (deliveryError) {
        if (!cancelled) {
          setError(
            deliveryError.message
          );
          setLoading(false);
        }

        return;
      }

      if (cancelled) return;

      const messageMap: Record<
        string,
        Message
      > = {};

      for (
        const message of
          messageData ?? []
      ) {
        messageMap[message.id] =
          message as Message;
      }

      setMessages(messageMap);

      setDeliveries(
        (deliveryData ?? []) as Delivery[]
      );

      setLoading(false);
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  /*
   * REALTIME DELIVERY UPDATES
   *
   * IMPORTANT:
   *
   * React Strict Mode can mount this
   * effect, immediately clean it up,
   * and mount it again.
   *
   * We therefore check whether the
   * effect is still active AFTER the
   * async getUser() call.
   *
   * This prevents an old effect from
   * creating/subscribing a channel after
   * its cleanup has already happened.
   */
  useEffect(() => {
    let active = true;

    let channel:
      | ReturnType<
          typeof supabase.channel
        >
      | null = null;

    async function subscribe() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      /*
       * The effect may already have
       * been cleaned up while getUser()
       * was waiting.
       */
      if (!active || !user) {
        return;
      }

      /*
       * Unique channel name.
       *
       * This prevents React development
       * remounts from accidentally
       * reusing an already-subscribed
       * channel.
       */
      const channelName =
        `recipient-dashboard-${user.id}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "deliveries",
          },
          async (payload) => {
            /*
             * Ignore callbacks after the
             * effect has been cleaned up.
             */
            if (!active) return;

            const updated =
              payload.new as Delivery;

            /*
             * Only show deliveries belonging
             * to this recipient.
             */
            const {
              data: message,
            } = await supabase
              .from("messages")
              .select(
                "id, recipient_name, created_at"
              )
              .eq(
                "id",
                updated.message_id
              )
              .eq(
                "recipient_id",
                user.id
              )
              .maybeSingle();

            if (!active || !message) {
              return;
            }

            setDeliveries(
              (current) => {
                const exists =
                  current.some(
                    (item) =>
                      item.id ===
                      updated.id
                  );

                if (!exists) {
                  return [
                    updated,
                    ...current,
                  ];
                }

                return current.map(
                  (item) =>
                    item.id ===
                    updated.id
                      ? updated
                      : item
                );
              }
            );

            setMessages(
              (current) => ({
                ...current,
                [message.id]:
                  message as Message,
              })
            );
          }
        );

      /*
       * ONLY SUBSCRIBE AFTER ALL
       * CALLBACKS HAVE BEEN REGISTERED.
       */
      if (!active) {
        return;
      }

      channel.subscribe();
    }

    subscribe();

    return () => {
      /*
       * Mark this particular effect
       * instance inactive FIRST.
       *
       * This is important because
       * getUser() is asynchronous.
       */
      active = false;

      if (channel) {
        supabase.removeChannel(
          channel
        );

        channel = null;
      }
    };
  }, [supabase]);

  /*
   * LOGOUT
   */
  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  /*
   * LOADING
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p className="text-sm text-neutral-500">
          Checking for your messages...
        </p>
      </main>
    );
  }

  /*
   * DASHBOARD
   */
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* HEADER */}
      <header className="border-b border-neutral-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-neutral-500 transition hover:text-white"
          >
            <ArrowLeft />
            MessageGo
          </Link>

          <div className="text-sm font-black tracking-tight">
            MESSAGEGO
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-neutral-500 transition hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs tracking-[0.2em] text-neutral-600">
              RECIPIENT
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Hey, {userName}.
            </h1>

            <p className="mt-3 max-w-xl text-neutral-500">
              Apparently someone decided your message
              needed to be physically delivered.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-900 bg-green-950/30 px-4 py-2 text-xs text-green-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            LIVE TRACKING
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {deliveries.length === 0 && (
          <div className="mt-12 rounded-3xl border border-neutral-800 bg-neutral-900 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
              <PackageIcon />
            </div>

            <h2 className="mt-6 text-xl font-bold">
              No messages yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Nothing has been physically delivered to you
              yet. Which is probably for the best.
            </p>
          </div>
        )}

        {/* DELIVERY LIST */}
        {deliveries.length > 0 && (
          <div className="mt-10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Your Messages
              </h2>

              <span className="text-xs text-neutral-600">
                {deliveries.length}{" "}
                {deliveries.length === 1
                  ? "delivery"
                  : "deliveries"}
              </span>
            </div>

            {deliveries.map(
              (delivery) => {
                const message =
                  messages[
                    delivery.message_id
                  ];

                const isDelivered =
                  delivery.status ===
                  "delivered";

                const isArrived =
                  delivery.status ===
                    "arrived" ||
                  delivery.status ===
                    "handoff_verified";

                const isInTransit =
                  delivery.status ===
                    "in_transit" ||
                  delivery.status ===
                    "pickup_verified" ||
                  delivery.status ===
                    "accepted" ||
                  delivery.status ===
                    "partner_assigned";

                const isPigeon =
                  delivery.carrier_type ===
                  "pigeon";

                return (
                  <div
                    key={delivery.id}
                    className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6"
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      {/* LEFT */}
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-800">
                          {isPigeon ? (
                            <BirdIcon />
                          ) : (
                            <TruckIcon />
                          )}
                        </div>

                        <div>
                          <p className="text-xs tracking-widest text-neutral-600">
                            DELIVERY #
                            {delivery.id
                              .slice(
                                0,
                                8
                              )
                              .toUpperCase()}
                          </p>

                          <h3 className="mt-1 text-lg font-semibold">
                            Message Delivery
                          </h3>

                          <p className="mt-1 text-sm text-neutral-500">
                            {isPigeon
                              ? "Pigeon Express"
                              : "Human Delivery Partner"}
                          </p>
                        </div>
                      </div>

                      {/* STATUS */}
                      <StatusBadge
                        status={
                          delivery.status
                        }
                      />
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-neutral-600">
                            DELIVERY STATUS
                          </p>

                          <p className="mt-1 text-sm font-medium capitalize">
                            {delivery.status.replace(
                              /_/g,
                              " "
                            )}
                          </p>
                        </div>

                        {isDelivered && (
                          <div className="rounded-full bg-green-950 px-3 py-1 text-xs text-green-400">
                            Delivered
                          </div>
                        )}

                        {isArrived &&
                          !isDelivered && (
                            <div className="rounded-full bg-green-950 px-3 py-1 text-xs text-green-400">
                              Arrived
                            </div>
                          )}

                        {isInTransit && (
                          <div className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">
                            On the way
                          </div>
                        )}
                      </div>

                      {/* TRACKING LINE */}
                      <div className="mt-5 flex items-center gap-2">
                        <div
                          className={`h-2 flex-1 rounded-full ${
                            isInTransit ||
                            isArrived ||
                            isDelivered
                              ? "bg-white"
                              : "bg-neutral-800"
                          }`}
                        />

                        <div
                          className={`h-2 flex-1 rounded-full ${
                            isArrived ||
                            isDelivered
                              ? "bg-white"
                              : "bg-neutral-800"
                          }`}
                        />

                        <div
                          className={`h-2 flex-1 rounded-full ${
                            isDelivered
                              ? "bg-white"
                              : "bg-neutral-800"
                          }`}
                        />
                      </div>

                      <div className="mt-2 flex justify-between text-[10px] text-neutral-600">
                        <span>Assigned</span>
                        <span>In Transit</span>
                        <span>Delivered</span>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <InfoCard
                        icon={
                          <MapPinIcon />
                        }
                        label="Distance"
                        value={
                          delivery.distance_remaining !==
                          null
                            ? `${Number(
                                delivery.distance_remaining
                              ).toFixed(
                                1
                              )} km`
                            : "Calculating..."
                        }
                      />

                      <InfoCard
                        icon={
                          <LockIcon />
                        }
                        label="Message"
                        value={
                          isDelivered
                            ? "Unlocked"
                            : "Sealed"
                        }
                      />

                      <InfoCard
                        icon={
                          isPigeon ? (
                            <BirdIcon />
                          ) : (
                            <TruckIcon />
                          )
                        }
                        label="Transport"
                        value={
                          isPigeon
                            ? "Pigeon"
                            : "Human"
                        }
                      />
                    </div>

                    {/* ACTION */}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-neutral-600">
                        {message
                          ? "Your message is sealed until verified handoff."
                          : "Message details unavailable."}
                      </div>

                      <Link
                        href={`/recipient/${delivery.id}`}
                        className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.02] hover:bg-neutral-200"
                      >
                        {isDelivered
                          ? "Open Message"
                          : isArrived
                            ? "Unlock Message"
                            : "Track Delivery"}

                        <ArrowRight />
                      </Link>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* FOOTER JOKE */}
        <div className="mt-16 text-center">
          <p className="text-xs text-neutral-700">
            You could&apos;ve just texted.
          </p>
        </div>
      </section>
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "delivered") {
    return (
      <span className="rounded-full border border-green-900 bg-green-950/40 px-4 py-2 text-xs font-medium text-green-400">
        ● Delivered
      </span>
    );
  }

  if (
    status === "arrived" ||
    status === "handoff_verified"
  ) {
    return (
      <span className="rounded-full border border-green-900 bg-green-950/40 px-4 py-2 text-xs font-medium text-green-400">
        ● Arrived
      </span>
    );
  }

  if (status === "in_transit") {
    return (
      <span className="rounded-full border border-blue-900 bg-blue-950/40 px-4 py-2 text-xs font-medium text-blue-400">
        ● In Transit
      </span>
    );
  }

  if (
    status === "accepted" ||
    status === "pickup_verified"
  ) {
    return (
      <span className="rounded-full border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300">
        ● Preparing
      </span>
    );
  }

  return (
    <span className="rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-medium text-neutral-500">
      ● Assigned
    </span>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-800/40 p-4">
      <div className="flex items-center gap-2 text-neutral-500">
        {icon}

        <span className="text-[10px] tracking-widest">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-neutral-300">
        {value}
      </p>
    </div>
  );
}