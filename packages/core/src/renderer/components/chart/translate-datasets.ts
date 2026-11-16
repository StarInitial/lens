/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { mapValues } from "lodash";
import type { TranslateFunction } from "../../i18n/translated-text";
import { translateName } from "../../i18n/translated-text";

/**
 * A chart dataset as the metrics charts declare it. Only the textual parts are
 * relevant here, everything else is passed through untouched.
 */
export interface TranslatableChartDataset {
  label?: string;
  tooltip?: string;
}

const translateDataset = <Dataset extends TranslatableChartDataset>(t: TranslateFunction, dataset: Dataset): Dataset => ({
  ...dataset,
  ...(dataset.label
    ? { label: translateName(t, "charts.", dataset.label) }
    : {}),
  ...(dataset.tooltip
    ? { tooltip: translateName(t, "charts.tooltips.", dataset.tooltip) }
    : {}),
});

/**
 * Translates the label and the tooltip of every dataset of a single chart.
 */
export const translateChartDatasetList = <Dataset extends TranslatableChartDataset>(t: TranslateFunction, datasets: Dataset[]): Dataset[] =>
  datasets.map(dataset => translateDataset(t, dataset));

/**
 * Translates the label and the tooltip of every dataset of the charts of every
 * metrics tab.
 */
export const translateChartDatasets = <Tab extends string, Dataset extends TranslatableChartDataset>(t: TranslateFunction, datasets: Partial<Record<Tab, Dataset[]>>): Partial<Record<Tab, Dataset[]>> =>
  mapValues(datasets, group => group?.map(dataset => translateDataset(t, dataset)));
