# 2. Internationalization and the Simplified Chinese language pack

* Status: accepted
* Date: 2026-11-13
* Deciders: OpenLens maintainers

## Context

The renderer had no localization abstraction at all. Every visible string was a
literal in a component (about 2700 TS/TSX files), dates were formatted with
`toLocaleString()` or `moment.tz(...).format()` using the Chromium locale, and the
only locale-adjacent preference was `localeTimezone` (a time zone, not a
language).

Requirements:

* the user interface must be translatable without touching component logic,
* at least English and Simplified Chinese (`zh-CN`) must ship,
* the language must be selectable in Preferences and persisted,
* the choice must survive a restart, and "follow the operating system" must be
  the default,
* extensions must be able to translate their own UI against the Lens catalogs,
* existing snapshots and tests should stay meaningful.

## Decision

### Catalog based, dependency free runtime

The translation runtime is written in the repository (`common/i18n`) instead of
pulling in `i18next`/`react-i18next`:

* catalogs are flat maps from a dotted key (`preferences.tabs.application`) to a
  message, collected in `common/i18n/translations/{en,zh-cn}.ts`,
* `translateIn` resolves a key against the current catalog, then the English
  catalog, then the key itself. Returning the key means an unknown entry (for
  example an extension's plain text label) is rendered verbatim, so no catalog
  entry is needed for compatibility,
* `{{name}}` placeholders are interpolated from a parameter record; unknown
  placeholders are left as they are (visible, not `undefined`),
* the current locale lives in a MobX observable inside the `i18n` injectable, so
  every `observer` component and every `useTranslation()` consumer re-renders
  when the language changes.

The reasons not to add a dependency: the monorepo is being kept lean after the
Electron 44 baseline, the catalogs must be typed against `SupportedLocale`
(a plain `Record<SupportedLocale, TranslationDictionary>` is a compile time
check), and a missing dependency cannot break packaging. The key shape and
fallback semantics mirror i18next, so swapping the runtime later only requires
replacing `translateIn` and the `i18n` injectable.

### Locales and resolution

`common/i18n/locale.ts` defines `supportedLocales = ["en", "zh-CN"]`,
`defaultLocale = "en"` and the `system` sentinel of the `locale` user preference.

`resolveLocale(preference, systemLocale)`:

1. returns the preference when it is a supported locale,
2. otherwise resolves the environment locale (`navigator.language` in the
   renderer, `LC_ALL`/`LC_MESSAGES`/`LANG` in the main process), accepts both
   BCP 47 (`zh-Hans-CN`) and POSIX (`zh_CN.UTF-8`) spellings, and maps a language
   prefix (`zh*` → `zh-CN`),
3. falls back to English.

Traditional Chinese (`zh-TW`, `zh-Hant`) currently resolves to the Simplified
catalog; a `zh-TW` catalog is a one line addition to `supportedLocales` when the
translation exists.

### User preference and wiring

* `locale: LocalePreference` (`"system" | "en" | "zh-CN"`) was added to the
  preference descriptors. `toStore` serializes the `system` default as
  `undefined`, matching how every other default is stored. No migration is
  needed: an absent field reads back as `system`.
* `features/user-preferences/renderer/apply-language-preference.injectable.ts`
  is a `beforeFrameStartsSecond` runnable that runs after
  `load-user-preferences-storage`, so the first rendered frame already uses the
  persisted language.
* The Preferences → Application → Language block writes both
  `state.locale` and the i18n state, so switching is immediate and persisted by
  the existing user store reaction.
* `I18nProvider` (a react-application higher order component, and additionally
  mounted by `RootFrame`/`ClusterFrame` because unit tests render those frames
  directly) exposes the i18n instance to `useTranslation()`.

### Where translations are applied

* `SubTitle` translates a string `title` as a key, falling back to the string, so
  layout components did not need a DI change per call site.
* Preference tabs and pages store translation keys (`label`,
  `PreferencePageComponent title`) and translate at render time in
  `PreferencesNavigation`/`PreferencesNavigationTab`/`PreferencePageComponent`.
* Every preference block (theme, language, start-up, timezone, extension
  registry, editor, terminal, kubeconfig sync, proxy, telemetry) was converted to
  `useTranslation()` or to an injected `I18n` dependency (for the class
  component).
* The welcome page (`welcome.tsx`) and its built-in "Browse Clusters in Catalog"
  menu entry are translated; the extension provided welcome menus keep working
  because `title` may stay a plain string or a function.
* The Kubernetes preference page is translated as well: the kubectl blocks
  (binary download, download mirror and its mirror labels, directory for
  binaries, path to binary), the kubeconfig sync buttons, and the Helm chart
  repository section including the "add custom repository" dialog.
* The cluster sidebar translates **only its top level** entries (`Cluster`,
  `Nodes`, `Workloads`, `Config`, `Network`, `Storage`, `Namespaces`, `Events`,
  `Helm`, `Access Control`, `Custom Resources`). Those registrations now store a
  key (`sidebar.cluster`, …) and `SidebarItem` translates it; every other
  registration (for example `Pod` or `Deployment`) keeps its plain string and is
  rendered verbatim, so resource names stay untranslated by design.
* The application menu and the tray menu follow the language as well; see
  "Main process" below.
* `LocaleDate` formats with the moment locale of the current language
  (`renderer/i18n/moment-locale.ts`).

### Main process: application menu and tray

The application menu and the tray menu are owned by the main process, so they
cannot use `useTranslation()`. Instead:

* `features/user-preferences/main/apply-language-preference.injectable.ts` is a
  `beforeApplicationIsLoading` runnable (after `load-user-preferences-storage`)
  that starts a MobX `reaction` from `userPreferencesState.locale` to
  `i18n.setLocalePreference()`. Changing the language in Preferences therefore
  reaches the main process through the existing user store sync and updates the
  native menus without a restart.
* every menu item label is a `computed` value, for example
  `label: computed(() => i18n.t("menu.file"))`. `Labeled.label` accepts
  `string | IComputedValue<string>`, `populate-application-menu` resolves it
  while building the Electron template, and the existing menu `autorun` and tray
  `reaction` re-populate the native menus when the label changes.
* Electron role items (`undo`, `zoomIn`, …) would otherwise be labelled by
  Electron in the language of the *operating system*. They pass an optional
  `labelKey` to `getApplicationMenuOperationSystemActionInjectable` so that they
  follow the language of the application instead.
* the tray no longer offers an "About" entry, and the top level Help menu was
  removed completely (welcome page, documentation, support and about). In its
  place Windows and Linux get a top level "About" menu holding nothing but the
  about dialog, which on macOS stays in the application menu where the platform
  expects it; "Check for Updates..." moved from Help to the File menu on Windows
  and Linux.
* `getSystemLocale()` gained an `Intl.DateTimeFormat().resolvedOptions().locale`
  fallback, because the main process has no `navigator` and Windows/macOS do not
  set `LC_ALL`/`LANG`. On those systems the menu follows the OS locale when the
  preference is `system`.

### Extension API

`Renderer.I18n` (`extensions/renderer-api/i18n.ts`) exposes
`translate(key, params)`, `getCurrentLocale()` and `getSupportedLocales()`;
extension-provided labels that are not keys keep rendering as plain text.

## Consequences

Easier:

* adding a language is: add the locale to `supportedLocales` + `localeNames`, add
  a catalog to `common/i18n/translations`, add it to `translationCatalogs`. The
  `Record<SupportedLocale, ...>` types and `translations.test.ts` (key parity and
  placeholder parity against English) catch incomplete catalogs.
* any component can be translated incrementally; untranslated strings fall back
  to English and continue to work.

Harder / accepted costs:

* the catalogs are flat, so keys need discipline (`feature.area.name`).
* `useTranslation()` requires an `I18nProvider` in the tree. A component rendered
  in isolation without the provider throws — the error message names the HOC
  file.
* a native menu item that is created outside of the injectables (for example by
  an extension through the legacy API) keeps its plain English label; only items
  that pass a key are translated.
* the translation browser does not exist; one can find untranslated strings by
  grepping JSX text, and `npm run check:i18n` (or
  `packages/core/src/common/i18n/translations.test.ts`) reports incomplete
  catalogs.
* 31 snapshot files changed. They were regenerated with `jest -u` and reviewed:
  the only differences are the new Language block, the extension registry
  paragraph now being a single text node, and the welcome page paragraph
  collapsing its JSX line breaks (identical rendered text).
* one pre-existing flaky test (`src/features/cluster/refresh-accessibility-technical.test.ts`)
  times out when the whole `src/features` tree runs in parallel; it passes when
  run on its own (25 s) and is unrelated to this change.

## Verification

Performed on Windows x64 (Node 22, Electron 44 typings):

* `npx tsc --noEmit -p packages/core/tsconfig.json`: clean.
* `npx jest src/common/i18n`: 34 tests pass (locale resolution, catalog parity,
  placeholder parity, translation and fallback behavior).
* `node scripts/check-i18n.mjs` (`npm run check:i18n`): reports 2 catalogs with
  111 keys each, no gaps.
* `npx jest src/features/preferences`: 132 tests pass (14 suites), including a
  new end-to-end suite (`language-preference.test.tsx`) that navigates to
  Preferences, selects `简体中文`, asserts the navigation and page titles are
  Chinese, asserts the selection is persisted as `zh-CN` in the user store, and
  switches back to "跟随系统" (system default).
* `npx jest src/renderer/components`: 396 tests pass (58 suites), 81 snapshots
  unchanged — the `SubTitle` change is invisible for plain string titles.
* `npx jest src/renderer src/features`: 1779 tests pass (167 suites), 393
  snapshots pass. Only one snapshot file (`status-bar.test.tsx`) needed the
  welcome paragraph update.
* The real application was driven through its remote debugging port: opening
  Preferences → App shows the new **Language** block; selecting `English` or
  `简体中文` switches the UI instantly and is persisted as
  `"locale": "zh-CN"` in `lens-user-store.json` (choosing "system default"
  removes the field again). The Kubernetes preference page renders fully in
  Chinese.

Not covered, requiring manual QA: visual layout with longer Chinese strings, the
language of dates in logs/docks, extension preferences, and the application menu
(English by design for now).

## How to add a translation

1. Add the locale id to `supportedLocales` and its native name to `localeNames`
   in `common/i18n/locale.ts`.
2. Create `common/i18n/translations/<locale>.ts` with exactly the keys of
   `en.ts`.
3. Register it in `common/i18n/translations/index.ts`.
4. In components, use a key with `useTranslation()` or `<SubTitle title="key" />`.
5. Run `npm run check:i18n` before opening the pull request.

## See also

* `packages/core/src/common/i18n/` — runtime, catalogs, tests
* `packages/core/src/renderer/i18n/` — provider, hook, moment locale
* `packages/core/src/extensions/renderer-api/i18n.ts` — extension facing API
* `docs/extensions/capabilities/localization.md` — user facing documentation
* `scripts/check-i18n.mjs` — catalog consistency check
