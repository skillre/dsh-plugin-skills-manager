# 0.1.1 transport contract and verification boundary

## Discovery on 2026-11-02

The writer loaded `cordis-plugin-development`, listed Inspect Providers, and queried Host `Service.listService` for `connection`. The current fleet snapshot and mounted package both identify DSH `0.2.1-rc.5`. The test-only `@deepseek-ai/dsh-client-connection` version was resolved from the [fleet toolchain snapshot](</Users/skillre/dsh-plugins/toolchain.json#L133-L135>), not hand-picked or widened.

Only this Host face is required:

```ts
connection.fetch.register({
  path: '/api/skillre-skills-manager/execute',
  methods: ['POST'],
  requestBody: 'buffered',
  fetch: async (request: Request) => response,
}) // => () => Promise<void>, owned by the Context reading the service
```

The writer also queried Host `llm.listConfigurableProviders` and `settings.describe`, and read the real SettingsController remote adapter. `settings/describe` returns `{ writable, hasDocument, namespaces }`; Desktop welcome actually calls `llm/listConfigurableProviders`, whose result is a directory array. Tests must exercise both through the real Gateway, not a plugin-owned lookalike. The actual [Gateway wire helper](</Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/dsh-api-gateway/lib/index.js#L1460-L1472>) requires unary Remote payload `{ args: {} }` for these no-argument methods; the plugin's direct `{ action: ... }` payload is different. [SettingsForms.describe](</Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/dsh-settings/lib/index.js#L413-L450>) projects only volatile Config fields. This plugin has no volatile fields, so its absence from the live form namespaces is normal; uninstall is instead proved by dependency/selection/composition/route absence. The first two pre-final runs remain failed evidence for these test-harness mistakes, with verified owned cleanup, and cannot become compatibility proof.

Client `Service.listService(connection)` timed out after 10 seconds. No page was opened, reconnected or configured to bypass that limitation. The Client RPC call remains `connection.rpc.call('/api', ENDPOINT, payload, signal)`; only type-only realm separation was needed because the real Host test package augments `Context.connection`. The compiled Client artifact must remain byte-identical to 0.1.0.

## Real runtime evidence for the decision

The mounted [Connection README](</Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/dsh-client-connection/README.md#L30-L53>) documents that Web and Desktop shell-owned carriers dispatch the same shared Fetch handler and that exact Fetch routes are owner-only.

The actual [HostConnectionService implementation](</Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/dsh-client-connection/lib/index.js#L820-L885>) confirms:

- exact pathname/method selection precedes the Gateway interceptor;
- non-owner exact-route access returns HTTP 403 before the route callback;
- exact-route registration belongs to the caller Fiber;
- there is exactly one interceptor for all of `/api`, irrespective of its endpoint matcher.

Therefore 0.1.0 could break Gateway regardless of plugin order. 0.1.1 contributes one exact route, not another interceptor or server. The adapter re-expresses only the inspected unary JSON envelope, checks media type/discriminator/correlation/method, and delegates payload validation and business operations to the unchanged manager. It receives the carrier's request signal; manager lifetime/cleanup already cancels operations on Fiber unload. No guessed Peer callback parameter, credential read, cached Inspect business data, or global Gateway fallback is introduced.

## Required checks and limits

[Real registry tests](</Users/skillre/dsh-plugins/repos/dsh-plugin-skills-manager/tests/transport.spec.ts>) import the actual exported `HostConnectionService` as `ConnectionRegistry`, including its real shared-handler dispatch, Peer scopes and Cordis ownership. A Gateway-style interceptor fixture intentionally matches every endpoint to prove exact-route priority. Both Gateway-first and plugin-first order work; disposing either contribution preserves the other, and plugin Fiber restart/cleanup is exercised. These tests do not pretend the Gateway fixture is the full application: the packed test supplies that coverage.

The [isolated runner](</Users/skillre/dsh-plugins/repos/dsh-plugin-skills-manager/scripts/verify-isolated.mjs>) creates a fresh owned non-Desktop home/profile, installs a regular tarball, compares every packed file with frozen checkout bytes, and calls the real authenticated Gateway welcome APIs plus plugin list/detail/check/remove/restore. Welcome acceptance is only successful correlated RPC, a Settings record with a namespaces array and an LLM directory array; empty arrays are valid, and no extra live-form/provider-field assumptions are imposed. It stops the first Host, starts another while the packed plugin remains installed, repeats welcome and restored-fixture list/detail/fingerprint checks, then uninstalls, starts a third Host, repeats welcome reads and verifies the plugin route returns 404. It retains the original strict positive-owned-PID stop → `close` → group `ESRCH` → canonical owner/UID-root removal → `ENOENT` proof. `EPERM` remains failure/uncertainty; it is never exit evidence. No user profile, skill, browser, DSH installation or remote publication is changed.

The metadata-bearing final tarball must be packed after pre-final evidence is consumed and then reinstalled without any concurrent rebuild or metadata change. Its complete payload, SHA256, uninstall and owned cleanup proof remain external to avoid an impossible self-referential tarball hash.

Real Electron visual/interaction acceptance and the user's daily Desktop restart remain unverified and user-owned. Native registry and isolated macOS CLI carrier checks are not a substitute. Version 0.1.0 is unsafe to install or roll back to; if Plugins is inaccessible, preserve logs and obtain separate user consent for a reversible recovery rather than editing Desktop profile state in this task.
