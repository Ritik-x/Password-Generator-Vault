# Password Secure Vault

A full‑stack password vault with client‑side encryption. Users generate and store credentials; all sensitive fields are encrypted in the browser before being sent to the server. The backend never sees plaintext.

## Features

- **Client-side encryption (zero‑knowledge):** Encrypts each field in the browser using AES‑GCM with keys derived from a master password via PBKDF2‑SHA256.
- **Password generator:** Create strong passwords with customizable options.
- **Vault CRUD:** Create, list, update, delete items; search on decrypted data client‑side.
- **Auth with HTTP‑only cookies:** JWT stored in `token` cookie; protected `/vault` routes.
- **Security middleware:** CORS with credentials, Helmet, cookie parsing, rate limiting on vault routes.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Crypto:** WebCrypto API (AES‑GCM 256‑bit, PBKDF2‑SHA256)
- **Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas

## Repository Structure

```
client/                  # Next.js app (pages under app/)
  app/
    login/ register/ vault/ ...
  components/PasswordGenerator.tsx
  lib/api.ts             # API client (credentials: 'include')
  lib/crypto.ts          # WebCrypto: PBKDF2 + AES-GCM helpers
  lib/vaultCodec.ts      # Field-wise encrypt/decrypt
  next.config.mjs

server/                  # Express API
  controllers/
    auth.controller.js   # register/login/logout; sets HTTP-only cookie
    vault.controller.js  # vault CRUD (scoped by user)
  middlewares/
    auth.middleware.js   # verifies JWT cookie
  models/
    user.model.js
    vault.model.js
  routes/
    auth.route.js        # /register /login /logout
    vault.route.js       # /vault CRUD
  server.js              # CORS, Helmet, cookie-parser, DB connect
```

## Architecture & Flow

- **Auth:** `POST /login` returns HTTP‑only cookie `token` (JWT). Protected routes check `req.cookies.token`.
- **Vault:** Client encrypts each field and sends ciphertext to server. Server stores ciphertext as strings.
- **Search:** Runs on decrypted data in the browser (privacy‑preserving).
- **CORS:** `server/server.js` allows a list of origins from `CORS_ORIGIN` env and sets `credentials: true`.

## Crypto Design

- **Algorithms:**
  - AES‑GCM (256‑bit) for confidentiality + integrity (AEAD).
  - PBKDF2‑SHA‑256 to derive an encryption key from the master password.
- **Per‑item randomness:** Per‑field `salt` (PBKDF2) and 12‑byte `iv` (GCM).
- **Payload format:** `{ cipherText, iv, salt, iterations, algo, version }` (binary values Base64‑encoded).
- **Code:**
  - `client/lib/crypto.ts` implements `encryptJSON()` and `decryptJSON()`.
  - `client/lib/vaultCodec.ts` encrypts/decrypts fields: `title`, `username`, `password`, `url`, `notes`.
- **Why:** AES‑GCM provides authenticated encryption; PBKDF2 hardens passwords; WebCrypto is native and fast.

## Prerequisites

- Node.js 18+ (LTS recommended)
- MongoDB Atlas connection string

## Environment Variables

Backend (`server/` on Render or local `.env`):

- `MONGODB_URI` — MongoDB Atlas URI
- `JWT_SECRET` — long random string
- `NODE_ENV` — `production` in prod
- `CORS_ORIGIN` — comma‑separated list of allowed origins, e.g. `https://your-app.vercel.app,http://localhost:3000`
- `PORT` — optional (Render sets its own `PORT`)

Frontend (`client/.env.local` for local, Vercel Project Env for prod):

- `NEXT_PUBLIC_API_BASE` — base URL of backend, e.g. `https://password-generator-vault.onrender.com`

## Run Locally

1. Install deps

```bash
# frontend
cd client
npm install

# backend (new terminal)
cd server
npm install
```

2. Configure env

- `server/.env` (local example):

```
MONGODB_URI=your_atlas_uri
JWT_SECRET=your_secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
PORT=4000
```

- `client/.env.local`:

```
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

3. Start both apps

```bash
# backend
cd server
npm start

# frontend (new terminal)
cd client
npm run dev  # http://localhost:3000
```

4. Test

- Visit `http://localhost:3000`
- Register/Login → `/vault` → create/search/edit/delete items

## Deploy

### Backend (Render)

- New → Web Service → connect repo
- Root Directory: `server/`
- Build: `npm install`
- Start: `node server.js` (recommended for prod; avoid nodemon)
- Env vars:
  - `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`
  - `CORS_ORIGIN=https://password-generator-vault-six.vercel.app/`
- Deploy → note the URL, e.g. `https://password-generator-vault.onrender.com`

### Frontend (Vercel)

- Import repo → Root Directory: `client/`
- Env var:
  - `NEXT_PUBLIC_API_BASE=https://password-generator-vault.onrender.com`
- Deploy → get `https://password-generator-vault-six.vercel.app/`
- Update Render `CORS_ORIGIN` to include your Vercel URL (and localhost if needed) → redeploy backend.

## API (summary)

- `POST /register` — body: `{ email, password }` → sets `token` cookie
- `POST /login` — body: `{ email, password }` → sets `token` cookie
- `POST /logout` — clears `token` cookie
- `GET /vault` — list items for current user
- `POST /vault` — create item (encrypted fields)
- `PUT /vault/:id` — update item
- `DELETE /vault/:id` — delete item

All protected endpoints require the `token` cookie (HTTP‑only) and use `credentials: 'include'` from the client.

## Troubleshooting

- **CORS preflight fails:**

  - Ensure `CORS_ORIGIN` contains the exact frontend origin with no trailing slash.
  - Only one CORS middleware in `server/server.js` with `credentials: true`.

- **401 on `/vault`:**

  - Login first; check `/login` response has `Set-Cookie: token=...; HttpOnly; Secure; SameSite=None` (prod).
  - Confirm browser stored the cookie for the backend origin.

- **Cookies not set locally:**

  - Option A: Call backend directly over HTTPS and allow third‑party cookies in the browser.
  - Option B (dev): Add a Next.js rewrite to proxy `/api/*` → backend, and use `API_BASE="/api"` so cookies are first‑party.

- **MongoDB connection issues:**
  - Atlas network access allows your server IP (or 0.0.0.0/0 for quick start).
  - URI credentials are correct.

## Security Notes

- The master password never leaves the browser.
- The database stores only encrypted payloads (ciphertext + iv + salt + iterations).
- AES‑GCM provides integrity; tampering fails decryption.

## **Assignment Details** Password Generator + Secure Vault (MVP)

**Tech Stack Used**

- Frontend: Next.js (TypeScript)
- Backend: Node.js + Express
- Database: MongoDB (Atlas)
- Encryption: WebCrypto API (AES-GCM + PBKDF2-SHA256)

**Live Demo:** [https://password-generator-vault-six.vercel.app](https://password-generator-vault-six.vercel.app)  
**Backend:** [https://password-generator-vault.onrender.com](https://password-generator-vault.onrender.com)  
**GitHub Repo:** [https://github.com/Ritik-x/Password-Generator-Vault](https://github.com/Ritik-x/Password-Generator-Vault)

**Crypto Note (why WebCrypto):**

> WebCrypto is native, fast, and secure. AES-GCM ensures both confidentiality and integrity, while PBKDF2-SHA-256 makes brute-forcing harder by deriving strong keys from a user’s master password.

**Demo Flow:**  
Generate → Save → Search → Edit → Delete → Copy (auto-clears after ~10s)

## License

MIT (or your preferred license).
