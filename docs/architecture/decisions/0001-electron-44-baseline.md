# 1. Electron baseline: 44.x (the "LTSC-like" line)

* Status: accepted
* Date: 2026-11-13
* Deciders: OpenLens maintainers
* Supersedes: "stay on Electron 22 forever" (implicit status quo)

## Context

The monorepo was pinned to `electron@22.3.10` (Node 16.17, Chromium 108, module ABI 110).
Electron 22 reached end of life long ago: it no longer receives Chromium security
patches, so every shipped build carried a browser engine with publicly known,
unpatched vulnerabilities.

Electron has **no official LTS**. The published support policy is "the latest three
stable major versions receive security and bug fixes", which at an eight week release
cadence is a support window of roughly five to eight months per major. A
"long term" baseline therefore cannot be bought from upstream, it has to be
*operated*: pick one major, freeze the product on it, take every patch release of
that major, and re-baseline on a fixed schedule.

Additional constraints considered:

* Electron 22 is the **last** major that supports Windows 7 / 8 / 8.1. Electron 23
  dropped those, and no future version will bring them back.
* Electron 44 dropped 32 bit Windows (`win32-ia32`) and Linux ARMv7, and dropped
  macOS 12 (Monterey) because Chromium no longer supports it.
* The application renders with `nodeIntegration: true`, `contextIsolation: false`
  and no preload script, i.e. it depends on renderer capabilities that Electron is
  actively shrinking (44 removed the `clipboard` module from renderers entirely).

## Decision

Baseline the product on **`electron@44.11.3`** and keep it on the 44 line, taking
every `44.x` patch release.

* Runtime: Node 24.18 (LTS line, upstream support until 2028-04), Chromium 152.0.7977,
  native module ABI 149.
* Supported platforms: Windows 10+ (x64), macOS 13+, Linux x64/arm64.
  Windows 7/8/8.1, 32 bit Windows, `linux-armv7l`, Unity desktops and macOS 12 are
  explicitly dropped.
* The 44 line is end-of-lifed when Electron 47 ships (expected 2027-03/04). A new
  baseline must be evaluated in **2027 Q1**, targeting "latest major minus one" at
  that time (expected 48.x).

The toolchain moves with it: `electron-builder@26`, `electron-updater@6.8`,
`@sentry/electron@8`, `electron-devtools-installer@4`, `@electron/notarize@3`,
TypeScript 5.x, `@types/node@24`, and Node 22.x on CI (the `electron` npm package
requires `node >= 22.12.0`).

## Consequences

Easier:

* Security patching is possible again for the first time in two years.
* Modern Chromium/Node/V8: no more workarounds for long fixed engine bugs, faster
  startup and lower memory use.
* A repeatable process ("freeze a major, re-baseline yearly") instead of ad-hoc jumps.

Harder / accepted costs:

* Code changes were required in the renderer (see below).
* The migration from a two year old baseline is large: 22 majors of breaking changes
  land at once. Intermediate majors (23-43) were not used as release targets because
  they are all end-of-life as well; they were only useful as debugging checkpoints.
* Dropping 32 bit Windows, macOS 12 and Windows 7/8/8.1 is a product decision with
  user facing impact and has to be reflected in the release notes.

Code that had to change:

