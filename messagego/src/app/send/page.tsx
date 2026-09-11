"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import LocationPicker from "@/components/LocationPicker";

import { createClient } from "@/lib/supabase/client";

import { calculateDistance } from "@/lib/distance";
import { calculateEtaMinutes } from "@/lib/delivery";
import { encryptMessage } from "@/lib/crypto";
import { generateHandoffCode } from "@/lib/handoff";

type CarrierType = "human" | "pigeon";

type ActiveDelivery = {
  id: string;
  carrier_type: CarrierType;
  status: string;
  distance_total: number | null;
  distance_remaining: number | null;
  eta: string | null;
  created_at: string;
};

const HUMAN_MAX_DISTANCE_KM = 10;

const ACTIVE_STATUSES = [
  "created",
  "partner_search",
  "partner_assigned",
  "accepted",
  "pickup_verified",
  "in_transit",
  "arrived",
  "handoff_verified",
];

function ArrowRight({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m15 18-6-6 6-6" />
      <path d="M9 12h12" />
    </svg>
  );
}

function UserIcon() {
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
      <circle
        cx="12"
        cy="8"
        r="3.5"
      />
      <path d="M5 20c.8-3.5 3.1-5.5 7-5.5s6.2 2 7 5.5" />
    </svg>
  );
}

function MessageIcon() {
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
      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 3v-5.5A7.5 7.5 0 1 1 20 11.5Z" />
    </svg>
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
      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  );
}

function NavigationIcon() {
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
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
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
      <path d="M10 17H2V5h12v12" />
      <path d="M14 9h4l4 4v4h-8" />
      <circle
        cx="6"
        cy="18"
        r="2"
      />
      <circle
        cx="18"
        cy="18"
        r="2"
      />
    </svg>
  );
}

