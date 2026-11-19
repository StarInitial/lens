/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import userEvent from "@testing-library/user-event";
import { waitFor, within } from "@testing-library/react";
import { getApplicationBuilder } from "../test-utils/get-application-builder";
import navigateToCatalogInjectable from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";

describe("catalog sidebar navigation", () => {
  it("shares one selection indicator and keeps collapsed categories out of keyboard navigation", async () => {
    const builder = getApplicationBuilder();
    const result = await builder.render();

    builder.applicationWindow.only.di.inject(navigateToCatalogInjectable)();

    const navigation = result.getByRole("navigation", { name: "Catalog" });
    const categories = navigation.querySelectorAll<HTMLButtonElement>("button[data-nav-active]");
    const category = categories[1];
    const group = within(navigation).getByRole("button", { name: /Categories/ });

    expect(category).toBeDefined();
    category.focus();
    userEvent.keyboard("{Enter}");

    await waitFor(() => expect(category).toHaveAttribute("aria-current", "page"));
    expect(navigation.querySelectorAll('[data-nav-active="true"]')).toHaveLength(1);
    expect(navigation.querySelectorAll(".lens-active-indicator")).toHaveLength(1);

    userEvent.click(group);
    expect(group).toHaveAttribute("aria-expanded", "false");
    expect(category.closest('[aria-hidden="true"]')).toHaveAttribute("inert");

    userEvent.click(group);
    expect(group).toHaveAttribute("aria-expanded", "true");
    expect(category.closest('[aria-hidden="true"]')).toBeNull();
    expect(category).toHaveAttribute("aria-current", "page");
  });
});
