# সুরক্ষা (SUST)

A campus safety and ragging incident reporting platform for universities. Students can submit reports with photos, audio, and live location; proctors and admins are notified in real time; and responders can view reports and navigate to the reporter’s location. The UI is in Bengali.

---

## What It Does

- **Students** sign up, complete their profile (department, registration number, etc.), and submit **ragging** or **safety** reports with:
  - Text description
  - Photo and/or voice recording
  - GPS location (initial + optional live updates)
- On submit, **proctors** (by department) receive **SMS** and **email** with a link to the report.
- A **public report page** (`/report/[token]`) shows the report and a map with the reporter’s and viewer’s locations and a route between them.
- **Admins** and **correspondents** manage reports, update status (pending → acknowledged → resolved), and get overviews. Status changes trigger **email** to the reporter.
- **Correspondents** are invite-only (email + password) and can view all reports and details.

---

## Services Overview

| Service | Purpose |
|--------|---------|
| **Clerk** | Auth (sign-in, sign-up, roles). Roles: `admin`, `correspondent`, `student`. Webhook syncs users to Convex. |
| **Convex** | Backend: DB, queries, mutations, actions. Auth via Clerk JWT. Realtime subscriptions for reports and locations. |
| **Report submission** | Creates report + first location, generates public token. Notifies active proctors via **SMS** (OneCodeSoft) and **email** (SMTP). |
| **Live location** | After submit, the student’s device can push GPS updates to `reportLocations`; the public page and dashboards consume the latest point. |
| **Status updates** | Admin/correspondent sets status and optional note. **Email** is sent to the reporter with the new status and note. |
| **Correspondent invite** | Creates Clerk user (email+password), Convex user, and `correspondents` row. Sends **email** with credentials and sign-in URL. |
| **File storage** | `/api/upload`: authenticated upload of photos (`jpg`, `jpeg`, `png`, `webp`) and audio (`webm`, `mp3`, `ogg`, `m4a`) to local `data/` dir. `/api/files/[...path]`: serves those files (used for report media on the public page). |
| **Maps** | MapLibre GL for admin dashboard (clustered report map), student report form (pick/live location), and public report page (reporter + viewer locations and route). |

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui, MapLibre GL, Recharts
- **Auth:** Clerk (Clerk Elements for sign-in/sign-up)
- **Backend:** Convex (queries, mutations, actions, HTTP for webhooks)
- **Email:** Nodemailer (SMTP)
- **SMS:** OneCodeSoft (Bulk SMS API)

---

## Roles and Access

| Role | Dashboard | Main actions |
|------|-----------|--------------|
| **Student** | `/student` | Complete profile, submit reports, see own reports, share report link |
| **Correspondent** | `/correspondent` | View all reports, open report detail (map, media, status) |
| **Admin** | `/admin` | Overview (charts, map), reports (list, status, copy link), students, correspondents (invite), proctors, departments |

---

## Project Structure (high level)

```
app/
  (auth)/          sign-in, sign-up, complete-profile
  (dashboard)/     admin/*, correspondent/*, student/*
  report/[token]/  public report page (no login)
  api/upload       POST upload (auth)
  api/files/      GET file by path
convex/
  schema           users, students, correspondents, proctors, departments, reports, reportLocations
  reports         create, getByToken, list, listWithReporter, listForDashboard, updateStatus, updateAudio
  reportLocations updateLocation, getLatest
  reportStatusUpdate  action: update status + email reporter
  reportsSubmit   action: create report + notify proctors (SMS + email)
  correspondentsInvite  action: create Clerk + Convex user + email
  http            /clerk-webhook for user sync
lib/
  storage         saveFile (photos, audio) under data/
  effect/         email, sms helpers
```

---

## Environment Variables

Copy `env.example` to `.env.local` and fill in:

### Next.js (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | For Clerk → Convex webhook |
| `CLERK_JWT_ISSUER_DOMAIN` | Issuer from Clerk JWT template `convex` (e.g. `https://xxx.clerk.accounts.dev`) |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL (`npx convex dev` shows it) |
| `NEXT_PUBLIC_APP_URL` | App base URL (e.g. `https://yourapp.com`) for report and invite links |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional; used if you switch/need Google-specific features |
| `ONECODESOFT_API_KEY` | OneCodeSoft API key for SMS |
| `ONECODESOFT_SENDER_ID` | OneCodeSoft sender ID |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP for nodemailer |
| `EMAIL_FROM` | From address for outgoing email |

### Convex (via `npx convex env set`)

Set in Convex dashboard or CLI for **both development and production**:

- `CLERK_SECRET_KEY` – used by `correspondentsInvite` (Clerk API)
- `CLERK_WEBHOOK_SECRET` – HTTP action verifies Svix signature
- `CLERK_JWT_ISSUER_DOMAIN` – `convex/auth.config.ts` validates Clerk JWTs
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` – email from Convex actions
- `ONECODESOFT_API_KEY`, `ONECODESOFT_SENDER_ID` – SMS from `reportsSubmit`
- `NEXT_PUBLIC_APP_URL` – base URL in report and invite links

---

## Getting Started

1. **Install**

   ```bash
   npm install
   ```

2. **Convex**

   ```bash
   npx convex dev
   ```

   - Creates/links project and prints `NEXT_PUBLIC_CONVEX_URL`.
   - Set Convex env vars as above.

3. **Clerk**

   - Create an application at [clerk.com](https://clerk.com).
   - Enable Email (and Google if you use it). Add JWT template `convex` and set `CLERK_JWT_ISSUER_DOMAIN` to its issuer.
   - Add a webhook: POST to `https://<your-convex-site>.convex.site/clerk-webhook`, subscribe to `user.created`, `user.updated`; set `CLERK_WEBHOOK_SECRET`.

4. **Next.js**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

5. **File storage**

   - Uploads go to `data/photos/` and `data/audio/`. Ensure the process can create and write to `data/` (or change `lib/storage.ts`).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Next.js production build |
| `npm run start` | Next.js production server |
| `npx convex dev` | Convex dev (schema, functions, env) |
| `npx convex deploy` | Deploy Convex to production |

---

## Report Flow (short)

1. Student submits report (type, description, optional photo/audio, GPS) from `/student/report`.
2. Convex `reports.create` inserts `reports` and first `reportLocations`; `reportsSubmit` runs.
3. `reportsSubmit` sends SMS to active proctors (with mobile) and email to proctors (with link `NEXT_PUBLIC_APP_URL/report/<publicToken>`).
4. Student can keep sharing live location; `reportLocations` is updated and read by the public page and dashboards.
5. Anyone with the link can open `/report/[token]` to see the report and the map (reporter + current viewer, route).
6. Admin/correspondent updates status; `reportStatusUpdate` patches the report and emails the reporter.

---

## Correspondent Invite Flow

1. Admin invites from `/admin/correspondents` (name, email, mobile).
2. `correspondentsInvite` generates a password, creates a Clerk user (`public_metadata.role = "correspondent"`), syncs to Convex `users` and `correspondents`, and sends email with credentials and sign-in URL (`NEXT_PUBLIC_APP_URL/sign-in`).
3. Correspondent signs in and uses `/correspondent` to list and open reports.

---

## License

Private. All rights reserved.
