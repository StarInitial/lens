# StarLens

**A desktop Kubernetes IDE: explore clusters, inspect workloads and debug resources without living in `kubectl` and YAML.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#requirements)
[![Node](https://img.shields.io/badge/node-%3E%3D22.12-brightgreen.svg)](#requirements)

StarLens is a personal, redesigned build of the Lens Desktop Core — the same Electron + React application shell that powers Lens — packaged as a standalone Kubernetes IDE for Windows, macOS and Linux. It ships the full Kubernetes workbench (cluster catalog, workload views, logs, terminal, Helm, CRDs, metrics) plus the Lens Extension API, so existing Lens extensions keep working.

> **Note** — StarLens is an unofficial, personal fork. It is not affiliated with, endorsed by, or supported by Mirantis or the Lens team.

## Highlights

- **Cluster catalog** — keep several clusters side by side, switch between them, and see connection state at a glance.
- **Workloads at a glance** — a workloads overview with per-resource status rings (pods, deployments, daemon sets, stateful sets, replica sets, jobs, cron jobs) and a compact events feed.
- **Every built-in resource view** — cluster, nodes, workloads, config (ConfigMaps, Secrets, HPA, …), network (services, ingresses, endpoints, port forwarding), storage (PVs, PVCs, storage classes), namespaces, events, Helm and custom resources.
- **Live operations** — stream pod logs, open a shell into a container, edit and apply resources, scale and restart workloads, delete resources with confirmation.
- **Metrics** — CPU and memory usage for pods, workloads and nodes when a Prometheus-compatible provider is installed.
- **Extension API** — the Lens extension system (main-process and renderer extensions, custom catalog entities, custom resource stacks) is fully available; see [`docs/`](./docs).
- **Localized UI** — English (default) and 简体中文, switchable at runtime.
- **Redesigned shell** — refreshed theme, typography, card surfaces and motion across the main layouts and the sidebar.

## Requirements

- Node.js **22.12** or newer
- npm **9.6.7** or newer
- A kubeconfig with at least one cluster, if you want to see live data

StarLens runs on Windows, macOS and Linux. It bundles its own `kubectl`, `helm` and `lens-k8s-proxy` binaries, so no local Kubernetes tooling is required to use the app.

## Getting started

Clone the repository and install the workspace dependencies from the repository root:

```bash
git clone https://github.com/StarInitial/lens.git
cd lens
npm install
```

### Run in development

`npm run dev` builds the workspaces and starts the watcher; keep it running, then start the desktop app from a second terminal:

```bash
npm run dev
# in another terminal
npm run start-dev
```

### Build the desktop app

```bash
npm run build       # build all workspace packages
npm run build:app   # package the desktop app with electron-builder
```

### Test, lint and check translations

```bash
npm run test:unit           # unit tests
npm run test:integration    # integration tests (needs an app build)
npm run lint                # ESLint across the workspaces
npm run lint:fix            # apply supported fixes
npm run check:i18n          # verify translation bundles
```

## Repository layout

| Path | Contents |
| --- | --- |
| `packages/` | Workspace packages: the core application, feature modules, UI components, the extension API and shared tooling. |
| `star-lens/` | The desktop application: Electron main/renderer entry points, webpack configuration, static assets and integration tests. |
| `docs/` | Lens Extension API documentation and guides. |
| `scripts/` | Operational and release helper scripts. |
| `scenarios/` | Manual test and demo scenarios. |

Source code generally lives in each package's `src/` directory; tests sit next to the code they cover (`*.test.ts[x]`) or in `__tests__/`.

## Localization

The UI ships with English and Simplified Chinese. Switch at runtime under **Preferences → App → Language** (`System default`, `English`, `简体中文`); the choice is stored in the user preferences and applies immediately. Translation bundles live in `packages/core/src/common/i18n/translations`, and `npm run check:i18n` validates them.

## Extensions

StarLens implements the Lens Extension API. Extensions are built with the `@k8slens/extensions` API package and the `@k8slens/legacy-extension-example` sample in this repository, and installed extensions appear in the in-app extension page (`lens://app/extensions`). Start with [`docs/README.md`](./docs/README.md) for the API overview and guides.

## Documentation

- Extension development: [`docs/README.md`](./docs/README.md)
- Getting started / capabilities / guides: [`docs/extensions`](./docs/extensions)
- Architecture decision records: [`docs/architecture/decisions`](./docs/architecture/decisions)
- Contributor and agent notes: [`AGENTS.md`](./AGENTS.md)

The documentation site is built with `mkdocs`; `npm run mkdocs:serve-local` serves it locally and `npm run mkdocs:verify` builds it in strict mode.

## Contributing

This is a personal build, so there is no public contribution or pull request workflow. Changes are committed with conventional commit subjects (`feat:`, `fix(scope):`, `chore:`) and pushed directly to `master`.

Issues and suggestions are still welcome via the GitHub issue tracker.

## License

StarLens keeps the licensing of the upstream Lens Desktop Core:

- All source code, and everything outside `docs/`, is released under the [MIT license](./LICENSE).
- Content under [`docs/`](./docs) is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Portions of the codebase are derived from the OpenLens / Lens open source project and remain copyright of their respective authors.
