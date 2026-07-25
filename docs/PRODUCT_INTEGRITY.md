# Product integrity model

Founder DNA is designed to help people create evidence, not to convert
confidence into a claim. This document defines the trust boundaries used by
the product and repository.

## Evidence classes

Every meaningful product output belongs to one of three classes:

| Class | Meaning | May affect verified totals? |
| --- | --- | --- |
| Self-report | Information entered by a founder about skills, history, availability, or intent | No |
| Hypothesis | A model- or human-generated proposition that still requires testing | No |
| Verified evidence | A source-backed event reviewed under the product evidence rules | Yes |

The UI must not style self-report or hypotheses as proof.

## Verified proof rules

- Unverified revenue and expenses never contribute to verified P&L.
- Customer counts are deduplicated rather than summed across repeated events.
- A commitment is not treated as a payment.
- A meeting is not treated as demand.
- AI output is not treated as customer confirmation.
- Demo profiles and walkthroughs remain labeled illustrative.
- Unknown values remain unknown or zero; they are not estimated for
  presentation.

## Authentication and isolation

- Supabase Auth owns account lifecycle and access tokens.
- The API verifies token signatures against Supabase JWKS.
- Postgres Row-Level Security isolates user-scoped records.
- Published matching profiles expose only the fields permitted by policy.
- Connection and conversation access requires a participating account.
- Connection state transitions are enforced in the database, not only in the
  interface.
- Browser code never receives a Supabase secret key.

## AI boundaries

The Foundry integration is a guarded operating loop rather than an autonomous
agent with unlimited authority.

Each run:

1. accepts a bounded founder context;
2. requests schema-constrained output;
3. validates the response before use;
4. stores provider, model, duration, state, and failure metadata;
5. presents checkpoints for continue, pivot, or stop;
6. requires human approval before consequential action.

The system must not autonomously:

- spend money;
- publish outreach;
- create legal entities;
- agree to contracts;
- represent professional legal, tax, medical, or financial advice;
- claim that a hypothesis has been validated.

## Matching trust model

Compatibility is a decision aid, not a prediction of founder success.

- Scores explain shared vision and complementary operating signals.
- Verification badges represent specific completed checks only.
- Illustrative candidates cannot be contacted.
- A profile begins private and must be intentionally published.
- Introductions are consent-based.
- Scheduling does not imply a partnership or endorsement.

## Claim policy

The following claims require source-backed field evidence before publication:

- users served;
- revenue earned;
- jobs created;
- customer outcomes;
- time or money saved;
- predictive accuracy;
- partner or agency endorsement;
- market coverage or live local demand;
- “top percentile” performance.

The current codebase intentionally displays a zero baseline until real
evidence exists.

## Change review

Pull requests that affect scoring, AI behavior, proof totals, authentication,
RLS, matching visibility, payments, or public claims should answer:

1. Which evidence class does the new data belong to?
2. Can one account observe another account's private data?
3. Can the change inflate verified totals?
4. Does the model gain a new consequential capability?
5. Is the demo state still unmistakably labeled?
6. Is the behavior covered by unit, API, or routed browser tests?

The repository pull-request template includes these checks.
