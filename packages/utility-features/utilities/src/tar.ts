/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Helper for working with tarball files (.tar, .tgz)
// Docs: https://github.com/npm/node-tar
import tar from "tar";
import path from "path";
import type { JsonValue } from "type-fest";

export type ReadFileFromTarOpts<ParseJson extends boolean> = {
  tarPath: string;
  filePath: string;
} & (
  ParseJson extends true
    ? {
      parseJson: true;
    }
    : {
      parseJson?: false;
    }
);

/**
 * The `ReadEntry` type of `@types/tar` extends `MiniPass`, but the version of
 * `minipass` resolved in this repository (4.x, which ships its own types) no
 * longer exposes the EventEmitter members on that type. Only a small structural
 * subset of the entry is used here, so it is described explicitly.
 */
interface TarEntryStream {
  path: string;
  on(event: "data", listener: (chunk: Buffer) => void): void;
  once(event: "error", listener: (err: Error) => void): void;
  once(event: "end", listener: () => void): void;
}

export function readFileFromTar(opts: ReadFileFromTarOpts<false>): Promise<Buffer>;
export function readFileFromTar(opts: ReadFileFromTarOpts<true>): Promise<JsonValue>;

export function readFileFromTar<ParseJson extends boolean>({ tarPath, filePath, parseJson = false }: ReadFileFromTarOpts<ParseJson>): Promise<JsonValue | Buffer> {
  return new Promise((resolve, reject) => {
    const fileChunks: Buffer[] = [];

    tar.list({
      file: tarPath,
      filter: entryPath => path.normalize(entryPath) === filePath,
      sync: true,
      onentry(entry) {
        const entryStream = entry as unknown as TarEntryStream;

        entryStream.on("data", chunk => {
          fileChunks.push(chunk);
        });
        entryStream.once("error", err => {
          reject(new Error(`reading file has failed ${entryStream.path}: ${err}`));
        });
        entryStream.once("end", () => {
          const data = Buffer.concat(fileChunks);
          const result = parseJson ? JSON.parse(data.toString("utf8")) : data;

          resolve(result);
        });
      },
    });

    if (!fileChunks.length) {
      reject(new Error("Not found"));
    }
  });
}

export async function listTarEntries(filePath: string): Promise<string[]> {
  const entries: string[] = [];

  await tar.list({
    file: filePath,
    onentry: (entry) => {
      entries.push(path.normalize(entry.path));
    },
  });

  return entries;
}