function BirdIcon() {
  return (
    <span className="text-lg">
      🐦
    </span>
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

function CheckIcon() {
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
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(
      /^\w/,
      (char) => char.toUpperCase()
    );
}

function getStatusTone(status: string) {
  if (status === "delivered") {
    return "border-green-900 bg-green-950/30 text-green-400";
  }

  if (
    status === "arrived" ||
    status === "handoff_verified"
  ) {
    return "border-emerald-900 bg-emerald-950/30 text-emerald-400";
  }

  if (status === "in_transit") {
    return "border-blue-900 bg-blue-950/30 text-blue-400";
  }

  return "border-neutral-800 bg-neutral-900 text-neutral-400";
}

function DeliveryOption({
  selected,
  disabled,
  onClick,
  icon,
  title,
  description,
  meta,
  badge,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  meta: string;
  badge: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        group relative rounded-2xl border p-5 text-left
        transition-all duration-200
        ${
          disabled
            ? "cursor-not-allowed border-neutral-900 bg-neutral-950 opacity-35"
            : selected
              ? "border-white bg-white text-black shadow-lg"
              : "border-neutral-800 bg-neutral-900 text-white hover:border-neutral-600"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div
          className={`
            flex h-10 w-10 items-center justify-center rounded-xl
            ${
              selected
                ? "bg-black text-white"
                : "bg-neutral-800 text-neutral-300"
            }
          `}
        >
          {icon}
        </div>

        <span
          className={`
            rounded-full px-2.5 py-1 text-[10px] font-medium
            ${
              selected
                ? "bg-neutral-100 text-neutral-600"
                : "bg-neutral-800 text-neutral-500"
            }
          `}
        >
          {badge}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="font-semibold">
          {title}
        </h3>

        <p
          className={`
            mt-1 text-sm leading-5
            ${
              selected
                ? "text-neutral-600"
                : "text-neutral-500"
            }
          `}
        >
          {description}
        </p>
      </div>

      <div
        className={`
          mt-5 flex items-center gap-2 text-xs
          ${
            selected
              ? "text-neutral-500"
              : "text-neutral-600"
          }
        `}
      >
        <span
          className={`
            h-1.5 w-1.5 rounded-full
            ${
              selected
                ? "bg-black"
                : "bg-neutral-600"
            }
          `}
        />

        {meta}
      </div>

      {selected && (
        <div className="absolute right-4 bottom-4 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
          <CheckIcon />
        </div>
      )}
    </button>
  );
}

export default function SendPage() {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const router = useRouter();

  const RECIPIENT_USER_ID =
    "b569c230-fd3c-4fe0-a2da-b85734221971";

  const [
    destinationLat,
    setDestinationLat,
  ] = useState(10.8505);

  const [
    destinationLng,
    setDestinationLng,
  ] = useState(76.2711);

  const [
    recipientName,
    setRecipientName,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [originLat, setOriginLat] =
    useState<number | null>(null);

  const [originLng, setOriginLng] =
    useState<number | null>(null);

  const [carrier, setCarrier] =
    useState<CarrierType>("human");

  const [loading, setLoading] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    activeDeliveries,
    setActiveDeliveries,
  ] = useState<ActiveDelivery[]>([]);

  const [
    loadingDeliveries,
    setLoadingDeliveries,
  ] = useState(true);

  const [
    cancellingId,
    setCancellingId,
  ] = useState<string | null>(null);

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState<string | null>(null);

  const distance =
    originLat !== null &&
    originLng !== null
      ? calculateDistance(
          originLat,
          originLng,
          destinationLat,
          destinationLng
        )
      : null;

  const isLongDistance =
    distance !== null &&
    distance > HUMAN_MAX_DISTANCE_KM;

  /*
   * AUTOMATICALLY SWITCH TO PIGEON
   */
  useEffect(() => {
    if (isLongDistance) {
      setCarrier("pigeon");
    }
  }, [isLongDistance]);

  /*
   * GET SENDER LOCATION
   */
  useEffect(() => {
    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by this browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOriginLat(
          position.coords.latitude
        );

        setOriginLng(
          position.coords.longitude
        );
      },
      () => {
        setError(
          "Location access is required to create a delivery."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  /*
   * LOAD CURRENT USER
   */
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      setCurrentUserId(user.id);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  /*
   * LOAD ACTIVE DELIVERIES
   */
  useEffect(() => {
    if (!currentUserId) return;

    let mounted = true;

    async function loadActiveDeliveries() {
      setLoadingDeliveries(true);

      const {
        data,
        error: fetchError,
      } = await supabase
        .from("deliveries")
        .select(`
          id,
          carrier_type,
          status,
          distance_total,
          distance_remaining,
          eta,
          created_at,
          messages!inner (
            sender_id
          )
        `)
        .eq(
          "messages.sender_id",
          currentUserId
        )
        .in(
          "status",
          ACTIVE_STATUSES
        )
        .order("created_at", {
          ascending: false,
        });

      if (!mounted) return;

      if (fetchError) {
        console.error(
          "MESSAGEGO ACTIVE DELIVERIES ERROR:",
          fetchError
        );

        setLoadingDeliveries(false);
        return;
      }

      setActiveDeliveries(
        (data ?? []).map(
          (delivery) => ({
            id: delivery.id,
            carrier_type:
              delivery.carrier_type as CarrierType,
            status: delivery.status,
            distance_total:
              delivery.distance_total !==
              null
                ? Number(
                    delivery.distance_total
                  )
                : null,
            distance_remaining:
              delivery.distance_remaining !==
              null
                ? Number(
                    delivery.distance_remaining
                  )
                : null,
            eta: delivery.eta,
            created_at:
              delivery.created_at,
          })
        )
      );

      setLoadingDeliveries(false);
    }

    loadActiveDeliveries();

    /*
     * REALTIME
     */
    const channel = supabase
      .channel(
        `sender-deliveries-${currentUserId}-${Date.now()}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deliveries",
        },
        () => {
          if (mounted) {
            loadActiveDeliveries();
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [
    currentUserId,
    supabase,
  ]);

  /*
   * LOGOUT
   */
  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      await supabase.auth.signOut();

      router.replace("/");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign out."
      );

      setLoggingOut(false);
    }
  }

  /*
   * CANCEL DELIVERY
   */
  async function cancelDelivery(
    deliveryId: string
  ) {
    if (cancellingId) return;

    const confirmed =
      window.confirm(
        "Cancel this delivery?\n\nThe message will no longer be delivered."
      );

    if (!confirmed) return;

    setCancellingId(deliveryId);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const {
        data: delivery,
        error: deliveryError,
      } = await supabase
        .from("deliveries")
        .select(`
          id,
          status,
          messages!inner (
            sender_id
          )
        `)
        .eq("id", deliveryId)
        .single();

      if (deliveryError) {
        throw deliveryError;
      }

      if (!delivery) {
        throw new Error(
          "Delivery not found."
        );
      }

      const messageRecord =
        Array.isArray(
          delivery.messages
        )
          ? delivery.messages[0]
          : delivery.messages;

      if (
        messageRecord?.sender_id !==
        user.id
      ) {
        throw new Error(
          "You cannot cancel this delivery."
        );
      }

      if (
        [
          "arrived",
          "handoff_verified",
          "delivered",
          "cancelled",
        ].includes(
          delivery.status
        )
      ) {
        throw new Error(
          "This delivery can no longer be cancelled."
        );
      }

      const {
        error: updateError,
      } = await supabase
        .from("deliveries")
        .update({
          status: "cancelled",
        })
        .eq("id", deliveryId)
        .eq(
          "status",
          delivery.status
        );

      if (updateError) {
        throw updateError;
      }

      await supabase
        .from("delivery_events")
        .insert({
          delivery_id: deliveryId,
          event_type: "cancelled",
          metadata: {
            cancelled_by: user.id,
          },
        });

      setActiveDeliveries(
        (current) =>
          current.filter(
            (item) =>
              item.id !== deliveryId
          )
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel delivery."
      );
    } finally {
      setCancellingId(null);
    }
  }

  /*
   * CREATE DELIVERY
   */
  async function createDelivery() {
    setError("");

    if (
      originLat === null ||
      originLng === null
    ) {
      setError(
        "Waiting for your location..."
      );

      return;
    }

    if (!message.trim()) {
      setError(
        "Write a message first."
      );

      return;
    }

    const finalDistance =
      calculateDistance(
        originLat,
        originLng,
        destinationLat,
        destinationLng
      );

    const finalCarrier: CarrierType =
      finalDistance >
      HUMAN_MAX_DISTANCE_KM
        ? "pigeon"
        : carrier;

    if (
      carrier === "human" &&
      finalDistance >
        HUMAN_MAX_DISTANCE_KM
    ) {
      setCarrier("pigeon");

      setError(
        "This delivery is over 10 km. Pigeon Express has been selected."
      );

      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      /*
       * ENCRYPT MESSAGE
       */
      const encrypted =
        await encryptMessage(message);

      const {
        data: messageData,
        error: messageError,
      } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id:
            RECIPIENT_USER_ID,
          recipient_name:
            recipientName ||
            "MessageGo Recipient",
          encrypted_content:
            encrypted.ciphertext,
          encryption_iv:
            encrypted.iv,
          encryption_key:
            encrypted.key,
        })
        .select()
        .single();

      if (messageError) {
        throw messageError;
      }

      /*
       * ETA
       */
      const etaMinutes =
        calculateEtaMinutes(
          finalDistance,
          finalCarrier
        );

      const eta = new Date(
        Date.now() +
          etaMinutes * 60 * 1000
      ).toISOString();

      /*
       * CREATE DELIVERY
       */
      const {
        data: deliveryData,
        error: deliveryError,
      } = await supabase
        .from("deliveries")
        .insert({
          message_id:
            messageData.id,

          carrier_type:
            finalCarrier,

          origin_lat:
            originLat,

          origin_lng:
            originLng,

          destination_lat:
            destinationLat,

          destination_lng:
            destinationLng,

          current_lat:
            originLat,

          current_lng:
            originLng,

          distance_total:
            finalDistance,

          distance_remaining:
            finalDistance,

          eta,

          handoff_code:
            generateHandoffCode(),

          status:
            "created",
        })
        .select()
        .single();

      if (deliveryError) {
        throw deliveryError;
      }

      /*
       * FIND CARRIER
       */
      const {
        data: carriers,
        error: carrierError,
      } = await supabase
        .from("carriers")
        .select("id")
        .eq(
          "type",
          finalCarrier
        )
        .eq(
          "is_available",
          true
        )
        .limit(1);

      if (carrierError) {
        throw carrierError;
      }

      if (
        !carriers ||
        carriers.length === 0
      ) {
        await supabase
          .from("deliveries")
          .update({
            status:
              "cancelled",
          })
          .eq(
            "id",
            deliveryData.id
          );

        throw new Error(
          finalCarrier === "pigeon"
            ? "No delivery pigeons are currently available."
            : "No delivery partners are currently available."
        );
      }

      /*
       * ASSIGN CARRIER
       */
      const {
        error: assignError,
      } = await supabase
        .from("deliveries")
        .update({
          carrier_id:
            carriers[0].id,

          status:
            "partner_assigned",
        })
        .eq(
          "id",
          deliveryData.id
        );

      if (assignError) {
        throw assignError;
      }

      /*
       * EVENT
       */
      await supabase
        .from("delivery_events")
        .insert({
          delivery_id:
            deliveryData.id,

          event_type:
            "partner_assigned",

          latitude:
            originLat,

          longitude:
            originLng,
        });

      /*
       * TRACK DELIVERY
       */
      router.push(
        `/delivery/${deliveryData.id}`
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* HEADER */}
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            onClick={() =>
              router.push("/")
            }
            className="flex items-center gap-2 text-sm font-semibold tracking-tight transition hover:text-neutral-400"
          >
            <ArrowLeft />
            MessageGo
          </button>

          <div className="hidden text-[10px] font-medium tracking-[0.25em] text-neutral-600 sm:block">
            PHYSICAL MESSAGING
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs text-neutral-500 transition hover:text-white disabled:opacity-50"
          >
            {loggingOut
              ? "Signing out..."
              : "Sign out"}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {/* TITLE */}
        <div className="mb-10 max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            New delivery
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Send a message.
          </h1>

          <p className="mt-3 text-base text-neutral-500">
            You could&apos;ve just texted.
          </p>
        </div>

        {/* COMPOSER + MAP */}
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* LEFT */}
          <div className="space-y-5">
            {/* MESSAGE CARD */}
            <div className="rounded-3xl border border-white/[0.07] bg-[#101010] p-5 sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
                  <MessageIcon />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Your message
                  </p>

                  <p className="text-xs text-neutral-600">
                    Sealed until delivery
                  </p>
                </div>
              </div>

              {/* RECIPIENT */}
              <div>
                <label className="text-xs font-medium text-neutral-500">
                  Recipient
                </label>

                <div className="relative mt-2">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600">
                    <UserIcon />
                  </div>

                  <input
                    value={recipientName}
                    onChange={(e) =>
                      setRecipientName(
                        e.target.value
                      )
                    }
                    placeholder="Recipient name"
                    className="w-full rounded-2xl border border-white/[0.07] bg-[#171717] py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-700 focus:border-white/20"
                  />
                </div>
              </div>

              {/* MESSAGE */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-500">
                    Message
                  </label>

                  <span className="text-[10px] text-neutral-700">
                    {message.length}/500
                  </span>
                </div>

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value.slice(
                        0,
                        500
                      )
                    )
                  }
                  placeholder="Write something worth physically delivering..."
                  rows={7}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/[0.07] bg-[#171717] px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-neutral-700 focus:border-white/20"
                />
              </div>
            </div>

            {/* DELIVERY METHOD */}
            <div className="rounded-3xl border border-white/[0.07] bg-[#101010] p-5 sm:p-6">
              <div className="mb-5">
                <p className="text-sm font-semibold">
                  Delivery method
                </p>

                <p className="mt-1 text-xs text-neutral-600">
                  Choose how the message gets there.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DeliveryOption
                  selected={
                    carrier === "human"
                  }
                  disabled={
                    isLongDistance
                  }
                  onClick={() =>
                    setCarrier("human")
                  }
                  icon={<TruckIcon />}
                  title="Human Express"
                  description="A real delivery partner carries it."
                  meta="Live GPS · up to 10 km"
                  badge="REAL GPS"
                />

                <DeliveryOption
                  selected={
                    carrier === "pigeon"
                  }
                  onClick={() =>
                    setCarrier("pigeon")
                  }
                  icon={<BirdIcon />}
                  title="Pigeon Express"
                  description="For deliveries beyond the human range."
                  meta="Simulated GPS · long distance"
                  badge="PIGEON"
                />
              </div>

              {isLongDistance && (
                <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-neutral-400">
                      <NavigationIcon />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-neutral-300">
                        Pigeon Express selected
                      </p>

                      <p className="mt-1 text-xs leading-5 text-neutral-600">
                        Human delivery is limited to{" "}
                        {HUMAN_MAX_DISTANCE_KM} km.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SUMMARY */}
            <div className="rounded-3xl border border-white/[0.07] bg-[#101010] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Delivery summary
                  </p>

                  <p className="mt-1 text-xs text-neutral-600">
                    Everything looks good?
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-neutral-500">
                  <LockIcon />
                </div>
              </div>

              <div className="mt-6 divide-y divide-white/[0.05]">
                <SummaryRow
                  label="Transport"
                  value={
                    carrier === "human"
                      ? "Human Express"
                      : "Pigeon Express"
                  }
                />

                <SummaryRow
                  label="Distance"
                  value={
                    distance !== null
                      ? `${distance.toFixed(
                          1
                        )} km`
                      : "Calculating..."
                  }
                />

                <SummaryRow
                  label="Tracking"
                  value={
                    carrier === "human"
                      ? "Live GPS"
                      : "Simulated GPS"
                  }
                />

                <SummaryRow
                  label="Message"
                  value="Sealed"
                />

                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm font-medium">
                    Delivery fee
                  </span>

                  <span className="text-lg font-semibold">
                    ₹
                    {carrier ===
                    "human"
                      ? "49"
                      : "199"}
                  </span>
                </div>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-2xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={
                createDelivery
              }
              disabled={
                loading ||
                originLat === null ||
                originLng === null ||
                !message.trim()
              }
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Finding a delivery partner..."
                : "Create delivery"}

              {!loading && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>

            <p className="text-center text-[11px] text-neutral-700">
              Your message is encrypted and sealed for delivery.
            </p>
          </div>

          {/* RIGHT — MAP */}
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)] lg:min-h-[650px]">
            <div className="relative h-[520px] overflow-hidden rounded-3xl border border-white/[0.07] bg-[#101010] lg:h-full">
              <LocationPicker
                latitude={
                  destinationLat
                }
                longitude={
                  destinationLng
                }
                onLocationSelect={(
                  lat,
                  lng
                ) => {
                  setDestinationLat(
                    lat
                  );

                  setDestinationLng(
                    lng
                  );
                }}
              />

              {/* MAP HEADER */}
              <div className="pointer-events-none absolute left-4 right-4 top-4 z-[1000] flex items-start justify-between">
                <div className="rounded-2xl border border-black/10 bg-white/95 px-4 py-3 text-black shadow-lg backdrop-blur">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Delivery route
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-xs font-medium">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    You

                    <span className="text-neutral-300">
                      →
                    </span>

                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    Recipient
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white/95 px-4 py-3 text-right text-black shadow-lg backdrop-blur">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Distance
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {distance !== null
                      ? `${distance.toFixed(
                          1
                        )} km`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* MAP FOOTER */}
              <div className="pointer-events-none absolute bottom-4 left-4 z-[1000]">
                <div className="rounded-full border border-black/10 bg-white/95 px-4 py-2 text-[10px] font-medium text-neutral-600 shadow-lg backdrop-blur">
                  Click anywhere to set the drop-off
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE DELIVERIES */}
        <section className="mt-20 border-t border-white/[0.06] pt-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-600">
                History
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Active deliveries
              </h2>
            </div>

            {activeDeliveries.length >
              0 && (
              <span className="rounded-full border border-white/[0.07] bg-neutral-900 px-3 py-1.5 text-[10px] font-medium text-neutral-500">
                {activeDeliveries.length} active
              </span>
            )}
          </div>

          {loadingDeliveries ? (
            <div className="mt-6 rounded-3xl border border-white/[0.07] bg-[#101010] p-8">
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-900" />
              <div className="mt-3 h-3 w-48 animate-pulse rounded bg-neutral-900" />
            </div>
          ) : activeDeliveries.length ===
            0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/[0.08] bg-[#0d0d0d] p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-neutral-600">
                <NavigationIcon />
              </div>

              <p className="mt-5 text-sm font-medium text-neutral-400">
                No active deliveries
              </p>

              <p className="mt-1 text-xs text-neutral-700">
                Your deliveries will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3">
              {activeDeliveries.map(
                (delivery) => {
                  const isPigeon =
                    delivery.carrier_type ===
                    "pigeon";

                  const isTerminal =
                    [
                      "arrived",
                      "handoff_verified",
                    ].includes(
                      delivery.status
                    );

                  const remaining =
                    delivery.distance_remaining;

                  const eta =
                    delivery.eta
                      ? Math.max(
                          0,
                          Math.ceil(
                            (new Date(
                              delivery.eta
                            ).getTime() -
                              Date.now()) /
                              60000
                          )
                        )
                      : null;

                  return (
                    <div
                      key={
                        delivery.id
                      }
                      className="group rounded-3xl border border-white/[0.07] bg-[#101010] p-5 transition hover:border-white/[0.12]"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-neutral-300">
                            {isPigeon ? (
                              <BirdIcon />
                            ) : (
                              <TruckIcon />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold">
                                {isPigeon
                                  ? "Pigeon Express"
                                  : "Human Express"}
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[9px] font-medium ${getStatusTone(
                                  delivery.status
                                )}`}
                              >
                                {formatStatus(
                                  delivery.status
                                )}
                              </span>
                            </div>

                            <p className="mt-1 text-[10px] text-neutral-700">
                              #
                              {delivery.id
                                .slice(
                                  0,
                                  8
                                )
                                .toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/delivery/${delivery.id}`
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-full border border-white/[0.1] px-5 py-2.5 text-xs font-medium transition hover:border-white/30 hover:bg-white/[0.04]"
                          >
                            Track
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>

                          {!isTerminal && (
                            <button
                              type="button"
                              onClick={() =>
                                cancelDelivery(
                                  delivery.id
                                )
                              }
                              disabled={
                                cancellingId ===
                                delivery.id
                              }
                              className="rounded-full border border-red-950 px-5 py-2.5 text-xs font-medium text-red-500 transition hover:bg-red-950/30 disabled:opacity-40"
                            >
                              {cancellingId ===
                              delivery.id
                                ? "Cancelling..."
                                : "Cancel"}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-2">
                        <DeliveryStat
                          label="Distance"
                          value={
                            delivery.distance_total !==
                            null
                              ? `${delivery.distance_total.toFixed(
                                  1
                                )} km`
                              : "—"
                          }
                        />

                        <DeliveryStat
                          label="Remaining"
                          value={
                            remaining !==
                            null
                              ? `${remaining.toFixed(
                                  1
                                )} km`
                              : "—"
                          }
                        />

                        <DeliveryStat
                          label="ETA"
                          value={
                            eta !== null
                              ? `${eta} min`
                              : "—"
                          }
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-20 border-t border-white/[0.05] pt-8 text-center">
          <p className="text-[11px] text-neutral-700">
            MessageGo
          </p>

          <p className="mt-1 text-[10px] text-neutral-800">
            You could&apos;ve just texted.
          </p>
        </footer>
      </section>
    </main>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-neutral-500">
        {label}
      </span>

      <span className="text-sm font-medium text-neutral-300">
        {value}
      </span>
    </div>
  );
}

function DeliveryStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-950 p-3">
      <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-neutral-700">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-neutral-300">
        {value}
      </p>
    </div>
  );
}