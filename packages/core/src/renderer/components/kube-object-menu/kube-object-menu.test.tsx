/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { RenderResult } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { KubeObject, Pod } from "@k8slens/kube-object";
import userEvent from "@testing-library/user-event";
import { getInjectable } from "@ogre-tools/injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { ConfirmDialog } from "../confirm-dialog";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { computed, runInAction } from "mobx";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import { Cluster } from "../../../common/cluster/cluster";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import { KubeObjectMenu } from "./index";
import createEditResourceTabInjectable from "../dock/edit-resource/edit-resource-tab.injectable";
import hideDetailsInjectable from "../kube-detail-params/hide-details.injectable";
import { kubeObjectMenuItemInjectionToken } from "./kube-object-menu-item-injection-token";
import activeEntityInternalClusterInjectable from "../../api/catalog/entity/get-active-cluster-entity.injectable";
import directoryForTempInjectable from "../../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import hostedClusterIdInjectable from "../../cluster-frame-context/hosted-cluster-id.injectable";
import clustersStateInjectable from "../../../features/cluster/storage/common/state.injectable";
import activeEntityIdInjectable from "../../api/catalog/entity/active-entity-id.injectable";
import kubeObjectHandlersInjectable from "../../kube-object/handlers.injectable";
import kubeObjectDeleteServiceInjectable from "./kube-object-delete-service.injectable";
import i18nInjectable from "../../../common/i18n/i18n.injectable";

