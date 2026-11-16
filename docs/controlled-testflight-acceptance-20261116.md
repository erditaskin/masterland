# Controlled TestFlight acceptance — 16 November 2026

## Approved scope

The user approved a controlled TestFlight build with debug/test mode disabled. Advertising must still use Google test inventory. Existing normal/test progress must be preserved, and production reward execution remains disabled.

## Implementation

- `EXPO_PUBLIC_CONTROLLED_ACCEPTANCE=true` with `testflight` and `EXPO_PUBLIC_TEST_MODE=false` selects a separate fresh save at `@masterland/save/controlled-testflight/v1`.
- The existing `@masterland/save/v2` save and its legacy imports are not copied into this controlled save. Normal builds keep their existing namespace.
- A confirmed account deletion clears both local progress namespaces and the pre-cloud backup, consistent with the user's decision.
- Test ads can be previewed with debug mode disabled. They do not change the controlled live-account balance or daily reward allowance. Debug-mode test ad rewards remain isolated from production cloud writes.
- `ios:acceptance` builds this configuration with backend enabled and account deletion still disabled.

## Verification

- 80 unit tests passed; TypeScript and ESLint passed.
- Release iOS simulator test `testControlledAcceptanceHasNoCheatsAndOnlyPreviewAds` passed. Debug buttons were absent and the energy page explicitly described the no-credit preview.
- Physical device build/signing and real Apple login/deletion acceptance remain separate steps.

## Approved remote deployment

The user approved deploying reviewed migrations and closed-default functions to `qydeobqdselujkprmxpb` at action time.

- All three migrations were applied in one transaction through the authenticated dashboard SQL Editor. The public application schema was empty before deployment. Success was observed.
- All seven application tables have RLS enabled, verified with a post-deployment query.
- `anon` and `authenticated` cannot execute `record_energy_ssv`, verified with `has_function_privilege`.
- `delete-account` and `admob-ssv` were deployed through the dashboard using Deno-checked single-file bundles generated from the canonical repository sources.
- Legacy gateway JWT checking is off as specified by `supabase/config.toml`; the handlers authenticate with Auth `getUser` or Google ECDSA verification respectively.
- Network probes sent no user identity, secret or credential. `delete-account` POST `{}` returned 503 `not_enabled`; `admob-ssv` GET returned 503 `Not enabled`.
- No execution flags were enabled, and the SSV endpoint was not added to AdMob.
- Dashboard SQL execution does not register Supabase CLI migration history. Before a future CLI `db push`, repair the three verified versions as applied rather than replaying them.

Apple key/secret setup is recorded by the separate setup session in `docs/account-setup-status.md`. Secret values are not copied into this implementation report. Apple exchange/revocation acceptance is not implied by deployment.

## Approved deletion response recovery deployment

The user separately approved migration `202611160004_deletion_recovery.sql` and the updated `delete-account` function with account deletion remaining disabled. The migration transaction succeeded in the authenticated dashboard, and the function overview confirmed a new deployment.

A deletion request now has a client-held random receipt. The server stores its SHA-256 hash. A status check can confirm the request after the Auth user has disappeared, without requiring an obsolete session. A missing response, network failure, or pending server operation never authorizes local erasure. Local progress resets only after a matching receipt confirms Auth deletion. The status endpoint returns no email, identity, or game progress.

Post-deployment probes used no real user or deletion request:

- Ordinary POST `{}` returned HTTP 503 with `not_enabled`, confirming deletion remains closed.
- A status request with a random nonexistent request ID and receipt returned HTTP 404 with `receipt_not_found`, confirming the recovery branch is deployed without exposing a request.

All four migrations and all three database suites passed in isolated PostgreSQL 16. The Release simulator passed normal-save reload and deletion-recovery parchment/retry checks. The updated local client has not been accepted on a physical device, and no real Apple account deletion/revocation was performed. Deployment is not end-to-end deletion acceptance.

Dashboard execution does not update CLI migration history. Repair all four verified versions as applied before a future CLI push; do not replay them.

Cloud outbox and explicit save-adoption foundations are under local test. Automatic cloud sync remains unconnected; these tests do not establish live cross-device synchronization.


## Physical-device authentication follow-up

- Confirmed installed bundle `com.erditaskin.masterland`, version 0.2.0 (2), on the iPhone 13 Pro. Updated in place without uninstalling or clearing game storage.
- Observed native Apple authorization, a connected Apple account, persistence across app replacement, and return to the game after successful sign-in. The user reported a brief account-summary flash; the final UI keeps the pending sign-in view mounted until navigation closes it.
- Removed account-linking UI at the user's request. Signed-out users see “Giriş yap”; sign-out explicitly clears the visible session after successful local sign-out. “Kapat” returns to local play without creating a Supabase anonymous account. Physical-device guest play, sign-out back to sign-in, and retained progress were observed.
- Added five auth-store regression checks for login without delivered auth events, logout/relogin, cancellation, failed server verification, and an existing stored session with stale visible state. 94 unit tests, TypeScript and lint pass.
- Release simulator `testOfflineAccountPanelAndContentLanguage` passed with the new “Kapat” action and TR/EN profile navigation. The final simulator profile layout was visually inspected.
- Final physical-device check completed: the user confirmed that Apple sign-in now returns directly to the game without the transient account summary. The game board was observed afterward with the same level 2, 103 energy and 96 gold as before the sign-out/relogin cycle. Real account deletion, provider revoke, and a new TestFlight upload are not accepted by these results.
