# Deployment guide

This guide describes the production path for Founder DNA v0.6.0:

- Vercel for the Vite application and Express serverless API;
- Supabase for authentication and Postgres persistence;
- Gemini API or Vertex AI for live Foundry generation;
- Stripe for signed payment evidence;
- Capacitor for Android packaging.

## Deployment contract

A release is production-ready only when:

1. `npm run verify` passes;
2. the Supabase migration has been applied;
3. `npm run db:check` reports all eight application tables;
4. production environment variables are configured outside the repository;
5. authentication redirects match the deployed origin;
6. the production smoke tests below pass.

## 1. Install and verify

```bash
npm ci
npm run verify
```

Do not deploy from a dependency tree created with `npm install` when the lock
file has changed unexpectedly. Continuous integration uses `npm ci` and
Node.js 24.

## 2. Prepare Supabase

Open the target project in Supabase and run:

```text
supabase/migrations/202607250001_founder_dna.sql
```

The migration creates:

- `founder_profiles`;
- `evidence_events`;
- `agent_runs`;
- `match_profiles`;
- `connections`;
- `conversations`;
- `messages`;
- `intro_meetings`.

It also installs timestamps, integrity triggers, grants, indexes, new-user
bootstrap records, and Row-Level Security policies.

Verify the result:

```bash
npm run db:check
```

In **Authentication → URL Configuration**:

- set the production origin as the Site URL;
- allow `http://localhost:4173/**` for development;
- allow `https://YOUR_DOMAIN/**` for production.

Email/password authentication works without an external OAuth provider. Keep
the Google button disabled until a real Google OAuth client and matching
Supabase redirect URL are configured.

## 3. Configure Vercel

Import the GitHub repository into Vercel. The repository-level `vercel.json`
defines the build, SPA deep-link fallback, `/api/*` function rewrite, security
headers, and immutable asset caching.

### Required values

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_JWKS_URL=https://YOUR_PROJECT.supabase.co/auth/v1/.well-known/jwks.json
USE_SUPABASE=true
PUBLIC_APP_URL=https://YOUR_DOMAIN
ALLOWED_ORIGINS=https://YOUR_DOMAIN,capacitor://localhost
```

Use the same project URL and publishable key for:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_SUPABASE_GOOGLE_ENABLED=false
```

The publishable key is designed for browser use and remains constrained by
RLS. `SUPABASE_SECRET_KEY`, when needed for a trusted administrative workflow,
must be stored as a server-only encrypted environment variable. Never prefix a
secret with `VITE_`.

### Optional Gemini configuration

Choose one provider path.

Gemini API:

```dotenv
GEMINI_API_KEY=YOUR_SERVER_ONLY_KEY
GOOGLE_GENAI_USE_VERTEXAI=false
GEMINI_MODEL=gemini-2.5-flash
```

Vertex AI:

```dotenv
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=global
GOOGLE_GENAI_USE_VERTEXAI=true
GEMINI_MODEL=gemini-2.5-flash
```

### Optional Stripe configuration

```dotenv
STRIPE_SECRET_KEY=YOUR_SERVER_ONLY_KEY
STRIPE_WEBHOOK_SECRET=YOUR_SIGNING_SECRET
STRIPE_PRICE_ID=YOUR_PRICE_ID
```

Create the production webhook endpoint at:

```text
https://YOUR_DOMAIN/api/webhooks/stripe
```

## 4. Deploy

```bash
npm run deploy:check
npx vercel
npx vercel --prod
```

`deploy:check` intentionally fails if the database schema is not available. Do
not bypass that failure for a public release.

## 5. Production smoke test

```bash
curl -i https://YOUR_DOMAIN/login
curl -sS https://YOUR_DOMAIN/api/health
curl -i https://YOUR_DOMAIN/api/ledger
curl -I https://YOUR_DOMAIN/Founder-DNA-Agency-Pilot-Blueprint.pdf
```

Expected behavior:

- `/login` returns HTTP `200` through the SPA fallback;
- `/api/health` reports version `0.6.0`, Supabase persistence, database ready,
  and Supabase JWT authentication;
- `/api/ledger` returns `401` without a valid access token;
- the agency blueprint returns a PDF;
- unknown public routes render the application recovery page.

Complete these manual checks in two separate browser accounts:

1. email signup and confirmation;
2. sign-in, sign-out, and password reset;
3. profile creation and private/published matching state;
4. account isolation across profiles, messages, proof, and agent runs;
5. consent-based introduction state transitions;
6. dark, light, desktop, and mobile layouts;
7. Gemini unavailable and configured states;
8. signed Stripe webhook ingestion, when enabled.

## 6. Operations

Recommended production controls:

- require the GitHub `Verify` workflow before merging to `main`;
- enable Dependabot and GitHub secret scanning;
- create Vercel and Supabase budget alerts;
- monitor `/api/health` without storing private response data;
- retain structured Gemini run receipts and human decisions;
- rotate any credential that appears in logs or source history;
- test database restores before collecting real customer evidence.

## Rollback

Vercel deployments are immutable. Roll back application code by promoting the
last known-good deployment. Do not reverse a database migration by deleting
tables containing user evidence. Use a reviewed forward migration that
preserves records and RLS.

## Optional Cloud Run target

`Dockerfile` and `cloudbuild.yaml` provide an alternative Express deployment.
Supply the same Supabase and application variables at runtime. Vertex AI can
use the Cloud Run service account through Application Default Credentials.

After deployment, point the Vite client and Android build at the Cloud Run
origin with `VITE_API_BASE_URL`.

## Android production release

The repository creates a development APK:

```bash
export ANDROID_SDK_ROOT=/absolute/path/to/android-sdk
npm run android:build
```

For Play Store distribution:

1. set `VITE_API_BASE_URL` to the production HTTPS origin;
2. keep `VITE_ENABLE_LOCAL_REVIEW` unset;
3. create and protect a release keystore outside the repository;
4. build a signed Android App Bundle;
5. verify OAuth redirect and deep-link behavior on a physical device;
6. complete Play Console privacy, data-safety, and account-deletion details.