| Area | Electron change | Where |
| --- | --- | --- |
| Clipboard | 44: `clipboard` removed from renderers, clipboard API is promise based | `renderer/utils/clipboard.ts` (new) and its four call sites |
| File paths | 32: `File.path` removed in favour of `webUtils.getPathForFile` | `renderer/utils/get-path-for-file.ts` (new), `components/file-picker` |
| File dialogs | 43: default dialog location changed to "Downloads" | `main/ipc/ask-user-for-file-paths.injectable.ts` |
| Error reporting | Sentry JS v8 removed `@sentry/integrations` (`Offline`, `Dedupe`) | `common/error-reporting/initialize-sentry-reporting.injectable.ts` |
| Devtools | `electron-devtools-installer@4` resolves with extensions, not a name | `main/electron-app/runnables/setup-developer-tools-in-development-environment.injectable.ts` |
| `--host-rules` | 40: switch deprecated, **no longer effective in 44** | `main/start-main-application/runnables/setup-hostnames.injectable.ts` (moved to `host-resolver-rules`) |
| System proxy | 44: Chromium no longer bypasses a proxy for `lens.app`, the main window fails with `ERR_CONNECTION_CLOSED` behind a system proxy | `main/start-main-application/lens-window/setup-session-proxy-bypass.injectable.ts` (new: reads the system proxy with `resolveProxy` and re-applies it as `fixed_servers` with the Lens origins in `proxyBypassRules`) |
| Dev server reachability | 44: an unhandled error event is fatal in the main process | `main/routes/files/development.injectable.ts` (the proxy to the webpack dev server now answers 502 + auto reload instead of throwing) and `main/start-main-application/lens-window/wait-for-webpack-dev-server.injectable.ts` (new: the window waits for the dev server), plus `open-lens/webpack/dev-server.ts` (binds `127.0.0.1` explicitly, `localhost` resolved to `::1` only) |
| Unhandled rejections | 44: main process runs on Node 24 where an unhandled rejection kills the process | `main/start-main-application/lens-window/application-window/create-lens-window.injectable.ts` (a rejected `loadURL` used to abort startup without showing any window) |
| Login item settings | 44: pre macOS 13 attributes (`openAsHidden`, `wasOpenedAsHidden`) removed | `features/user-preferences/main/sync-open-at-login-with-os.injectable.ts`, `main/electron-app/features/should-start-hidden.injectable.ts` (start-hidden is driven only by the `--hidden` argument now) |
| `File.path` in D&D install | 32: removed | `renderer/components/extensions/install-on-drop.injectable.ts` |
| Menu click signature | 44: second argument widened to `BaseWindow` | `features/application-menu/main/populate-application-menu.injectable.ts` |
| IPC event types | 44: `IpcMainEvent`/`IpcRendererEvent` no longer interchangeable | `extensions/ipc/ipc-main.ts` |
| `app.getPath` names | 44: added `assets` to the path names | `common/app-paths/app-path-names.ts` (path list is now explicit instead of derived from Electron) |
| `child_process` / `app` typings | node 24 types | `common/error-reporting`, `main/electron-app` test doubles, `utility-features/utilities/src/{tar,type-narrowing}.ts` |

## Verification

Performed on Windows x64 against `electron@44.11.3` (Node 24.22.2, Chromium 152, ABI 149):

* `tsc -p packages/core --noEmit` with the Electron 44 typings: clean.
* Unit tests of the touched areas (app paths, main window creation, electron app double,
  application menu, application updates, extension ipc, renderer clipboard/file path
  helpers): 200+ passing.
* `node-pty` loads and spawns a real PTY inside the Electron 44 process (`ELECTRON_RUN_AS_NODE`,
  ABI 149) using its N-API prebuild.
* The application starts, the splash and the main window load (625 ms in dev, no failed
  navigation) and the rendered UI is reachable: the root frame ends up on
  `https://lens.app:<port>/welcome` with a populated DOM and the cluster frame renders.

Notes from the verification run:

* `lens.app` no longer resolves implicitly to loopback for Chromium's proxy logic, so the
  session proxy bypass above is mandatory on machines with a system proxy. Without it the
  first navigation fails after ~12 s and, because the main process is on Node 24, the
  rejection used to terminate the app before any window was shown.
* `npm run dev` only builds, it never starts Electron. Use `npm run start-dev`.

Not covered here and still requiring manual QA: clipboard copy/paste in the terminal and in
the dialogs, kubeconfig drag & drop, the native file dialogs, `win-ca` system certificate
injection and the auto-update flow.

## Known debt deferred by this decision

The renderer security model (`nodeIntegration: true`, `contextIsolation: false`,
`nodeIntegrationInSubFrames: true`, no preload) is **not** part of this baseline
change; it is scheduled as its own milestone. The renderer footprint is small
(nine files import Node builtins, fourteen import `electron`), so the migration path
is: introduce a preload script with `contextBridge` -> drop
`nodeIntegrationInSubFrames` -> evaluate `contextIsolation: true`.

Trigger to start that work: the next baseline upgrade touching renderer
capabilities, or a security/compliance requirement for renderer sandboxing.

## See also

* `scripts/check-electron-eol.mjs` - reports how much support window the pinned
  major has left; wired into the `Electron baseline` CI workflow.
* Electron breaking changes: <https://github.com/electron/electron/blob/main/docs/breaking-changes.md>
* Electron release schedule: <https://releases.electronjs.org/>
