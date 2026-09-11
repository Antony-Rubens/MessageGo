import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import LiveDeliveryMap from "@/components/LiveDeliveryMap";
import LiveDeliveryTracker from "@/components/LiveDeliveryTracker";
import PigeonSimulator from "@/components/PigeonSimulator";
import DeliveryActions from "@/components/DeliveryActions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

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

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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

function CarrierIcon({
  type,
}: {
  type: "human" | "pigeon";
}) {
  if (type === "pigeon") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M3 12c4-.5 6-3 8-6 2-3 6-2 8 0 2 2 2 5 0 7-2 2-5 2-7 1l-4 5" />
        <path d="m11 6-3-2" />
        <circle cx="17" cy="8" r=".7" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="7" cy="17" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
      <path d="M3 17V6h11v11" />
      <path d="M14 10h4l3 3v4h-4" />
      <path d="M7 10h4" />
    </svg>
  );
}

function getStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusDescription(status: string) {
  switch (status) {
    case "created":
      return "Your delivery request has been created.";

    case "partner_search":
      return "Looking for an available delivery partner.";

    case "partner_assigned":
      return "A delivery partner has been assigned.";

    case "accepted":
      return "The delivery partner has accepted the request.";

    case "pickup_verified":
      return "The message has been verified at pickup.";

    case "in_transit":
      return "Your message is currently in transit.";

    case "arrived":
      return "The message has reached the recipient location.";

    case "handoff_verified":
      return "The recipient has verified the handoff.";

    case "delivered":
      return "The message has been successfully delivered.";

    case "cancelled":
      return "This delivery was cancelled before completion.";

    default:
      return "Delivery status updated.";
  }
}

function getStatusTone(status: string) {
  if (status === "cancelled") {
    return {
      badge:
        "border-red-500/20 bg-red-500/10 text-red-400",
      dot: "bg-red-400",
    };
  }

  if (
    status === "delivered" ||
    status === "handoff_verified"
  ) {
    return {
      badge:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      dot: "bg-emerald-400",
    };
  }

  if (status === "arrived") {
    return {
      badge:
        "border-amber-500/20 bg-amber-500/10 text-amber-400",
      dot: "bg-amber-400",
    };
  }

  return {
    badge:
      "border-blue-500/20 bg-blue-500/10 text-blue-400",
    dot: "bg-blue-400",
  };
}

