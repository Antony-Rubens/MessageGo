<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# MESSAGEGO 🎯

### We don't send messages. We deliver them.

> **What if sending a message actually required someone to deliver it?**

MessageGo is a deliberately over-engineered physical messaging system built for **TinkerHub Useless Projects 2026**.

Instead of sending a message instantly through the internet, MessageGo turns it into a real delivery:

**Sender → Delivery Partner → Destination → Verified Handoff → Message Unlocked**

For short distances, a real human delivery partner carries the message using **live GPS tracking**.

For long distances, a **simulated pigeon** takes over, travelling across the map according to distance and speed.

Because apparently, WhatsApp was too efficient.

---

## 👥 Team

### Team Name: DevEmphasis

### Team Members

- **Antony Rubens** — Team Lead — Albertian Institute of Science and Technology
- **Alan Verghese Mathew** — Team Member — Albertian Institute of Science and Technology

---

# 💡 The Idea

Modern messaging has become ridiculously convenient.

You type.

You press send.

Someone receives it.

**Done.**

MessageGo asks:

> **What if it wasn't?**

We built a messaging platform where a message is treated like a physical package.

The sender doesn't simply send a message — they create a **delivery**.

The message remains sealed while it travels.

The recipient only gets access after the delivery reaches its destination and the handoff is verified.

---

# 🤨 The Problem (that doesn't exist)

We have solved almost every problem associated with digital messaging.

Messages travel instantly.

Files travel instantly.

Photos travel instantly.

So naturally, we identified the biggest remaining problem:

## **Messages are arriving way too quickly.**

Other problems we decided to solve:

- People don't get enough exercise from sending texts.
- Messages lack a proper transportation infrastructure.
- There is no satisfying way to track a message moving toward you.
- Digital messages have become suspiciously convenient.
- Nobody knows where their message is physically located at any given moment.
- Pigeons have been unfairly excluded from modern communication systems.

---

# 🕊️ The Solution (that nobody asked for)

## Introducing MessageGo.

A physical messaging network disguised as a modern delivery platform.

Instead of:

```text
SEND → RECEIVED
````

MessageGo creates:

```text
CREATE
   ↓
PARTNER SEARCH
   ↓
PARTNER ASSIGNED
   ↓
ACCEPTED
   ↓
PICKUP VERIFIED
   ↓
IN TRANSIT
   ↓
ARRIVED
   ↓
HANDOFF VERIFIED
   ↓
DELIVERED
   ↓
MESSAGE UNLOCKED
```

Every delivery has a real state.

Every movement can be tracked.

Every handoff requires verification.

And the message stays sealed until it reaches the recipient.

---

# 🚚 Two Ways to Deliver a Message

## 🧍 Human Delivery

For nearby destinations, MessageGo uses a real human delivery partner.

The partner:

1. Accepts the delivery.
2. Travels toward the pickup location.
3. Verifies pickup.
4. Carries the sealed message.
5. Shares live GPS coordinates.
6. Reaches the recipient.
7. Completes the handoff.

The sender can watch the delivery move in real time.

### Human delivery = REAL GPS

The carrier's browser uses the **Geolocation API** to continuously report their position.

---

## 🕊️ Pigeon Express

For longer distances, humans are clearly not the optimal solution.

So we use pigeons.

A simulated pigeon travels between the origin and destination using:

```text
Travel Time = Distance / Pigeon Speed
```

The pigeon moves across the map while the delivery state updates in real time.

### Pigeon delivery = SIMULATED GPS

This isn't just a loading animation.

The system calculates:

* Origin
* Destination
* Distance
* Speed
* Current position
* Remaining distance
* ETA

The pigeon is effectively treated as another transport layer.

---

# 🔐 The Message Stays Sealed

The delivery partner should deliver the message.

They should **not read it**.

MessageGo therefore encrypts the message before storing it.

The current prototype uses:

### AES-GCM 256-bit encryption

The encrypted ciphertext is stored instead of the plaintext message.

The message is decrypted on the recipient side after successful handoff verification.

### Important

This implementation is a **prototype encryption model**, not production-grade end-to-end encryption, because the demo key is also stored in the database.

The purpose is to demonstrate the architectural idea:

> **Transport the message without exposing its contents to the carrier.**

---

# 🔑 Verified Handoff

Arrival alone isn't enough.

The recipient must prove that the physical delivery has actually reached them.

When the delivery reaches:

```text
ARRIVED
```

MessageGo generates a **6-digit handoff code**.

The recipient enters the code.

If it matches:

```text
ARRIVED
      ↓
