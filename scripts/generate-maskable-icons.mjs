import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(process.cwd(), "public");
const BG = [14, 14, 14]; // #0e0e0e — matches the manifest background_color / theme_color
const SCALE = 0.75; // logo sits inside the 80% maskable safe zone

function crc32(buf) {
  if (!crc32.table) {
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }
    crc32.table = table;
  }

  const table = crc32.table;
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function readPng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) {
    throw new Error("not a png");
  }

  let pos = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const idat = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }

    pos += 12 + len;
  }

  if (bitDepth !== 8 || interlace !== 0 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(`unsupported png: bitDepth=${bitDepth} colorType=${colorType} interlace=${interlace}`);
  }

  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const data = Buffer.alloc(height * stride);
  let rp = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = raw[rp];
    rp += 1;
    const row = y * stride;
    const prevRow = (y - 1) * stride;

    for (let x = 0; x < stride; x += 1) {
      const value = raw[rp + x];
      const a = x >= bpp ? data[row + x - bpp] : 0;
      const b = y > 0 ? data[prevRow + x] : 0;
      const c = x >= bpp && y > 0 ? data[prevRow + x - bpp] : 0;

      let out;
      if (filter === 0) {
        out = value;
      } else if (filter === 1) {
        out = value + a;
      } else if (filter === 2) {
        out = value + b;
      } else if (filter === 3) {
        out = value + ((a + b) >> 1);
      } else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        out = value + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      } else {
        throw new Error(`bad filter ${filter}`);
      }

      data[row + x] = out & 0xff;
    }

    rp += stride;
  }

  return { width, height, bpp, data };
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typed = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed), 0);
  return Buffer.concat([length, typed, crc]);
}

function writePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function sample(src, sx, sy) {
  const { width, height, bpp, data } = src;
  const x0 = Math.max(0, Math.min(width - 1, Math.floor(sx)));
  const y0 = Math.max(0, Math.min(height - 1, Math.floor(sy)));
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const fx = Math.max(0, Math.min(1, sx - Math.floor(sx)));
  const fy = Math.max(0, Math.min(1, sy - Math.floor(sy)));

  const at = (xx, yy) => (yy * width + xx) * bpp;
  const c00 = at(x0, y0);
  const c10 = at(x1, y0);
  const c01 = at(x0, y1);
  const c11 = at(x1, y1);
  const out = [0, 0, 0, 255];

  for (let i = 0; i < bpp; i += 1) {
    out[i] =
      (1 - fx) * (1 - fy) * data[c00 + i] +
      fx * (1 - fy) * data[c10 + i] +
      (1 - fx) * fy * data[c01 + i] +
      fx * fy * data[c11 + i];
  }

  if (bpp === 3) {
    out[3] = 255;
  }

  return out;
}

// Scale `src` so it occupies `scale` of `outSize`, centered on a full-bleed background.
function buildMaskable(src, outSize, scale) {
  const out = Buffer.alloc(outSize * outSize * 4);

  for (let i = 0; i < outSize * outSize; i += 1) {
    out[i * 4] = BG[0];
    out[i * 4 + 1] = BG[1];
    out[i * 4 + 2] = BG[2];
    out[i * 4 + 3] = 255;
  }

  const content = Math.round(outSize * scale);
  const offset = Math.round((outSize - content) / 2);

  for (let y = 0; y < content; y += 1) {
    for (let x = 0; x < content; x += 1) {
      const sx = ((x + 0.5) * src.width) / content - 0.5;
      const sy = ((y + 0.5) * src.height) / content - 0.5;
      const [r, g, b, a] = sample(src, sx, sy);
      const alpha = a / 255;
      const di = ((offset + y) * outSize + (offset + x)) * 4;

      out[di] = Math.round(r * alpha + out[di] * (1 - alpha));
      out[di + 1] = Math.round(g * alpha + out[di + 1] * (1 - alpha));
      out[di + 2] = Math.round(b * alpha + out[di + 2] * (1 - alpha));
      out[di + 3] = 255;
    }
  }

  return { width: outSize, height: outSize, data: out };
}

function main() {
  const sourcePath = path.join(ROOT, "icon-512.png");
  const src = readPng(fs.readFileSync(sourcePath));

  const maskable512 = buildMaskable(src, 512, SCALE);
  const maskable192 = buildMaskable(src, 192, SCALE);

  const out512 = path.join(ROOT, "icon-maskable-512.png");
  const out192 = path.join(ROOT, "icon-maskable-192.png");

  fs.writeFileSync(out512, writePng(maskable512.width, maskable512.height, maskable512.data));
  fs.writeFileSync(out192, writePng(maskable192.width, maskable192.height, maskable192.data));

  console.log(`wrote ${path.basename(out512)} (${maskable512.width}x${maskable512.height})`);
  console.log(`wrote ${path.basename(out192)} (${maskable192.width}x${maskable192.height})`);
}

main();
