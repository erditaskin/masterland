# Account, cloud and rewarded-ad foundation — 16 November 2026

## Implemented

- Explicit backend environment configuration, with a guard against connecting test-mode builds to the production backend.
- Native Apple and Google authentication paths, Facebook browser PKCE callback handling, identity linking and local sign-out. These paths are prepared, not verified against live accounts.
- Encrypted chunked session storage with serialized writes and recovery-safe replacement.
- TR/EN content names, shared legacy UI text translation, persistent language selection and account panel. English remains labelled as preview pending full copy review.
- Cloud save parsing and a revision-checked repository. SQL migration includes owner-read RLS, optimistic concurrency, write idempotency and ten previous snapshots.
- Rewarded-energy UX policy: +15 energy, four rewards per day, thirty-minute promotion interval and two promotions per session. Promotions require an idle board and no open page or celebration.

## Validation

- TypeScript check and ESLint passed without warnings.
- 69 unit tests passed.
- Release iOS simulator tests passed: language/account panel tour and normal-save reload.
- English board, collection, cities and market screenshots were captured. The cities screenshot was visually inspected. Language switching preserved the tested board geometry and wallet values.
- An earlier native build failed because temporary build files filled the disk. Only reproducible temporary derived-data folders were removed; the subsequent build and tests passed.

## Still required before release

- Live Apple/Google/Facebook sign-in, linking, cancellation and account-deletion verification.
- Cloud conflict selection UI, durable synchronization queue, offline reconnection and account-switch scenarios. The repository is deliberately not connected to automatic persistence yet.
- Apply and validate the SQL migration in the intended environment. No remote database deployment was performed during this phase.
- AdMob native integration, consent handling, server-side reward verification, reward ledger and end-to-end quota/idempotency tests. The local policy does not authorize rewards.
- Resolve test-mode isolation with the chosen single-production backend before enabling cloud features in a cheat-enabled build.
- Complete English copy/layout review, physical-device verification and a new TestFlight build after the complete integration passes.

The separate account-setup session owns `docs/account-setup-status.md`; it is intentionally excluded from this implementation commit. No credentials or `.env` file are committed.
