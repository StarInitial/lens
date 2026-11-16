/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { weblinkStoreMigrationInjectionToken } from "../../../features/weblinks/common/migration-token";
import { isLensBuiltInWeblink } from "../../../features/weblinks/common/links";
import { applicationInformationToken } from "@k8slens/application";
import type { WeblinkData } from "../common/storage.injectable";

const currentVersionWeblinkStoreMigrationInjectable = getInjectable({
  id: "current-version-weblink-store-migration",
  instantiate: (di) => {
    const { version } = di.inject(applicationInformationToken);

    return {
      version, // Run always after upgrade
      run(store) {
        const weblinksRaw = store.get("weblinks");
        const weblinks = (Array.isArray(weblinksRaw) ? weblinksRaw : []) as WeblinkData[];

        // The Lens branded links (website, documentation, forums, Twitter, blog)
        // are no longer shipped, and the Slack link was dropped long ago.
        store.set("weblinks", weblinks.filter(weblink =>
          weblink.id !== "lens-slack-link" && !isLensBuiltInWeblink(weblink),
        ));
      },
    };
  },
  injectionToken: weblinkStoreMigrationInjectionToken,
});

export default currentVersionWeblinkStoreMigrationInjectable;
