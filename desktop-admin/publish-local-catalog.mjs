import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_EXPORT_BYTES = 64 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PRODUCTS = 10_000;
const MAX_IMAGES_PER_PRODUCT = 12;
const AUDIENCES = new Set(['men', 'women', 'boys', 'girls', 'unisex_kids', 'unisex']);
const MIME_EXTENSIONS = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.resolve(scriptDirectory, '..');

function fail(message) {
  throw new Error(message);
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

function splitList(value) {
  return typeof value === 'string'
    ? [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))]
    : [];
}

function imageBytes(image, productName) {
  if (!image || typeof image.mime_type !== 'string' || !MIME_EXTENSIONS.has(image.mime_type)) {
    fail(`"${productName}" has an unsupported product image.`);
  }

  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(image.data_url ?? '');
  if (!match || match[1] !== image.mime_type) {
    fail(`"${productName}" has an invalid image payload.`);
  }

  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES || bytes.toString('base64') !== match[2]) {
    fail(`"${productName}" has an invalid or oversized image.`);
  }

  const validSignature = image.mime_type === 'image/jpeg'
    ? bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : image.mime_type === 'image/png'
      ? bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      : bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!validSignature) fail(`"${productName}" image data does not match its format.`);

  return bytes;
}

function normalizeAudience(value) {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!raw) return 'unisex';
  if (raw === 'kids') return 'unisex_kids';
  return raw;
}

function mapProduct(product, imagePaths) {
  if (!product || typeof product !== 'object' || typeof product.id !== 'string' || !product.id.trim()) {
    fail('The export contains a product with an invalid identifier.');
  }
  if (typeof product.name !== 'string' || !product.name.trim() || typeof product.category !== 'string' || !product.category.trim()) {
    fail('A published product is missing its name or category.');
  }
  const audience = normalizeAudience(product.target_audience);
  if (!AUDIENCES.has(audience)) {
    fail(`"${product.name}" has an unsupported target audience.`);
  }
  if (!Number.isFinite(product.price) || product.price < 0 || !Number.isInteger(product.stock) || product.stock < 0) {
    fail(`"${product.name}" must have a valid price and non-negative stock to appear online.`);
  }
  if (typeof product.created_at !== 'string' || !Number.isFinite(Date.parse(product.created_at))) {
    fail(`"${product.name}" has an invalid creation date.`);
  }

  const idSuffix = digest(product.id).slice(0, 8);
  const sale = Boolean(product.is_sale && Number.isFinite(product.previous_price) && product.previous_price > 0);
  const fallbackCollection = audience.replace('_', ' ');
  const collectionName = typeof product.collection === 'string' && product.collection.trim()
    ? product.collection
    : fallbackCollection;

  return {
    id: product.id,
    slug: `${slugify(product.name) || 'product'}-${idSuffix}`,
    name: product.name.trim(),
    gender: ['men', 'women', 'boys', 'girls'].includes(audience) ? audience : 'unisex',
    targetAudience: audience,
    collection: slugify(collectionName),
    createdAt: product.created_at || undefined,
    category: product.category.trim(),
    price: sale ? product.previous_price : product.price,
    salePrice: sale ? product.price : undefined,
    description: typeof product.description === 'string' ? product.description : '',
    images: imagePaths,
    imagePositions: imagePaths.map(() => '50% 50%'),
    sizes: splitList(product.sizes).length ? splitList(product.sizes) : ['One size'],
    colors: splitList(product.colours).length ? splitList(product.colours) : ['Default'],
    featured: Boolean(product.featured),
    new: Boolean(product.is_new),
    sale,
    available: product.stock > 0,
    stock: product.stock,
  };
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    fail('Usage: node ./desktop-admin/publish-local-catalog.mjs <dioc-products-export.json>');
  }

  const exportPath = path.resolve(process.cwd(), inputPath);
  const file = await readFile(exportPath);
  if (file.byteLength > MAX_EXPORT_BYTES) fail('The catalogue export exceeds 64 MB.');

  let catalogExport;
  try {
    catalogExport = JSON.parse(file.toString('utf8'));
  } catch {
    fail('The catalogue export is not valid JSON.');
  }
  if (catalogExport?.format_version !== 1 || !Array.isArray(catalogExport.products) || catalogExport.products.length > MAX_PRODUCTS) {
    fail('Unsupported catalogue export format or product count.');
  }

  const productIds = new Set();
  const published = [];
  const imageDirectory = path.join(websiteRoot, 'public', 'catalog-images');
  await mkdir(imageDirectory, { recursive: true });

  for (const product of catalogExport.products) {
    if (!product || !['draft', 'published', 'archived'].includes(product.status)) {
      fail('The export contains a product with an invalid publication status.');
    }
    if (product.status !== 'published') continue;
    if (productIds.has(product.id)) fail('The export contains duplicate product identifiers.');
    productIds.add(product.id);
    if (!Array.isArray(product.images) || product.images.length > MAX_IMAGES_PER_PRODUCT) {
      fail(`"${product.name || 'A product'}" has an invalid number of images.`);
    }

    const imagePaths = [];
    for (const [index, image] of product.images.entries()) {
      const bytes = imageBytes(image, product.name || 'Product');
      const extension = MIME_EXTENSIONS.get(image.mime_type);
      const fileName = `${digest(product.id).slice(0, 20)}-${index + 1}-${digest(bytes).slice(0, 12)}.${extension}`;
      await writeFile(path.join(imageDirectory, fileName), bytes);
      imagePaths.push(`/catalog-images/${fileName}`);
    }
    published.push(mapProduct(product, imagePaths));
  }


  published.sort((a, b) => Date.parse(b.createdAt ?? '') - Date.parse(a.createdAt ?? '') || b.id.localeCompare(a.id));
  const output = `import type { Product } from './catalog';\n\nexport const publishedCatalog: Product[] = ${JSON.stringify(published, null, 2)};\n`;
  await writeFile(path.join(websiteRoot, 'lib', 'published-catalog.ts'), output, 'utf8');

  console.log(`Prepared ${published.length} published product(s) for the public site.`);
  console.log('Review lib/published-catalog.ts and public/catalog-images, then deploy the website.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