// TODO: make `animated={false}` not required to make tests deterministic
describe("kube-object-menu", () => {
  let di: DiContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting();
    di.override(kubeObjectHandlersInjectable, () => computed(() => new Map()));

    di.override(hostedClusterIdInjectable, () => "some-cluster-id");
    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");
    di.override(directoryForTempInjectable, () => "/some-directory-for-temp");

    di.inject(clustersStateInjectable).set("some-cluster-id", new Cluster({
      id: "some-cluster-id",
      contextName: "some-context-name",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));
    di.override(activeEntityIdInjectable, () => computed(() => "some-cluster-id"));

    runInAction(() => {
      di.register(
        someMenuItemInjectable,
        someOtherMenuItemInjectable,
        someAnotherMenuItemInjectable,
      );
    });

    render = renderFor(di);

    di.override(
      apiManagerInjectable,
      () =>
        ({
          getStore: () => undefined,
        } as unknown as ApiManager),
    );

    const deleteMock = jest.fn().mockResolvedValue(undefined);

    di.override(kubeObjectDeleteServiceInjectable, () => ({ delete: deleteMock }));

    di.override(hideDetailsInjectable, () => () => {});

    di.override(createEditResourceTabInjectable, () => () => "irrelevant");
  });

  it("given no cluster, does not crash", () => {

    di.override(
      activeEntityInternalClusterInjectable,
      () => computed(() => undefined),
    );

    expect(() => {
      render(<KubeObjectMenu object={null as never} toolbar={true} />);
    }).not.toThrow();
  });

  it("given no kube object, renders", () => {
    const { baseElement } = render(
      <KubeObjectMenu object={null as never} toolbar={true} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  describe("given kube object", () => {
    let result: RenderResult;
    let removeActionMock: AsyncFnMock<() => void>;

    beforeEach(async () => {
      const objectStub = KubeObject.create({
        apiVersion: "some-api-version",
        kind: "some-kind",
        metadata: {
          uid: "some-uid",
          name: "some-name",
          resourceVersion: "some-resource-version",
          namespace: "some-namespace",
          selfLink: "/foo",
        },
      });

      removeActionMock = asyncFn();
      result = render((
        <div>
          <ConfirmDialog animated={false} />

          <KubeObjectMenu
            object={objectStub}
            toolbar={true}
            removeAction={removeActionMock}
          />
        </div>
      ));
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("does not open a confirmation dialog yet", () => {
      expect(screen.queryByTestId("confirmation-dialog")).toBeNull();
    });

    describe("when rerendered with different kube object", () => {
      beforeEach(() => {
        const newObjectStub = KubeObject.create({
          apiVersion: "some-other-api-version",
          kind: "some-other-kind",
          metadata: {
            uid: "some-other-uid",
            name: "some-other-name",
            resourceVersion: "some-other-resource-version",
            namespace: "some-other-namespace",
            selfLink: "/some-other-api-version/some-other-kind/some-other-namespace/some-other-name",
          },
        });

        result.rerender(
          <div>
            <ConfirmDialog animated={false} />

            <KubeObjectMenu
              object={newObjectStub}
              toolbar={true}
              removeAction={removeActionMock}
            />
          </div>,
        );
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      describe("when removing new kube object", () => {
        beforeEach(async () => {
          userEvent.click(await screen.findByTestId("menu-action-delete-for-/some-other-api-version/some-other-kind/some-other-namespace/some-other-name"));
        });

        it("renders", async () => {
          await screen.findByTestId("confirmation-dialog");
          expect(result.baseElement).toMatchSnapshot();
        });
      });
    });

    describe("when removing kube object", () => {
      beforeEach(async () => {
        userEvent.click(await screen.findByTestId("menu-action-delete-for-/foo"));
      });

      it("renders", async () => {
        await screen.findByTestId("confirmation-dialog");
        expect(result.baseElement).toMatchSnapshot();
      });

      describe("when remove is confirmed", () => {
        beforeEach(async () => {
          const confirmRemovalButton = await screen.findByTestId("confirm");

          userEvent.click(confirmRemovalButton);
        });

        it("calls for removal of the kube object", () => {
          expect(removeActionMock).toHaveBeenCalledWith();
        });

        it("does not close the confirmation dialog yet", async () => {
          await screen.findByTestId("confirmation-dialog");
        });

        it("when removal resolves, closes the confirmation dialog", async () => {
          await removeActionMock.resolve();
          await waitFor(() => {
            expect(screen.queryByTestId("confirmation-dialog")).toBeNull();
          });
        });
      });
    });
  });

  describe("given kube object with namespace", () => {
    let baseElement: Element;

    beforeEach(async () => {
      const objectStub = KubeObject.create({
        apiVersion: "some-api-version",
        kind: "some-kind",
        metadata: {
          uid: "some-uid",
          name: "some-name",
          resourceVersion: "some-resource-version",
          namespace: "some-namespace",
          selfLink: "/foo",
        },
      });

      ({ baseElement } = render(
        <div>
          <ConfirmDialog animated={false} />

          <KubeObjectMenu
            object={objectStub}
            toolbar={true}
            removeAction={() => {}}
          />
        </div>,
      ));
    });

    it("when removing kube object, renders confirmation dialog with namespace", async () => {
      const menuItem = await screen.findByTestId("menu-action-delete-for-/foo");

      userEvent.click(menuItem);

      expect(baseElement).toMatchSnapshot();
    });
  });

  describe("given kube object without namespace", () => {
    let baseElement: Element;

    beforeEach(async () => {
      const objectStub = KubeObject.create({
        apiVersion: "some-api-version",
        kind: "some-kind",
        metadata: {
          uid: "some-uid",
          name: "some-name",
          resourceVersion: "some-resource-version",
          namespace: undefined,
          selfLink: "/foo",
        },
      });

      ({ baseElement } = render(
        <div>
          <ConfirmDialog animated={false} />

          <KubeObjectMenu
            object={objectStub}
            toolbar={true}
            removeAction={() => {}}
          />
        </div>,
      ));
    });

    it("when removing kube object, renders confirmation dialog without namespace", async () => {
      const menuItem = await screen.findByTestId("menu-action-delete-for-/foo");

      userEvent.click(menuItem);

      expect(baseElement).toMatchSnapshot();
    });
  });
});

describe("kube-object-menu force deletion", () => {
  let di: DiContainer;
  let render: DiRender;
  let deleteServiceMock: jest.Mock;

  beforeEach(() => {
    di = getDiForUnitTesting();
    di.override(kubeObjectHandlersInjectable, () => computed(() => new Map()));
    render = renderFor(di);
    deleteServiceMock = jest.fn().mockResolvedValue(undefined);
    di.override(kubeObjectDeleteServiceInjectable, () => ({ delete: deleteServiceMock }));
    di.override(apiManagerInjectable, () => ({ getStore: () => undefined } as unknown as ApiManager));
    di.override(hideDetailsInjectable, () => () => {});
    di.override(createEditResourceTabInjectable, () => () => "irrelevant");
  });

  const createPod = (data: Record<string, any> = {}) => new Pod({
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
      uid: "some-uid",
      name: "some-pod",
      namespace: "default",
      resourceVersion: "1",
      selfLink: "/api/v1/namespaces/default/pods/some-pod",
      ...data.metadata,
    },
    spec: { terminationGracePeriodSeconds: 30, ...data.spec },
    status: { phase: "Running", ...data.status },
  } as any);

  it("shows and confirms force deletion for a running pod", async () => {
    const pod = createPod();

    render(
      <div>
        <ConfirmDialog animated={false} />
        <KubeObjectMenu
          object={pod}
          toolbar={true}
          removable={true}
        />
      </div>,
    );

    userEvent.click(await screen.findByTestId(`menu-action-force-delete-for-${pod.selfLink}`));
    userEvent.click(await screen.findByTestId("confirm"));

    await waitFor(() => expect(deleteServiceMock).toHaveBeenCalledWith(pod, "force_delete"));
  });

  it("translates the force delete action and confirmation to Chinese", async () => {
    di.inject(i18nInjectable).setLocalePreference("zh-CN");
    const pod = createPod();

    render(
      <div>
        <ConfirmDialog animated={false} />
        <KubeObjectMenu object={pod} toolbar removable />
      </div>,
    );

    const action = await screen.findByTestId(`menu-action-force-delete-for-${pod.selfLink}`);

    expect(action).toHaveTextContent("强制删除");
    userEvent.click(action);
    expect(screen.getByTestId("confirmation-dialog")).toHaveTextContent("强制删除 Pod default/some-pod");
    expect(screen.getByTestId("confirm")).toHaveTextContent("强制删除");
  });

  it("does not offer force deletion for a completed pod", async () => {
    const pod = createPod({
      status: {
        phase: "Succeeded",
      },
    });

    render(
      <KubeObjectMenu
        object={pod}
        toolbar={true}
        removable={true}
      />,
    );

    expect(screen.queryByTestId(`menu-action-force-delete-for-${pod.selfLink}`)).toBeNull();
  });

  it("offers force deletion for a terminating pod with active containers", async () => {
    const pod = createPod({
      metadata: {
        deletionTimestamp: "2024-01-01T00:00:00Z",
      },
      status: {
        phase: "Running",
        containerStatuses: [
          {
            name: "main",
            restartCount: 0,
            state: {
              running: {
                startedAt: "2024-01-01T00:00:00Z",
              },
            },
          },
        ],
      },
    });

    render(
      <KubeObjectMenu
        object={pod}
        toolbar={true}
        removable={true}
      />,
    );

    expect(screen.getByTestId(`menu-action-force-delete-for-${pod.selfLink}`)).toBeInTheDocument();
    expect(screen.queryByTestId(`menu-action-delete-for-${pod.selfLink}`)).toBeNull();
  });

  it("confirms force finalization for a terminating resource with finalizers", async () => {
    const object = KubeObject.create({
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: {
        uid: "some-uid",
        name: "some-config-map",
        namespace: "default",
        resourceVersion: "1",
        selfLink: "/api/v1/namespaces/default/configmaps/some-config-map",
        deletionTimestamp: "2024-01-01T00:00:00Z",
        finalizers: ["example.com/finalizer"],
      },
    });

    render(
      <div>
        <ConfirmDialog animated={false} />
        <KubeObjectMenu
          object={object}
          toolbar={true}
          removable={true}
        />
      </div>,
    );

    userEvent.click(await screen.findByTestId(`menu-action-force-finalize-for-${object.selfLink}`));
    userEvent.click(await screen.findByTestId("confirm"));

    await waitFor(() => expect(deleteServiceMock).toHaveBeenCalledWith(object, "force_finalize"));
    expect(screen.queryByTestId(`menu-action-delete-for-${object.selfLink}`)).toBeNull();
  });
});

const MenuItemComponent = () => <li>Some menu item</li>;

const someMenuItemInjectable = getInjectable({
  id: "some-menu-item",

  instantiate: () => ({
    apiVersions: ["some-api-version"],
    kind: "some-kind",
    Component: MenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 1,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

const someOtherMenuItemInjectable = getInjectable({
  id: "some-other-menu-item",

  instantiate: () => ({
    apiVersions: ["some-unrelated-api-version"],
    kind: "some-kind",
    Component: MenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 1,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

const someAnotherMenuItemInjectable = getInjectable({
  id: "some-another-menu-item",

  instantiate: () => ({
    apiVersions: ["some-api-version"],
    kind: "some-unrelated-kind",
    Component: MenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 1,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});
