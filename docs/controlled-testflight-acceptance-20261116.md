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
