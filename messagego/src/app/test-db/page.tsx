"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestDatabase() {
  const [status, setStatus] = useState("Testing Supabase...");

  useEffect(() => {
    async function testConnection() {
      const supabase = createClient();

      const { error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1);

      if (error) {
        setStatus(
          `Connected, but there is a database issue: ${error.message}`
        );
      } else {
        setStatus("Supabase connection works!");
      }
    }

    testConnection();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
        <h1 className="text-xl font-bold">
          MessageGo Database Test
        </h1>

        <p className="mt-4 text-neutral-400">
          {status}
        </p>
      </div>
    </main>
  );
}