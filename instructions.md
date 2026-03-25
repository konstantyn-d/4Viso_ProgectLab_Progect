# PharmaTrack — Frontend Developer Brief

## Project Overview

You are building the frontend of PharmaTrack — an enterprise B2B 
dashboard for monitoring pharmaceutical supply chain logistics. 
This is a real client project for 4Viso, a Belgian company 
specializing in supply chain auditing and compliance.

The product helps pharmaceutical companies, logistics providers, 
and QA auditors track temperature-sensitive medical shipments 
across global transport lanes, ensure GDP (Good Distribution 
Practice) compliance, and assess risk in real time.

This is NOT a marketing website. It is a professional operations 
tool — think Bloomberg Terminal, Linear.app, or a high-end 
DevOps dashboard. Dense data, zero decoration, maximum clarity.

---

## Tech Stack

- Framework:      Next.js 14 (App Router)
- Language:       TypeScript (strict mode, no `any`)
- Styling:        Tailwind CSS
- UI Components:  shadcn/ui (customized to match design system)
- State:          Zustand for global state, React Query (TanStack) 
                  for server state and data fetching
- Auth:           Supabase Auth (JWT tokens, handled via middleware)
- API:            REST calls to our Node.js backend 
                  (base URL from env: NEXT_PUBLIC_API_URL)
- Charts:         Recharts (temperature timelines, risk trends)
- Forms:          React Hook Form + Zod validation
- Icons:          Lucide React only — no other icon libraries
- Date handling:  date-fns
- HTTP client:    Axios with interceptors for auth headers

---

## Design System — NON-NEGOTIABLE RULES

### Colors (only these are allowed)

Background:        #0A0A0A
Surface/cards:     #111111
Elevated surface:  #1A1A1A
Border default:    #222222
Border hover:      #2E2E2E
Text primary:      #F5F5F5
Text secondary:    #6B6B6B
Text muted:        #3D3D3DSemantic (alerts only):
Critical/danger: #E53E3E  (bg: rgba(229,62,62,0.08))
Warning:         #C97B1A  (bg: rgba(201,123,26,0.08))
Safe/compliant:  #2D6A4F  (bg: rgba(45,106,79,0.08))
Info:            #2C5282  (bg: rgba(44,82,130,0.08))


FORBIDDEN: No teal, no cyan, no bright green, no gradients, 
no box shadows, no glow effects, no colored card backgrounds.

### Typography


Page titles:        16px, font-weight 500, #F5F5F5
Section headers:    13px, font-weight 500, #F5F5F5
Table headers:      10px, uppercase, letter-spacing 0.08em, #6B6B6B
KPI values:         28px, font-weight 300, #F5F5F5
Body text:          13px, font-weight 400, #A0A0A0
Labels/captions:    11px, #6B6B6B
Mono (IDs, codes):  font-family monospace, 12px, #6B6B6B



### Components
- Borders: always 1px solid #222222, border-radius: 4px for cards,
  2px for badges
- Status badges: sharp corners (border-radius: 2px), 
  low-opacity fill, semantic color text
- Buttons: one style only — transparent bg, 1px border #2E2E2E, 
  #F5F5F5 text, hover bg #1A1A1A
- Primary CTA ("Add Lane"): bg #F5F5F5, text #0A0A0A — 
  only ONE white button allowed per page
- Sidebar active state: 2px left border #F5F5F5, no bg change
- Table rows: 52px height, 1px bottom border #1A1A1A, 
  no zebra striping, hover bg #111111
- KPI cards: no icons, no colored accents — 
  just uppercase label + large light number + small delta

---

## Project Structure


---

## Pages — Detailed Specification

### 1. Login (/login)
Two-column layout (50/50):

