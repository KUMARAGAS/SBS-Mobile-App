# PLAN.md — SBS Field Service Mobile App

> **DOCUMENT STATUS: DISCOVERY CAPTURE — INTERVIEW IN PROGRESS.**
> This file currently holds everything captured during the co-founder interview: business context,
> locked decisions, assumptions, a draft data model and architecture, cost/version facts, and the
> open questions that are still unanswered.
> It is deliberately **NOT yet a final implementation plan** — see **Part 10 (Next Steps)** for the
> remaining interview batches. The implementation plan will be appended once the open questions close.
>
> **Last updated:** 21 September 2026
> **Repo state:** greenfield — `/run/media/amila/New Volume1/SBS/Mobileapp` was empty at kickoff.
> **No scaffolding performed** (per explicit instruction). No git repo, no dependencies, no config yet.

---

## 0. Document control

| Item | Value |
|---|---|
| Project | SBS Field Service App (technician mobile app + web admin panel) |
| Client / business | SBS.COM Office Solutions (Pvt) Ltd, Sri Lanka |
| Current phase | Discovery / requirements interview |
| Phase gate | Spec summary → assumptions → risks → **then** implementation plan |
| Interview batches done | Batch 1 (platform/tenancy/scope), Batch 2 (auth/roles/backend/AI/dispatch) |
| Batches outstanding | Batch 3 (reports, cost, release, observability, QA, migration, legal/ownership) + Batch 4 (future-proofing, optional) |
| Unresolved conflicts | 4 flagged, 3 resolved, see §18 |
| Labeled assumptions | 12+ (see §16) — created mostly by wholesale "I agree with your recommendation" answers on fact-based questions |

### How to use this file
- **§§1–15** are the working spec: business context, scope, decisions, model, architecture, non-functional.
- **§16** lists every assumption. **Anything in §16 is a guess** until the client confirms it.
- **§19** lists what must happen before the implementation plan is credible.
- When the interview closes, append **Part B: Implementation Plan** (phases, milestones, task breakdown).

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

## 5. Locked decisions (L1–L9 + Batch 2 design choices)

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
| **D1** | Backend: **single Next.js 16.3 monolith on Vercel** (admin panel + API route handlers in one repo) | Smallest team, fastest path, one auth model, two deploys avoided |
| **D2** | ORM: **Drizzle ORM 0.45.3 stable** (pin ≥ 0.45.3 — 0.45.2 carried a SQL-injection fix); not the 1.0 RC | Lean, SQL-shaped; v1 RC migration is a known future task |
| **D3** | API style: **REST-ish JSON + Zod validation** (no tRPC/GraphQL) | Native client ergonomics; tRPC is awkward outside Next.js RSC |
| **D4** | Mobile→API auth: **Clerk session token (short-lived JWT) verified server-side on every request** | No long-lived API keys on devices |
| **D5** | Neon: **pooled/HTTP driver**, **branching** for dev/staging, **pgvector enabled from day one** | Branching = safe environments; pgvector = home for AI retrieval with no new vendor |
| **D6** | **Business logic lives server-side only** — especially warranty/entitlement maths | If entitlement logic lives on the device, technicians can fake warranty status |
| **D7** | Provisioning: **admin-created employees + invite-link binding to a one-time token**, public sign-up disabled | Avoids the Apple "Hide My Email" and mismatched-email onboarding failures |
| **D8** | Attendance **approval workflow** (technician submits → branch in-charge approves → post-approval edits require a reason + audit log) *conditional on F3* | If attendance feeds payroll it is a system of record, not a log |
| **D9** | i18n framework installed on day one even if only English ships | Retrofitting i18n means re-touching every string and layout |
| **D10** | Photos: **client-side compression (~200–400 KB) before ImageKit upload**; upload on Wi-Fi or explicit consent | Sri Lankan mobile data is metered and expensive for staff |
| **D11** | Distribution: **internal** (TestFlight + Play internal track) for v1 | No store review delays or public privacy-policy exposure while stabilising |
| **D12** | Expo **SDK 57 stable** (58 is beta) with **EAS Build + dev client from day one** | Native Apple/Google sign-in requires a dev build anyway (not Expo Go), so Stream later is a config job, not a pipeline rebuild |

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

