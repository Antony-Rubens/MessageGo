

<img width="1280" height="640" alt="MessageGo" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />

# MESSAGEGO 💌

## We don't send messages. We deliver them.

# MESSAGEGO 🎯

MessageGo is a deliberately unnecessary but fully functional physical messaging platform built for **TinkerHub Useless 3.0**.

Instead of simply pressing "Send", MessageGo turns your digital message into an actual delivery journey.

Nearby messages are delivered by real human delivery partners using live GPS.

Long-distance messages are delivered by simulated pigeons.

Because apparently pressing "send" was too easy.


# Screenshots (Add at least 3)

![MessageGo Send Screen](screenshots/send.png)
*The sender creates a message, chooses a delivery method, and starts the delivery.*

![MessageGo Live Tracking](screenshots/tracking.png)
*The sender can track the message and delivery partner in real time.*

![MessageGo Partner Dashboard](screenshots/partner.png)
*The delivery partner can view available deliveries, accept them, and manage the delivery process.*

# Diagrams

![MessageGo Architecture](screenshots/architecture.png)
*Architecture showing the sender, delivery partners, Supabase backend, realtime tracking, and recipient flow.*

For Hardware:

# Schematic & Circuit

Not applicable — MessageGo is a software-only web application.

*No physical circuit or electronic hardware is required.*

![Schematic](screenshots/architecture.png)
*Software architecture showing the communication between the application, Supabase services, delivery partners, and recipients.*

# Build Photos

Not applicable — MessageGo is implemented as a web-based software platform.

![Components](screenshots/software.png)
*The project consists of software components including the Next.js frontend, Supabase backend, database, authentication, realtime services, GPS tracking, and pigeon simulation.*

![Build](screenshots/development.png)
*Development process involving frontend development, backend integration, database configuration, realtime communication, GPS tracking, and testing.*

![Final](screenshots/final.png)
*Final MessageGo web application with sender, delivery partner, recipient, live tracking, and pigeon delivery functionality.*

### Project Demo

# Video

