/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { runInAction } from "mobx";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import i18nInjectable from "../../common/i18n/i18n.injectable";
import normalizeCatalogEntityContextMenuInjectable from "./normalize-menu-item.injectable";
import withConfirmationInjectable from "../components/confirm-dialog/with-confirm.injectable";

describe("normalizing a catalog entity context menu item", () => {
  let di: ReturnType<typeof getDiForUnitTesting>;

  beforeEach(() => {
    di = getDiForUnitTesting();

    di.override(withConfirmationInjectable, () => (params) => {
      params.ok?.();
    });
  });

  it("keeps the title of an item without a catalog entry", () => {
    const normalize = di.inject(normalizeCatalogEntityContextMenuInjectable);

    expect(normalize({ title: "Some custom action", onClick: () => {} }).title).toBe("Some custom action");
  });

  it("translates the title of a built in item", () => {
    const i18n = di.inject(i18nInjectable);

    runInAction(() => {
      i18n.setLocalePreference("zh-CN");
    });

    const normalize = di.inject(normalizeCatalogEntityContextMenuInjectable);

    expect(normalize({ title: "Settings", onClick: () => {} }).title).toBe("设置");
    expect(normalize({ title: "Connect", onClick: () => {} }).title).toBe("连接");
    expect(normalize({ title: "Disconnect", onClick: () => {} }).title).toBe("断开连接");
    expect(normalize({ title: "Remove", onClick: () => {} }).title).toBe("移除");
    expect(normalize({ title: "Add to Hotbar", onClick: () => {} }).title).toBe("添加到快捷栏");
    expect(normalize({ title: "Remove from Hotbar", onClick: () => {} }).title).toBe("从快捷栏移除");
  });

  it("keeps the click handler of an item", () => {
    const i18n = di.inject(i18nInjectable);
    const onClick = jest.fn();

    runInAction(() => {
      i18n.setLocalePreference("zh-CN");
    });

    const normalize = di.inject(normalizeCatalogEntityContextMenuInjectable);

    normalize({ title: "Settings", onClick }).onClick();

    expect(onClick).toHaveBeenCalled();
  });
});