## 8. Architecture, stack and integrations

### 8.1 Shape

```
  Technician (Android/iOS)            Coordinator / In-charge / Owner
  Expo SDK 57 + React Native          Browser
  Expo Router, dev client             Next.js 16.3 (App Router)
        |                                   |
        |  Clerk session JWT (Bearer)       |  Clerk session cookie
        v                                   v
  +------------------------------------------------------+
  |  Next.js 16.3.3 route handlers  (REST + Zod)         |
  |  - RBAC + org/office scoping middleware              |
  |  - business logic: entitlements, SLA, derived        |
  |    attendance, idempotency, audit log               |
  +------------------------------------------------------+
     |            |             |            |
     v            v             v            v
  Neon           ImageKit      Sentry      Stream (v1.1)
  Postgres       media         errors      Video/Audio
  (Drizzle,      CDN           perf        + FCM/APNs
   pgvector)                           ringing push (v1.1)
```

**Rule:** the mobile app never talks to Postgres, ImageKit (for upload credentials) or any secret-bearing
service directly except through the API. ImageKit upload auth must be signed server-side.

### 8.2 Versions verified 21 Sep 2026

| Component | Version / package | Notes |
|---|---|---|
| Mobile framework | **Expo SDK 57** (stable) | SDK 58 is in beta — do not adopt mid-build |
| Navigation | Expo Router (file-based) | Included in SDK 57 template |
| Auth (mobile) | **`@clerk/expo`** + `expo-secure-store`, `expo-auth-session`, `expo-crypto`, `expo-web-browser` | Clerk docs updated 18 Sep 2026 |
| Auth (server) | Clerk backend SDK + session-token verification | Tokens are short-lived; verify per request |
| Error monitoring | **`@sentry/react-native` 8.27.0** | Requires Expo SDK 50+; Expo Router tracing, OTA context, Session Replay, EAS dashboard integration |
| Web/API | **Next.js 16.3.3** (Active LTS) | 15.5.24 is Maintenance LTS. Next.js now ships **monthly security releases** — budget a patch cadence |
| ORM | **Drizzle ORM 0.45.3** + drizzle-kit | **Pin >= 0.45.3** (0.45.2 carried a SQL-injection fix). `v1.0.0-rc.4` exists — do not adopt the RC |
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
| **Vercel** | Hosting Next.js (admin + API) | Database (Neon is external) |
| **EAS** | Native builds + OTA JS updates | Changing native code over the air (impossible by design) |
| **LLM provider (v1.1, TBD)** | Assistant responses + photo diagnosis | Being the source of truth for asset/contract state |

### 8.4 Verified pricing / limits (vendor pages, 21 Sep 2026)

| Service | Verified figures | Estimated v1 cost |
|---|---|---|
| **Neon** | Free: 100 projects, **100 CU-hrs/mo per project**, **0.5 GB storage per project**, up to 2 CU, scale-to-zero after 5 min, 10 branches/project, 5 GB object storage, 1M function invocations. Launch: **$0.106/CU-hr**, **$0.35/GB-mo**, typical ~$15/mo | $0–15 |
| **ImageKit** | Free: **20 GB bandwidth, 3 GB storage (uploads stop at the cap), 2 users**, 500 video units. Lite **$9/mo**: 40 GB bw + **$0.50/GB** overage, 10 GB storage + **$0.10/GB** overage, 3 users. Pro $89/mo | $9–15 |
| **Stream Video/Audio** | **$100 usage credit every month** on all tiers; **333,000 free audio participant-minutes**; then **$0.30 per 1,000 participant minutes**; video priced by consumed resolution (Dynascale) | **$0** |
| **Vercel** | Hobby is **non-commercial only** → a business app requires **Pro** | ~$20/mo |
| **Apple / Google** | $99/yr + $25 one-time | ~$8/mo amortised |
| **Firebase (FCM)** | Free | $0 |
| **Clerk / Sentry / EAS** | Free tiers plausibly cover ~50 users, but limits were **not verified in this pass** | $0–~150 **VERIFY** |
| **AI assistant (v1.1)** | Claude **Haiku 4.5 $1/$5 per MTok**, **Sonnet 5 $2/$10** (introductory pricing is now standard). Prompt-cache hits cost **0.1x**; newer tokenizer on 4.7+ models yields ~**30% more tokens** for the same text | **~$135/mo (Haiku) to ~$270/mo (Sonnet)** at 50 techs x 20 exchanges/day |

