"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeliveryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/send");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] text-neutral-900">
      <p className="text-sm font-semibold text-neutral-500">
        Redirecting...
      </p>
    </main>
  );
}
