# PLAN.md — SBS Field Service Mobile App

> **DOCUMENT STATUS: DISCOVERY CAPTURE — INTERVIEW IN PROGRESS.**
> This file currently holds everything captured during the co-founder interview: business context,
> locked decisions, assumptions, a draft data model and architecture, cost/version facts, and the
> open questions that are still unanswered.
> It is deliberately **NOT yet a final implementation plan** — see **§19 (Next Steps)** for the
> remaining interview batches. The implementation plan will be appended once the open questions close.
>
> **Last updated:** 21 September 2026 (discovery capture + decoupled-architecture revision; no code written)
> **REVISION (21 Sep 2026):** the architecture was changed to a **decoupled** design at the client's
> request — standalone **Node.js + Express.js + TypeScript** API, with **Redux Toolkit + RTK Query**
> as the state/API layer in **both** clients. See **D1, D13–D18** and **§8** (including the new
> **§8.5 Repository and folder structure**).
> **Repo state:** the directory **was empty at kickoff** (verified by this session at 20:26). A default
> **Expo SDK 57 scaffold** then appeared in it at 21:36–21:45 on 21 Sep 2026 — **not created by this
> planning session** — see **§0.1 Workspace reality check**.
> **This session performed no scaffolding:** no git init, no dependencies added, no accounts created, no
> configuration written. The only file this session wrote is `PLAN.md`.

---

## 0. Document control

| Item | Value |
|---|---|
| Project | SBS Field Service App (technician mobile app + web admin panel) |
| Architecture | **Decoupled**: Express/Node/TS API + Expo RN app + Next.js admin, both clients on RTK/RTK Query (D1, D13–D18) |
| Client / business | SBS.COM Office Solutions (Pvt) Ltd, Sri Lanka |
| Current phase | Discovery / requirements interview |
| Repo state | **Default Expo SDK 57 scaffold present** (external action, 21 Sep 21:36 — not by this session) + `node_modules` (485 MB); **no git repo**; see §0.1 |
| Phase gate | Spec summary → assumptions → risks → **then** implementation plan |
| Interview batches done | Batch 1 (platform/tenancy/scope), Batch 2 (auth/roles/backend/AI/dispatch) |
| Batches outstanding | Batch 3 (reports, cost, release, observability, QA, migration, legal/ownership) + Batch 4 (future-proofing, optional) |
| Unresolved conflicts | **9 flagged, 3 resolved** — C5–C9 are new (ORM, identity, DTO ownership, `api/auth.ts` semantics, `domin/` spelling): see §8.5 and §17 |
| Labeled assumptions | **31** (A1–A31, see §16) — created by wholesale "I agree with your recommendation" answers on fact-based questions, plus the architecture revision |

### How to use this file
- **§§1–15** are the working spec: business context, scope, decisions, model, architecture, non-functional.
- **§16** lists every assumption. **Anything in §16 is a guess** until the client confirms it.
- **§19** lists what must happen before the implementation plan is credible.
- When the interview closes, append **Part B: Implementation Plan** (phases, milestones, task breakdown).

### 0.1 Workspace reality check (verified 21 Sep 2026 at 20:26 and 21:55, then re-checked later the same session)

The directory **was empty when this interview began** (verified 20:26). Between 21:36 and 21:45 — while
this document was being written — a **default `create-expo-app` scaffold** and an installed `node_modules`
appeared. **This planning session did not create them.** The only file this session wrote is `PLAN.md`.

| What exists | Detail |
|---|---|
| Scaffold origin | Default `create-expo-app@latest` template — **untouched starter** (tutorial routes + demo components) |
| Expo SDK | **57.0.24** (expo-router 57.0.22) — matches decision **D12** (SDK 57 stable) |
| React / React Native | React **19.2.3**, React Native **0.86.3** |
| Routing | `main: expo-router/entry`, file-based routes under `src/app/` |
| TypeScript | **6.0.3**, `strict: true`, path alias `@/*` → `./src/*` |
| Experiment flags | `typedRoutes: true`, `reactCompiler: true` |
| App identity | `app.json` name/slug `Mobileapp`, scheme `mobileapp` — **placeholder branding** |
| Template leftovers | `src/app/index.tsx`, `src/app/explore.tsx`, demo components (`animated-icon`, `app-tabs`, `web-badge`, `collapsible`, `themed-*`), Expo/React logos, `scripts/reset-project.js`, tutorial `README.md` |
| Licensing | **`LICENSE` is the template's MIT license** — must be replaced or removed for a client/commercial project |
| Agent instruction files | **`AGENTS.md`** + **`CLAUDE.md`** (which imports AGENTS.md) appeared after the 21:55 check. Expo-oriented conventions: `npx expo install` for dependencies, Expo Router routes in `src/app/`, EAS for build/submit/update, CNG (never hand-edit `ios/`/`android/`), and versioned-docs lookup rather than memory. **Reviewed and consistent with this plan** (D12, §9.1 dev-build requirement, §8.5 layout) |
| Version control | **No git repo initialised** |
| Installed packages | `node_modules` present (485 MB, 363 packages) |
| Toolchain present | Node **v22.22.1**, npm **10.9.9**, Python 3.14.4, perl 5.40 |

**Resolved after this check (22 Sep 2026):** the tutorial starter was stripped — `src/app/explore.tsx`, every
demo component (`animated-icon*`, `app-tabs*`, `hint-row`, `web-badge`, `themed-text`/`themed-view`,
`ui/collapsible`, `external-link`), `src/constants/theme.ts`, `src/hooks/*`, `src/global.css`, the Expo/React
logo art and `scripts/reset-project.js` (plus its `reset-project` npm script) are gone, leaving only a blank
`src/app`. That is this table's option 1 with `git init` first: the repo now has an initial commit
(`b475726`). **Current status lives in `README.md`.** Still outstanding: the template `LICENSE`, the
placeholder `app.json` identity, and the Expo-branded icon/splash art (README → Pending). Later the same day
the repo was restructured into the **npm-workspaces monorepo of §8.5** — `apps/mobile` (the moved Expo app),
`apps/api`, `apps/admin`, `packages/shared`, `packages/config` — structure only, no application code.

**Already useful for this plan:** `expo-web-browser` (Clerk hosted auth) and `react-native-gesture-handler`
(Stream Video peer dependency) are already present in the template.

**Required by this plan but not yet installed:** `@clerk/expo`, `expo-secure-store`, `expo-auth-session`,
`expo-crypto`, `@sentry/react-native`, `expo-updates`, `expo-notifications`, `expo-image-picker` or
`expo-camera`, `expo-location`, offline storage (`expo-sqlite`), and (v1.1)
`@stream-io/video-react-native-sdk`.

**Decision needed (not taken unilaterally):**

1. **Keep** the scaffold (recommended), strip it to a blank app via `npm run reset-project`, then rename the
   app identity fields for SBS branding.
2. **Remove** the scaffold and start clean.
3. Leave it untouched until Part B is approved.

**Recommendation: option 1 — executed only after the implementation plan is approved**, with `git init`
and an initial commit as the very first step, since nothing is under version control today.

---

## 1. Business context (verified from sbssrilanka.com, 21 Sep 2026)

SBS.COM OFFICE SOLUTIONS (PVT) LTD — established **2009**, ~**50 employees**, **2,000+ clients**
(banks, hospitals, hotels, apartments, public and private institutions). HQ **#974/7 Pannipitiya Road,
Battaramulla**; branches **Rathnapura** and **Anuradhapura**; overseas office in **Malé, Maldives**
(different legal entity — `osmosisasia.com`). Hotline 24/7.

**Revenue lines**
- Telecommunication: PABX/EPABX, networking, call-centre solutions, Wi-Fi
- Security & surveillance: CCTV, access control, fingerprint machines, tour-guard systems (Hikvision partner)
- Software: web/mobile app development, websites; plus accessories, survey/consultancy

**Service model (this is the part that drives the data model)**
- Complimentary **1-year service** with **3 free services in the first year** after purchase → an
  **entitlement/warranty counter per installed asset** is required.
- **Paid services** at nominal rate; **ongoing maintenance/AMC contracts** for continued support.
- **24/7 hotline** and online service → complaints are **received by a coordinator**, not created by
  the field technician. Also "immediate breakdown service 24/7".
- **Monthly diagnostic reports** and monthly customer phone inquiries → **recurring preventive
  maintenance visits** are a distinct work type alongside breakdowns.
- "Standby goods available at all times" → spare parts / branch stock (later phase).
- Island-wide branches for support; environmental quality verification of customer sites.

**Implications we accepted**
1. What SBS installs are **systems** (CCTV system = NVR + cameras + cabling; PABX = PBX unit +
   extensions). "Product details" is therefore an **asset registry**, not a per-visit free-text note.
2. The **admin panel is v1-critical**: it is the intake/dispatch surface for the hotline, not a
   later-phase management tool.
3. Clients are **institutions**, so a consumer-style client login portal is out of scope for v1.

---

## 2. Problem & opportunity

**Problem today (assumed — §16 A6):** complaints/job cards and attendance live in WhatsApp groups,
phone calls and spreadsheets. Consequences: no reliable attendance record for payroll, no asset
history per customer (who installed what, when, under what warranty), no view of who is where right
now, and preventive-maintenance obligations (free visits, AMC expiry) are tracked in heads and paper.

**What the app must do better than today**
1. Trustworthy technician attendance tied to real jobs (payroll + site proof).
2. A single asset register per customer site with warranty/entitlement state, so "is this customer
   still inside free service, and when are they due a preventive visit?" is answerable in one screen.
3. Dispatch visibility: which technician is on which job, right now, across all offices.
4. Reduce the senior-engineer dependency via remote assistance (video, later phase).

---

## 3. Users & personas

| Persona | Count (est.) | Device | Primary need |
|---|---|---|---|
| **Owner / Super Admin** | 1–2 | Desktop | Oversight, money (AMC/warranty exposure), reports |
| **HO Operations Manager** | 1–3 | Desktop | Dispatch, cross-office coordination, exceptions |
| **Coordinator / Hotline operator** | 1–2 | **PC-first (assumed F8)** | Log complaint, assign technician + branch, SLA watch |
| **Branch In-charge** (Rathnapura, Anuradhapura) | 2–4 | Desktop + phone | Own-office jobs, approve attendance, own reports |
| **Field Technician** | ~30–40 | **Mobile (Android-first assumed F1)**, BYOD assumed (F2) | My jobs today, clock in/out, photos, asset details, history |
| **Senior engineer** (also a technician role) | 1–3 | Mobile | Same + receives remote-assist calls (v1.1) |
| Client contact (bank/hospital staff) | 2,000+ orgs | n/a | **No login in v1.** Receives service via existing channels |

**Primary app users are technicians.** Primary *value* consumers are the owner and branch in-charges.
This asymmetry is why the web admin panel is v1-critical.

---

## 4. Scope

### 4.1 In scope for v1
- **Auth (Clerk)**: invite-only employee provisioning, Sign in with Apple + Google, public sign-up
  **disabled**, immediate revocation on employee deactivation (sessions + push tokens).
