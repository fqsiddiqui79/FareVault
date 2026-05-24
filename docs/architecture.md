# FareVault - Travel Price Tracking Platform

**Project Type:** Full-Stack Web Application  
**Status:** Prototype / UI Complete - Backend Pending  
**Created:** May 2026  
**Stack:** React (frontend) · Node.js (backend) · PostgreSQL + TimescaleDB · Redis · WebSocket

-----

## Project Summary

FareVault is a real-time travel price tracking and alert platform that monitors flight fares, hotel rates, and package deals across 240+ sources. Users set up watches on specific routes and dates; the platform scans continuously in the background and delivers instant alerts the moment prices drop via email, SMS, push notification, or desktop.

The platform is positioned as a stronger architectural alternative to tools like RatePunk, with a distributed scan engine, time-series price history, ML-powered booking windows, and multi-channel alert delivery rather than a simple browser extension.

-----

## What Is Built (Prototype)

The React UI prototype (`farevault.jsx`) is complete and includes:

- **Search bar** with flight / hotel / package type switching and date selection
- **Flight results** with airline, route, duration, stops, date, live price, and price-drop detection
- **Hotel results** with star rating, city, per-night rate, and price-drop detection
- **Package bundles** combining cheapest available flight and hotel with bundle discount applied
- **Sparkline price history charts** on every result card
- **Per-result alert toggles** - users switch alerts on/off per route or property
- **Alerts panel** (slide-out) showing recent price movements with channel preferences: email, SMS, push, desktop
- **Stats row** showing average savings, routes tracked, active alerts, and best deal today
- **Live scan indicator** in the header showing the platform is actively monitoring

The UI is dark-themed, data-dense, and built with React hooks and inline styles. No external UI library dependencies beyond Google Fonts.

-----

## Architecture Overview

### Frontend

|Layer            |Technology                                       |
|-----------------|-------------------------------------------------|
|Framework        |React 18 (functional components, hooks)          |
|Styling          |Inline CSS with CSS variables via constants      |
|Charts           |Custom SVG sparklines (no chart library required)|
|Fonts            |DM Mono (prices) + Inter (body) via Google Fonts |
|State            |useState / useEffect (local)                     |
|Real-time updates|WebSocket connection to backend (to be wired)    |

### Backend (to be built)

|Layer         |Technology                                     |Purpose                                    |
|--------------|-----------------------------------------------|-------------------------------------------|
|API server    |Node.js + Express or Fastify                   |REST API and WebSocket server              |
|Scan queue    |Bull (Redis-backed) or BullMQ                  |Background price scan jobs                 |
|Flight data   |Amadeus API or Duffel API                      |Live fare aggregation                      |
|Hotel data    |Booking.com Content API or RapidAPI            |Live hotel rates                           |
|Database      |PostgreSQL + TimescaleDB extension             |Relational data + time-series price history|
|Cache         |Redis                                          |Session state, rate limiting, job queues   |
|Alert delivery|Twilio (SMS), SendGrid (email), Firebase (push)|Multi-channel notifications                |
|Auth          |Clerk or Auth0                                 |OAuth + JWT session management             |
|Deployment    |Vercel (frontend) + Railway or Render (backend)|CI/CD hosting                              |

-----

## Data Flow

```
User sets watch on SYD -> LHR, 12 Jul
        |
        v
Backend stores watch in PostgreSQL
        |
        v
Bull queue schedules scan job every 10 min
        |
        v
Scan worker calls Amadeus API + Booking.com API
        |
        v
New price stored in TimescaleDB with timestamp
        |
        v
Price compared to last stored price
        |
    [price dropped?]
       /       \
     YES        NO
      |          |
      v          v
Alert triggered  No action
      |
      v
Delivery service fans out:
  - Email via SendGrid
  - SMS via Twilio
  - Push via Firebase
  - WebSocket push to open browser tab
```

-----

## File Structure (Recommended)

```
farevault/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FlightCard.jsx
│   │   │   ├── HotelCard.jsx
│   │   │   ├── PackageCard.jsx
│   │   │   ├── AlertsPanel.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Sparkline.jsx
│   │   │   └── StatCard.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       (main view - current prototype)
│   │   │   ├── WatchList.jsx       (all user-set watches)
│   │   │   ├── PriceHistory.jsx    (full 90-day chart view per route)
│   │   │   └── Settings.jsx        (alert channel preferences)
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js     (live price updates)
│   │   │   └── useAlerts.js        (alert state management)
│   │   ├── constants/
│   │   │   └── colors.js           (design token constants)
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── flights.js
│   │   │   │   ├── hotels.js
│   │   │   │   ├── packages.js
│   │   │   │   ├── watches.js      (CRUD for user watches)
│   │   │   │   └── alerts.js
│   │   │   └── middleware/
│   │   │       ├── auth.js
│   │   │       └── rateLimit.js
│   │   ├── workers/
│   │   │   ├── scanWorker.js       (Bull job processor)
│   │   │   ├── flightScanner.js    (Amadeus/Duffel integration)
│   │   │   └── hotelScanner.js     (Booking.com integration)
│   │   ├── services/
│   │   │   ├── alertService.js     (fan-out delivery logic)
│   │   │   ├── emailService.js     (SendGrid)
│   │   │   ├── smsService.js       (Twilio)
│   │   │   └── pushService.js      (Firebase)
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── migrations/
│   │   └── websocket/
│   │       └── server.js
│   └── package.json
│
├── FAREVAULT_PROJECT.md            (this file)
└── docker-compose.yml              (PostgreSQL + Redis local dev)
```

