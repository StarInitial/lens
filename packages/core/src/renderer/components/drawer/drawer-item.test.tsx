/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { runInAction } from "mobx";
import type { RenderResult } from "@testing-library/react";
import { Pod } from "@k8slens/kube-object";
import { MemoryRouter } from "react-router-dom";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../test-utils/renderFor";
import { KubeObjectMeta } from "../kube-object-meta/kube-object-meta";
import i18nInjectable from "../../../common/i18n/i18n.injectable";
import { I18nContext } from "../../i18n/i18n-context";
import { DrawerItem } from "./drawer-item";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import { Cluster } from "../../../common/cluster/cluster";

describe("labels of the object details", () => {
  let render: DiRender;
  let i18n: ReturnType<ReturnType<typeof getDiForUnitTesting>["inject"]>;

  const renderWithLocale = (children: React.ReactElement): RenderResult => render(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <I18nContext.Provider value={i18n as any}>
      <MemoryRouter>{children}</MemoryRouter>
    </I18nContext.Provider>,
  );

  beforeEach(() => {
    const di = getDiForUnitTesting();

    render = renderFor(di);
    i18n = di.inject(i18nInjectable);

    di.override(directoryForUserDataInjectable, () => "/some-user-data");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);
    di.override(hostedClusterInjectable, () => new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));
  });

  it("shows the labels in English by default", () => {
    const result = renderWithLocale(
      <DrawerItem name="Created">4h 42m</DrawerItem>,
    );

    expect(result.getByText("Created")).not.toBeNull();
  });

  describe("when the language is simplified Chinese", () => {
    beforeEach(() => {
      runInAction(() => {
        (i18n as { setLocalePreference: (preference: string) => void }).setLocalePreference("zh-CN");
      });
    });

    it("translates a declared label", () => {
      const result = renderWithLocale(
        <DrawerItem name="Created">4h 42m</DrawerItem>,
      );

      expect(result.getByText("创建时间")).not.toBeNull();
    });

    it("translates the labels of the object metadata", () => {
      const pod = new Pod({
        apiVersion: "v1",
        kind: "Pod",
        metadata: {
          name: "some-pod",
          namespace: "default",
          labels: {
            app: "some-app",
          },
          resourceVersion: "1",
          uid: "some-uid",
          selfLink: "/api/v1/namespaces/default/pods/some-pod",
          creationTimestamp: "2026-11-16T10:49:54Z",
        },
        spec: {
          containers: [],
        },
        status: {
          conditions: [],
          hostIP: "10.0.0.1",
          podIP: "10.0.0.2",
          startTime: "2026-11-16T10:49:54Z",
          phase: "Running",
        },
      });

      const result = renderWithLocale(<KubeObjectMeta object={pod} />);

      expect(result.getByText("创建时间")).not.toBeNull();
      expect(result.getByText("名称")).not.toBeNull();
      expect(result.getByText("命名空间")).not.toBeNull();
      expect(result.getByText("标签")).not.toBeNull();
    });

    it("keeps the name of a label which is not in the catalogs", () => {
      const result = renderWithLocale(
        <DrawerItem name="Some custom field">value</DrawerItem>,
      );

      expect(result.getByText("Some custom field")).not.toBeNull();
    });

    it("keeps the labels which are the names of kubernetes objects", () => {
      const result = renderWithLocale(
        <DrawerItem name="Pods">3</DrawerItem>,
      );

      expect(result.getByText("Pods")).not.toBeNull();
    });
  });
});