- **Onboarding**: guided first-run profile completion with consent acknowledgment.
- **Employee profiles**: name, preferred name, mobile, employee ID/NIC, DOB (HR/statutory purpose),
  photo (ImageKit), home branch/technical office, joined date, designation, **skills/certifications**,
  blood group + emergency contact, push token.
- **Customers, sites, and installed-asset registry** (system level), with photos and install details:
  model number, brand, serial, install date, installing engineer, remarks.
- **Service tickets/complaints**: two intake paths (coordinator-created breakdown tickets;
  technician-created preventive/maintenance visits and surveys), assignment to technician + office,
  status lifecycle, completion flag, complaint type, remarks.
- **Attendance as per-visit job sessions**: travel start → on-site start → end, with GPS + optional
  selfie at clock-in, derived daily attendance, midnight-crossing shift support.
- **Technician history**: own visits, filterable.
- **Admin panel (web)**: manage users and offices, dispatch/assign, cross-office attendance view,
  asset & contract management, reports 1/2/3/6 (see §5), CSV export, audit log.
- **Warranty / AMC entitlement tracking**: warranty start/end, free-visit allowance and usage,
  contract type (warranty / AMC-free / AMC-paid / none), "visits due" and "expiring soon" lists.
- **Offline resilience**: persistent retry queue + local draft of the in-progress visit; app remains
  usable for today's jobs when the network drops.
- **Observability**: Sentry (crashes/perf, PII scrubbed) + business-failure tracking (stuck jobs,
  missing clock-outs, sync queue depth, push failures).
- **i18n framework wired**; English content at launch.
- **Notifications**: job assignment/reassignment, approval outcomes, SLA-at-risk, incoming call (v1.1).

### 4.2 Deferred to v1.1
- **Video + audio calls** (Stream Video/Audio): remote guidance from senior engineers to field staff.
- **AI assistant**: short-question + photo-diagnosis UI; retrieval over SBS's own material via
  pgvector on Neon. **Provider not yet chosen — must not be silently selected.**
- PDF exports and scheduled email/WhatsApp report digests.
- In-app chat with support (**separate product from Stream Video/Audio** — deliberate decision to keep
  WhatsApp/phone in v1).
- Spare-part consumption per visit and technician/branch stock.
- CSV import tooling if the initial data shaping is not ready (see §16 A6).

### 4.3 v2 and beyond (do not over-engineer now)
- Client/B2B portal (AMC compliance reporting for banks/hospitals/hotels).
- Multi-tenant resale to other integrators/dealers (schema is `org_id`-ready from day one).
- Component-level asset serialisation with barcode scanning.
- Maldives entity onboarding, multi-currency, multi-country.
- Payroll/HR system integration, inventory/procurement, SLA penalty automation.

### 4.4 Explicitly OUT of v1
- Public self-registration.
- Client logins / client portal.
- Payroll computation, salary, bank details.
- Continuous location tracking (location is captured **only** at explicit actions).
- Maldives operations.
- App store public release (internal distribution planned).

---

## 5. Locked decisions (L1–L9 + technical decisions D1–D18)

| # | Decision | Rationale / trade-off accepted |
|---|---|---|
| **L1** | **Two surfaces**: Expo/React Native app for technicians + **web admin panel** for admins/coordinators | Field staff get a real mobile app; reports/tables/exports are 3–5x faster to build on web. Cost accepted: two codebases (mitigated by one repo, one API, one language) |
| **L2** | Ticket intake from **both** directions, with a `source` field; **admin panel is v1-critical** | Matches the 24/7 hotline reality; prevents duplicate paper process |
| **L3** | **Asset registry at system level** (Customer → Site → Installed System), components attach later | Makes warranty/entitlement and service history possible; avoids per-visit free text |
| **L4** | **Attendance = per-visit job session**; daily attendance is **derived** | Honest model for field work; enables labour-hour per customer for AMC billing |
| **L5** | **`org_id` on every table**; SBS-only v1; **Maldives excluded**; nothing hardcoded to a country | ~5% extra work now; avoids a full rewrite if the product is ever resold |
| **L6** | **Contract/warranty entitlement tracking in v1** (minimal) | This is the revenue/retention feature; it is what makes the owner open the dashboard |
| **L7** | **Video calls + AI assistant → v1.1** | Highest engineering cost, lowest v1 value. Note: Stream service cost is negligible at this scale (§8) |
| **L8** | **Offline = retry queue + local draft**, not full offline-first | Fast to build, feels responsive; accepted risk: dead-zone clock-out is delayed (mitigated by device-timestamp capture at action time) |
| **L9** | Office-scoped visibility for staff, island-wide for HO admins, cross-branch assignment allowed with audit log | Matches how integrators actually work; prevents lateral data leakage |
| **D1** | **DECOUPLED (revised)**: the backend is a standalone **Node.js + Express.js + TypeScript** service (`apps/api`) exposing a REST API. No business logic in the frontends. | Decouples release cadence (the API can deploy without shipping an app build), allows a plain long-running Node process (transactions, cron, report/PDF generation) that a serverless frontend framework handles poorly, and keeps **one API for two clients**. Cost accepted: three deployables and explicit API contracts → see D15/D17 and risk R21 |
| **D2** | ORM: **Drizzle ORM 0.45.3 stable** (pin ≥ 0.45.3 — 0.45.2 carried a SQL-injection fix); not the 1.0 RC | Lean, SQL-shaped; v1 RC migration is a known future task |
| **D3** | API style: **REST + JSON, versioned under `/v1`, validated with Zod** (no tRPC/GraphQL) | REST is the common denominator for a decoupled API consumed by RTK Query on two clients. Zod schemas in `packages/shared` are the single source of record shapes (D15/D18) |
| **D4** | Client→API auth: **Clerk session token (short-lived JWT) sent as `Authorization: Bearer` and verified per request in Express middleware** via `@clerk/express` (`clerkMiddleware()` + `getAuth(req)`) | No long-lived API keys on devices. A 401 is handled centrally in the RTK Query `baseQuery` (refresh via Clerk, retry once) — never a silent per-screen failure |
| **D5** | Neon: **pooled/HTTP driver**, **branching** for dev/staging, **pgvector enabled from day one** | Branching = safe environments; pgvector = home for AI retrieval with no new vendor |
| **D6** | **Business logic lives server-side only** — especially warranty/entitlement maths | If entitlement logic lives on the device, technicians can fake warranty status |
| **D7** | Provisioning: **admin-created employees + invite-link binding to a one-time token**, public sign-up disabled | Avoids the Apple "Hide My Email" and mismatched-email onboarding failures |
| **D8** | Attendance **approval workflow** (technician submits → branch in-charge approves → post-approval edits require a reason + audit log) *conditional on F3* | If attendance feeds payroll it is a system of record, not a log |
| **D9** | i18n framework installed on day one even if only English ships | Retrofitting i18n means re-touching every string and layout |
| **D10** | Photos: **client-side compression (~200–400 KB) before ImageKit upload**; upload on Wi-Fi or explicit consent | Sri Lankan mobile data is metered and expensive for staff |
| **D11** | Distribution: **internal** (TestFlight + Play internal track) for v1 | No store review delays or public privacy-policy exposure while stabilising |
| **D12** | Expo **SDK 57 stable** (58 is beta) with **EAS Build + dev client from day one** | Native Apple/Google sign-in requires a dev build anyway (not Expo Go), so Stream later is a config job, not a pipeline rebuild |
| **D13** | Web admin frontend stays **Next.js 16.3.3 but as a *client-rendered* consumer of the Express API** — no route handlers, no server-side data fetching, no RSC data layer | Keeps the already-chosen framework and file-based routing while removing the monolith coupling. Alternative considered: Vite + React Router SPA (lighter, but a framework swap that was not requested) — open question §17.15 |
| **D14** | **Redux Toolkit 2.12.0 + RTK Query in BOTH clients** (Expo app **and** admin panel). RTK Query owns *all* server state/caching; RTK slices own session, UI, drafts and the outbox. **No ad-hoc `useEffect`+`fetch`, no per-screen axios instance, no bespoke cache.** | One caching/invalidation model across two apps, generated hooks, and typed endpoints from a shared contract. Cost: both apps carry a store, and contributors must follow RTK conventions (a convention lint rule is advisable) |
| **D15** | **Monorepo** (npm workspaces) — `apps/api`, `apps/mobile`, `apps/admin`, `packages/shared` (Zod schemas + TS types + constants), `packages/config` (tsconfig/eslint presets) | Decoupling two clients from one API without a shared contract is how APIs silently drift. Trade-off: monorepo tooling overhead and stricter CI discipline |
| **D16** | Offline/queue: a **custom RTK Query `baseQuery` wrapper** that captures failed *mutations* into a persisted `outbox` slice and replays them with **idempotency keys**; `extractRehydrationInfo` + `redux-persist` persist the RTK Query cache on mobile. Queries retry; mutations queue. | Implements L8 with one library instead of a bespoke sync engine. Redux documents the caveat that persisting an api slice can serve **stale** data, and recommends it mainly for native apps with no browser cache — so the persisted cache is read-through with a **short `keepUnusedDataFor`**, and attendance is always re-validated server-side |
| **D17** | API hosting: a **long-running container** — **Railway** (Hobby $5/mo minimum usage incl. $5 credits) or **Render** (Hobby workspace $0 + compute, e.g. **$7/mo 512 MB** or **$25/mo 2 GB**) — **not serverless functions**, because pooling, cron and report generation need a persistent process | Predictable cost/behaviour for a Node service; Neon stays pooled. Trade-off: one more service to monitor → health checks, restart policy and uptime alerting required (risk R22) |
| **D18** | API contract: **OpenAPI 3 spec generated from the Zod schemas**, consumed as **shared TS types (required in v1)** and optionally as `@rtk-query/codegen-openapi` generated hooks (v1.1 convenience) | Prevents the classic decoupled-architecture failure: frontend types diverging from the API. Codegen is not a v1 dependency |

---

## 6. Roles, permissions and core journeys

### 6.1 Proposed permission matrix (needs client sign-off — see §17)

| Capability | Owner | HO Ops Manager | Coordinator | Branch In-charge | Technician |
|---|---|---|---|---|---|
| See all offices' data | yes | yes | tickets only | own office only | no |
| Create + assign tickets | yes | yes | yes | yes (own office) | self-created visits |
| Close / reopen ticket | yes | yes | yes | yes (own office) | close own, subject to approval |
| **Edit attendance after the fact** | yes | yes | no | yes (own office) | no |
| See contract / warranty value (LKR) | yes | yes | default: no | default: no | no |
| Manage users & offices | yes | limited | no | no | no |
| See customer contact details | yes | yes | yes | yes | assigned jobs only |
| Reports / export | yes | yes | limited | own office | own history only |
| Start a video call (v1.1) | yes | yes | yes | yes | yes |

**Open sub-decisions:** (a) does attendance require formal approval (D8) — depends on F3;
(b) may technicians see colleagues' visits within their own office (default: yes);
(c) does the Coordinator use a PC or a phone (F8) — a phone means the admin panel needs a mobile-
responsive design, which is extra work that must be planned, not discovered.

