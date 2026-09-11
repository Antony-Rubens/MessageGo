"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-900">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-xl font-black tracking-tight"
          >
            MessageGo
          </button>

          <button
            onClick={() => router.push("/login")}
            className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold transition hover:bg-neutral-100"
          >
            Sign In
          </button>
        </nav>

        <div className="flex flex-1 items-center py-20">
          <div className="grid w-full items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                Physical messaging
              </div>

              <h1 className="max-w-4xl text-6xl font-black leading-[0.95] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
                We don&apos;t send messages.
                <br />
                <span className="text-neutral-400">
                  We deliver them.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-600">
                What if sending a message actually meant delivering it?
                MessageGo turns digital messages into physical deliveries,
                powered by humans and pigeons.
              </p>

              <p className="mt-5 text-sm font-semibold text-neutral-500">
                You could&apos;ve just texted.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push("/login")}
                  className="rounded-full bg-neutral-900 px-7 py-4 font-bold text-white transition hover:bg-neutral-800"
                >
                  Start a Delivery
                </button>

                <button
                  onClick={() => router.push("/login")}
                  className="rounded-full border border-neutral-300 bg-white px-7 py-4 font-bold transition hover:bg-neutral-100"
                >
                  Sign In
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
                <div className="mb-6 text-5xl">🏃</div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                  Short distance
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Human Express
                </h2>

                <p className="mt-3 text-sm leading-6 text-neutral-500">
                  A real delivery partner physically carries your message to
                  the recipient.
                </p>

                <div className="mt-6 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-semibold">
                  Real GPS
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
                <div className="mb-6 text-5xl">🕊️</div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                  Long distance
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Pigeon Express
                </h2>

                <p className="mt-3 text-sm leading-6 text-neutral-500">
                  When humans aren&apos;t practical, a simulated pigeon takes
                  your message across the map.
                </p>

                <div className="mt-6 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-semibold">
                  Simulated GPS
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm sm:col-span-2">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                      Tracking
                    </p>
                    <h3 className="mt-2 text-xl font-black">
                      Watch it travel.
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                      Sealed
                    </p>
                    <h3 className="mt-2 text-xl font-black">
                      Nobody reads it.
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                      Slow
                    </p>
                    <h3 className="mt-2 text-xl font-black">
                      That&apos;s the point.
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-neutral-200 pt-6 text-xs text-neutral-400">
          MessageGo — You could&apos;ve just texted.
        </footer>
      </section>
    </main>
  );
}