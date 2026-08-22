# TrustDocs Frontend (Doc-Contract API)

Vite + React SPA. UI/UX is based on the Base44 TrustDocs design; the **system of record** is the Go Doc-Contract backend (`/api/v1`) with HttpOnly session cookies.

Preview reference: https://illegal-verify-trust-flow.base44.app/

## Prerequisites

1. Node.js 18+
2. Backend running on `http://localhost:8080` (see `../backend`)

## Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:5173

### Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Doc-Contract API base |

### Backend CORS / cookies

Backend must allow the Vite origin. On the backend set:

```bash
FRONTEND_ORIGIN=http://localhost:5173
APP_ENV=development
PORT=8080
```

See [backend/docs/FRONTEND_DEVELOPER_GUIDE.md](../backend/docs/FRONTEND_DEVELOPER_GUIDE.md) and [backend/docs/DEMO.md](../backend/docs/DEMO.md).

## Local sync checklist

1. Start backend: `cd ../backend && go run ./cmd/server`
2. Start frontend: `npm run dev`
3. Register at `/register` → check server stdout for verification link → open link or use `/verify-email?token=...`
4. Log in → onboarding → create organization (or individual) → dashboard
5. Optional: link MetaMask on wallet step (`POST /auth/wallet/nonce` + verify)
6. Public verify at `/verify` with an envelope UUID from the DEMO flow (upload → envelope → send → sign)
7. Evidence UI: `http://localhost:8080/verify-ui?envelope_id={uuid}`

## Architecture

- `src/api/*` — fetch client with `credentials: 'include'`
- `src/lib/AuthContext.jsx` — session via `GET /auth/me`
- `src/lib/orgStorage.js` — persists `org_id` for `X-Organization-ID`
- Placeholder dashboard routes remain Coming Soon until envelopes UI is wired

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite on port 5173 |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | ESLint |

## Next product wiring (DEMO path)

1. Issue / send: `POST /documents/upload` → envelopes CRUD → send
2. Sign: `/sign/{token}` + OTP
3. Dashboards: list envelopes instead of mock stats
4. Team: `POST /orgs/invite`
