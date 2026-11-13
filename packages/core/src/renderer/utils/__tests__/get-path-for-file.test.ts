/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

type GetPathForFile = (file: File) => string | undefined;

const mockElectron: {
  webUtils?: {
    getPathForFile: (file: File) => string;
  };
} = {};

jest.mock("electron", () => mockElectron);

describe("renderer/utils/get-path-for-file", () => {
  beforeEach(() => {
    delete mockElectron.webUtils;
  });

  /**
   * The helper snapshots the `electron` module when it is imported, so the module
   * has to be (re-)imported after the mock was set up.
   */
  const importGetPathForFile = (): GetPathForFile => {
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("../get-path-for-file").getPathForFile;
  };

  const createFile = (path?: string): File => {
    const file = new File(["some content"], "kubeconfig.yaml");

    if (path !== undefined) {
      Object.defineProperty(file, "path", { value: path });
    }

    return file;
  };

  describe("given electron exposes webUtils", () => {
    it("uses webUtils.getPathForFile", () => {
      const getPathForFileMock = jest.fn(() => "/home/user/kubeconfig.yaml");

      mockElectron.webUtils = {
        getPathForFile: getPathForFileMock,
      };

      const getPathForFile = importGetPathForFile();

      expect(getPathForFile(createFile("/legacy/path.yaml"))).toBe("/home/user/kubeconfig.yaml");
      expect(getPathForFileMock).toHaveBeenCalled();
    });

    it("falls back to the legacy File.path when webUtils throws", () => {
      mockElectron.webUtils = {
        getPathForFile: () => {
          throw new Error("not supported");
        },
      };

      expect(importGetPathForFile()(createFile("/legacy/path.yaml"))).toBe("/legacy/path.yaml");
    });

    it("falls back to the legacy File.path when webUtils returns nothing", () => {
      mockElectron.webUtils = {
        getPathForFile: () => "",
      };

      expect(importGetPathForFile()(createFile("/legacy/path.yaml"))).toBe("/legacy/path.yaml");
    });
  });

  describe("given electron does not expose webUtils", () => {
    it("returns the legacy File.path", () => {
      expect(importGetPathForFile()(createFile("/legacy/path.yaml"))).toBe("/legacy/path.yaml");
    });

    it("returns undefined when the path is not available at all", () => {
      expect(importGetPathForFile()(createFile())).toBeUndefined();
    });
  });
});

// the helper is imported dynamically inside the tests, keep this file a module
export {};
