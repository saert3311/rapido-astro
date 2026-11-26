# Docker Contact Email Hardening & Preflight Contract

## Problem Statement
How might we reliably capture and deliver customer inquiries from Rápido Pack Valencia's Dockerized VPS deployment using our existing Mailjet + Turnstile stack, without silent lead drops, bot bypasses, extra SaaS costs, or CI regressions?

## Recommended Direction
Keep the existing zero-dependency runtime path (`server.mjs` → `src/lib/contact-handler.ts` → Mailjet REST API + Cloudflare Turnstile `siteverify`) and harden it for self-hosted VPS operations behind **Nginx** (Docker Compose / Coolify / Dokploy / Portainer) rather than reimplementing email delivery. Because Mailjet and Turnstile already run over standard HTTPS `fetch`, the real risk off Cloudflare Workers is not transport — it is silent misconfiguration, missing edge protections, and zero observability.

We pair runtime hardening with a clear **liveness vs. readiness preflight contract**:
- `GET /healthz` stays the container healthcheck / process liveness probe (`200 OK`), so CI smoke tests and container startups never require production secrets and containers stay healthy during env updates.
- `GET /readyz` verifies that `dist/index.html` exists and required contact secrets (`TURNSTILE_SECRET_KEY`, `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`) are populated and not `.env.example` placeholders, returning `503` if misconfigured so preflight checks catch bad deploys immediately.
- In production (`NODE_ENV=production`), `POST /api/contact` fails closed (`503 SERVICE_UNAVAILABLE`) instead of falling back to Cloudflare's dummy pass-all Turnstile key or silently returning `200 OK` without sending email.

## Key Assumptions to Validate
- [ ] **Mailjet DNS records stay valid after hosting migration** — Verify `rapidopackvalencia.es` keeps active SPF (`include:spf.mailjet.com`), DKIM, and DMARC records and send a live test email to confirm inbox placement (not spam).
- [ ] **Turnstile hostname allowlist covers all VPS domains** — Confirm `rapidopackvalencia.es`, `www.rapidopackvalencia.es`, and any staging hostname are listed under Turnstile site key `0x4AAAAAAFWf9LvYLm41PcPy` in Cloudflare's dashboard.
- [ ] **Nginx forwards client IP headers reliably** — Confirm Nginx sets `X-Real-IP` and appends to `X-Forwarded-For` (`TRUST_PROXY=true`) so Turnstile `remoteIp` and rate limiting see real visitor IPs instead of the Docker bridge IP.
- [ ] **Mailjet free tier (200 emails/day, 6,000/month) covers store volume** — Confirm with historical inquiry volume; rate limiting + fail-closed Turnstile prevents bot spikes from burning quota.

## MVP Scope
**In:**
- **Fail-closed production config** in `src/lib/contact-handler.ts`: Reject missing or placeholder `TURNSTILE_SECRET_KEY` / `MAILJET_API_KEY` / `MAILJET_SECRET_KEY` with `503` when `NODE_ENV=production` (preserving existing test/dev dummy behavior outside production).
- **Liveness vs. Readiness split** in `server.mjs`: Keep `/healthz` as the container liveness probe; add `/readyz` reporting safe boolean readiness checks (never exposing secret values) + startup warning log if secrets are missing.
- **Nginx-aware edge protections** in `server.mjs` + `src/lib/contact-handler.ts`:
  - Forward visitor IP (`CF-Connecting-IP`, `X-Real-IP`, or rightmost proxy-appended `X-Forwarded-For` when `TRUST_PROXY=true`) to `verifyTurnstileToken({ remoteIp })`.
  - Lightweight in-memory sliding-window IP rate limit on `POST /api/contact` (5 requests / 10 min per IP → `429 Too Many Requests` with Spanish error message and `Retry-After`).
- **Structured JSON logging (PII-free)** to `stdout`/`stderr`: Log Turnstile failures, Mailjet HTTP errors, rate limits, and `contactListSynced: false` events with status/error codes (never logging raw message text, email, or phone) so `docker logs` makes failures visible.
- **Post-deploy preflight script** (`scripts/verify-contact-env.mjs` via `npm run verify:contact`): Validates env completeness, optionally checks `/healthz` and `/readyz`, and optionally verifies Mailjet API credentials without sending spam.
- **Automated TDD tests** in `tests/docker-server.test.mjs` and `tests/contact-api.test.mjs` covering `503` fail-closed, `/readyz` `200`/`503`, `429` rate limit, `remoteIp` forwarding, and zero regressions to Cloudflare `wrangler.json`.

**Out:**
- Changes to `ContactForm.astro` UX, Cloudflare Workers (`src/worker.ts`, `wrangler.json`), or Mailjet email templates.

## Not Doing (and Why)
- **Persistent SQLite/Redis outbox & retry queue** — Breaks `read_only: true` stateless containers and adds volume/ops overhead for a low-volume local store form that already displays the direct phone/WhatsApp fallback (`640 39 74 34`) on error.
- **Telegram / WhatsApp dead-letter webhooks** — Introduces a new credential to manage and a new third-party data processor requiring RGPD updates in `src/pages/privacidad.astro`.
- **Replacing Mailjet with direct SMTP or another ESP** — Unnecessary churn; Mailjet API v3.1/v3 already works at €0/month, has 100% test coverage, and is already disclosed in the privacy policy.
- **Removing Cloudflare Turnstile** — Turnstile is free, RGPD-friendly, and works from any VPS over HTTPS; replacing it requires rewriting `ContactForm.astro` and existing tests for no gain.
- **External npm dependencies (Express, Pino, Nodemailer, Rate-Limiter libs)** — Preserves the zero-`node_modules` Alpine runtime image (`server.mjs` stays pure Node 22 built-ins).
