# Localization

Lens renders its user interface in the language the user picks in
**Preferences → App → Language**. Two catalogs ship today: English (`en`, the
source locale) and Simplified Chinese (`zh-CN`). The value *System default*
follows the locale of the operating system.

## Translating an extension

The current language is available to extensions through `Renderer.I18n`:

``` typescript
import { Renderer } from "@k8slens/extensions";

const cancel = Renderer.I18n.translate("common.cancel");
const locale = Renderer.I18n.getCurrentLocale(); // "en" | "zh-CN"
const locales = Renderer.I18n.getSupportedLocales();
```

`translate(key, params)` resolves the key against the catalog of the current
language, then against the English catalog, and finally returns the key itself.
That last fallback means extension-provided labels that are plain text keep
working untouched — you only need keys for text you actually want translated.

Placeholders are written as `{{name}}` and filled from the second argument:

``` typescript
Renderer.I18n.translate("extension.greeting", { name: "Ada" });
```

If your extension ships its own strings, keep them in the extension and pick the
variant from `getCurrentLocale()`. The Lens catalogs are not writable by
extensions.

## Adding a translation to Lens

1. Add the locale id to `supportedLocales` and its native name to `localeNames`
   in `packages/core/src/common/i18n/locale.ts`.
2. Create `packages/core/src/common/i18n/translations/<locale>.ts` with exactly
   the keys of `en.ts`.
3. Register the catalog in
   `packages/core/src/common/i18n/translations/index.ts` — the
   `Record<SupportedLocale, TranslationDictionary>` type makes a missing catalog
   a compile error.
4. Run `npm run check:i18n` (or the unit tests of `src/common/i18n`) to verify key
   and placeholder parity.

## Translating a component

Function components use the `useTranslation()` hook:

``` tsx
import { useTranslation } from "../../renderer/i18n/i18n-context";

export const Example = () => {
  const { t } = useTranslation();

  return <SubTitle title={t("preferences.editor.font-size.title")} />;
};
```

Notes:

* `<SubTitle title="some.key" />` also works: a string `title` is treated as a key
  and falls back to the string itself.
* Class components and injectables receive the `i18n` injectable
  (`packages/core/src/common/i18n/i18n.injectable.ts`) and call `i18n.t(key)`.
* `useTranslation()` requires an `I18nProvider` in the tree; the frame and the
  react-application HOC already provide it.