export default async function DeliveryPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: delivery, error } =
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
        carrier_id
      `)
      .eq("id", id)
      .single();

  if (error || !delivery) {
    notFound();
  }

  const isCancelled =
    delivery.status === "cancelled";

  const isFinished =
    delivery.status === "delivered" ||
    delivery.status === "handoff_verified";

  const shouldSimulatePigeon =
    delivery.carrier_type === "pigeon" &&
    !isCancelled &&
    !isFinished;

  const statusTone = getStatusTone(
    delivery.status
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* HEADER */}
      <header className="border-b border-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-white"
          >
            <ArrowLeft />
            MessageGo
          </a>

          <div className="text-sm font-black tracking-tight">
            MESSAGEGO
          </div>

          <div className="w-[72px]" />
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
        {/* PAGE HEADING */}
        <div className="flex flex-col gap-6 border-b border-neutral-900 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-600">
                DELIVERY TRACKING
              </p>

              <span className="h-1 w-1 rounded-full bg-neutral-700" />

              <p className="font-mono text-[10px] text-neutral-600">
                {delivery.id
                  .slice(0, 8)
                  .toUpperCase()}
              </p>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              {isCancelled
                ? "Delivery cancelled"
                : isFinished
                  ? "Message delivered"
                  : "Message in transit"}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              {getStatusDescription(
                delivery.status
              )}
            </p>
          </div>

          {/* DELIVERY TYPE */}
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300">
              <CarrierIcon
                type={
                  delivery.carrier_type as
                    | "human"
                    | "pigeon"
                }
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
                DELIVERY METHOD
              </p>

              <p className="mt-0.5 text-sm font-medium">
                {delivery.carrier_type ===
                "pigeon"
                  ? "Pigeon Express"
                  : "Human Express"}
              </p>
            </div>
          </div>
        </div>

        {/* MAP + SIDEBAR */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* MAP */}
          <div className="relative h-[520px] overflow-hidden rounded-[28px] border border-neutral-800 bg-neutral-900 md:h-[620px]">
            <LiveDeliveryMap
              deliveryId={delivery.id}
              carrierType={
                delivery.carrier_type as
                  | "human"
                  | "pigeon"
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
                delivery.current_lat !== null
                  ? Number(
                      delivery.current_lat
                    )
                  : null
              }
              currentLng={
                delivery.current_lng !== null
                  ? Number(
                      delivery.current_lng
                    )
                  : null
              }
            />
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-4">
            {/* STATUS */}
            <div className="rounded-[28px] border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-600">
                    CURRENT STATUS
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${statusTone.dot}`}
                    />

                    <h2 className="text-xl font-bold capitalize">
                      {getStatusLabel(
                        delivery.status
                      )}
                    </h2>
                  </div>
                </div>

                <div
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${statusTone.badge}`}
                >
                  {isCancelled
                    ? "Cancelled"
                    : isFinished
                      ? "Complete"
                      : "Active"}
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-neutral-500">
                {getStatusDescription(
                  delivery.status
                )}
              </p>
            </div>

            {/* LIVE TRACKER */}
            {!isCancelled && (
              <div className="rounded-[28px] border border-neutral-800 bg-neutral-900 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-600">
                      LIVE TRACKING
                    </p>

                    <h2 className="mt-1 text-base font-semibold">
                      Delivery progress
                    </h2>
                  </div>

                  <span className="flex items-center gap-2 text-[10px] font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    LIVE
                  </span>
                </div>

                <LiveDeliveryTracker
                  delivery={{
                    id: delivery.id,
                    carrier_type:
                      delivery.carrier_type,
                    status: delivery.status,
                    destination_lat:
                      Number(
                        delivery.destination_lat
                      ),
                    destination_lng:
                      Number(
                        delivery.destination_lng
                      ),
                    current_lat:
                      delivery.current_lat !==
                      null
                        ? Number(
                            delivery.current_lat
                          )
                        : null,
                    current_lng:
                      delivery.current_lng !==
                      null
                        ? Number(
                            delivery.current_lng
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
                  }}
                />
              </div>
            )}

            {/* DELIVERY DETAILS */}
            <div className="rounded-[28px] border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-600">
                DELIVERY DETAILS
              </p>

              <div className="mt-5 divide-y divide-neutral-800">
                <div className="flex items-center justify-between py-3 first:pt-0">
                  <span className="text-sm text-neutral-500">
                    Method
                  </span>

                  <span className="flex items-center gap-2 text-sm font-medium">
                    <CarrierIcon
                      type={
                        delivery.carrier_type as
                          | "human"
                          | "pigeon"
                      }
                    />

                    {delivery.carrier_type ===
                    "pigeon"
                      ? "Pigeon Express"
                      : "Human Express"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-neutral-500">
                    Tracking
                  </span>

                  <span className="text-sm font-medium">
                    {delivery.carrier_type ===
                    "pigeon"
                      ? "Simulated GPS"
                      : "Live GPS"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 last:pb-0">
                  <span className="text-sm text-neutral-500">
                    Message
                  </span>

                  <span className="flex items-center gap-2 text-sm font-medium">
                    <LockIcon />
                    Sealed
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            {!isFinished &&
              !isCancelled && (
                <DeliveryActions
                  deliveryId={delivery.id}
                  status={delivery.status}
                />
              )}
          </aside>
        </div>

        {/* PRIVACY / SECURITY */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300">
                <LockIcon />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-600">
                  MESSAGE PRIVACY
                </p>

                <h3 className="mt-1 font-semibold">
                  Message sealed during delivery
                </h3>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  The delivery partner transports
                  the message without access to its
                  contents. The recipient unlocks it
                  after verified handoff.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300">
                <CheckIcon />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-600">
                  DELIVERY VERIFICATION
                </p>

                <h3 className="mt-1 font-semibold">
                  Handoff confirmation required
                </h3>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Delivery is completed only after
                  the recipient verifies the handoff
                  code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PIGEON SIMULATION */}
      {shouldSimulatePigeon && (
        <PigeonSimulator
          deliveryId={delivery.id}
          active={true}
        />
      )}
    </main>
  );
}