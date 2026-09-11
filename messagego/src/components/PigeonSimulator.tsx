"use client";

import { useEffect } from "react";

type Props = {
  deliveryId: string;
  active: boolean;
};

export default function PigeonSimulator({
  deliveryId,
  active,
}: Props) {
  useEffect(() => {
    if (!active) return;

    let stopped = false;

    async function tick() {
      if (stopped) return;

      try {
        await fetch(
          `/api/pigeon/${deliveryId}`,
          {
            method: "POST",
          }
        );
      } catch (error) {
        console.error(
          "Pigeon simulator error:",
          error
        );
      }
    }

    tick();

    const interval = setInterval(
      tick,
      1000
    );

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [
    deliveryId,
    active,
  ]);

  return null;
}