### 6.2 Core user journeys

**J1 — Employee onboarding (invite path)**
1. Admin creates the employee record (name, branch, role, skills, mobile) in the admin panel.
2. System issues a Clerk invitation (email or SMS link carrying a **one-time token**).
3. Employee installs the app, opens the link, completes Sign in with Apple / Google.
4. Account binds to the **invite token**, not to the email address (design decision D7).
5. First-run onboarding: confirm/complete profile fields, upload photo, set
   **skills/certifications**, **acknowledge the location-capture notice** (timestamped consent).
6. State becomes `active`; the technician lands on "My Jobs".

**J2 — Coordinator creates a breakdown complaint (admin panel)**
1. Coordinator searches/creates the **customer** and **site**; picks the **installed asset** (or notes
   "new site survey").
2. Selects complaint type, priority, and (optionally) whether it falls under warranty/AMC —
   the system shows **remaining free visits / contract status** so the coordinator sees commercial impact.
3. Assigns a technician (optionally branch-scoped, or HO-wide).
4. Technician receives a push; accepts (cross-office) or auto-assigns (own office) per the §17 open question.
5. Status: `new → assigned → accepted → travelling → on_site → completed → (approved) → closed`.

**J3 — Technician works a job (the core loop)**
1. Technician opens "My Jobs" (works offline from cached data).
2. Taps **Start travel** → session starts; device timestamp captured immediately.
3. Taps **Arrived / start on-site** → GPS captured; optional site selfie.
4. Works the issue; optionally consults the AI assistant (v1.1) via short questions + photos.
5. Records outcome: complaint type confirmation, work done, parts used (v1.1), remarks,
   before/after photos (compressed → ImageKit).
6. Updates/creates **asset records** if equipment was installed/replaced: model, brand, serial,
   install date, installing engineer, remarks.
7. Taps **Complete** → marks the ticket complete, **clock-out** closes the session
   (payable/derivable), syncs when connectivity allows; failed submissions enter the retry queue.

**J4 — Preventive maintenance / free-service visit**
Technician (or coordinator) creates a visit against an asset; system shows entitlement position
(free visits remaining, contract type, expiry) so both the technician and the office understand what
can be charged. Recurring-schedule generation is **not** in v1 — visits are created manually from the
"visits due" list.

**J5 — Technician checks history**
Own visit list with filters (date, customer, complaint type, status) → opens a visit → sees the full
asset/service timeline including photos and who did what.

**J6 — Owner reviews Monday morning**
Logs into the admin panel → attendance summary per technician (payroll input) → open/stuck jobs by
office → warranty/AMC exposure (free visits exhausted, contracts expiring) → exports CSV.

**J7 — Remote assistance (v1.1)**
Senior engineer receives a ringing call pushed via FCM/APNs; junior technician shares live video from
site for diagnosis. ⚠️ Only 1–3 senior engineers exist, so this feature's receiving end is a
bottleneck — treat it as a capability, not a guarantee.

### 6.3 Report set for v1 (proposed — requires sign-off)

| # | Report | Consumer | v1 |
|---|---|---|---|
| 1 | Attendance summary per technician per month (present days, hours, late/absent) | Accounts / payroll | on-screen + CSV |
| 2 | Job closure: opened vs completed vs open, by office and complaint type, avg resolution time | Owner / HO | on-screen + CSV |
| 3 | Warranty & AMC exposure: free visits exhausted, contracts expiring in 30/60 days | Owner / sales | on-screen + CSV |
| 4 | Technician utilisation: visits, travel vs on-site time, unaccepted jobs | HO Ops | on-screen (v1.1 CSV) |
| 5 | Customer service history timeline (with photos) | Branch / owner | on-screen |
| 6 | Stuck jobs: open > N days with no activity | HO Ops | on-screen + CSV |

Deferred: PDF rendering and scheduled email/WhatsApp digests (v1.1).

---

## 7. Draft data model

Conventions: every business table carries `org_id` (L5) plus `created_at`, `updated_at`,
`created_by`, `updated_by`. Soft-delete (`deleted_at`) for anything referenced by history.
Timestamps are stored **UTC**; the local date is always derived, never stored as text.
Identifiers are UUIDs (or NanoIDs where a short human-readable reference is useful, e.g. ticket numbers).

### 7.1 Core entities and fields (draft)

| Entity | Key fields | Relationships / constraints |
|---|---|---|
| **organizations** | name, country, timezone, currency, logo | Root tenancy. Single row for v1. |
| **offices** *(branches/technical offices)* | org_id, name, code, type (ho/branch), address, lat/lng, phone, timezone, is_active | 1 org → N offices. Referenced as `assigned_office_id` throughout. |
| **employees** | org_id, office_id, clerk_user_id (unique), employee_code (unique per org), full_name, preferred_name, mobile (unique per org), nic (unique), dob, joined_date, designation, role, skills[], photo_file_id, blood_group, emergency_contact, status (invited/active/suspended/left), consent_accepted_at, consent_version | 1 office → N employees. `status` drives access revocation. |
| **employee_invites** | employee_id, token_hash (one-time), channel (email/sms), expires_at, used_at | Binds a Clerk identity to a pre-created employee (D7). |
| **customers** | org_id, name, type (bank/hospital/hotel/corporate/govt/other), billing_address, primary_contact_id, owning_office_id, notes | Institutional clients. Duplicate detection on name+phone. |
| **customer_contacts** | customer_id, name, designation, mobile, email, is_primary | Multiple per customer. |
| **sites** | customer_id, org_id, name, address, lat/lng, owning_office_id, access_instructions, site_hours, environment_notes | A bank HQ has many branch sites — **this level is mandatory, not optional**. |
| **assets** *(installed systems)* | site_id, category (cctv/pabx/access_control/fingerprint/network/other), brand, model_no, serial_no, installation_date, installed_by_employee_id, remarks, status (active/removed/replaced), photo_file_ids[] | System-level registry (L3). Components deferred. |
| **contracts** *(entitlement)* | asset_id (or customer_id), org_id, type (warranty/free_service/amc_paid/amc_free/none), start_date, end_date, free_visits_allowed, free_visits_used, renewal_status, notes | Drives the "visits due / expiring" report. `free_visits_used` is **server-computed**, never client-supplied (D6). |
| **complaint_types** | org_id, name, category, is_active, default_priority | Configurable lookup so the list can evolve without a migration. |
| **tickets** *(complaints)* | org_id, ticket_no (sequence per org), customer_id, site_id, asset_id (nullable), source (hotline/technician/admin), complaint_type_id, priority, description, status, assigned_employee_id, assigned_office_id, sla_due_at, created_by, completed_at, closed_at, resolution_notes | 1 site → N tickets. Assignment + status drives the dispatch loop. |
| **visits** *(job sessions = the attendance record)* | org_id, ticket_id (nullable for non-ticket work), employee_id, status, device_started_at, travel_started_at, arrived_at, on_site_started_at, ended_at, server_received_at, device_clock_skew_ms, clock_in_lat/lng, clock_out_lat/lng, gps_accuracy_m, selfie_file_id, work_performed, remarks, completion_flag, approval_state (pending/approved/rejected), approved_by, approved_at, edit_reason, idempotency_key (unique) | **The heart of the system.** Multiple visits per ticket allowed. Cross-midnight sessions attribute to the shift-start date. |
| **visit_photos** | visit_id, asset_id (nullable), file_id (ImageKit), type (before/after/evidence/site), caption, captured_at, uploaded_at, width/height/bytes | Compressed client-side before upload (D10). |
| **attendance_days** *(derived)* | employee_id, work_date, office_id, first_start_at, last_end_at, total_session_minutes, travel_minutes, on_site_minutes, visit_count, status (present/absent/partial/holiday/leave), payroll_flag, computed_at | Materialised nightly + on demand. Regenerable from `visits` — safe to rebuild. |
| **device_tokens** | employee_id, platform, token, app_version, last_seen_at, revoked_at | Revoked immediately when an employee is deactivated. |
| **audit_log** | org_id, actor_employee_id, entity, entity_id, action, before, after, reason, ip, user_agent, at | Immutable. Required for attendance edits (D8) and warranty changes. |
| **notifications** | employee_id, type, payload, ticket_id/visit_id, created_at, read_at, delivery_state | In-app record; push delivery state tracked separately. |
| **ai_conversations / ai_messages** *(v1.1)* | employee_id, ticket_id (nullable), role, content, attachments, tokens_in/out, model, created_at | Needed for cost attribution per office. |
| **call_sessions** *(v1.1)* | stream_call_id, initiator, participants[], ticket_id (nullable), started_at, ended_at, duration | Ties a call to the job for reporting. |

### 7.2 Validation / uniqueness rules
- `employees.clerk_user_id` unique; `employees.nic` unique; `employees.mobile` unique per org.
- `employees.employee_code` unique per org — the **stable human key** for imports and payroll exports.
- `visits.idempotency_key` unique — makes replaying a queued submission safe (critical, see §10).
- `visits.ended_at >= visits.travel_started_at >= visits.device_started_at` enforced in app + DB.
- A visit cannot be `ended` without `on_site_started_at` (guards against accidental single-tap sessions).
- `contracts.free_visits_used <= contracts.free_visits_allowed`; exceeding should be flagged, not blocked
  (real life: a fourth free visit happens; finance needs to see it).
- A technician cannot hold two open visits simultaneously (warn + require reason to override).
- Ticket cannot be marked complete without at least one visit marked complete.

### 7.3 Source of truth
- **Postgres (Neon) is the only source of truth.** The app holds a cache for offline read and a
  durable draft/retry queue for writes. Nothing authoritative lives only on a device (L8/D6).
- ImageKit holds binaries; Postgres holds `file_id` references and metadata. Orphaned file cleanup is a
  scheduled maintenance job.
- Clerk holds identity; Postgres holds the *employment* record. They are joined by `clerk_user_id`,
  and the employment record is authoritative for role and office.

---

## 8. Architecture, stack, integrations and repository structure

### 8.1 Shape (decoupled: two clients, one API)

```
         TECHNICIAN                         COORDINATOR / IN-CHARGE / OWNER
  Expo SDK 57 + React Native              Next.js 16.3.3 admin
  Redux Toolkit store                     (client-rendered, RTK Query)
   + RTK Query (all server state)         Redux Toolkit store
   + outbox slice (offline writes)         + RTK Query (all server state)
        |                                              |
        |  Authorization: Bearer <Clerk JWT>           |  Authorization: Bearer <Clerk JWT>
        v                                              v
  +--------------------------------------------------------------------+
  |           API  --  Node.js + Express.js 5 + TypeScript             |
  |           apps/api   (stateless, long-running container)           |
  |                                                                    |
  |  clerkMiddleware() -> getAuth(req)     RBAC + org/office scoping   |
  |  Zod request validation                idempotency keys            |
  |  audit log                             /v1 REST + /healthz         |
  |  business logic: entitlements, SLA, derived attendance, reports    |
  |  image-upload auth signing             cron worker (reports, cleanup)|
  +--------------------------------------------------------------------+
        |                 |                  |                 |
        v                 v                  v                 v
   Neon Postgres      ImageKit            Sentry         Stream (v1.1)
   (Drizzle ORM,      media / CDN         errors         Video / Audio
    pgvector)                             perf           + FCM/APNs ringing
```

