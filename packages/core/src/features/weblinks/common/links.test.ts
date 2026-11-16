/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  isLensBuiltInWeblink,
  kubernetesDocumentationWeblinkName,
  lensBlogWeblinkId,
  lensBlogWeblinkName,
  lensDocumentationWeblinkId,
  lensForumsWeblinkId,
  lensTwitterWeblinkId,
  lensWebsiteWeblinkId,
  lensWebsiteLinkName,
} from "./links";

describe("weblinks built into older versions", () => {
  describe("isLensBuiltInWeblink", () => {
    it.each([
      lensWebsiteWeblinkId,
      lensDocumentationWeblinkId,
      lensForumsWeblinkId,
      lensTwitterWeblinkId,
      lensBlogWeblinkId,
    ])("recognises the id %s", id => {
      expect(isLensBuiltInWeblink({ id, name: "Irrelevant" })).toBe(true);
    });

    it("recognises a link by name when the id is an url", () => {
      expect(isLensBuiltInWeblink({
        id: "https://k8slens.dev",
        name: lensWebsiteLinkName,
      })).toBe(true);
    });

    it("recognises the blog link by name", () => {
      expect(isLensBuiltInWeblink({
        id: "https://medium.com/k8slens",
        name: lensBlogWeblinkName,
      })).toBe(true);
    });

    it("keeps the Kubernetes documentation link", () => {
      expect(isLensBuiltInWeblink({
        id: "https://kubernetes.io/docs/home/",
        name: kubernetesDocumentationWeblinkName,
      })).toBe(false);
    });

    it("keeps links added by the user", () => {
      expect(isLensBuiltInWeblink({
        id: "some-user-link",
        name: "My own link",
      })).toBe(false);
    });
  });
});
