"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { decryptMessage } from "@/lib/crypto";

type Delivery = {
  id: string;
  status: string;
  message_id: string;
};

type Message = {
  encrypted_content: string;
  encryption_iv: string;
  encryption_key: string;
};

export default function RecipientPage() {
  const params = useParams();
  const deliveryId = params.id as string;

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [delivery, setDelivery] =
    useState<Delivery | null>(null);

  const [message, setMessage] =
    useState<Message | null>(null);

  const [enteredCode, setEnteredCode] =
    useState("");

  const [unlockedMessage, setUnlockedMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [verifying, setVerifying] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * LOAD DELIVERY
   */
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          "Please log in as the recipient."
        );
        setLoading(false);
        return;
      }

      /*
       * Find delivery
       */
      const {
  data: deliveryData,
  error: deliveryError,
} = await supabase
  .from("deliveries")
  .select(`
    id,
    status,
    message_id
  `)
  .eq("id", deliveryId)
  .maybeSingle();

      if (deliveryError) {
  setError(deliveryError.message);
  setLoading(false);
  return;
}

if (!deliveryData) {
  setError("Delivery not found.");
  setLoading(false);
  return;
}

      /*
       * Verify this message belongs
       * to the logged-in recipient.
       */
      const {
  data: messageData,
  error: messageError,
} = await supabase
  .from("messages")
  .select(`
    encrypted_content,
    encryption_iv,
    encryption_key
  `)
  .eq(
    "id",
    deliveryData.message_id
  )
  .eq(
    "recipient_id",
    user.id
  )
  .single();

      if (messageError) {
  setError(messageError.message);
  setLoading(false);
  return;
}

if (!messageData) {
  setError(
    "This message is not assigned to this recipient."
  );
  setLoading(false);
  return;
}

      setDelivery(
        deliveryData as Delivery
      );

      setMessage(
        messageData as Message
      );

      setLoading(false);
    }

    load();
  }, [
    deliveryId,
    supabase,
  ]);

  /*
   * REALTIME STATUS
   */
  useEffect(() => {
    const channel = supabase
      .channel(
        `recipient-delivery-${deliveryId}`
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
          setDelivery(
            payload.new as Delivery
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    deliveryId,
    supabase,
  ]);

  /*
   * VERIFY HANDOFF
   */
  async function verifyHandoff() {
    if (!delivery || !message) {
      return;
    }

    setError("");

    if (
      enteredCode.length !== 6
    ) {
      setError(
        "Enter the 6-digit code."
      );
      return;
    }

    setVerifying(true);

    try {
      /*
       * Get handoff code
       */
      const {
        data,
        error: fetchError,
      } = await supabase
        .from("deliveries")
        .select(`
          handoff_code,
          status
        `)
        .eq(
          "id",
          delivery.id
        )
        .single();

      if (
        fetchError ||
        !data
      ) {
        throw new Error(
          "Could not verify delivery."
        );
      }

      /*
       * Delivery must have arrived
       */
      if (
        data.status !==
        "arrived"
      ) {
        throw new Error(
          "The delivery has not arrived yet."
        );
      }

      /*
       * Check code
       */
      if (
        data.handoff_code !==
        enteredCode
      ) {
        throw new Error(
          "Incorrect handoff code."
        );
      }

      /*
       * HANDOFF VERIFIED
       */
      const {
        error: handoffError,
      } = await supabase
        .from("deliveries")
        .update({
          status:
            "handoff_verified",
        })
        .eq(
          "id",
          delivery.id
        )
        .eq(
          "status",
          "arrived"
        );

      if (handoffError) {
        throw handoffError;
      }

      /*
       * DELIVERED
       */
      const {
        error: deliveredError,
      } = await supabase
        .from("deliveries")
        .update({
          status: "delivered",
          delivered_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          delivery.id
        )
        .eq(
          "status",
          "handoff_verified"
        );

      if (deliveredError) {
        throw deliveredError;
      }

      /*
       * DECRYPT
       */
      const plaintext =
        await decryptMessage(
          message.encrypted_content,
          message.encryption_iv,
          message.encryption_key
        );

      setUnlockedMessage(
        plaintext
      );

      setDelivery(
        (current) =>
          current
            ? {
                ...current,
                status:
                  "delivered",
              }
            : current
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Verification failed."
      );
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p className="text-neutral-500">
          Loading your message...
        </p>
      </main>
    );
  }

  if (error && !delivery) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Unable to load message
          </h1>

          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>
        </div>
      </main>
    );
  }

  const hasArrived =
    delivery?.status ===
      "arrived" ||
    delivery?.status ===
      "handoff_verified" ||
    delivery?.status ===
      "delivered";

  const isDelivered =
    delivery?.status ===
      "handoff_verified" ||
    delivery?.status ===
      "delivered";

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-900">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <div className="font-black tracking-tight">
            MESSAGEGO
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-6 py-16">
        {!isDelivered ? (
          <>
            <div className="text-center">
              <p className="text-xs tracking-widest text-neutral-600">
                RECIPIENT
              </p>

              <h1 className="mt-4 text-4xl font-bold">
                {hasArrived
                  ? "Your message has arrived."
                  : "Your message is on its way."}
              </h1>

              <p className="mt-4 text-neutral-500">
                {hasArrived
                  ? "Complete the handoff to unlock your message."
                  : "A human is physically carrying your message to you."}
              </p>
            </div>

            {hasArrived ? (
              <div className="mt-10 rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
                <p className="text-center text-xs tracking-widest text-neutral-600">
                  HANDOFF VERIFICATION
                </p>

                <h2 className="mt-3 text-center text-xl font-bold">
                  Enter your 6-digit code
                </h2>

                <input
                  value={enteredCode}
                  onChange={(e) =>
                    setEnteredCode(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="mt-8 w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-5 text-center font-mono text-3xl tracking-[0.5em] outline-none"
                />

                <button
                  onClick={
                    verifyHandoff
                  }
                  disabled={verifying}
                  className="mt-5 w-full rounded-full bg-white py-4 font-bold text-black disabled:opacity-50"
                >
                  {verifying
                    ? "Verifying..."
                    : "Unlock Message"}
                </button>

                {error && (
                  <p className="mt-5 text-center text-sm text-red-400">
                    {error}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-10 rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-neutral-700">
                  <span className="text-2xl">
                    ✉
                  </span>
                </div>

                <p className="mt-5 font-semibold">
                  Message in transit
                </p>

                <p className="mt-2 text-sm text-neutral-500">
                  We&apos;ll update this screen
                  when your delivery arrives.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-xs tracking-widest text-green-400">
              DELIVERY COMPLETE
            </p>

            <h1 className="mt-4 text-4xl font-bold">
              Message unlocked.
            </h1>

            <div className="mt-10 rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-left">
              <p className="text-xs tracking-widest text-neutral-600">
                YOUR MESSAGE
              </p>

              <p className="mt-5 whitespace-pre-wrap text-lg leading-8">
                {unlockedMessage}
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}