**Rules of the decoupled design**
1. **One API, two clients.** Both clients talk *only* to `/v1` over HTTPS. No client reaches Postgres,
   ImageKit private keys, Stream secrets or any other service directly.
2. **Express owns all business logic** — entitlements, SLA, attendance derivation, report aggregation (D6).
   Clients collect and render; they never compute money- or payroll-affecting values.
3. **RTK Query owns server state in both clients** (D14): cache lifetime, invalidation tags, polling and
   optimistic updates. Redux slices own only local, UI, session and **outbox** state.
4. **`packages/shared` is the contract** (D15): request/response shapes are defined once in Zod and used by
   Express validation and by both TypeScript clients.
5. **The API is stateless** — Clerk tokens carry identity, there are no server sessions, and scaling out is
   trivial (even though SBS volumes never require it).

### 8.2 Versions verified 21 Sep 2026

| Component | Version / package | Notes |
|---|---|---|
| Mobile framework | **Expo SDK 57** (stable) | SDK 58 is in beta — do not adopt mid-build |
| Navigation | Expo Router (file-based) | Included in SDK 57 template |
| Auth (mobile) | **`@clerk/expo`** + `expo-secure-store`, `expo-auth-session`, `expo-crypto`, `expo-web-browser` | Clerk docs updated 18 Sep 2026 |
| Auth (admin ops) | Clerk backend SDK (`clerkClient`) | Server-side use for **invitations + user management** (D7) — not for authorization decisions |
| Error monitoring | **`@sentry/react-native` 8.27.0** | Requires Expo SDK 50+; Expo Router tracing, OTA context, Session Replay, EAS dashboard integration |
| API runtime | **Node.js 22 LTS + Express.js 5.2.1** (Express 4.22.2 is still maintained; greenfield → v5) | Express 5 auto-forwards rejected promises from `async` handlers to error middleware, so `express-async-handler` wrappers are unnecessary. `path-to-regexp` syntax changed in v5 |
| API language | **TypeScript (strict)** + **Zod** for runtime validation | TS types are erased at runtime; Zod is the real guard and the source of the OpenAPI spec (D18) |
| API auth middleware | **`@clerk/express`** — `clerkMiddleware()` + `getAuth(req)` | Clerk docs updated 21 Sep 2026; supports cookie **and** header session JWTs, so mobile uses the header |
| Admin frontend | **Next.js 16.3.3** (Active LTS), client-rendered consumer of the API | 15.5.24 is Maintenance LTS. Next.js ships **monthly security releases** — budget a patch cadence |
| Client state & API | **Redux Toolkit 2.12.0 + RTK Query** in both clients (`react-redux` pinned at install) | RTK Query persistence via `extractRehydrationInfo` + `redux-persist`, **mobile only** |
| ORM | **Drizzle ORM 0.45.3** + drizzle-kit — ⚠️ **disputed by C5** (the requested `apps/api` tree names Prisma + `PrismaPg`) | Pin >= 0.45.3 (0.45.2 carried a SQL-injection fix); `v1.0.0-rc.4` exists — do not adopt the RC. If Prisma wins instead: latest stable tag **7.10.0**, **8.0 in RC** (`v8.0.0-rc.11`, 13 Sep 2026), and pgvector needs raw SQL / TypedSQL |
| DB | Neon Postgres (serverless, pooled/HTTP driver) | Enable **pgvector** and **branching** |
| Media | ImageKit | Client-side compression before upload (D10) |
| Calls (v1.1) | `@stream-io/video-react-native-sdk` v1 | Native module: **minSdk 24**, 16 KB page-size compliance needs SDK **>= 1.21.1**; needs GestureHandlerRootView; test on real devices only |
| Push | FCM (Android) + APNs (iOS) via Expo notifications | Required for job alerts and (v1.1) call ringing / CallKit |
| Build & release | EAS Build + EAS Update (`expo-updates`) | Dev client required; runtime-version policies gate OTA |

### 8.3 Integration responsibilities (one job each — no overlap)

| Service | Sole responsibility | What it must NOT be used for |
|---|---|---|
| **Clerk** | Identity, sessions, invitations, OAuth (Apple/Google) | Storing employment data or roles (Neon is authoritative) |
| **Neon Postgres** | All business data + audit log + pgvector embeddings (v1.1) | Binary storage |
| **ImageKit** | Image/video binaries, transforms, delivery CDN | Business records, access control decisions |
| **Sentry** | Crash/perf diagnostics, release health | PII (explicitly scrub; vendor sample shows `sendDefaultPii: true` — we must set it **off**) |
| **Stream Video/Audio** | Real-time audio/video calls (v1.1) | Messaging (Stream **Chat** is a separate paid product, deliberately not bought) |
| **FCM/APNs** | Push delivery incl. ringing pushes | Scheduling / business logic |
| **Railway or Render** | Hosting the **Express API** container (long-running process, cron, report generation) | Being a database (Neon is external); CDN work (ImageKit does that) |
| **Vercel** | Hosting the **Next.js admin frontend only** | Running the API — it is a separate service now |
| **EAS** | Native builds + OTA JS updates | Changing native code over the air (impossible by design) |
| **LLM provider (v1.1, TBD)** | Assistant responses + photo diagnosis | Being the source of truth for asset/contract state |

### 8.4 Verified pricing / limits (vendor pages, 21 Sep 2026)

| Service | Verified figures | Estimated v1 cost |
|---|---|---|
| **Neon** | Free: 100 projects, **100 CU-hrs/mo per project**, **0.5 GB storage per project**, up to 2 CU, scale-to-zero after 5 min, 10 branches/project, 5 GB object storage, 1M function invocations. Launch: **$0.106/CU-hr**, **$0.35/GB-mo**, typical ~$15/mo | $0–15 |
| **ImageKit** | Free: **20 GB bandwidth, 3 GB storage (uploads stop at the cap), 2 users**, 500 video units. Lite **$9/mo**: 40 GB bw + **$0.50/GB** overage, 10 GB storage + **$0.10/GB** overage, 3 users. Pro $89/mo | $9–15 |
| **Stream Video/Audio** | **$100 usage credit every month** on all tiers; **333,000 free audio participant-minutes**; then **$0.30 per 1,000 participant minutes**; video priced by consumed resolution (Dynascale) | **$0** |
| **API host — Railway** | **Hobby $5/mo minimum usage**, includes $5 of monthly credits; up to 48 vCPU / 48 GB per service; metered memory **$0.00000386/GB/s**, CPU **$0.00000772/vCPU/s**, egress **$0.05/GB**. The Free plan ($1/mo, 1 vCPU / 0.5 GB) is not production-suitable | ~$5–10/mo |
| **API host — Render** | Hobby workspace **$0/mo + compute**: 512 MB web service **$7/mo**, 2 GB / 1 CPU **$25/mo**, 4 GB **$85/mo**; Hobby includes 5 GB bandwidth; Pro workspace $25/mo + compute; SSD $0.25/GB/mo | ~$7–25/mo |
| **Vercel (admin frontend)** | Hobby is **non-commercial only** → a business project requires **Pro** | ~$20/mo |
| **Apple / Google** | $99/yr + $25 one-time | ~$8/mo amortised |
| **Firebase (FCM)** | Free | $0 |
| **Clerk / Sentry / EAS** | Free tiers plausibly cover ~50 users, but limits were **not verified in this pass** | $0–~150 **VERIFY** |
| **AI assistant (v1.1)** | Claude **Haiku 4.5 $1/$5 per MTok**, **Sonnet 5 $2/$10** (introductory pricing is now standard). Prompt-cache hits cost **0.1x**; newer tokenizer on 4.7+ models yields ~**30% more tokens** for the same text | **~$135/mo (Haiku) to ~$270/mo (Sonnet)** at 50 techs x 20 exchanges/day |

