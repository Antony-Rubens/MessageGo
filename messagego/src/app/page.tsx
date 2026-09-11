"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f3ea] text-neutral-900">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        {/* NAVIGATION */}
        <nav className="relative z-20 flex shrink-0 items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-xl font-black tracking-[-0.05em]"
          >
            MessageGo
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-neutral-400 sm:block">
              Physical messaging
            </span>

            <button
              onClick={() => router.push("/login")}
              className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* HERO */}
        <div className="flex flex-1 items-center py-10 lg:py-12">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            {/* LEFT — HERO COPY */}
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                Physical messaging
              </div>

              <h1 className="max-w-2xl text-[3.8rem] font-black leading-[0.88] tracking-[-0.065em] sm:text-6xl lg:text-[5.3rem] xl:text-[5.7rem]">
                You could&apos;ve
                <br />
                just texted.
                <br />
                <span className="text-neutral-400">
                  But here we are.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
                MessageGo turns digital messages into physical deliveries.
                Nearby messages go by human. Long-distance messages go by
                pigeon.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <span className="h-px w-8 bg-neutral-300" />

                <p className="text-sm font-semibold text-neutral-500">
                  Because apparently pressing &quot;send&quot; was too easy.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push("/login")}
                  className="rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800"
                >
                  Start a Delivery
                </button>

                <button
                  onClick={() => router.push("/login")}
                  className="rounded-full border border-neutral-300 bg-white px-7 py-3.5 text-sm font-bold shadow-sm transition hover:border-neutral-900 hover:bg-neutral-100"
                >
                  Sign In
                </button>
              </div>

              {/* Trust / Product Row */}
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                  <p className="text-lg font-black tracking-tight">REAL</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                    Human GPS
                  </p>
                </div>

                <div className="h-8 w-px bg-neutral-200" />

                <div>
                  <p className="text-lg font-black tracking-tight">LIVE</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                    Delivery tracking
                  </p>
                </div>

                <div className="h-8 w-px bg-neutral-200" />

                <div>
                  <p className="text-lg font-black tracking-tight">SEALED</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                    Until handoff
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT — VISUAL DELIVERY SYSTEM */}
            <div className="relative">
              {/* Main tracking panel */}
              <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)]">
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                      Live delivery
                    </p>

                    <h2 className="mt-1 text-lg font-black tracking-tight">
                      Your message is moving.
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-900" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-600">
                      Live
                    </span>
                  </div>
                </div>

                {/* Map-style visualization */}
                <div className="relative h-[350px] overflow-hidden bg-[#f4f1e9] sm:h-[390px]">
                  {/* Grid */}
                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute left-[15%] top-[-10%] h-[130%] w-px rotate-[18deg] bg-neutral-300" />
                    <div className="absolute left-[42%] top-[-10%] h-[130%] w-px rotate-[18deg] bg-neutral-300" />
                    <div className="absolute left-[72%] top-[-10%] h-[130%] w-px rotate-[18deg] bg-neutral-300" />
                    <div className="absolute left-[-10%] top-[28%] h-px w-[130%] rotate-[8deg] bg-neutral-300" />
                    <div className="absolute left-[-10%] top-[62%] h-px w-[130%] rotate-[-7deg] bg-neutral-300" />
                    <div className="absolute left-[-10%] top-[84%] h-px w-[130%] rotate-[4deg] bg-neutral-300" />
                  </div>

                  {/* Decorative roads */}
                  <div className="absolute left-[-10%] top-[48%] h-12 w-[120%] rotate-[-10deg] border-y border-neutral-300 bg-white/30" />
                  <div className="absolute left-[35%] top-[-15%] h-[130%] w-14 rotate-[20deg] border-x border-neutral-300 bg-white/20" />

                  {/* Route */}
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 600 390"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M95 285 C175 245 190 170 280 195 C370 220 405 125 505 92"
                      stroke="#d4d4d4"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M95 285 C175 245 190 170 280 195 C370 220 405 125 505 92"
                      stroke="#171717"
                      strokeWidth="3"
                      strokeDasharray="8 8"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Sender */}
                  <div className="absolute left-[11%] top-[69%]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-neutral-900 text-xs text-white shadow-lg">
                      ↑
                    </div>

                    <div className="mt-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 shadow-sm">
                      <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                        Sender
                      </p>
                    </div>
                  </div>

                  {/* Carrier */}
                  <div className="absolute left-[45%] top-[43%]">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-neutral-900 text-2xl shadow-xl">
                      🏃

                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-neutral-900" />
                    </div>

                    <div className="absolute left-1/2 top-[68px] -translate-x-1/2 whitespace-nowrap rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-sm">
                      <p className="text-[9px] font-bold">
                        In transit
                      </p>
                    </div>
                  </div>

                  {/* Recipient */}
                  <div className="absolute right-[11%] top-[17%]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-white text-xl shadow-lg">
                      •
                    </div>

                    <div className="mt-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 shadow-sm">
                      <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                        Recipient
                      </p>
                    </div>
                  </div>

                  {/* Distance badge */}
                  <div className="absolute bottom-5 left-5 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                      Remaining
                    </p>

                    <p className="mt-0.5 text-xl font-black tracking-tight">
                      3.8 km
                    </p>
                  </div>

                  {/* ETA badge */}
                  <div className="absolute bottom-5 right-5 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 text-right shadow-sm backdrop-blur">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                      ETA
                    </p>

                    <p className="mt-0.5 text-xl font-black tracking-tight">
                      11 min
                    </p>
                  </div>
                </div>

                {/* Tracking footer */}
                <div className="grid grid-cols-3 border-t border-neutral-100">
                  <div className="border-r border-neutral-100 px-5 py-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                      Status
                    </p>

                    <p className="mt-1 text-xs font-bold">
                      In transit
                    </p>
                  </div>

                  <div className="border-r border-neutral-100 px-5 py-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                      Carrier
                    </p>

                    <p className="mt-1 text-xs font-bold">
                      Human
                    </p>
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                      Message
                    </p>

                    <p className="mt-1 text-xs font-bold">
                      Sealed
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating roast card */}
              <div className="absolute -bottom-5 -left-5 hidden w-48 rounded-2xl border border-neutral-200 bg-neutral-900 p-4 text-white shadow-xl sm:block">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                  Delivery update
                </p>

                <p className="mt-2 text-sm font-bold leading-5">
                  Your message is putting in more effort than you did.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT STRIP */}
        <div className="grid shrink-0 gap-3 pb-2 sm:grid-cols-3">
          {/* Tracking */}
          <div className="group rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  01 / Tracking
                </p>

                <h3 className="mt-1 text-base font-black">
                  Watch it travel.
                </h3>
              </div>

              <span className="text-lg">→</span>
            </div>

            <p className="mt-2 text-xs leading-5 text-neutral-500">
              Follow the delivery from pickup to destination in real time.
            </p>
          </div>

          {/* Sealed */}
          <div className="group rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  02 / Sealed
                </p>

                <h3 className="mt-1 text-base font-black">
                  Nobody reads it.
                </h3>
              </div>

              <span className="text-lg">▣</span>
            </div>

            <p className="mt-2 text-xs leading-5 text-neutral-500">
              The carrier delivers the message, not the contents.
            </p>
          </div>

          {/* Verified */}
          <div className="group rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  03 / Verified
                </p>

                <h3 className="mt-1 text-base font-black">
                  Make the handoff count.
                </h3>
              </div>

              <span className="text-lg">✓</span>
            </div>

            <p className="mt-2 text-xs leading-5 text-neutral-500">
              A six-digit code before the emotional damage is delivered.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="flex shrink-0 items-center justify-between border-t border-neutral-200 pt-4 mt-4 text-[10px] font-medium text-neutral-400">
          <span>MessageGo</span>

          <span className="hidden sm:block">
            We don&apos;t send messages. We deliver them.
          </span>

          <span>Team DevEmphasis</span>
        </footer>
      </section>
    </main>
  );
}