HANDOFF VERIFIED
      ↓
DELIVERED
      ↓
MESSAGE UNLOCKED
```

This creates a simple chain of custody between transportation and message access.

---

# 🗺️ Live Delivery Tracking

Every delivery has its own tracking page.

The map displays:

* Sender location
* Recipient location
* Current carrier location
* Delivery route
* Distance travelled
* Remaining distance
* ETA
* Current delivery state

The tracking interface updates through **Supabase Realtime**.

No page refresh required.

---

# 🧠 Delivery State Machine

MessageGo isn't just moving a marker around a map.

Every delivery follows a controlled state machine:

```text
                    ┌───────────────┐
                    │    CREATED    │
                    └───────┬───────┘
                            ↓
                 ┌─────────────────────┐
                 │   PARTNER SEARCH    │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │  PARTNER ASSIGNED   │
                 └──────────┬──────────┘
                            ↓
                     ┌────────────┐
                     │  ACCEPTED  │
                     └─────┬──────┘
                           ↓
                 ┌──────────────────┐
                 │ PICKUP VERIFIED  │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │    IN TRANSIT    │
                 └────────┬─────────┘
                          ↓
                    ┌───────────┐
                    │  ARRIVED  │
                    └─────┬─────┘
                          ↓
               ┌────────────────────┐
               │ HANDOFF VERIFIED   │
               └─────────┬──────────┘
                         ↓
                   ┌───────────┐
                   │ DELIVERED │
                   └───────────┘

              At appropriate stages:
                         ↓
                    CANCELLED
```

This lifecycle drives:

* UI
* GPS tracking
* Carrier actions
* Recipient access
* Verification
* Realtime updates
* Cancellation
* Database state

---

# 🧑‍💻 User Roles

MessageGo has three primary actors.

## Sender

Creates and tracks deliveries.

Can:

* Enter recipient information
* Write the message
* Choose delivery method
* Create delivery
* Track the carrier
* Cancel eligible deliveries

---

## Delivery Partner

Acts as the transportation layer.

Can:

* View available deliveries
* Accept deliveries
* Navigate to pickup
* Verify pickup
* Start delivery
* Share live GPS
* Complete delivery
* Cancel eligible deliveries

The partner never needs access to the actual message contents.

---

## Recipient

Receives the physical delivery.

Can:

* View incoming deliveries
* Track delivery progress
* See arrival status
* Enter handoff code
* Unlock the delivered message

---

# ⚙️ Technical Details

## Software

### Languages

* TypeScript
* JavaScript
* SQL
* CSS

### Frameworks

* Next.js 16
* React
* Tailwind CSS

### Libraries

* Supabase JS
* Supabase SSR
* Leaflet
* React Leaflet
* Web Crypto API

### Backend / Services

* Supabase Authentication
* Supabase PostgreSQL
* Supabase Realtime
* Next.js API Routes

### Deployment

* Vercel-ready Next.js application

---

# 🏗️ Architecture

```text
                         MESSAGEGO
                             │
             ┌───────────────┼───────────────┐
             │               │               │
          SENDER           PARTNER        RECIPIENT
             │               │               │
             │               │               │
             └───────────────┼───────────────┘
                             │
                        NEXT.JS APP
                             │
              ┌──────────────┼──────────────┐
              │              │              │
          SUPABASE         LEAFLET       CRYPTO
              │              │              │
       ┌──────┼──────┐       │         AES-GCM
       │      │      │       │
     AUTH    DB   REALTIME   │
       │      │      │       │
       │      │      └───────┤
       │      │              │
       │      └──── Delivery │ Tracking
       │                     │
       └──────── Users       │
                             │
                  ┌──────────┴──────────┐
                  │                     │
             HUMAN CARRIER         PIGEON
             REAL GPS            SIMULATED GPS
