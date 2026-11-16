/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Identifiers and names of the Lens branded web links that older versions added
 * to the catalog. They are no longer seeded (see the `5.1.4` migration) and are
 * removed from existing stores when they are read (see `storage.injectable.ts`).
 */
export const lensWebsiteWeblinkId = "lens-website-link";
export const lensWebsiteLinkName = "Lens Website";

export const lensDocumentationWeblinkId = "lens-documentation-link";
export const lensDocumentationWeblinkName = "Lens Documentation";

export const lensForumsWeblinkId = "lens-forums-link";
export const lensForumsWeblinkName = "Lens Forums";

export const lensTwitterWeblinkId = "lens-twitter-link";
export const lensTwitterWeblinkName = "Lens on Twitter";

export const lensBlogWeblinkId = "lens-blog-link";
export const lensBlogWeblinkName = "Lens Official Blog";

export const kubernetesDocumentationWeblinkId = "kubernetes-documentation-link";
export const kubernetesDocumentationWeblinkName = "Kubernetes Documentation";

export const lensBuiltInWeblinkIds: ReadonlySet<string> = new Set([
  lensWebsiteWeblinkId,
  lensDocumentationWeblinkId,
  lensForumsWeblinkId,
  lensTwitterWeblinkId,
  lensBlogWeblinkId,
]);

export const lensBuiltInWeblinkNames: ReadonlySet<string> = new Set([
  lensWebsiteLinkName,
  lensDocumentationWeblinkName,
  lensForumsWeblinkName,
  lensTwitterWeblinkName,
  lensBlogWeblinkName,
]);

/**
 * Whether `weblink` is one of the Lens branded links. Matching by name as well as
 * by id keeps the cleanup working for stores written by older versions, which
 * used the link URL as the id.
 */
export const isLensBuiltInWeblink = (weblink: { id: string; name: string }): boolean =>
  lensBuiltInWeblinkIds.has(weblink.id) || lensBuiltInWeblinkNames.has(weblink.name);
