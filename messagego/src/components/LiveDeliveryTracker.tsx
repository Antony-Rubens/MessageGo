"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Delivery = {
  id: string;
  carrier_type: string;
  status: string;
  current_lat: number | null;
  current_lng: number | null;
  destination_lat: number | null;
  destination_lng: number | null;
  distance_remaining: number | null;
  eta: string | null;
};

type LiveDeliveryTrackerProps = {
  delivery: Delivery;
};

export default function LiveDeliveryTracker({
  delivery: initialDelivery,
}: LiveDeliveryTrackerProps) {
  const supabase = createClient();

  const [delivery, setDelivery] = useState(initialDelivery);

  useEffect(() => {
    const channel = supabase
      .channel(`delivery-${initialDelivery.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deliveries",
          filter: `id=eq.${initialDelivery.id}`,
        },
        (payload) => {
          console.log(
            "MESSAGEGO REALTIME DELIVERY UPDATE:",
            payload.new
          );

          setDelivery(payload.new as Delivery);
        }
      )
      .subscribe((status) => {
        console.log(
          "MESSAGEGO REALTIME STATUS:",
          status
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialDelivery.id, supabase]);

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <p className="text-xs uppercase tracking-wider text-neutral-600">
        LIVE CARRIER LOCATION
      </p>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-500">
            Latitude
          </span>

          <span className="font-mono">
            {delivery.current_lat?.toFixed(6) ?? "Waiting..."}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-neutral-500">
            Longitude
          </span>

          <span className="font-mono">
            {delivery.current_lng?.toFixed(6) ?? "Waiting..."}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-neutral-500">
            Status
          </span>

          <span className="font-semibold capitalize">
            {delivery.status.replaceAll("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}