-----

## Database Schema (Key Tables)

### users

```sql
id, email, name, auth_provider, created_at
```

### watches

```sql
id, user_id, type (flight|hotel|package),
origin, destination, travel_date,
hotel_name, hotel_city,
alert_enabled, alert_threshold_pct,
created_at
```

### price_snapshots (TimescaleDB hypertable)

```sql
time, watch_id, price, currency, provider, raw_metadata
-- Hypertable on `time` column for efficient range queries
```

### alerts_log

```sql
id, watch_id, user_id, trigger_price, previous_price,
pct_drop, channels_delivered, delivered_at
```

-----

## Key Integrations Required

|Integration              |Purpose                |Notes                                          |
|-------------------------|-----------------------|-----------------------------------------------|
|Amadeus for Developers   |Flight search API      |Free tier available; paid for production volume|
|Duffel API               |Alternative flight data|Better NDC content                             |
|Booking.com Affiliate API|Hotel rates            |Requires affiliate approval                    |
|Twilio                   |SMS alerts             |Pay-per-message                                |
|SendGrid                 |Email alerts           |Free tier: 100 emails/day                      |
|Firebase Cloud Messaging |Push notifications     |Free                                           |
|Clerk or Auth0           |User auth              |Free tier available                            |

-----

## MVP Build Sequence

1. Set up PostgreSQL + TimescaleDB + Redis locally via Docker
1. Build Express API with `watches` CRUD endpoints
1. Implement Bull scan queue with a single FlightScanner worker (Amadeus)
1. Wire price comparison logic and alert trigger
1. Deliver alerts via SendGrid email only (simplest channel first)
1. Connect frontend search bar to live API
1. Replace mock data with real API responses
1. Add WebSocket for live dashboard updates
1. Add Twilio SMS + Firebase push
1. Add hotel scanning (Booking.com)
1. Build package bundling engine (combine cheapest flight + hotel per destination)
1. Add ML booking window predictor (optional, phase 2)

-----

## Component Reference (Prototype)

|Component    |File                          |Description                             |
|-------------|------------------------------|----------------------------------------|
|`FareVault`  |farevault.jsx (default export)|Root app shell with header, tabs, layout|
|`SearchBar`  |farevault.jsx                 |Route/date input with type switcher     |
|`FlightCard` |farevault.jsx                 |Single flight result with alert toggle  |
|`HotelCard`  |farevault.jsx                 |Single hotel result with alert toggle   |
|`PackageCard`|farevault.jsx                 |Bundle deal card                        |
|`AlertsPanel`|farevault.jsx                 |Slide-out panel with alert history      |
|`Sparkline`  |farevault.jsx                 |SVG mini price chart                    |
|`PriceTag`   |farevault.jsx                 |Price display with drop percentage      |
|`StatCard`   |farevault.jsx                 |Summary stat tile                       |

-----

## Design Tokens

```javascript
// colors.js
export const COLORS = {
  bg:       "#0a0c14",   // page background
  surface:  "#111320",   // header, panel backgrounds
  card:     "#161928",   // result cards
  border:   "#1e2438",   // all borders
  accent:   "#00e5ff",   // primary CTA, flight highlights
  gold:     "#f5a623",   // hotel highlights
  green:    "#00d68f",   // price drops, savings
  red:      "#ff4d6d",   // alert badges, warnings
  purple:   "#8b5cf6",   // package deals
  text:     "#e8eaf2",   // primary text
  muted:    "#6b7394",   // secondary text
  subtle:   "#3a3f58",   // tertiary text
};
```

-----

## Notes for Development

- All prices in the prototype are AUD. Add currency selector and conversion layer before launch.
- The prototype uses mock data arrays at the top of `farevault.jsx`. Replace these with API fetch calls inside `useEffect` hooks in each component.
- The `Sparkline` component expects a plain array of numbers. Feed it the `price` field from the last N `price_snapshots` rows for the relevant `watch_id`.
- Alert toggle state is local (`useState`) in the prototype. In production, each toggle fires a PATCH to `/api/watches/:id` to persist the preference.
- The package bundling logic in production should run server-side: for a given origin/destination/date, pull the lowest flight price and lowest hotel rate and combine them, then apply a configurable bundle discount percentage.
- Consider rate limiting scan workers per API provider to avoid exceeding free tier quotas during development.

-----

*FareVault prototype built May 2026. Backend integration pending.*