[MessageGo — TinkerHub Useless 3.0 Demo](https://youtube.com/shorts/6TiC7TaJLvU?feature=share)

*This demo showcases the complete MessageGo delivery workflow, including message creation, human delivery, real-time GPS tracking, pigeon delivery simulation, recipient handoff verification, and message unlocking.*

# Additional Demos

*The complete project demonstration is included in the video above.*

---

## Team Contributions

- **Antony Rubens** — Team Lead: Full-stack development, system architecture, Next.js application, Supabase integration, authentication, database design, realtime tracking, GPS integration, encryption, pigeon simulation, delivery state machine, UI/UX, integration, and testing.
- **Alan Verghese Mathew** — Team Member: Feature development, integration, testing, documentation, demo preparation, and project support.

---

## 👥 Team

### Team Name: DevEmphasis

### Team Members

- **Antony Rubens** — Team Lead — Albertian Institute of Science and Technology
- **Alan Verghese Mathew** — Team Member — Albertian Institute of Science and Technology

---

# 💔 The Problem

You finally gather the courage.

You type the paragraph.

You reread it 17 times.

You delete half of it.

You type it again.

You send it.

And then she replies:

> **"Aww, you're such a good friend."**

Congratulations.

You have been promoted to:

# FRIEND.

No salary.
No benefits.
No chance of promotion.

So we asked an important question:

### What if your message could at least suffer the way you did?


---

# 🚚 The Solution

## Introducing **MessageGo**

A revolutionary messaging platform designed for people who:

- Took 45 minutes to write a 3-line message.
- Checked "last seen" 38 times.
- Overanalysed a "haha".
- Thought "take care ❤️" meant something.
- Got called "bro".
- And still somehow decided to send another message.

MessageGo doesn't deliver your message instantly.

### We make it travel.

Because instant delivery is apparently too kind.


---

# 🧍 HUMAN DELIVERY

For nearby destinations, your message gets assigned to a real human delivery partner.

The process is simple:

```text
You write the message
        ↓
You regret sending it
        ↓
Delivery partner accepts
        ↓
Partner picks it up
        ↓
Partner physically travels
        ↓
You track them in real time
        ↓
They reach her
        ↓
She still says "you're such a good friend"
````

### Human Delivery = REAL GPS

Yes.

An actual human moves.

Their location is tracked using the browser's Geolocation API.

Because if your feelings are going nowhere,

at least your message is.

---

# 🕊️ PIGEON EXPRESS

Sometimes the person you want to message is far away.

Naturally, we could use the internet.

But where's the fun in that?

So we introduced:

# PIGEON EXPRESS™

Your message gets assigned a pigeon and begins its heroic journey.

```text
Origin
  ↓
Pigeon gets message
  ↓
Pigeon questions your life choices
  ↓
Flight begins
  ↓
Live tracking
  ↓
Distance decreases
  ↓
Hope decreases
  ↓
Pigeon arrives
  ↓
She replies:
"You're like a brother to me."
```

### Pigeon Delivery = SIMULATED GPS

The pigeon isn't just randomly flying around the screen.

The system calculates:

* Origin
* Destination
* Distance
* Speed
* Current position
* Remaining distance
* ETA

So technically...

**your pigeon has better direction than you had in that relationship.**

---

# 🔐 SEALED MESSAGE

Don't worry.

Your delivery partner can't read your message.

The message is encrypted before being stored.

Currently using:

### AES-GCM 256-bit encryption

So while the carrier knows:

> "I am delivering a message."

They don't know:

> "I have liked you since second year and I don't know how to tell you."

That's between you and the database.

---

# 🔑 HANDOFF VERIFICATION

The message doesn't unlock just because the delivery reaches the destination.

The recipient has to enter a **6-digit handoff code**.

```text
ARRIVED
   ↓
"What's the code?"
   ↓
Recipient enters code
   ↓
Code verified
   ↓
Message unlocked
```

Finally...

A system that requires more verification than your relationship.

---

# 🧠 THE DELIVERY PIPELINE

Every message goes through a beautiful, unnecessarily complicated journey:

```text
┌───────────────┐
│    CREATED    │
└───────┬───────┘
        ↓
┌───────────────────┐
│  PARTNER SEARCH   │
└────────┬──────────┘
         ↓
┌───────────────────┐
│ PARTNER ASSIGNED  │
└────────┬──────────┘
         ↓
┌───────────────┐
│   ACCEPTED    │
└───────┬───────┘
        ↓
┌──────────────────┐
│ PICKUP VERIFIED  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│   IN TRANSIT     │
└────────┬─────────┘
         ↓
┌───────────────┐
│    ARRIVED     │
└───────┬───────┘
        ↓
┌────────────────────┐
│ HANDOFF VERIFIED   │
└─────────┬──────────┘
          ↓
┌────────────────┐
│    DELIVERED   │
└────────┬───────┘
         ↓
┌──────────────────┐
│ MESSAGE UNLOCKED │
└──────────────────┘
```

Meanwhile, your romantic relationship:

```text
YOU
 ↓
LIKE HER
 ↓
TEXT HER
 ↓
OVERTHINK
 ↓
CONFESS
 ↓
"You're such a good friend"
 ↓
💀
```

---

# 🗺️ LIVE TRACKING

Because waiting for someone to reply isn't stressful enough.

MessageGo lets you track your message in real time.

You can see:

* Current location
* Destination
* Route
* Distance remaining
* ETA
* Delivery status
* Carrier

So instead of staring at:

> **"Last seen 2 hours ago"**

you can stare at:

> **"Message is 3.4 km away."**

Progress.

---

# 👨‍💻 THREE PEOPLE. ONE MESSAGE. ZERO ROMANTIC PROGRESS.

MessageGo supports three roles.

---

## 💌 SENDER

The brave individual who thinks:

> "This time she'll understand."

Can:

* Write a message
* Choose delivery method
* Create a delivery
* Track the message
* Cancel the delivery

---

## 🧍 DELIVERY PARTNER

The only person actually doing something productive.

Can:

* View available deliveries
* Accept a delivery
* Navigate to pickup
* Verify pickup
* Start delivery
* Share live GPS
* Complete delivery
* Cancel eligible deliveries

The partner cannot read the sealed message.

Unlike your friends who definitely already know what happened.

---

## 📩 RECIPIENT

The person who may or may not have been waiting for the message.

Can:

* View incoming deliveries
* Track delivery
* Confirm arrival
* Enter handoff code
* Unlock the message

And possibly respond with:

> "Awwww ❤️"

Which is either romantic...

or the most dangerous sentence in the English language.

---

# ⚙️ TECH STACK

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

* Vercel

---

# 🏗️ ARCHITECTURE

```text
                         MESSAGEGO
                             │
                             ↓
                          SENDER
                             │
                             ↓
                      ENCRYPT MESSAGE
                             │
                             ↓
                     CREATE DELIVERY
                             │
                      ┌───────┴───────┐
                      ↓               ↓
                   HUMAN           PIGEON
                 REAL GPS        SIMULATED GPS
                      │               │
                      └───────┬───────┘
                              ↓
                           SUPABASE
                              │
                 ┌────────────┼────────────┐
                 ↓            ↓            ↓
               AUTH       POSTGRESQL    REALTIME
                              │
                              ↓
                         LIVE TRACKING
                              │
                              ↓
                          RECIPIENT
                              │
                              ↓
                         HANDOFF CODE
                              │
                              ↓
                        MESSAGE UNLOCK
```

---

# 📍 GPS SYSTEM

MessageGo has two different transportation models.

## HUMAN

```text
Phone / Laptop GPS
       ↓
Geolocation API
       ↓
Supabase
       ↓
Realtime
       ↓
Live Map
```

Actual human movement.

Actual coordinates.

Actual delivery.

---

## PIGEON

```text
Origin + Destination
        ↓
Distance Calculation
        ↓
Pigeon Speed
        ↓
Position Interpolation
        ↓
Supabase
        ↓
Realtime
        ↓
Animated Map
```

Not actual pigeon movement.

We have standards.

---

# 🗄️ DATABASE

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

* Users
* Messages
* Carriers
* Delivery states
* GPS coordinates
* ETA
* Delivery events
* Handoff verification
* Carrier availability

Because apparently a simple text message needed a database architecture.

---

# 🔒 SECURITY

The delivery partner shouldn't know what you're saying.

They only need to know:

> "Take this thing there."

MessageGo separates:

### MESSAGE LAYER

from

### TRANSPORT LAYER

The carrier can access delivery information without needing the plaintext message.

The system also uses:

* Supabase Authentication
* Row Level Security
* Encrypted message storage
* Handoff verification
* Role-based access
* Delivery state validation

---

# 🚀 INSTALLATION

## 1. Clone the repository

```bash
git clone https://github.com/Antony-Rubens/MessageGo.git
cd MessageGo
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create environment variables

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## 4. Run the application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 📸 SCREENSHOTS

## 1. Sending the Message

![MessageGo Send Screen](screenshots/send.png)

*He could have just texted her. He chose this instead.*

---

## 2. Live Tracking

![MessageGo Live Tracking](screenshots/tracking.png)

*The message is moving. His relationship isn't.*

---

## 3. Partner Dashboard

![MessageGo Partner Dashboard](screenshots/partner.png)

*Someone is finally putting effort into delivering his message.*

---

## 4. Recipient Handoff

![MessageGo Recipient](screenshots/recipient.png)

*After travelling all that distance, the message still needs permission to be opened.*

---

## 5. Pigeon Express

![MessageGo Pigeon](screenshots/pigeon.png)

*When your message needs more emotional distance, send a pigeon.*

---

# 🧪 DEMO

## Human Delivery

```text
SENDER
  ↓
Writes message
  ↓
Message encrypted
  ↓
Delivery created
  ↓
Partner accepts
  ↓
Pickup verified
  ↓
Partner physically travels
  ↓
GPS updates in realtime
  ↓
Recipient watches delivery
  ↓
Partner arrives
  ↓
Handoff code
  ↓
Message unlocked
```

---

# 🕊️ PIGEON DEMO

```text
SENDER
  ↓
Long-distance delivery
  ↓
Pigeon assigned
  ↓
Distance calculated
  ↓
ETA calculated
  ↓
Pigeon starts flying
  ↓
Live position updates
  ↓
Pigeon reaches destination
  ↓
Handoff verification
  ↓
Message unlocked
```

---

# 🧨 CANCELLATION

Sometimes you realize:

> "Maybe I shouldn't send this."

Good news.

You can cancel eligible deliveries.

```text
DELIVERY
   ↓
CANCEL
   ↓
MESSAGE DOESN'T ARRIVE
   ↓
YOU KEEP YOUR DIGNITY
```

At least one of these things is still recoverable.

---

# 🧠 WHY DID WE BUILD THIS?

We could have built another:

* AI chatbot
* Expense tracker
* To-do app
* Weather app
* Productivity dashboard
* "Revolutionary" student management system

Instead, we asked:

### "What is the least efficient way to send a text?"

And then actually engineered it.

Underneath the joke, MessageGo demonstrates:

* Full-stack development
* Authentication
* PostgreSQL
* Realtime systems
* GPS tracking
* Geospatial calculations
* State machines
* Encryption
* Role-based access
* Simulation
* Multi-device communication

The idea is useless.

### The engineering isn't.

---

# 🏆 WHAT MAKES MESSAGEGO DIFFERENT?

Most projects say:

> **"We solved a real-world problem."**

MessageGo says:

> **"We created a completely unnecessary problem and then built an unnecessarily sophisticated solution for it."**

And that's the beauty of a Useless Project.

---

# 🔮 FUTURE FEATURES

Because apparently we haven't suffered enough.

Possible future upgrades:

* QR-based handoff
* Physical thermal-printed messages
* Pigeon personality system
* Delivery ratings
* Delivery history
* Route optimization
* Multi-hop delivery
* Offline-first partner tracking
* Real-world IoT delivery devices
* AR delivery visualization

And perhaps...

### A "She Said Yes" delivery status.

We are currently waiting for a test case.

---

# ⚠️ DISCLAIMER

MessageGo is a **Useless Project**.

Please do not:

* Trust pigeons with confidential documents.
* Use MessageGo to stalk your crush.
* Interpret delivery status as relationship status.
* Assume "you're such a good friend" is secretly romantic.
* Send 14 consecutive deliveries because she hasn't replied.

The encryption implementation is a prototype and should not be considered production-grade end-to-end encryption.

---

# 👥 TEAM CONTRIBUTIONS

## Antony Rubens

**Team Lead — Albertian Institute of Science and Technology**

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

## Alan Verghese Mathew

**Team Member — Albertian Institute of Science and Technology**

* Project development
* Feature integration
* Testing
* Demo preparation
* Documentation support

---

# ❤️ THE MESSAGEGO PHILOSOPHY

A normal messaging app:

```text
"Hey"
   ↓
Delivered
```

MessageGo:

```text
"Hey"
   ↓
Encrypted
   ↓
Assigned to a human
   ↓
Picked up
   ↓
Physically transported
   ↓
GPS tracked
   ↓
Arrived
   ↓
Handoff verified
   ↓
Finally unlocked
```

Because if you're going to get friendzoned...

### At least make the message work for it.

---

## Made with ❤️ at TinkerHub Useless Projects

![TinkerHub](https://img.shields.io/badge/TinkerHub-24-black?style=flat-square)

![Useless Projects](https://img.shields.io/badge/UselessProjects--26-26-black?style=flat-square)

---

<p align="center">

# MESSAGEGO

### We don't send messages.

## We deliver them.

### — Team DevEmphasis —

</p>
```
