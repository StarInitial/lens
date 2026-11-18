/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { TranslateParams } from "../../common/i18n/translation";
import { useTranslation } from "./i18n-context";

/**
 * Turns a human readable value into a translation key segment: `Web Links`,
 * `WebLink` and `KubernetesCluster` become `web-links`, `web-link` and
 * `kubernetes-cluster`.
 */
export const toKeySegment = (value: string): string =>
  value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export type TranslateFunction = (key: string, params?: TranslateParams) => string;

/**
 * Translates a label which the source declares in its own language, for example
 * the `Created` of a `DrawerItem`. Values without a catalog entry (resource
 * kinds, field names of custom resources, user data, ...) are returned as they
 * are declared, so nothing has to be translated to stay readable.
 */
export const translateName = (t: TranslateFunction, namespace: string, value: string): string => {
  const key = `${namespace}${toKeySegment(value)}`;
  const translated = t(key);

  return translated === key ? value : translated;
};

export interface TranslatedTextProps {
  /** For example `catalog.kinds.` */
  namespace: string;

  /** The value as it is declared, for example `KubernetesCluster` */
  value: string;
}

/**
 * Renders `value` translated through `namespace` + the key form of the value, and
 * falls back to the value itself when the catalogs have no entry for it. That
 * keeps kinds, sources and phases of extensions readable without a catalog.
 */
export const TranslatedText = ({ namespace, value }: TranslatedTextProps) => {
  const { t } = useTranslation();
  const key = `${namespace}${toKeySegment(value)}`;
  const translated = t(key);

  return <>{translated === key ? value : translated}</>;
};

export interface TranslatedSpanProps {
  namespace: string;
  value: string;
  className?: string;
}

/**
 * Same as {@link TranslatedText} but wrapped in a `<span>`, for the cases where
 * the surrounding markup carries the styling (for example the catalog status).
 */
export const TranslatedSpan = ({ namespace, value, className }: TranslatedSpanProps) => {
  const { t } = useTranslation();
  const key = `${namespace}${toKeySegment(value)}`;
  const translated = t(key);

  return <span className={className}>{translated === key ? value : translated}</span>;
};

export interface TranslatedKeyTextProps {
  /**
   * A full translation key (for example `catalog.columns.name`). When the
   * catalogs have no entry, the value itself is rendered.
   */
  value: string;
}

/**
 * Renders a value that already is a translation key. Column titles, tab labels
 * and other declarations use this so that they can stay plain text.
 */
export const TranslatedKeyText = ({ value }: TranslatedKeyTextProps) => {
  const { t } = useTranslation();

  return <>{t(value)}</>;
};

export interface TranslatedColumnTitleProps {
  /**
   * A column title as it is declared, for example `Age`. Titles are looked up
   * under `columns.<key>`; unknown (or resource kind) titles stay untouched.
   */
  value: string;
}

/**
 * Renders a table column title. Resource kinds (`Pods`, `Replicas`, ...) have no
 * entry in the catalogs and are therefore shown exactly as declared.
 */
export const TranslatedColumnTitle = ({ value }: TranslatedColumnTitleProps) => {
  const { t } = useTranslation();
  const key = `columns.${toKeySegment(value)}`;
  const translated = t(key);

  if (translated !== key) {
    return <>{translated}</>;
  }

  const statusKey = `status.${toKeySegment(value)}`;
  const status = t(statusKey);

  return <>{status === statusKey ? value : status}</>;
};

export interface TranslatedItemCountProps {
  count: number;
}

/**
 * `<n> item(s)` with proper plural forms, used by the list layouts.
 */
export const TranslatedItemCount = ({ count }: TranslatedItemCountProps) => {
  const { t } = useTranslation();
  const key = count === 1
    ? "common.items-count-one"
    : "common.items-count";

  return <>{t(key, { count })}</>;
};
