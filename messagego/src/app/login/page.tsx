"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getRedirectPath(
  email: string,
  role: string | null | undefined
): string {
  const normalizedEmail = email.toLowerCase().trim();

  if (normalizedEmail === "antonyrubens@gmail.com") {
    return "/partner";
  }

  if (normalizedEmail === "recipient@messagego.demo") {
    return "/recipient";
  }

  if (normalizedEmail === "antony.rubens.10@gmail.com") {
    return "/send";
  }

  if (role === "carrier") {
    return "/partner";
  }

  if (role === "recipient") {
    return "/recipient";
  }

  return "/send";
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function fillDemoAccount(
    selectedEmail: string,
    selectedPassword: string
  ) {
    setEmail(selectedEmail);
    setPassword(selectedPassword);
    setError("");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      /*
       * Explicitly clear the existing session first.
       *
       * This prevents an old Partner/Recipient session from
       * interfering when switching between demo accounts.
       */
      await supabase.auth.signOut();

      const {
        data: { user },
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginError) {
        throw loginError;
      }

      if (!user) {
        throw new Error("Unable to sign in.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.warn("Profile lookup failed:", profileError.message);
      }

      const destination = getRedirectPath(
        user.email ?? email,
        profile?.role
      );

      router.replace(destination);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in.";

      setError(message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/")}
          className="mb-8 text-sm text-neutral-500 hover:text-neutral-900 transition"
        >
          ← Back to MessageGo
        </button>

        <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
          <div className="mb-8">
            <div className="text-4xl mb-4">✉️</div>

            <h1 className="text-3xl font-black tracking-tight">
              Welcome back.
            </h1>

            <p className="mt-2 text-neutral-500">
              Sign in to MessageGo.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-neutral-900 px-4 py-3 font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-neutral-200" />

              <span className="text-xs uppercase tracking-wider text-neutral-400">
                Demo accounts
              </span>

              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  fillDemoAccount(
                    "antony.rubens.10@gmail.com",
                    "ANCYantony10"
                  )
                }
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-left hover:bg-neutral-50 transition"
              >
                <div className="font-bold">
                  Sender
                </div>

                <div className="text-xs text-neutral-500">
                  Create and track messages
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  fillDemoAccount(
                    "antonyrubens@gmail.com",
                    "ANCYantony10"
                  )
                }
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-left hover:bg-neutral-50 transition"
              >
                <div className="font-bold">
                  Delivery Partner
                </div>

                <div className="text-xs text-neutral-500">
                  Accept and deliver messages
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  fillDemoAccount(
                    "recipient@messagego.demo",
                    "MessageGo123!"
                  )
                }
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-left hover:bg-neutral-50 transition"
              >
                <div className="font-bold">
                  Recipient
                </div>

                <div className="text-xs text-neutral-500">
                  Receive and unlock messages
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}