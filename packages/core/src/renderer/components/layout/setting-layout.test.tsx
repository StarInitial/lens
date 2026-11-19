/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingLayout } from "./setting-layout";
import { Tab, Tabs } from "../tabs/tabs";

describe("shared settings sidebar", () => {
  it("keeps the same selection pill when navigating between nested and direct settings tabs", () => {
    const Settings = () => {
      const [selected, setSelected] = useState("general");

      return (
        <SettingLayout
          provideBackButtonNavigation={false}
          navigation={(
            <Tabs
              value={selected}
              onChange={setSelected}
              scrollable={false}>
              <Tab value="general" label="General" />
              <div>
                <h2>Extension settings</h2>
                <Tab value="extension" label="Extension" />
              </div>
            </Tabs>
          )}
        >
          {selected}
        </SettingLayout>
      );
    };
    const result = render(<Settings />);
    const indicator = result.container.querySelector(".sidebar > .lens-active-indicator");

    expect(indicator).toBeInTheDocument();
    expect(indicator).not.toHaveClass("line");
    userEvent.click(result.getByRole("tab", { name: "Extension" }));
    expect(result.getByRole("tab", { name: "Extension" })).toHaveAttribute("aria-selected", "true");
    expect(result.container.querySelector(".sidebar > .lens-active-indicator")).toBe(indicator);

    result.getByRole("tab", { name: "General" }).focus();
    userEvent.keyboard("{Enter}");
    expect(result.getByRole("tab", { name: "General" })).toHaveAttribute("aria-selected", "true");
    expect(result.container.querySelector(".sidebar > .lens-active-indicator")).toBe(indicator);
  });
});
