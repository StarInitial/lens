# Repository Guidelines

## Project Structure & Module Organization

StarLens is an Electron and React Kubernetes IDE in an npm/Lerna monorepo. `packages/` contains the core application, feature modules, UI components, extension API, and shared tooling; package source generally lives in `src/`. `open-lens/` contains the desktop app, webpack configuration, static assets, and integration tests. Documentation and images live in `docs/`, operational scripts in `scripts/`, and manual scenarios in `scenarios/`.

## Build, Test, and Development Commands

Use Node.js 22.12 or newer and npm 9.6.7 or newer. Run these commands from the repository root:

- `npm install` installs workspace dependencies and links packages.
- `npm run build` builds the workspaces; `npm run build:app` packages the desktop app.
- `npm run dev` builds in development mode and starts the workspace watcher. In another terminal, `npm run start-dev` prepares binaries and starts the app.
- `npm run lint` checks workspace code; `npm run lint:fix` applies supported fixes.
- `npm run test:unit` runs unit tests; `npm run test:integration` runs integration tests. `npm run check:i18n` checks translations.
- `npm run mkdocs:serve-local` serves documentation with Docker; `npm run mkdocs:verify` builds it in strict mode.

## Coding Style & Naming Conventions

Follow the affected package's ESLint and Prettier configuration. Shared settings use two spaces, double quotes, semicolons, trailing commas, and Unix line endings. Use PascalCase for TypeScript interfaces and type aliases; follow nearby filenames and component conventions. Include the repository's `license-header` in source files where required by lint rules. Avoid imports from a local `.` barrel in core code.

## Testing Guidelines

Jest runs `*.test.js`, `*.test.ts`, and `*.test.tsx` files, usually beside the source or in `__tests__/`. Add focused tests for behavior changes and review snapshot updates. The shared package configuration requires 100% branch, function, line, and statement coverage for included source; individual packages may configure Jest differently. Integration tests are under `open-lens/integration/` and depend on an app build.

## Commit & Pull Request Guidelines

Recent commits use concise conventional subjects such as `feat: ...`, `fix(terminal): ...`, and `chore: ...`. Keep changes focused. The pull request template asks for a change description, a linked issue (`Fixes #...`), and an appropriate label such as `bug`, `enhancement`, or `chore`. Include test results and screenshots for visible UI changes when useful.

## Repository Ownership & Publishing

This is a personal modified version of StarLens and does not require collaboration or a pull request workflow. When publishing changes to GitHub, commit the focused changes and push directly to `master` by default. Create a feature branch or pull request only when explicitly requested.
