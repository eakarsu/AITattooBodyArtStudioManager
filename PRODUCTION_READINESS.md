# Production readiness

The governed API at `/api/governance` is the supported path for a body-art service order. It records tenant-scoped cases, opaque evidence references, approval-gated transitions, connector failures, an idempotent outbox, immutable delivery attempts, retry scheduling, dead-letter state, and reconciliation. It never books, charges, refunds, messages, or certifies health compliance by itself.

## Deployment sequence

1. Review `server/migrations/001_governed_body_art_service.sql`, back up the target database, and apply it as a separate deployment step with `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f server/migrations/001_governed_body_art_service.sql`.
2. Copy `.env.example` to `.env`; replace every placeholder, use a unique JWT secret of at least 32 characters, and set an explicit production CORS allowlist.
3. Install locked dependencies explicitly in `server` and `client`. `start.sh` only starts existing installations.
4. Provision tenant memberships separately. Connector workers must claim outbox items, call approved systems, and post only opaque receipts or failure metadata back to the API.

Production runtime rejects legacy provider routes, mock/demo flags, wildcard CORS, weak secrets, and startup schema bootstrap. Legacy AI/gap routes remain quarantined by default.

## Required external validation

Before release, validate payment, tax, inventory, scheduling, messaging, accounting, delivery, partner, and health-safety contracts in a controlled environment. Exercise double booking, stock races, payment divergence, cancellations, refunds, no-shows, partial service, health exceptions, retry exhaustion, dead-letter recovery, and reconciliation. Health and blood-borne-policy evidence requires qualified local review; the software does not make medical or regulatory compliance determinations.
