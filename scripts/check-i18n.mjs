#!/usr/bin/env node
/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Verifies the translation catalogs without loading TypeScript.
 *
 * For every locale other than the source locale (`en`) it checks that:
 *
 * 1. the catalog has exactly the keys of `en`,
 * 2. no message is empty,
 * 3. every message uses the same `{{placeholder}}` set as the source message.
 *
 * Usage: node scripts/check-i18n.mjs
 * Exits with 1 when a catalog is incomplete or inconsistent.
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogsDirectory = join(repositoryRoot, "packages/core/src/common/i18n/translations");
const sourceLocale = "en";

/**
 * Extracts the `"key": "value"` entries of a catalog. The catalogs are flat maps
 * of string literals, so this is enough to read them without a TypeScript
 * toolchain (and without introducing a dependency just for a check).
 */
const readCatalog = (filePath) => {
  const content = readFileSync(filePath, "utf8");
  const entries = new Map();
  const entryPattern = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$/gm;

  for (const [, key, value] of content.matchAll(entryPattern)) {
    entries.set(key.replace(/\\"/g, "\""), value.replace(/\\"/g, "\"").replace(/\\n/g, "\n"));
  }

  return entries;
};

const placeholdersOf = (message) =>
  [...message.matchAll(/\{\{\s*([^{}\s]+)\s*\}\}/g)].map(([, name]) => name).sort();

const catalogFiles = new Map(
  readdirSync(catalogsDirectory)
    .filter(fileName => fileName.endsWith(".ts") && fileName !== "index.ts")
    .map(fileName => [fileName, readCatalog(join(catalogsDirectory, fileName))]),
);

const sourceCatalog = catalogFiles.get(`${sourceLocale}.ts`);

if (!sourceCatalog) {
  console.error(`Missing the source catalog ${sourceLocale}.ts in ${catalogsDirectory}`);
  process.exit(1);
}

const problems = [];

for (const [fileName, catalog] of catalogFiles) {
  const locale = fileName.replace(/\.ts$/, "");

  if (locale === sourceLocale) {
    for (const [key, message] of catalog) {
      if (!message.trim()) {
        problems.push(`${locale}: "${key}" is empty`);
      }
    }

    continue;
  }

  for (const key of sourceCatalog.keys()) {
    if (!catalog.has(key)) {
      problems.push(`${locale}: missing key "${key}"`);
    }
  }

  for (const [key, message] of catalog) {
    const source = sourceCatalog.get(key);

    if (source === undefined) {
      problems.push(`${locale}: key "${key}" does not exist in ${sourceLocale}`);
      continue;
    }

    if (!message.trim()) {
      problems.push(`${locale}: "${key}" is empty`);
    }

    const [expected, actual] = [placeholdersOf(source).join(","), placeholdersOf(message).join(",")];

    if (expected !== actual) {
      problems.push(`${locale}: "${key}" uses placeholders [${actual}] but ${sourceLocale} uses [${expected}]`);
    }
  }
}

if (problems.length) {
  console.error(`i18n catalogs are inconsistent (${problems.length} problem(s)):`);

  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }

  process.exit(1);
}

console.log(`i18n catalogs OK: ${catalogFiles.size} catalog(s), ${sourceCatalog.size} key(s) each.`);
