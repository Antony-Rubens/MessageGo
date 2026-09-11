"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Props = {
  deliveryId: string;
  status: string;
};

export default function DeliveryActions({
  deliveryId,
  status,
}: Props) {
  const supabase = createClient();

  const [cancelling, setCancelling] =
    useState(false);
  const [cancelled, setCancelled] =
    useState(false);
  const [error, setError] = useState("");

  const canCancel =
    !cancelled &&
    ![
      "arrived",
      "handoff_verified",
      "delivered",
      "cancelled",
    ].includes(status);

  async function cancelDelivery() {
    if (!canCancel || cancelling) return;

    const confirmed = window.confirm(
      "Cancel this delivery?\n\nThe message will no longer be delivered."
    );

    if (!confirmed) return;

    setCancelling(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Please sign in again."
        );
      }

      const { data: delivery, error: fetchError } =
        await supabase
          .from("deliveries")
          .select("id, status")
          .eq("id", deliveryId)
          .single();

      if (fetchError) {
        throw fetchError;
      }

      if (
        !delivery ||
        [
          "arrived",
          "handoff_verified",
          "delivered",
          "cancelled",
        ].includes(delivery.status)
      ) {
        throw new Error(
          "This delivery can no longer be cancelled."
        );
      }

      const { error: updateError } =
        await supabase
          .from("deliveries")
          .update({
            status: "cancelled",
          })
          .eq("id", deliveryId);

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

      setCancelled(true);

      window.location.reload();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel delivery."
      );
      setCancelling(false);
    }
  }

  if (!canCancel) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <p className="text-xs text-neutral-600">
        DELIVERY CONTROL
      </p>

      <button
        type="button"
        onClick={cancelDelivery}
        disabled={cancelling}
        className="mt-4 w-full rounded-full border border-red-900 bg-red-950/40 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cancelling
          ? "Cancelling..."
          : "Cancel Delivery"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}