```

---

# 📁 Project Structure

```text
messagego/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── pigeon/
│   │   ├── delivery/
│   │   ├── login/
│   │   ├── partner/
│   │   ├── recipient/
│   │   └── send/
│   │
│   ├── components/
│   │   ├── DeliveryActions.tsx
│   │   ├── LiveDeliveryMap.tsx
│   │   ├── LiveDeliveryTracker.tsx
│   │   ├── LocationPicker.tsx
│   │   ├── Map.tsx
│   │   └── PigeonSimulator.tsx
│   │
│   └── lib/
│       ├── crypto.ts
│       ├── delivery.ts
│       ├── distance.ts
│       ├── geofence.ts
│       ├── handoff.ts
│       ├── pigeon.ts
│       └── supabase/
│
├── public/
├── package.json
└── README.md
```

---

# 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Antony-Rubens/MessageGo.git
cd MessageGo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
.env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🗄️ Database

MessageGo uses PostgreSQL through Supabase.

Core tables:

```text
profiles
messages
carriers
deliveries
delivery_events
```

The database handles:

* User profiles
* Messages
* Carrier records
* Delivery state
* GPS coordinates
* ETA
* Delivery events
* Handoff verification

Row Level Security is used to restrict access based on the user's role and relationship to a delivery.

---

# 📍 GPS Architecture

One of the core design decisions of MessageGo is separating **real transportation** from **simulated transportation**.

```text
              DELIVERY
                  │
          ┌───────┴───────┐
          │               │
       HUMAN           PIGEON
          │               │
     Browser GPS      Simulator
          │               │
          └───────┬───────┘
                  ↓
           Current Position
                  ↓
          Supabase Realtime
                  ↓
              Live Map
```

### Human

```text
Device GPS
    ↓
Geolocation API
    ↓
Supabase
    ↓
Realtime
    ↓
Sender / Recipient Map
```

### Pigeon

```text
Origin + Destination
          ↓
Distance Calculation
          ↓
Speed Model
          ↓
Position Interpolation
          ↓
Supabase
          ↓
Realtime
          ↓
Animated Map
```

---

# 📏 Distance & ETA

Delivery distance is calculated from geographic coordinates.

The system uses the distance between:

```text
Origin
   ↓
Destination
```

to determine the appropriate delivery method and estimated travel time.

For the simulated pigeon:

```text
ETA = Distance / Speed
```

The current position is continuously interpolated between origin and destination.

---

# 🛡️ Security & Privacy

MessageGo separates the **message layer** from the **transport layer**.

The delivery partner receives:

* Delivery information
* Pickup information
* Destination information
* Transport state

But does not need access to:

* Plaintext message
* Recipient's message content

Additional protections include:

* Supabase Authentication
* PostgreSQL Row Level Security
* Encrypted message storage
* Handoff verification
* Role-based access rules
* Delivery state validation

---

# 📸 Screenshots

> Replace the paths below with the final screenshots uploaded to the repository.

### 1. Message Creation

![MessageGo Send Screen](screenshots/send.png)

*The sender creates a message and chooses between Human Express and Pigeon Express.*

---

### 2. Live Delivery Tracking

![MessageGo Live Tracking](screenshots/tracking.png)

*The sender watches the delivery move toward its destination with live position, route, distance and ETA.*

---

### 3. Partner Dashboard

![MessageGo Partner Dashboard](screenshots/partner.png)

*The delivery partner manages available requests, pickup verification and delivery progress.*

---

### 4. Recipient Handoff

![MessageGo Recipient](screenshots/recipient.png)

*The recipient enters the handoff code before the sealed message is unlocked.*

---

### 5. Pigeon Express

![MessageGo Pigeon](screenshots/pigeon.png)

*The simulated pigeon travels between distant locations while the delivery state updates in real time.*

---

# 🧩 Workflow

```text
┌──────────────┐
│    SENDER    │
└──────┬───────┘
       │
       │ Create message
       ↓
┌────────────────────┐
│ Encrypt & Store    │
│ Message            │
└─────────┬──────────┘
          │
          ↓
┌────────────────────┐
│ Create Delivery    │
└─────────┬──────────┘
          │
          ↓
     Choose Carrier
          │
     ┌────┴─────┐
     ↓          ↓
  HUMAN       PIGEON
  REAL GPS    SIMULATED
     │          │
     └────┬─────┘
          ↓
      IN TRANSIT
          │
          ↓
       ARRIVED
          │
          ↓
   HANDOFF CODE
      VERIFIED
          │
          ↓
      DELIVERED
          │
          ↓
  MESSAGE UNLOCKED
