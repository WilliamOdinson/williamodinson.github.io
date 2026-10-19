/**
 * sale-photos: Prepare phone photos for a listing under /sale.
 *
 *   pnpm sale:photos <slug> <photo>... [--max 1600] [--quality 82]
 *
 * Each photo is copied into public/sale/<slug>/ as NN.webp (numbering carries
 * on after any files already there), turned upright from its EXIF orientation,
 * scaled to fit within --max pixels on the long edge, and stripped of all
 * metadata, GPS coordinates included. A 4 MB camera JPEG comes out around
 * 150 KB. The matching `images:` block for the front-matter is printed last.
 *
 * iPhone HEIC files cannot be decoded by the bundled sharp binaries; export
 * them as JPEG first (Photos app: File > Export, or AirDrop converts them).
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const USAGE =
  "usage: pnpm sale:photos <slug> <photo>... [--max 1600] [--quality 82]";

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

async function main() {
  const { slug, photos, max, quality } = parseArgs(process.argv.slice(2));

  const dir = path.join(ROOT, "public", "sale", slug);
  await mkdir(dir, { recursive: true });

  let next = (await highestNumber(dir)) + 1;
  const written = [];
  const failed = [];

  for (const photo of photos) {
    const name = `${String(next).padStart(2, "0")}.webp`;
    const out = path.join(dir, name);
    try {
      const info = await sharp(photo)
        .rotate()
        .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
        .webp({ quality })
        .toFile(out);
      const before = (await stat(photo)).size;
      console.log(
        `${path.basename(photo)} -> public/sale/${slug}/${name}  ${info.width}x${info.height}, ${kb(before)} -> ${kb(info.size)}`,
      );
      written.push(name);
      next += 1;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      const hint =
        /\.hei[cf]$/i.test(photo) && !/missing/i.test(reason)
          ? " (HEIC is not supported here; export it as JPEG first)"
          : "";
      console.error(`${path.basename(photo)}: ${reason}${hint}`);
      failed.push(photo);
    }
  }

  if (written.length > 0) {
    console.log("\nimages:");
    for (const name of written) console.log(`  - /sale/${slug}/${name}`);
  }
  if (failed.length > 0) {
    throw new Error(`\n${failed.length} of ${photos.length} photos failed`);
  }
}

/**
 * @param {string[]} argv
 * @returns {{ slug: string, photos: string[], max: number, quality: number }}
 */
function parseArgs(argv) {
  const photos = [];
  let slug = null;
  let max = 1600;
  let quality = 82;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--max" || arg === "--quality") {
      const value = Number(argv[++i]);
      if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${arg} needs a positive integer\n${USAGE}`);
      }
      if (arg === "--max") max = value;
      else quality = value;
    } else if (arg.startsWith("--")) {
      throw new Error(`unknown option ${arg}\n${USAGE}`);
    } else if (slug === null) {
      slug = arg;
    } else {
      photos.push(path.resolve(arg));
    }
  }

  if (slug === null || photos.length === 0) throw new Error(USAGE);
  if (!SLUG_RE.test(slug)) {
    throw new Error(
      `slug "${slug}" must be lowercase letters, digits and single hyphens, like "malm-desk"`,
    );
  }
  if (quality > 100) throw new Error("--quality is a percentage, 1 to 100");

  return { slug, photos, max, quality };
}

/** Highest NN already used by an NN.webp in the folder, 0 for an empty one. */
async function highestNumber(dir) {
  const names = await readdir(dir);
  return names.reduce((best, name) => {
    const m = /^(\d+)\.webp$/.exec(name);
    return m ? Math.max(best, Number(m[1])) : best;
  }, 0);
}

/** @param {number} bytes */
function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}