> **Key cost insight:** the AI assistant is the only line item that can exceed every other service combined
> (10–20x). It must therefore ship with **per-user daily token caps + a hard monthly ceiling**, and it is
> the **only** feature allowed to degrade visibly when a limit is hit. Everything else must fail silently
> and gracefully (queued, retried, never losing a technician's work).

### 8.5 Repository and folder structure (proposed)

**Monorepo, npm workspaces (D15)** — one repo, three deployables, one shared contract.

> **Status (22 Sep 2026): this tree now exists.** Folders, workspace manifests, shared presets and
> per-workspace READMEs are in place; **no application code has been written yet**, and the dependencies of
> `apps/api` / `apps/admin` / `packages/shared` are not installed (blocked partly on C5/C6 below).

```
sbs-mobileapp/
├─ apps/
│  ├─ api/        # Node + Express.js 5 + TypeScript   ->  Railway / Render
│  ├─ mobile/     # Expo SDK 57 + RTK / RTK Query     ->  EAS Build + EAS Update
│  └─ admin/      # Next.js 16.3 (client-only) + RTK  ->  Vercel
├─ packages/
│  ├─ shared/     # Zod schemas + inferred TS types + enums + constants (THE CONTRACT)
│  └─ config/     # shared tsconfig / eslint / prettier presets
├─ .github/workflows/   # CI: typecheck, test, migrate, deploy
├─ package.json         # workspace root scripts: dev:api, dev:mobile, dev:admin
└─ PLAN.md
```

**`apps/api` — the Express service (client-specified 4-layer structure)**

> ⚠️ **Structure specified by the client (21 Sep 2026).** It replaces the earlier vertical-slice layout
> (`modules/<domain>/{routes,service,repo,schema}.ts`). Two items in this tree **conflict with decisions already
> locked** — see **C5 (Prisma vs Drizzle)** and **C6 (local login vs Clerk)** at the end of this section.

```
apps/api/
└─ src/                                        # ── 4-LAYER ARCHITECTURE (DDD-style naming)
   ├─ index.ts                                 # ENTRY POINT (app bootstrap)
   │
   ├─ api/                                     # ── LAYER 1: HTTP / ROUTING 
   │  ├─ dashboard.ts                          # Router → GET /api/dashboard
   │  └─ middlewares/
   │     ├─ authentication-middleware.ts       # isAuthenticated + AuthRequest + JwtPayload types
   │     ├─ global-error-handling-middleware.ts# 4-arg Express error handler
   │     └─ validate.ts                        # Zod schema → 400 validation middleware
   │
   ├─ application/                             # ── LAYER 2: BUSINESS LOGIC (a.k.a. services)
   │                               
   │
   ├─ domin/                                   # ── LAYER 3: DOMAIN (client’s spelling — see C9)
   │  ├─ dtos/
   │  ├─ errors/
   │  │  ├─ app-error.ts                       # AppError base + mapStatusToCode()
   │  │  ├─ validation-error.ts                # 400
   │  │  └─ forbidden-error.ts                 # 403 (currently unused)
   │  └─ utils/
   │     └─ response.ts                        # sendSuccess() / sendError() envelopes
   │
   └─ infrastructure/                          # ── LAYER 4: EXTERNAL SYSTEMS
      └─ db.ts                                 # PrismaClient + PrismaPg adapter, connectDB()
```

> **Note (client request, 21 Sep 2026):** `domin/errors/unauthorized-error.ts` was **removed** — not suitable
> for this project. **401 responses still exist**: they are raised by `api/middlewares/authentication-middleware.ts`
> through the **`AppError` base** (`mapStatusToCode()` maps the status to a code), so no dedicated class is needed.
> `forbidden-error.ts` (403) is kept but currently unused — **flag it if it should go the same way.**

**Dependency direction (never reversed):**
```
index.ts → api → application → domin
                     ↓
               infrastructure (db)
```

**Layer rules (what keeps this structure honest after month six)**
1. `api/` may import `application/` and `domin/` — **never `infrastructure/` directly** — and holds no business rules.
2. `application/` owns the logic and is **the only layer allowed to reach the database** (through `infrastructure/db.ts`).
3. `domin/` is pure: DTOs (Zod), error classes, response helpers. No Express types, no DB imports, no `process.env`.
4. `infrastructure/` knows nothing about HTTP; it exports clients/connections only.
5. `index.ts` is bootstrap only: validate env → connect DB → mount routers → listen → graceful shutdown.
6. **File names mirror across layers** (`api/task.ts` ↔ `application/task.ts` ↔ `domin/dtos/task.ts`).
   This convention is the only thing that makes a horizontal layer layout navigable.

*Trade-off accepted:* horizontal layers (this) are easier to onboard and enforce than vertical slices, but
`application/` grows into the largest folder. Revisit the split if the domain passes ~15 modules.

**Mapping the SBS domain into these four layers.** The tree above uses generic example names (`task`,
`dashboard`). Our domain maps onto the same conventions with mirrored file names:

| Layer | SBS files (same naming convention as the example tree) |
|---|---|
| `api/` | `employees.ts` (CRUD, invites, skills) · `offices.ts` · `customers.ts` (customers + sites) · `assets.ts` (installed systems) · `contracts.ts` (warranty/AMC) · `tickets.ts` (complaint intake, assignment, status) · **`visits.ts`** (attendance/job sessions — the core) · `media.ts` (ImageKit upload-auth signing) · `reports.ts` · `notifications.ts` (device tokens, push fan-out) |
| `application/` | mirrored: `visits.ts`, `tickets.ts`, `customers.ts`, `assets.ts`, `contracts.ts`, plus `entitlements.ts` (warranty / free-visit maths — **server-only**, D6), `attendance.ts` (daily derivation), `reports.ts`, `notifications.ts`, and `seed.ts` extended to seed offices + complaint types |
| `domin/dtos/` | `visits.ts`, `tickets.ts`, `assets.ts`, `contracts.ts`, `employees.ts`, `reports.ts` (Zod + inferred types) |
| `domin/errors/` | `validation-error.ts` (400) + `forbidden-error.ts` (403, unused) **+** `not-found-error.ts` (404) **+** `conflict-error.ts` (409, for idempotency replays). **401 is raised via the `AppError` base** by the auth middleware — no dedicated class |
| `infrastructure/` | `db.ts` (as specified) **+** the gaps below |

**Gaps in the specified tree — each needs a home before coding starts**

| Gap | Why it matters | Proposed placement |
|---|---|---|
| **Env validation** | The previous layout had `config/env.ts` failing fast on a missing `DATABASE_URL`/Clerk keys; this tree has no home for it | `infrastructure/config.ts`, imported only by `index.ts` |
| **Migrations** | §13 requires migrations to run before the API takes traffic | `prisma/migrations/` if Prisma wins → **blocked on C5** |
| **Generated DB client** | Prisma 7+ recommends an explicit output path | `src/generated/prisma/` (git-ignored, generated in CI) |
| **Scheduled work** | §10.1 needs cron: derived attendance, SLA sweeps, orphaned-media cleanup | `infrastructure/scheduler.ts` + `application/jobs/*.ts` (or a separate worker later) |
| **OpenAPI output (D18)** | Spec generated from Zod for docs + the CI contract check | `openapi/` beside `src/` |
| **Idempotency keys** | Must survive restarts — a single container cannot dedupe replay in memory | an `idempotency_keys` table reached through `infrastructure/db.ts` |
| **Tests** | Not in the tree, but §14 requires them | colocated `*.test.ts` **or** `tests/` — pick one now, not later |

**⚠️ Conflicts introduced by this tree — registered, deliberately NOT resolved silently** (repeated in §17)

- **C5 — ORM.** The tree specifies `PrismaClient` + `PrismaPg`; **D2 locks Drizzle 0.45.3**, and §13 says
  `drizzle-kit migrate`. Moving to Prisma means the data model becomes `schema.prisma`, migrations become
  `prisma migrate`, and **pgvector has no first-class type** (raw SQL / TypedSQL instead) — which matters for
  the v1.1 AI retrieval work. Verified 21 Sep 2026: `@prisma/adapter-pg` with `PrismaPg({ connectionString })`
  is the documented adapter pattern; latest stable tag is **7.10.0** while **8.0 is in RC** (`v8.0.0-rc.11`,
  13 Sep 2026) even though the docs already default to v8 — **confirm the pin at install time.** Note that
  Prisma is *more* viable now than under the original serverless assumption, since D17 gives a long-running
  container.
- **C6 — Identity (the serious one).** `POST /api/auth/login` + `application/auth.ts`
  (`bcrypt.compare` + `jwt.sign`) + `seedAdminUser(admin@test.com / 123456)` describes a **self-managed
  credential system**. That contradicts **D4/D7** (Clerk owns identity; invite-only provisioning; Sign in with
  Apple/Google; public sign-up disabled). It would add password storage, hashing, reset and MFA surface, a
  second source of identity, and a seeded default password that must never exist outside local development.
- **C7 — DTO ownership.** `domin/dtos` vs `packages/shared` (**D15** = the cross-client contract). Proposed
  resolution: `packages/shared` stays the single definition, `domin/dtos` imports/re-exports from it, and
  API-only shapes live in `domin/dtos` alone.
- **C8 — `api/auth.ts` semantics.** If Clerk stays, that router is invite-acceptance / session bootstrap,
  **not** login — so the file comment should change with it.
- **C9 — `domin/` spelling.** You flagged it yourself. A misspelled top-level folder is permanent noise in
  every import path and in code review, and renaming later touches every file. **Recommend `domain/` now —
  cost is zero.** Kept as `domin/` as instructed pending your call.

**`apps/mobile` — the Expo app (where the existing scaffold belongs)**
```
apps/mobile/
├─ src/
│  ├─ app/                  # expo-router routes (the scaffold layout, kept)
│  │  ├─ (auth)/           # sign-in, invite acceptance, onboarding
│  │  └─ (app)/            # my-jobs, visit session, history, profile
│  ├─ store/                # REDUX LIVES HERE
│  │  ├─ index.ts          # configureStore + persistor + setupListeners
│  │  ├─ baseQuery.ts      # fetchBaseQuery + Clerk token + 401 refresh + offline capture
│  │  ├─ api.ts            # createApi: tagTypes + endpoints (shared types)
│  │  ├─ outbox.ts         # persisted mutation queue (replay + idempotency keys)
│  │  └─ slices/{auth,ui,drafts,sync}
│  ├─ features/{jobs,visits,assets,history,profile}/
│  ├─ components/ui/        # design-system primitives
│  ├─ lib/{i18n,storage,location,compress,permissions}
│  └─ theme/
└─ app.config.ts             # EAS channels, runtimeVersion, permissions, plugins
```

**`apps/admin` — mirror of the same store shape** (`store/api.ts`, `store/slices/{auth,ui,filters}`) with
pages under `src/app/`, but **no outbox** (admins are assumed online).

**Contract flow:** Zod schema in `packages/shared` → Express validation → inferred TS types in both clients
→ (v1.1, optional) RTK Query hooks generated by `@rtk-query/codegen-openapi` from `openapi/`.

**⚠️ The stray scaffold from §0.1 maps to `apps/mobile`** — **done (22 Sep 2026):** it was reset to a blank
`src/app` (so `npm run reset-project` no longer exists anywhere) and **moved into `apps/mobile`** by a
history-preserving `git mv` during the monorepo restructure below. Still to do: **re-identify it for SBS** and
drop the template `LICENSE` (see root `README.md` → Pending).

---

## 9. Security, authentication and authorization

### 9.1 Authentication
- **Provider:** Clerk. Methods enabled: **Sign in with Apple** and **Sign in with Google**.
- **Native sign-in requires a development build** (native modules) — Expo Go is not viable, which is why
  EAS Build + dev client are in v1 scope regardless of video calls (D12).
- Clerk's **Native API** must be enabled for mobile auth. Clerk warns this "opens a public request
  pathway that bypasses browser-based CAPTCHA". **Mitigation is mandatory:
  public sign-up must be disabled** — accounts exist only via admin-created employees (D7).
- Token storage: `expo-secure-store`. No tokens in AsyncStorage, no tokens in logs.
- Server-side (Express): `app.use(clerkMiddleware())` attaches the auth object to every request and each
  protected route calls **`getAuth(req)`** (or a `requireAuth` / `requireRole` wrapper). Reject on
  missing/invalid (D4). Mobile sends the **header** JWT; the admin frontend may use the cookie.
  In the requested tree this lives in `src/api/middlewares/authentication-middleware.ts` — see **C6** if the
  local `bcrypt`/`jwt` login path is genuinely intended.
- **CORS:** the admin frontend is a browser client on a different origin, so the API needs an explicit
  per-environment **allowlist** (never `*`). The mobile app is not a browser origin and is unaffected.
- **Edge hardening:** `helmet`, small JSON body limits (images go straight to ImageKit, so request bodies
  stay tiny), per-token rate limiting on write endpoints, and no stack traces in responses.
- **One error envelope** `{ error: { code, message, details? } }` from the central handler, so both clients
  can render errors uniformly instead of guessing per screen.
- **Correlation IDs** on every request, echoed in logs, Sentry and the error envelope — the only practical
  way to debug a technician reporting that something failed.
- **`/healthz`** (liveness + database ping) for the host health check and the uptime monitor.

### 9.2 Provisioning and de-provisioning
**Onboarding is invite-only.** Admin creates employee → Clerk invitation (email or SMS) carrying a
one-time token → employee authenticates → account binds to the **token**, not to an email address.

Why binding to the token and not the email (three real failure modes avoided):
1. Apple's **Hide My Email** returns a relay address, and Apple returns name/email **only on the very
   first authorization** — an email match that fails once permanently breaks onboarding.
2. The Google account a technician uses personally is often not the email HR holds on file.
3. Casual/backup crews use whatever account is convenient on the day.

**Offboarding (often forgotten, cheap to build, expensive to omit):** deactivating an employee must,
within the same transaction/flow —
- invalidate Clerk sessions (immediate sign-out everywhere),
- **revoke all push device tokens**, so a departed employee stops receiving job details on a personal phone,
- leave historical visits/attendance intact (company records) but stop all access.

### 9.3 Authorization model
- Role lives in **Neon** (`employees.role`), not in Clerk metadata, and is authoritative.
  Clerk's org/role features are not the source of truth for employment.
- Every query is scoped by `org_id`, and for office-level roles additionally by `office_id`,
  enforced in **one shared query guard** — never by ad-hoc `WHERE` clauses written per endpoint.
- **Automated security test:** a Rathnapura in-charge session must receive zero rows for Anuradhapura
  data. This test must fail loudly if a future endpoint forgets scoping.
- Cross-branch assignment is allowed (L9) but logged.
- Contract/warranty **value** is hidden from field roles by default (see §6.1).
- Service-role credentials and the ImageKit private key exist **only** server-side. ImageKit upload
  auth must be a signed, short-lived token minted by the API — never the private key shipped in the app.

### 9.4 Data protection
- PII inventory: name, mobile, NIC, DOB, photo, GPS points, selfie, emergency contact, blood group.
- Transport: HTTPS only; no plaintext HTTP fallback.
- Sentry: **`sendDefaultPii` off**, plus scrubbing of tokens, mobile numbers and coordinates. Session
  Replay must be evaluated for PII leakage (a customer site screenshot is a data disclosure).
- Backups: Neon point-in-time/instant restore; document the recovery procedure and test it once.

---

## 10. Background work, state and failure modes

### 10.1 What happens asynchronously
| Work | Trigger | Retry / idempotency | User sees while waiting |
|---|---|---|---|
| Visit/clock submission | Technician action → **RTK Query mutation** | The custom `baseQuery` moves failed writes into the persisted **`outbox` slice**; replayed with backoff and an **`Idempotency-Key`**, so a duplicate replay is a no-op | Optimistic update + "Saved — will sync" badge; never a blocking spinner |
| Photo upload to ImageKit | After compression, post-submit | Retried independently of the visit record — the **visit is never blocked by a failed image** | Thumbnail with a pending indicator |
| Push notifications | Ticket assign/reassign, approval, SLA breach, incoming call | Delivery state tracked; failures surface as business alerts | Silent |
| Derived attendance | Nightly + on demand | Fully regenerable from `visits` (safe to recompute) | Not user-facing |
| Report queries | Admin request → `GET /v1/reports/...` via RTK Query | Plain SQL in the API first; materialise `attendance_days` only if slow; cached by RTK Query tags | Loading state; CSV export |
| Orphaned media cleanup | Cron in `infrastructure/scheduler.ts` (proposed — §8.5 gaps) | Deletes ImageKit files with no referencing row; idempotent | Not user-facing |
| SLA sweeps / reminders | Cron in `infrastructure/scheduler.ts` (proposed — §8.5 gaps) | Idempotent per (ticket, threshold); safe to re-run | Produces notifications only |

### 10.2 State and data flow (decoupled + RTK Query)
- **Source of truth:** Neon, reached only through the Express API. The client cache is a *read-through
  convenience*, never authority (D6).
- **Two-layer client state (D14):** **RTK Query** owns every server-derived collection (my jobs, ticket
  detail, asset and history lists, lookup lists) with **tag-based invalidation**; **Redux slices** own
  session, UI state, in-progress **drafts** and the **outbox**.
- **Optimistic UI:** mutations apply instantly via `onQueryStarted` + `updateQueryData`, then reconcile with
  the server response. The technician is never blocked by connectivity (L8).
- **Offline read:** the RTK Query cache is persisted (`extractRehydrationInfo` + `redux-persist`) with a
  deliberately **short `keepUnusedDataFor`** — some staleness is accepted in exchange for a usable app in a
  dead zone.
- **Offline write:** mutations that fail with a network error are moved to the persisted **outbox** and
  replayed in order with an `Idempotency-Key`; the UI shows `pending → synced` or `pending → failed` per item.
- **Revalidation:** `setupListeners(store.dispatch)` enables `refetchOnReconnect` and `refetchOnFocus`; push
  notifications additionally invalidate affected tags, so a new assignment appears without a manual pull.
- **No realtime subscriptions in v1** — refresh on focus, pull-to-refresh and push-driven invalidation.
  Websockets remain a v1.1+ decision, not a v1 dependency.
- **Conflict rule:** per-field last-write-wins with server timestamps, **except attendance**, which is
  append-only through corrections (edit requires a reason → `audit_log`). Attendance is **always re-validated
  server-side on arrival**, even when it arrives from the outbox.

### 10.3 Failure modes and edge cases (each needs an explicit behaviour)

| # | Edge case | Agreed behaviour |
|---|---|---|
| 1 | Overnight on-call shift (22:40 → 03:10) | Attribute the session to the **shift-start date**; store UTC; never truncate to a local date |
| 2 | Same submission replayed (offline queue) | `idempotency_key` makes it a no-op; never a duplicate visit |
| 3 | Device clock wrong | Store **both** device timestamp and server `received_at`; flag skew above a threshold for office review |
| 4 | Dead-zone clock-out | Retained in queue; the record still shows the true on-site time; office is alerted if unsynced > N hours |
| 5 | App killed with an open draft | Draft persisted to disk continuously, not only on submit |
| 6 | Employee deactivated holding an open visit | Session revoked; the visit is auto-closed and flagged for the in-charge |
| 7 | Ticket reassigned mid-visit | Visit stays with the original technician; ticket reassignment is logged |
| 8 | Warranty expires during a visit | Entitlement is evaluated **server-side at completion time** and recorded with the decision |
| 9 | Duplicate customer/site created | Fuzzy duplicate warning on name + phone/address; merge tool for admins (v1 minimal) |
| 10 | Photo upload fails | Visit still saves; image retries; visible pending state |
| 11 | ImageKit free-tier cap reached | Uploads **stop silently** on the free plan → must be detected and surfaced (admin alert + technician message) |
| 12 | Neon free-tier storage/compute cap | Upgrade path documented; monitor at 70% |
| 13 | Push token revoked / Android battery optimisation | Detection + prompt to re-enable; SMS fallback considered for critical assignments (**open question**) |
| 14 | App version too old for API | Client sends version; server returns "update required" below minimum supported version |
| 15 | Technician accepts two overlapping jobs | Warn + require a reason; surface in the utilisation report |
| 16 | GPS permission denied or unavailable | Work is **never blocked**; session is saved with a `gps_unavailable` flag for the in-charge |
| 17 | Shared device / multiple users | Clerk session switching handled; queue/drafts must be scoped per user to avoid cross-user data bleed |
| 18 | No internet for hours, multiple queued visits | Queue processes in order with bounded concurrency; ordering preserved within a visit |
| 19 | Customer site has no address (only "the bank branch") | Site record allows free-text access instructions; GPS pin optional |
| 20 | Technician on leave but assigned a job | Block assignment with a clear message; allow override with reason |

---

## 11. Non-functional requirements

### 11.1 Performance
- App cold start to "My Jobs" list on a mid-range Android device: **< 3 s**, usable offline from cache.
- Any technician action (clock in/out, submit notes) is **instant in the UI** and never waits on network.
- **API targets** (`/v1`): writes p95 **< 400 ms**, list/detail reads p95 **< 600 ms**, reports p95 **< 2 s**
  (including Colombo → host-region latency). The API is the only layer allowed to be slow, and only for reports.
- Admin list/report queries: **< 2 s** at SBS volumes (50 staff, ~2,000 customers, tens of thousands of
  visits/year). If a report exceeds that, materialise `attendance_days` first, not micro-optimise SQL.
- Image uploads happen after submission, compressed to **~200–400 KB**, and are free to fail.

### 11.2 Scale expectation (realistic, not aspirational)
- ~30–40 technicians, 5–10 admin users, 2,000+ customers, multiple sites per customer.
- Rough order: **~50–150 visits/day** at full adoption → ~40k visits/year. This is a **small** dataset;
  the architecture must not be complicated for scale it will never see.
- Design consequence: no queueing infrastructure, no microservices, no realtime layer in v1.
  A single Next.js deployment + Neon is comfortably sufficient.

### 11.3 Privacy and regulatory posture
- Governing law: **Sri Lanka Personal Data Protection Act No. 9 of 2022**. **Verified status (DLA Piper
  *Data Protection Laws of the World*, Sri Lanka chapter, last modified 17 Feb 2026): the Act was passed
  on 19 March 2022, but only the provisions relating to the regulator (the Data Protection Authority)
  and the interpretation section have been brought into operation. The substantive obligations remain in
  a transitional grace period.**
- **Practical position:** compliance is not yet legally enforced, so we **design to PDPA standards now**
  (purpose limitation, notice, consent, data minimisation, retention limits, breach readiness) **but do not
  buy formal compliance machinery** (DPO appointment, formal DPIAs) in v1.
- Employee-monitoring specifics (this is the risky part of the product):
  - A **plain-language in-app notice** plus a **timestamped acknowledgment** stored per employee.
  - Location is captured **only at explicit actions** (clock-in, arrival, clock-out), **never continuously**.
    This clause is what makes the feature defensible *and* acceptable to staff.
  - DOB and NIC are collected for **statutory HR purposes (EPF/ETF, insurance)**, not for
    "personalisation" — the stated purpose must match the actual use, and the UI copy must say so.
- Vendor posture check: confirm each processor's terms (Clerk, Neon, ImageKit, Sentry, Stream, LLM)
  support the processing we are doing, and **do no harm by default** (e.g. no PII in Sentry).
- ⚠️ Confirm with a qualified Sri Lankan lawyer before public launch or before extending to Maldives.
  This document is not legal advice.

### 11.4 Accessibility & usability for the actual environment
- Large tap targets, high contrast, one-handed use: technicians operate outdoors, in plant rooms and
  on ladders, sometimes with gloves and in bright sunlight.
- Offline-first *feel*: anything a technician taps must appear to have worked immediately.
- No mandatory fields that cannot be filled on site (e.g. serial numbers are often inaccessible).

### 11.5 Internationalisation
- i18n framework wired from day one (**D9**); English content at launch.
- Confidence needed: **do field technicians read English?** (F5). If not, Sinhala/Tamil must be planned
  as content work, not just a toggle — and layouts must tolerate text expansion.
- Sri Lanka is **UTC+5:30 with no DST**; Maldives is UTC+5 (out of scope). Store UTC regardless.

---

## 12. Observability

**Principle: technical health is not business health.** Sentry tells us the app crashed; it will not tell
us that a job sat unaccepted for six hours while a customer waited.

### 12.1 Technical
- `@sentry/react-native` **8.27.0** on mobile (Expo Router tracing, OTA-update context, EAS dashboard
  integration).
- **Sentry on the Express API** (error handler + performance) and on the admin frontend — one Sentry project
  per surface, tagged with service, environment and release, so an **API** regression is never confused with
  an **app** regression.
- **PII scrubbing everywhere** (`sendDefaultPii` off); Session Replay evaluated for disclosure risk; request
  bodies are not attached to error events.
- **Uptime monitoring** against `GET /healthz` with alerting — the API is its own service now (D17), so someone
  must be told when it stops responding (R22).
- Next.js is on a **monthly security release cadence**; Express/Node and the Neon client also need patch
  review → one scheduled monthly maintenance slot for all three deployables.

### 12.2 Business failure signals (the ones that actually matter)
| Signal | Threshold | Why it matters |
|---|---|---|
| Job assigned but **not accepted** | > 30 min | The technician never saw it — customer is waiting |
| Clocked in but **never clocked out** | > shift + 4 h | Attendance/payroll integrity |
| **Sync queue depth** rising across a branch | sustained increase | Bad connectivity or API failure |
| **Push delivery failures** | any sustained rate | Silent loss of all dispatch |
| **Photo upload failures** / ImageKit cap | any | Loss of installation evidence |
| Visits submitted but **not approved** | > 48 h | Approval workflow stalling payroll |

### 12.3 Alert routing (proposed)
- Immediate email for: job not accepted in 30 min, sync queue stalled, push failures sustained.
- Daily exception report on the admin dashboard for everything else.
- **Open question:** where do alerts go (email/Slack/WhatsApp/SMS) and **who is on call — you or an SBS
  staff member?** A 24/7 business needs a named human, not a dashboard nobody opens.

---

## 13. Environments and delivery

| Environment | Purpose | Data | Updates |
|---|---|---|---|
| **Local** | Development | Neon branch (or Docker Postgres) | Dev client on a physical device |
| **Staging** | Pre-release verification, pilot group | Neon branch, seeded anonymised data | EAS Update `staging` channel |
| **Production** | Live field use | Neon production branch, PITR enabled | EAS Update `production` channel; native builds via EAS Build → TestFlight / Play internal track |

- **EAS Update ships JS/styling/assets only** — never native code — and uses **runtime-version policies**
  so an update is only delivered to builds with compatible native code. That is the technical safety rail.
- **Who may publish to production:** default = **you only**, and only after staging verification. A bad
  OTA update affects 40 phones in the field with no store-based rollback.
- **Rollback:** republish the previous bundle (EAS Update revert). Target: recoverable within ~15 minutes.
- **Forced update:** the app sends its version on every request; below the minimum supported version the
  server returns "update required" and the app shows a blocking update screen. Non-breaking releases may
  allow a dismissible "continue without the newest features" path.
- **OTA policy compliance:** ⚠️ **verification task** — Expo's docs describe the technical boundary but the
  store-policy boundary (Apple restricting apps from changing functionality outside review) could not be
  retrieved in this session and **must be confirmed before we rely on OTA for anything beyond bug fixes**.
- **Store/native accounts required:** Apple Developer ($99/yr) + APNs key, Google Play ($25) + Play
  internal track, Firebase project (FCM). Ownership per F7 (default: SBS-owned, you as admin).
- **Three deployables per environment (D17):** the **API** container (Railway/Render), the **admin**
  frontend (Vercel) and the **mobile** build (EAS). Each has its own pipeline and its own rollback.
- **Migrations:** the migration step (**drizzle-kit** or `prisma migrate` — see **C5**) runs against Neon **before** the new API version
  takes traffic; migrations must be backward-compatible for one version (expand → migrate → contract),
  because a field phone can lag behind the API.
- **Deploy order:** migrations → API → admin → mobile update. Never invert it.
- **CORS per environment:** staging and production allowlists contain only their own admin origin; the
  mobile app needs no CORS entry (it is not a browser origin).
- **Config:** `.env` locally (Node 22 supports `--env-file=.env` natively), host env vars in staging and
  production; `infrastructure/config.ts` (proposed placement, §8.5 gaps) fails fast on a missing key.
- **Compatibility window:** the API must stay backward-compatible down to the **minimum supported client
  version** (see the forced-update rule above). This is the direct cost of decoupling.

---

## 14. Testing and definition of done

### 14.1 Must be covered by automated tests (money/trust-critical)
1. **Attendance maths**: overnight sessions crossing midnight, multiple visits/day, partial/abandoned
   visits, shift-start-date attribution, derived daily totals.
2. **Entitlement logic**: warranty/AMC evaluation, free-visit counting incl. a visit spanning expiry.
3. **Offline queue replay**: a queued clock-out submitted twice creates **one** visit (idempotency).
4. **Role/office scoping**: cross-office reads return nothing; assigned-office reads succeed.
5. **API authorisation**: every endpoint rejects missing/invalid session tokens.
6. **Offboarding**: deactivation revokes sessions and push tokens (assert, not assume).

### 14.2 Tooling
- Unit/integration: Vitest/Jest per stack convention; Drizzle + a throwaway Neon branch for DB tests.
- **API:** integration tests with **Supertest** against the Express app — auth, RBAC office scoping,
  idempotency replay, entitlement maths. These are the tests that protect money and payroll data.
- **Clients:** RTK Query endpoints tested with **MSW** rather than mocking store internals; the auth and
  `outbox` reducers are unit-tested directly (replay ordering, duplicate suppression).
- **Contract drift:** a CI check that `packages/shared` schemas still match the generated OpenAPI spec
  (D18) — this is what stops two clients drifting away from one API.
- End-to-end: **Maestro** (the flow tooling Expo's ecosystem supports) for the technician smoke path:
  launch → clock in → add photo → submit → verify sync.
- Real-device testing is mandatory for camera/GPS/push; emulators are insufficient.

### 14.3 Definition of Done for v1
- 2–3 real technicians (one branch, one HO/senior) run **2–3 weeks of real jobs end-to-end** with:
  **zero data loss**, no manual re-entry by office staff, attendance figures matching reality,
  and the owner using the dashboard unprompted.
- Explicitly *not* "the owner says it looks good".

---

## 15. Migration, retention, legal and ownership

### 15.1 Migration (the silent adoption killer)
If today's customer list lives in Excel and job history in WhatsApp, the app is **empty on day one** and
nobody adopts an empty app. Therefore v1 needs at minimum a **CSV import for customers, sites, installed
assets and contracts**, plus a documented data-shaping request to SBS (who owns that export?).
Open question: **does a customer list with addresses and model/serial numbers exist at all?**

### 15.2 Retention and deletion (proposed defaults, pending confirmation)
| Data | Proposed retention |
|---|---|
| Attendance, visits, job history | Retained long-term (payroll/contract defensibility) |
| GPS points | 12 months, then aggregated/removed |
| Site photos / selfies | Tied to the visit/job lifetime |
| Employee PII after leaving | Account disabled immediately; personal identifiers minimised; audit log retained |
| Audit log | Retained (immutable) |

### 15.3 Ownership and handover
⚠️ **Unresolved and important:** is this a **contract for SBS** (SBS owns the code; you hand over the repo
and all accounts) or **your product that SBS licenses**? This decides repo structure, documentation depth,
and who holds the Clerk/Neon/ImageKit/Stream/Apple keys. **Must be answered before the implementation plan.**

### 15.4 Operational hygiene
- All secrets in environment variables / EAS secrets; `.env` never committed; rotate Sentry auth token if
  exposed.
- Billing accounts owned by SBS per F7; you keep admin access during build.
- Document the "what to do when X breaks" runbook: push failures, ImageKit cap, Neon cap, API down,
  a technician's phone lost/stolen.

---

## 16. Assumptions (everything here is a GUESS until confirmed)

These exist because some questions were answered with "I agree with your recommendation", which is valid
for design choices but **cannot** supply facts about the business. Each is labeled with the cost of being wrong.

### 16.1 Business facts assumed (highest risk)

| ID | Assumption | If wrong |
|---|---|---|
| **A1** | Technician devices are **~70% Android / 30% iOS**, Android-first build | iOS-only support needed → Apple Developer account, APNs, CallKit work pulled into v1 |
| **A2** | **BYOD** — technicians use personal phones | Company-issued phones → device binding, stronger anti-fraud possible, but MDM/procurement enters scope |
| **A3** | Attendance **feeds payroll/OT/incentives (manually)** | If it does not, the approval workflow (D8) is unnecessary friction and should be dropped |
| **A4** | **No LLM in v1**; AI provider remains unchosen | If AI must ship in v1, provider + token budget must be decided and a cost ceiling set now |
| **A5** | Field staff read English; i18n framework wired but English-only at launch | Sinhala/Tamil needed → content work + layout rework, potentially before launch |
| **A6** | Today's process is **WhatsApp + Excel**; no clean structured data exists to import | If structured data exists, migration effort drops; if nothing exists, **v1 needs CSV import or it launches empty** |
| **A7** | Accounts are **SBS-owned**, you hold admin during build (F7) | If you own them, handover/licensing terms and cost recovery must be documented |
| **A8** | A real **Coordinator** role exists (1–2 people) and works **PC-first** | If they work on phones, the admin panel needs a mobile-responsive design (unplanned work) |
| **A9** | **No in-app chat** in v1; technicians keep WhatsApp/phone | If chat is expected, Stream **Chat** is a separate paid product to evaluate |
| **A10** | The single most important screen is the admin dashboard: **"where is every technician, right now, on what job"** | This is my guess, asked three times and never confirmed. If the real answer is asset history or clock-in reliability, v1 priorities change |
| **A11** | Customers are **institutions only** (banks, hospitals, hotels, corporates, govt) | Consumer/small-shop jobs would need a lighter customer model and possibly a client portal |
| **A12** | Free-service entitlement is counted **per installed asset, per visit** | If counted per customer or per contract year, the entitlement model changes |
| **A13** | ~**30–40 technicians**, **50–150 visits/day** at full adoption | Much higher volume would force pagination/materialised reports earlier (not an architecture change) |
| **A14** | ~**10 photos per visit** | Higher photo volume changes the ImageKit bandwidth estimate and storage plan |
| **A15** | Sri Lanka only in v1; single currency (LKR) | Maldives inclusion adds entity scoping, timezone (UTC+5), phone formats, cross-border data |
| **A16** | The owner reviews the dashboard on a **desktop browser** | Phone-first ownership needs a responsive/mobile admin design |
| **A17** | **Internal distribution** (TestFlight + Play internal track) is acceptable | Public store listing needs privacy policy, data-safety declarations, review turnaround |
| **A18** | GPS capture **only at explicit actions** is acceptable to staff | If staff resist monitoring, attendance evidence degrades to timestamps only — and A3's payroll use becomes contestable |
| **A19** | The business can supply its **complaint-type list** to seed the lookup table | Otherwise the list gets invented by us and will not match reality |
| **A20** | A **2–3 week pilot** with 2–3 technicians is an acceptable definition of done | "Ship to all 40 at once" raises rollout risk substantially |

### 16.2 Technical assumptions (low risk, cheap to reverse)

| ID | Assumption | If wrong |
|---|---|---|
| **A21** | **Expo SDK 57 stable** is the target (SDK 58 is in beta) | Adopting 58 mid-build risks native/third-party breakage for no v1 benefit |
| **A22** | Clerk / Sentry / EAS **free tiers cover ~50 users** — **limits NOT verified in this pass** | Budget could shift by up to ~$150/mo; verify before committing costs |
| **A23** | Attendance is stored as **per-visit sessions**, daily totals derived and regenerable | Derived-table bugs would surface as wrong payroll numbers — hence the test list in §14.1 |
| **A24** | No realtime/websockets in v1 (refresh-on-focus + push) | If "live board" expectations are strong, add polling first, websockets later |
| **A25** | Non-breaking releases may offer a dismissible update prompt | A stricter policy is a config change, not a redesign |
| **A26** | ImageKit free tier's **2-user cap** is sufficient (3 users on Lite at $9/mo) | Extra ImageKit dashboard users force the paid plan earlier |
| **A27** | The admin frontend **stays Next.js** as a client-rendered API consumer (D13) | If a lighter SPA (Vite + React Router) is preferred, the admin shell is rebuilt — pages and RTK Query hooks largely survive |
| **A28** | The API runs as a **long-running container** on Railway or Render (D17) | A serverless preference would change pooling, cron and cold-start behaviour — a genuine re-plan of §8 and §10 |
| **A29** | **Monorepo with npm workspaces** (D15); no Turborepo/Nx yet | Build times stay acceptable at this size; adding a build orchestrator later is config, not a rewrite |
| **A30** | RTK Query cache persisted with `redux-persist` over **AsyncStorage** initially (D16) | If queue reliability proves marginal, move the outbox to `expo-sqlite` or MMKV — contained behind the `outbox` slice interface |
| **A31** | **Express 5.2.1** for this greenfield API | Falling back to Express 4.22.2 means re-adding async error wrappers and reverting `path-to-regexp` conventions |

---

## 17. Open questions (must close before the implementation plan is final)

**Blocking (plan quality depends on these)**
1. **A10 / the one screen** — which screen must be perfect in v1? Asked three times; still unanswered.
2. **Facts F1, F2, F5, F7, F8, F9** — OS split, device ownership, languages, account ownership,
   coordinator workflow, in-app chat.
3. **Ownership model (§15.3)** — contract for SBS, or your licensed product?
4. **Attendance approval (§6.1, D8)** — is the submit→approve→audit workflow wanted, or is it friction?
5. **Cost envelope** — is **~$40–200/month of infrastructure** plus **$135–270/month if AI ships**
   acceptable, and who approves it? What should happen when a vendor limit is hit?

**Non-blocking but needed before pilot**
6. Where do alerts go, and **who is on call** — you or an SBS staff member?
7. Full notification trigger list; and should a technician **accept/decline** a job before travelling
   (with escalation if unaccepted)?
8. Is there an **on-call rota** in the system for 24/7 breakdowns, or does it live in someone's head?
9. Report consumers: who reads each report, is CSV enough, are **PDF + scheduled digests** needed in v1?
10. Do technicians see **colleagues' visits** within their own office (default: yes)?
11. Does the business want **SMS fallback** for critical assignments when push fails?
12. Is the existing customer data importable, who owns producing it, and in what shape?
13. Retention defaults in §15.2 — confirm or override.
14. Legal review of the location-monitoring notice before launch.

**Decisions introduced by the decoupled architecture (new — need your call)**

15. **Admin frontend framework:** keep Next.js client-rendered (default, D13), or move to a Vite +
    React Router SPA? The latter is lighter but is a framework swap you did not originally ask for.
16. **API hosting:** Railway (usage-metered, $5/mo minimum including credits) vs Render (flat compute tiers,
    $7–25/mo) — and who owns the account and approves the monthly ceiling? (D17)
17. **Contract tooling depth:** shared Zod + TypeScript types only (v1 default), or also generated OpenAPI
    plus `@rtk-query/codegen-openapi` hooks now? (D18)
18. **Outbox persistence:** AsyncStorage (default) or go straight to `expo-sqlite`/MMKV for the write
    queue? (D16, A30)

**⚠️ Conflicts from the requested `apps/api` folder structure (resolve before coding)**

23. **C5 — Prisma or Drizzle?** The tree says `PrismaClient` + `PrismaPg`; D2 says Drizzle 0.45.3. The data model,
    migration tooling and the pgvector approach all follow from this one call.
24. **C6 — Clerk or local credentials?** The tree implies `bcrypt` + `jwt.sign` login with a seeded
    `admin@test.com / 123456`. Confirm Clerk remains the identity provider (recommended) or accept a second,
    self-managed auth system.
25. **C7 — where DTOs live:** `domin/dtos`, or `packages/shared` as the single cross-client contract?
26. **C8 — what `api/auth.ts` means** if Clerk stays (invite acceptance / session bootstrap, not login).
27. **C9 — `domin/` or `domain/`?** Recommend fixing the spelling now; it is free today and expensive later.
28. **Where tests live:** colocated `*.test.ts` or a `tests/` directory (§8.5 gaps).

**Verification tasks (research I owe you)**
19. Clerk / Sentry / EAS current free-tier limits and the exact price of the first paid tier.
20. Store-policy boundary for **OTA updates** (Apple/Google) — currently unverified.
21. ImageKit plan sizing against real photo volume; 2-user cap vs actual admin headcount.
22. Neon storage/compute sizing: the free tier's **0.5 GB per project** will not hold years of visits —
    decide when to move to Launch (~$15/mo typical).

---

## 18. Open risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| **R1** | **Adoption failure** — app launches empty and staff must double-enter (paper/WhatsApp + app) | **Critical** | CSV import of customers/assets/contracts; make the app the *only* way to get paid for a visit; pilot before rollout |
| **R2** | **Payroll trust collapse** if attendance numbers look wrong once | **Critical** | Derived-attendance tests (§14.1), approval step, audit log, device+server timestamps |
| **R3** | **Dead-zone clock-outs** become pay disputes | High | Device timestamp at action time, queued sync, unsynced alert to office |
| **R4** | **ImageKit free-tier cap silently stops uploads** | High | Monitor usage; alert on failures; move to Lite before the cap |
| **R5** | **Single-person dependency** — only you can publish OTA/builds | High | Written runbook, EAS + repo access shared with a named SBS technical contact |
| **R6** | **Video calls bottleneck** — only 1–3 senior engineers to answer | Medium | Treat as capability not guarantee; call routing/rota before promising SLA |
| **R7** | **AI cost runaway** (the single largest recurring cost) | Medium | Per-user daily caps + hard monthly ceiling + visible-only degradation |
| **R8** | **Scope creep** — video/AI/client portal pulled into v1 | High | This document's §4 scope table is the contract; changes go through re-planning |
| **R9** | **Approval friction** slows technicians and drives workarounds | Medium | Only apply if A3 (payroll) holds; approve in bulk; auto-approve clean sessions |
| **R10** | **Photo evidence vs staff data cost** (metered mobile data) | Medium | Compression, Wi-Fi-preferring upload, explicit consent to use data |
| **R11** | **Push unreliability** on cheap Android devices | High | Detect delivery failure, surface in-app, consider SMS fallback |
| **R12** | **PDPA obligations commence** without warning | Medium | Design to standard now; keep a compliance gap list |
| **R13** | **Migration data quality** — duplicate/noisy customer records | Medium | Duplicate detection + merge tool; staged import with review |
| **R14** | **OTA store-policy boundary unverified** | Low | Verification task §17.15–16; restrict OTA to bug fixes until confirmed |
| **R15** | **Device clock skew** weakens attendance evidence | Medium | Server `received_at`, skew flags, office review queue |
| **R16** | **Ownership ambiguity** (§15.3) surfaces late | High | Decide before writing the implementation plan |
| **R17** | **Maldives scope creep** | Low | Explicitly out of scope (§4.4); schema stays country-agnostic |
| **R18** | **Unverified vendor limits** (Clerk/Sentry/EAS) surprise the budget | Low | Verification task §17.15 |
| **R19** | **GPS monitoring resistance** from staff | Medium | Action-only capture, plain-language notice, and the A18 confirmation with the team early |
| **R20** | **No named production on-call owner** at a 24/7 business | High | §12.3 — decide who answers when the API is down at 2 a.m. |
| **R21** | **Three deployables instead of one** — more parts, three pipelines, more room to drift | Medium | Shared contract package + CI contract check (D18/§14.2); fixed deploy order (§13) |
| **R22** | **The API is a single point of failure** — if the container dies, field work stalls | High | `/healthz`, host restart policy, uptime alerting; clients keep working from cache for reads and outbox for writes |
| **R23** | **CORS / token misconfiguration** between the admin origin and the API (classic decoupled failure) | Medium | Explicit per-environment allowlists, staging verification before each release, automated 401/403 tests |
| **R24** | **Stale persisted RTK Query cache** shows a technician outdated job data | Medium | Short `keepUnusedDataFor`, `refetchOnReconnect`/`refetchOnFocus`, push-driven tag invalidation, and server re-validation of every attendance write |
| **R25** | **Type drift** between `packages/shared` and the live API | Medium | Contract CI check (D18) plus Zod validation at the API boundary, so a mismatch fails loudly rather than silently |
| **R26** | **Two identity systems drift** if a local JWT login is added beside Clerk (C6) | High | Resolve C6 before building; if both are ever needed, one must be explicitly subordinate |
| **R27** | **Seeded default credentials** (`admin@test.com / 123456`) reaching a real environment | High | Seed only in local/dev behind an env guard, and assert in CI that seeding cannot run in production |

---

## 19. Next steps

1. **Answer Batch 3** — reports/definition of done, cost envelope and who pays, environments/release
   ownership (who may push OTA), alert routing and on-call, QA/pilot expectations, migration data,
   retention, and the ownership model (§15.3).
2. **Confirm or veto the A-list (§16)** — especially A3 (payroll), A5 (language), A10 (the one screen),
   A6 (existing data), A18 (GPS acceptance).
3. **Close blocking open questions (§17.1–4)**, including the ownership model.
4. **Verification tasks (§17.19–22)** — vendor limits, OTA store policy, ImageKit/Neon sizing.
5. **Architecture revision captured:** the decoupled design is recorded in **§5 (D1, D3, D4, D13–D18)**, **§8**
   and the new **§8.5**. Part B will be written for the decoupled stack (Express API + RTK Query clients),
   not for the discarded Next.js monolith.
6. **Then, and only then:** produce **Part B — Implementation Plan** below (phased milestones,
   task breakdown, sequencing rationale, and the first two weeks' work), and start building.

> **Scaffolding status:** see §0.1. This session created no project files other than `PLAN.md`.
> A default Expo scaffold plus `node_modules` (485 MB) is present in the directory from an **external
> action at 21:36 on 21 Sep 2026**; this plan has neither assessed, modified nor endorsed it.

---

## Part B — Implementation Plan

**Status: NOT YET WRITTEN.** Blocked on §17 (blocking open questions) and §16 (fact confirmations).
This section will contain the phased build plan, milestone sequencing, task breakdown, and the
agreed definition of done — once the interview closes per §19.