```

---

# 🎥 Project Demo

## Video

> Add the final demo video link here.

The demonstration shows the complete multi-device workflow:

```text
DEVICE 1 — SENDER
        ↓
Creates Message
        ↓
DEVICE 2 — PARTNER
        ↓
Accepts & Carries
        ↓
Live GPS Movement
        ↓
DEVICE 3 — RECIPIENT
        ↓
Receives Delivery
        ↓
Enters Handoff Code
        ↓
Message Unlocks
```

---

# 🧪 Demo Scenarios

## Scenario 1 — Human Delivery

```text
Sender
  ↓
Creates nearby delivery
  ↓
Partner receives request
  ↓
Partner accepts
  ↓
Pickup verified
  ↓
Partner moves physically
  ↓
GPS updates in realtime
  ↓
Recipient sees movement
  ↓
Arrival
  ↓
Handoff code
  ↓
Message unlocked
```

---

## Scenario 2 — Pigeon Express

```text
Sender
  ↓
Creates long-distance delivery
  ↓
Pigeon assigned
  ↓
Distance calculated
  ↓
ETA calculated
  ↓
Pigeon begins flight
  ↓
Position updates
  ↓
Live map animation
  ↓
Destination reached
  ↓
Handoff verification
  ↓
Message unlocked
```

---

## Scenario 3 — Cancellation

Eligible deliveries can be cancelled by the sender or delivery partner.

When cancelled:

```text
DELIVERY
   ↓
CANCELLED
   ↓
Carrier Released
   ↓
Carrier Available Again
```

This keeps the delivery lifecycle consistent even when a transport attempt fails.

---

# 🧠 What We Learned

Building MessageGo forced us to deal with problems that normal messaging apps conveniently avoid:

* Real-time state synchronization
* GPS tracking
* Geofencing
* Delivery state machines
* Role-based access
* Database security
* Realtime subscriptions
* Simulated movement
* ETA calculation
* Message encryption
* Handoff verification
* Multi-device testing

The project started as a joke.

The engineering didn't.

---

# 🏆 Why MessageGo?

Most projects try to solve a problem.

MessageGo deliberately creates one.

But underneath the absurd idea is a real distributed system involving:

**Authentication + Database + Realtime Communication + GPS + Encryption + Geospatial Logic + State Machines + Simulation**

The useless problem became a useful engineering playground.

---

# 📌 Project Status

### Current prototype includes

* [x] Sender interface
* [x] Recipient interface
* [x] Delivery partner interface
* [x] Supabase authentication
* [x] PostgreSQL database
* [x] Row Level Security
* [x] Realtime delivery updates
* [x] Human delivery mode
* [x] Real GPS tracking
* [x] Pigeon delivery simulation
* [x] Live map
* [x] Distance calculation
* [x] ETA calculation
* [x] Delivery state machine
* [x] Message encryption
* [x] Pickup verification
* [x] Handoff verification
* [x] Delivery cancellation
* [x] Carrier availability management

---

# 🔮 Future Ideas

Because apparently this wasn't unnecessary enough.

Possible future additions:

* QR-based handoff verification
* Physical thermal-printed messages
* Pigeon personality system
* Delivery ratings
* Delivery history
* Route optimization
* Multi-hop delivery
* Offline-first partner tracking
* Real-world IoT delivery devices
* AR delivery visualization

---

# ⚠️ Disclaimer

MessageGo is a **Useless Project**.

Please do not actually trust a pigeon with your confidential documents.

The current encryption implementation is intended for demonstration and should not be considered production-grade end-to-end encryption.

---

# 👥 Team Contributions

### Antony Rubens — Team Lead

* Full-stack architecture
* Next.js application
* Supabase integration
* Authentication
* Database architecture
* Realtime delivery tracking
* GPS system
* Encryption
* Pigeon simulation
* Delivery state machine
* UI/UX
* Integration and testing

### Alan Verghese Mathew — Team Member

* Project development
* Feature integration
* Testing
* Demo preparation
* Documentation support

---

## Made with ❤️ at TinkerHub Useless Projects

![TinkerHub](https://img.shields.io/badge/TinkerHub-24-black?style=flat-square)

![Useless Projects](https://img.shields.io/badge/UselessProjects--26-26-black?style=flat-square)

---

<p align="center">

# MESSAGEGO

### We don't send messages.

## We deliver them.

**Team DevEmphasis**

</p>
```