> **Key cost insight:** the AI assistant is the only line item that can exceed every other service combined
> (10–20x). It must therefore ship with **per-user daily token caps + a hard monthly ceiling**, and it is
> the **only** feature allowed to degrade visibly when a limit is hit. Everything else must fail silently
> and gracefully (queued, retried, never losing a technician's work).
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
- Server-side: verify the Clerk session token on **every** API request (D4); reject on missing/invalid.

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
| Visit/clock submission | Technician action | Persistent queue, exponential backoff; **`idempotency_key` prevents duplicates** on replay | Optimistic "Saved — will sync" badge; never a blocking spinner |
| Photo upload to ImageKit | After compression, post-submit | Retried independently of the visit record — the **visit is never blocked by a failed image** | Thumbnail with a pending indicator |
| Push notifications | Ticket assign/reassign, approval, SLA breach, incoming call | Delivery state tracked; failures surface as business alerts | Silent |
| Derived attendance | Nightly + on demand | Fully regenerable from `visits` (safe to recompute) | Not user-facing |
| Report queries | On admin request (v1) | Plain SQL first; materialise only if slow | Loading state, CSV export |
| Orphaned media cleanup | Scheduled | Deletes ImageKit files with no referencing row | Not user-facing |

### 10.2 State and data flow
- **Server is the source of truth**; the device keeps a read cache (today's jobs, assigned assets,
  lookup lists such as complaint types) plus a durable write queue.
- **Optimistic UI** on submit; the technician is never blocked by connectivity (L8).
- **No realtime subscriptions in v1** — refresh on focus + pull-to-refresh + push notification for
  changes. Realtime (websockets) is a v1.1+ decision, not a v1 dependency.
- **Conflict rule:** per-field last-write-wins with server timestamps, **except attendance**, which is
  append-only through corrections (edit requires reason → `audit_log`). No silent overwrites of time data.

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
- `@sentry/react-native` **8.27.0** with Expo Router tracing, OTA-update context and EAS dashboard
  integration; matching server-side error capture in Next.js.
- **PII scrubbing enabled** (`sendDefaultPii` off); Session Replay evaluated for disclosure risk.
- Next.js is on a **monthly security release cadence** → schedule a monthly dependency/patch review.

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

**Verification tasks (research I owe you)**
15. Clerk / Sentry / EAS current free-tier limits and the exact price of the first paid tier.
16. Store-policy boundary for **OTA updates** (Apple/Google) — currently unverified.
17. ImageKit plan sizing against real photo volume; 2-user cap vs actual admin headcount.
18. Neon storage/compute sizing: the free tier's **0.5 GB per project** will not hold years of visits —
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

---

## 19. Next steps

1. **Answer Batch 3** — reports/definition of done, cost envelope and who pays, environments/release
   ownership (who may push OTA), alert routing and on-call, QA/pilot expectations, migration data,
   retention, and the ownership model (§15.3).
2. **Confirm or veto the A-list (§16)** — especially A3 (payroll), A5 (language), A10 (the one screen),
   A6 (existing data), A18 (GPS acceptance).
3. **Close blocking open questions (§17.1–4)**, including the ownership model.
4. **Verification tasks (§17.15–18)** — vendor limits, OTA store policy, ImageKit/Neon sizing.
5. **Then, and only then:** produce **Part B — Implementation Plan** below (phased milestones,
   task breakdown, sequencing rationale, and the first two weeks' work), and start building.

> Nothing has been scaffolded: no `package.json`, no git repo, no dependencies, no config, no accounts.
> The project directory contains this file only.

---

## Part B — Implementation Plan

**Status: NOT YET WRITTEN.** Blocked on §17 (blocking open questions) and §16 (fact confirmations).
This section will contain the phased build plan, milestone sequencing, task breakdown, and the
agreed definition of done — once the interview closes per §19.
