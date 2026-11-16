# Rewarded energy and account deletion implementation checkpoint

## Scope and decisions

Only the existing AdMob rewarded-energy placement is integrated. No banner, interstitial, app-open or rewarded-interstitial placement is created. The product recommendation remains to start with optional energy rewards and measure player response before considering another optional placement.

The user confirmed that account deletion also deletes progress on the current phone. A later signup with the same email must create a new Auth UUID and a new application account, without inheriting deleted progress.

## Mobile implementation

- Google Mobile Ads 17.4.0 and NetInfo are integrated through Expo configuration. Generated `mobile/ios` remains disposable.
- App measurement is delayed. UMP gathers current consent before initializing/loading ads. Privacy choices can be reopened from the account page when required by UMP.
- Only explicit user action shows a rewarded ad. The energy page uses the existing parchment controls.
- Development/TestFlight selects Google's test rewarded unit. Production reward execution remains closed in code.
- Test rewards grant 15 energy only on `EARNED_REWARD`, never on close/error. Receipts and daily quota are stored in the same game save; duplicate callbacks cannot grant twice. The test quota resets by UTC date and permits four rewards per day.
- The approved promotion policy exists (30-minute interval, two per session), but automatic promotional UI is not yet enabled. Ads never open automatically.
- Test progress is marked `testOnly`, rejected by the cloud repository and the protected SQL write trigger.

Feature flags default off: `EXPO_PUBLIC_ADS_ENABLED`, `EXPO_PUBLIC_ACCOUNT_DELETION_ENABLED`. Account/backend flags remain separately gated. The existing test-to-production backend guard is preserved.

## Server implementation prepared, not remotely deployed

- `admob-ssv` verifies the original encoded callback query using Google's ECDSA public keys. It validates unit suffix, reward amount/type, timestamp, user and intent. Public-key refresh is bounded and handles key rotation.
- `prepare_energy_ad` and `record_energy_ssv` provide owner-scoped intents, transaction/intent idempotency, a server-side daily quota and an RLS-protected reward ledger. Only service-role execution can record an SSV grant.
- The live client still needs durable pending-reward reconciliation and cloud/economy integration. Prepared server code is not a live reward service.
- `delete-account` authenticates with Auth `getUser`, requires explicit confirmation and a recent sign-in, creates a deletion request, and performs Auth hard deletion on the server.
- For linked Apple accounts, a fresh native authorization code is exchanged, its signed identity is matched, and authorization is revoked before Auth deletion. The code/tokens remain in invocation memory. `APPLE_CLIENT_SECRET` must be configured only on the server and rotated before expiry.
- `app_accounts.status` becomes `deleting` on request and `deleted` only after Auth deletion. Auth identities/sessions and cloud game records cascade. Existing JWTs cannot read/write game saves because current account existence/status is checked.
- Deletion requests/tombstones contain no email or provider token. Completed minimal audit records have a 30-day purge function. Scheduling and privacy-policy alignment remain release work.
- After server-confirmed deletion, the mobile reset removes the game save, pre-cloud backup and legacy imports. A persisted reset marker resumes interrupted cleanup and prevents old progress resurrection.

## Validation and known limitations

- 79 unit tests passed, covering rewarded lifecycle, duplicate/stale callbacks, production guard, daily quota persistence, ECDSA verification/tampering and interrupted local deletion cleanup.
- TypeScript, ESLint and Deno checks passed.
- A disposable PostgreSQL 16 container applied all three migrations. Account deletion/RLS and rewarded quota/idempotency test suites passed. This uses a minimal Auth fixture, not a real Supabase Auth deployment.
- Native simulator checks passed for normal-save reload, TR/EN account UI and actual Google test rewarded loading/presentation. The full video/end-card flow then passed: after returning to the board, stamina was 115 from an initial 100. Screenshots were captured and visually checked.
- An initial ad-load test exposed a consent/loading timing issue. The loader now waits for consent completion. Later full-reward tests exposed test automation issues around Google's end-card close controls and the energy page hiding background accessibility; the test now closes the actual end card and returns to the board before asserting the HUD.

## Release gates still open

1. Real Apple/Google/Facebook sign-in, linking, cancellation and account switching; Google Testing/Meta Unpublished restrictions remain.
2. Configure Apple revocation credentials and test deletion against real Auth, including response loss after Auth deletion and recovery of pending server requests. Account deletion stays disabled until these pass.
3. Controlled migration/function deployment, a real SSV callback URL configured in AdMob, signed callbacks observed end to end, and durable pending-credit reconciliation. No endpoint has been entered into AdMob by this implementation.
4. Consent accept/decline/reopen testing in a regulated debug region and on a physical iPhone. No live ad interaction during development.
5. Offline/cloud conflict selection, two-device persistence and production/test data isolation acceptance.

No remote Supabase schema/function deployment, physical-device installation or new TestFlight upload is implied by this checkpoint.

## Primary references

- https://docs.page/invertase/react-native-google-mobile-ads/european-user-consent
- https://docs.page/invertase/react-native-google-mobile-ads/ad-formats
- https://developers.google.com/admob/ios/ssv
- https://developer.apple.com/support/offering-account-deletion-in-your-app/
- https://developer.apple.com/documentation/signinwithapplerestapi/revoke-tokens
- https://supabase.com/docs/guides/auth/managing-user-data
- https://supabase.com/docs/reference/javascript/auth-admin-deleteuser
