#!/usr/bin/env node
/**
 * Regenerates the StarLens icon set from scripts/brand/logo-starlens-mark.svg.
 *
 *   node scripts/brand/generate-icons.mjs
 *
 * Writes:
 *   star-lens/build/icon.ico                   (16..256, Windows + Linux tray/pin)
 *   star-lens/build/icon.png                   (512, Linux)
 *   star-lens/build/icons/512x512.png          (macOS)
 *   star-lens/build/icons/512x512@2x.png       (macOS)
 *   docs/img/favicon.ico, docs/custom_theme/img/favicon.ico
 *
 * The in-app glyph (packages/ui-components/icon/assets/logo-lens.svg) is the
 * same mark without the tone fills, so CSS can recolour it.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

const MARK = fs
  .readFileSync(path.join(here, "logo-starlens-mark.svg"), "utf8")
  .replace(/<\?xml[^>]*>/g, "")
  .replace(/<svg[^>]*>/, "")
  .replace("</svg>", "")
  .trim();

const MONO_MARK = MARK.replace(/fill="#[0-9a-fA-F]{3,8}"/g, 'fill="#ffffff"');

const PAD = 0.75; // glyph size relative to the tile
const RADIUS = 115; // tile corner radius in the 512 viewBox
const SMALL_LIMIT = 48; // at or below this size the mark is a solid silhouette

const background = `
  <linearGradient id="bg" x1="0" y1="0" x2="0.85" y2="1">
    <stop offset="0" stop-color="#A8E1FB"/>
    <stop offset="0.55" stop-color="#57B2E8"/>
    <stop offset="1" stop-color="#2E85CB"/>
  </linearGradient>`;

const offset = 256 - 256 * PAD;

const tile = (mark) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>${background}</defs>
  <rect width="512" height="512" rx="${RADIUS}" ry="${RADIUS}" fill="url(#bg)"/>
  <g transform="translate(${offset},${offset}) scale(${PAD})">${mark}</g>
</svg>`;

const svgFor = (size) => tile(size <= SMALL_LIMIT ? MONO_MARK : MARK);

const render = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

/** Uncompressed BMP frame, required by Windows for ICO entries below 256px. */
function bmpFrame(rgba, size) {
  const xorRow = size * 4;
  const xor = Buffer.alloc(xorRow * size);
  for (let y = 0; y < size; y++) {
    const src = (size - 1 - y) * xorRow; // bottom-up
    for (let x = 0; x < size; x++) {
      const s = src + x * 4;
      const d = y * xorRow + x * 4;
      xor[d] = rgba[s + 2];
      xor[d + 1] = rgba[s + 1];
      xor[d + 2] = rgba[s];
      xor[d + 3] = rgba[s + 3];
    }
  }
  const maskRow = Math.ceil(size / 32) * 4;
  const mask = Buffer.alloc(maskRow * size, 0);

  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(size, 4);
  header.writeInt32LE(size * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(xor.length + mask.length, 20);

  return Buffer.concat([header, xor, mask]);
}

function ico(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;

  entries.forEach((entry, i) => {
    const at = i * 16;
    dir.writeUInt8(entry.size >= 256 ? 0 : entry.size, at);
    dir.writeUInt8(entry.size >= 256 ? 0 : entry.size, at + 1);
    dir.writeUInt16LE(1, at + 4);
    dir.writeUInt16LE(32, at + 6);
    dir.writeUInt32LE(entry.data.length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += entry.data.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.data)]);
}

async function frame(size) {
  const png = await render(svgFor(size), size);
  if (size >= 256) {
    return { size, data: png };
  }
  const { data } = await sharp(png).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  return { size, data: bmpFrame(data, size) };
}

const write = (rel, data) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
  console.log("wrote", rel);
};

const appFrames = [];
for (const size of [16, 24, 32, 48, 64, 128, 256]) {
  appFrames.push(await frame(size));
}
write("star-lens/build/icon.ico", ico(appFrames));
write("star-lens/build/icon.png", await render(tile(MARK), 512));
write("star-lens/build/icons/512x512.png", await render(tile(MARK), 512));
write("star-lens/build/icons/512x512@2x.png", await render(tile(MARK), 1024));

const faviconFrames = [];
for (const size of [16, 32, 48]) {
  faviconFrames.push(await frame(size));
}
const favicon = ico(faviconFrames);
write("docs/img/favicon.ico", favicon);
write("docs/custom_theme/img/favicon.ico", favicon);

console.log("done");
