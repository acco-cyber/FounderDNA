# Security policy

Founder DNA handles founder profiles, AI outputs, matching conversations, and
business evidence. Authentication bypasses, cross-account data exposure,
credential leaks, injection, evidence-integrity failures, and payment webhook
forgery are treated as security issues.

## Supported versions

| Version | Supported |
| --- | --- |
| Current `main` branch | Yes |
| Latest tagged release | Yes |
| Earlier releases | No |

Security fixes are applied to the current release line. Deployments should
upgrade instead of independently patching an older build.

## Reporting a vulnerability

Use the repository's private **GitHub Security Advisory** flow. Do not open a
public issue containing:

- credentials or tokens;
- personal or customer data;
- private founder evidence;
- a working exploit;
- cross-account records;
- Android signing material.

Include the affected route or component, deployment mode, reproduction steps,
impact, and the smallest safe proof of concept. Remove unrelated personal data
from screenshots and logs.

## Security boundaries

- Supabase access-token signatures are verified against the project JWKS.
- Postgres Row-Level Security isolates private application records.
- Browser bundles receive only the Supabase URL and publishable key.
- Secret keys remain server-only.
- Stripe events are accepted only after signature verification.
- AI output is schema-validated and cannot directly authorize consequential
  actions.
- Demo and local-review identities are disabled in production builds.

## Secret handling

Never commit:

- `.env` files;
- Supabase secret keys;
- Stripe or Gemini secrets;
- evidence-admin or scheduler keys;
- service-account JSON;
- Android keystores;
- customer source documents.

The Supabase URL and publishable key identify a project but do not bypass RLS.
If any secret appears in source history, logs, a screenshot, or a build
artifact, revoke and rotate it before removing the exposed copy.

## Safe verification

Run before release:

```bash
npm run verify
npm run db:check
```

Test account isolation with two non-production accounts. Do not use real
customer evidence in automated tests or vulnerability demonstrations.
