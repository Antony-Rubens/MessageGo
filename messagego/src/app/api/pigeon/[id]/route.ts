import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { getPigeonPosition } from "@/lib/pigeon";

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const { id } = await params;

  const supabase =
    await createClient();

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
        status,
        created_at
      `)
      .eq("id", id)
      .single();

  if (error || !delivery) {
    return NextResponse.json(
      {
        error:
          "Delivery not found.",
      },
      { status: 404 }
    );
  }

  if (
    delivery.carrier_type !==
    "pigeon"
  ) {
    return NextResponse.json(
      {
        error:
          "This delivery is not using Pigeon Express.",
      },
      { status: 400 }
    );
  }

  if (
    delivery.status ===
      "delivered"
  ) {
    return NextResponse.json({
      message:
        "Delivery already completed.",
    });
  }

  const startTime =
    new Date(
      delivery.created_at
    ).getTime();

  const elapsedSeconds =
    (Date.now() - startTime) /
    1000;

  /*
   * DEMO MODE
   *
   * Instead of making the audience
   * wait the real flight duration,
   * the pigeon completes the journey
   * in approximately 60 seconds.
   */
  const DEMO_DURATION = 60;

  const progress = Math.min(
    1,
    elapsedSeconds /
      DEMO_DURATION
  );

  const position =
    getPigeonPosition(
      Number(
        delivery.origin_lat
      ),
      Number(
        delivery.origin_lng
      ),
      Number(
        delivery.destination_lat
      ),
      Number(
        delivery.destination_lng
      ),
      progress
    );

  if (progress >= 1) {
    await supabase
      .from("deliveries")
      .update({
        current_lat:
          position.lat,
        current_lng:
          position.lng,
        distance_remaining: 0,
        status: "arrived",
      })
      .eq("id", id);

    return NextResponse.json({
      progress: 1,
      status: "arrived",
      latitude:
        position.lat,
      longitude:
        position.lng,
    });
  }

  await supabase
    .from("deliveries")
    .update({
      current_lat:
        position.lat,
      current_lng:
        position.lng,
    })
    .eq("id", id);

  return NextResponse.json({
    progress,
    status:
      delivery.status,
    latitude:
      position.lat,
    longitude:
      position.lng,
  });
}