#!/usr/bin/env node
/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Reports how much support window the pinned Electron major has left.
 *
 * Electron supports the latest three stable majors, so a major `N` reaches end of
 * life as soon as `N + 3` becomes stable. This script pins that policy to real
 * release dates and warns before the baseline of this repository goes stale.
 *
 * Usage: node scripts/check-electron-eol.mjs [--warn-days=90]
 * Exits with 1 when the pinned major is already end of life, 0 otherwise.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RELEASES_URL = "https://releases.electronjs.org/releases.json";
const SUPPORTED_MAJORS = 3;

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const warnDaysArg = process.argv.find(arg => arg.startsWith("--warn-days="));
const warnDays = warnDaysArg ? Number(warnDaysArg.split("=")[1]) : 90;

const readPinnedVersion = () => {
  const npmrc = readFileSync(join(repositoryRoot, ".npmrc"), "utf8");
  const match = npmrc.match(/^\s*target\s+"?([0-9]+\.[0-9]+\.[0-9]+)"?\s*$/m);

  if (!match) {
    throw new Error("Could not find the pinned electron version (target) in .npmrc");
  }

  return match[1];
};

const fetchReleases = async () => {
  const response = await fetch(RELEASES_URL);

  if (!response.ok) {
    throw new Error(`Failed to download ${RELEASES_URL}: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Returns a map of major version to the date of its first stable release.
 */
const firstStableReleasePerMajor = (releases) => {
  const firstRelease = new Map();

  for (const release of releases) {
    if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(release.version)) {
      continue;
    }

    const major = Number(release.version.split(".")[0]);
    const date = new Date(release.date);
    const known = firstRelease.get(major);

    if (!known || date < known) {
      firstRelease.set(major, date);
    }
  }

  return firstRelease;
};

const formatDate = (date) => date.toISOString().slice(0, 10);

const daysBetween = (from, to) => Math.ceil((to - from) / (24 * 60 * 60 * 1000));

const main = async () => {
  const pinnedVersion = readPinnedVersion();
  const pinnedMajor = Number(pinnedVersion.split(".")[0]);
  const firstRelease = firstStableReleasePerMajor(await fetchReleases());
  const stableMajors = [...firstRelease.keys()].sort((a, b) => a - b);
  const latestMajor = stableMajors.at(-1);
  const supportedMajors = stableMajors.slice(-SUPPORTED_MAJORS);
  const eolMajor = pinnedMajor + SUPPORTED_MAJORS;
  const eolDate = firstRelease.get(eolMajor);
  const now = new Date();

  console.log(`pinned electron          : ${pinnedVersion} (major ${pinnedMajor})`);
  console.log(`latest stable major      : ${latestMajor}`);
  console.log(`majors under support     : ${supportedMajors.join(", ")}`);

  if (!supportedMajors.includes(pinnedMajor)) {
    console.error(`\n::error::electron ${pinnedMajor} is no longer supported by upstream (supported: ${supportedMajors.join(", ")})`);
    process.exitCode = 1;

    return;
  }

  if (!eolDate) {
    console.log(`\nelectron ${eolMajor} has not been released yet, end of life date unknown.`);
    console.log(`electron ${pinnedMajor} is supported right now.`);

    return;
  }

  const remainingDays = daysBetween(now, eolDate);

  console.log(`end of life             : ${formatDate(eolDate)} (electron ${eolMajor} release)`);
  console.log(`remaining support       : ${remainingDays} days`);

  if (remainingDays < 0) {
    console.error(`\n::error::electron ${pinnedMajor} reached end of life on ${formatDate(eolDate)}. Re-baseline now.`);
    process.exitCode = 1;

    return;
  }

  if (remainingDays < warnDays) {
    console.log(`\n::warning::electron ${pinnedMajor} reaches end of life in ${remainingDays} days, start the next baseline upgrade.`);
  }
};

main().catch(error => {
  // A network hiccup must not break the pipeline, the report is advisory.
  console.log(`::warning::could not determine the electron support window: ${error.message}`);
});
