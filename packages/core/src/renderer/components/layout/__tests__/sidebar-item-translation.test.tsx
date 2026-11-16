/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { computed } from "mobx";
import { MemoryRouter } from "react-router-dom";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { renderFor } from "../../test-utils/renderFor";
import { SidebarItem } from "../sidebar-item";
import type { SidebarItemDeclaration } from "@k8slens/cluster-sidebar";
import i18nInjectable from "../../../../common/i18n/i18n.injectable";

const getSidebarItem = (title: string): SidebarItemDeclaration => ({
  id: "some-sidebar-item",
  parentId: null,
  title,
  onClick: () => {},
  isActive: computed(() => false),
  isVisible: computed(() => true),
  children: [],
});

describe("<SidebarItem/> translation", () => {
  const renderItem = (title: string, locale?: string) => {
    const di = getDiForUnitTesting();
    const render = renderFor(di);

    if (locale) {
      di.inject(i18nInjectable).setLocalePreference(locale as never);
    }

    return render(
      <MemoryRouter>
        <SidebarItem item={getSidebarItem(title)} />
      </MemoryRouter>,
    );
  };

  it("shows top level items in English by default", () => {
    const result = renderItem("sidebar.cluster");

    expect(result.getByText("Cluster")).toBeInTheDocument();
  });

  it("translates top level items to Simplified Chinese", () => {
    const result = renderItem("sidebar.cluster", "zh-CN");

    expect(result.getByText("集群")).toBeInTheDocument();
  });

  it("translates every top level item", () => {
    const topLevel = {
      "sidebar.nodes": "节点",
      "sidebar.workloads": "工作负载",
      "sidebar.config": "配置",
      "sidebar.network": "网络",
      "sidebar.storage": "存储",
      "sidebar.namespaces": "命名空间",
      "sidebar.events": "事件",
      "sidebar.helm": "Helm",
      "sidebar.access-control": "访问控制",
      "sidebar.custom-resources": "自定义资源",
    };

    for (const [key, expected] of Object.entries(topLevel)) {
      expect(renderItem(key, "zh-CN").getByText(expected)).toBeInTheDocument();
    }
  });

  it("keeps resource names untranslated", () => {
    const result = renderItem("Pod", "zh-CN");

    expect(result.getByText("Pod")).toBeInTheDocument();
  });

  it("keeps unknown labels untranslated", () => {
    const result = renderItem("Something provided by an extension", "zh-CN");

    expect(result.getByText("Something provided by an extension")).toBeInTheDocument();
  });
});