LEFT PANEL (bg #0A0A0A):
- Top-left: PharmaTrack logo + "by 4Viso" subtitle
- Center: large heading "PharmaTrack", 
  subtext about pharma logistics
- Bottom: 3 stat counters — "47 Active Lanes", 
  "94.2% GDP Compliant", "16 Global Ports"
  Stats are static/hardcoded on login page

RIGHT PANEL (bg #111111, border-left #222222):
- Small badge top-center: "GDP Compliant Platform"
- "Welcome back" heading
- Company Email input
- Password input with show/hide toggle
- "Sign in" button (PRIMARY — white bg)
- Divider "or continue with"
- "Single Sign-On (SSO)" button (secondary)
- "Need access? Contact your administrator" link
- On submit: call POST /api/auth/login, 
  store JWT in httpOnly cookie via Supabase,
  redirect to /dashboard

### 2. Dashboard (/dashboard)
Topbar: search bar + notification bell + user avatar

4 KPI Cards (row):
- Active Lanes (number from API)
- GDP Compliant % (ring indicator — keep this, it works)
- Temperature Deviations (count, red if > 0)
- High Risk Lanes (count, red if > 0)

Network Status Grid (REPLACES the map):
Title: "Network Corridors"
A table with columns:
  CORRIDOR | LANES | AVG RISK | COMPLIANCE | STATUS
Rows (fetched from API, 6–8 corridors):
  Each row has a 3px left border:
    green (#2D6A4F) = all compliant
    amber (#C97B1A) = warnings present
    red (#E53E3E)   = deviation detected
  Example data:
    "Europe → Asia Pacific | 12 lanes | 18% | 96.2% | Compliant"
    "North America → Europe | 8 lanes | 24% | 91.5% | Warning"

Active Transport Lanes table (below):
Columns: MODE | ROUTE | CARRIER | PROGRESS | TEMPERATURE | GDP | RISK | STATUS
- MODE: small icon (plane/ship/truck) — lucide icons, #6B6B6B
- ROUTE: "BRU → SIN" bold, "Brussels to Singapore" muted below
- PROGRESS: text only "In Transit · 2 of 4" — no colored bars
- TEMPERATURE: "2°C – 8°C · 4°C" — red text if deviation
- GDP: "✓" in #2D6A4F or "✗" in #E53E3E
- RISK: "18%" — red if >60%, amber if >40%
- STATUS: sharp badge (2px radius)
- "+ Add Lane" button top-right (PRIMARY white button)

### 3. Lanes (/lanes)
Full list of all subscribed transport lanes.
Filter bar: search + mode filter + status filter + risk filter
Same table as dashboard lanes section but full page,
with pagination (20 per page).
Each row is clickable → navigates to /lanes/[id]

### 4. Lane Detail (/lanes/[id])
Two-column layout:
LEFT (60%):
- Route header: "BRU → SIN" large + carrier + mode icon
- Status badge + GDP badge + Risk score
- Progress tracker: 4 milestones as horizontal stepper
  (Departure → In Transit → Customs → Arrived)
  Each milestone: timestamp + location
- Temperature Timeline: Recharts LineChart
  X axis: time, Y axis: °C
  Two reference lines: min threshold, max threshold
  Line color: #F5F5F5, deviation zones highlighted 
  with rgba(229,62,62,0.1) background band

RIGHT (40%):
- Shipment details card (carrier, vessel, containers)
- Cold chain requirements card 
  (required range, product type)
- Recent audit events for this lane (last 5)

### 5. Shipments (/shipments)
4 KPI cards: Active / In Transit / Delivered Today / Delayed

Shipments table:
Columns: SHIPMENT ID | LANE | CARRIER | MODE | 
         DEPARTURE | ETA | TEMPERATURE | STATUS
- Shipment ID in monospace
- ETA: highlight red if overdue

### 6. Compliance (/compliance)
Overview: compliance score per lane and carrier.
Two sections:
- Lane Compliance table: 
  LANE | COMPLIANCE SCORE | GDP STATUS | LAST AUDIT | ISSUES
- Carrier Compliance table:
  CARRIER | LANES | AVG COMPLIANCE | GDP CERTIFIED | STATUS
Export button top-right: "Export Report" → triggers CSV download

### 7. Audit Log (/audit-log)
Filter bar: search + date range + user filter + action type filter
Export CSV button top-right.

Timeline feed (not a table):
Each entry:
- 3px left border (red/amber/green/blue by type)
- Icon (lucide) for event type — #6B6B6B
- Title: event name (bold 13px) + badge (type) + lane ID (monospace muted)
- Description: one line of detail
- Below: user avatar initials + name + timestamp
Row dividers: 1px #1A1A1A

Event types and their colors:
  Temperature Alert → red border
  Compliance Check  → green border
  Lane Created/Updated → blue border
  Shipment Event    → blue border
  Warning           → amber border

### 8. Add Lane Modal (appears on top of any page)
Triggered by "+ Add Lane" button anywhere.
Slide-over from right side (not centered modal).
Width: 480px. Background: #111111. Border-left: 1px #222222.

3-step wizard with step indicator at top:
STEP 1 — Transport Mode
  4 large buttons in 2x2 grid:
  ✈ Air  |  🚢 Sea
  🚛 Road | 📦 Multimodal
  Selected: border #F5F5F5, bg #1A1A1A

STEP 2 — Route & Details
  Origin port: searchable dropdown (search by city/code)
  Destination port: searchable dropdown
  Carrier: searchable dropdown
  Temperature range: min °C + max °C inputs
  Product type: dropdown (Vaccines / Biologics / 
                Active Pharma Ingredients / Other)

STEP 3 — Notifications
  Toggle list:
    [ ] Email alerts on temperature deviation
    [ ] Push notifications for status changes
    [ ] Daily compliance digest
    [ ] High risk alerts (risk > 60%)
  
  "Subscribe" button (PRIMARY white) → 
    POST /api/lanes, close modal, refresh lanes list

---

## Data Types (TypeScript interfaces)
```typescript


// types/lane.ts
export interface Lane {
id: string
route: {
origin: { code: string; city: string; country: string }
destination: { code: string; city: string; country: string }
}
mode: 'air' | 'sea' | 'road' | 'multimodal'
carrier: string
status: 'departure' | 'in_transit' | 'customs' | 'arrived'
progress: { current: number; total: number }
temperature: {
min: number
max: number
current: number
isDeviation: boolean
}
gdpCompliant: boolean
riskScore: number          // 0–100
productType: string
createdAt: string
updatedAt: string
}export interface Shipment {
id: string
laneId: string
carrier: string
mode: Lane['mode']
departure: string
eta: string
status: 'active' | 'in_transit' | 'delivered' | 'delayed'
temperature: Lane['temperature']
}export interface AuditEvent {
id: string
type: 'temperature_alert' | 'compliance_check' |
'lane_created' | 'lane_updated' | 'shipment_event'
severity: 'critical' | 'warning' | 'success' | 'info'
title: string
description: string
laneId: string
userId: string
userName: string
timestamp: string
}export interface ComplianceRecord {
laneId: string
score: number             // 0–100
gdpStatus: boolean
lastAudit: string
openIssues: number
}





--

---

## Auth Flow

1. User submits login form
2. Call `supabase.auth.signInWithPassword({ email, password })`
3. On success: Supabase sets session in localStorage
4. Middleware in `middleware.ts` checks session on every 
   protected route — redirect to /login if not authenticated
5. Axios interceptor attaches Bearer token to all API calls
6. On 401 response: clear session, redirect to /login
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
export const config = { matcher: ['/((?!_next|api|favicon).*)'] }
```

---

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Code Quality Rules

- TypeScript strict mode — no `any`, no `as unknown`
- All async operations wrapped in try/catch
- Loading states for every data fetch (skeleton loaders, 
  NOT spinners — use Tailwind animate-pulse)
- Empty states for every list/table (EmptyState component)
- All forms validated with Zod before submission
- No inline styles — Tailwind only
- Component max file length: 200 lines — 
  split into subcomponents if longer
- All data formatters live in `src/lib/utils/format.ts`


--



