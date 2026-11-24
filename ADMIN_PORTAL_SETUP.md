# DIOC local administration

The Windows desktop app in `desktop-admin` is the administration application. Its SQLite database, product photographs, and encrypted backups live under:

```text
%APPDATA%\ke.co.dioc.local-admin\DIOC\
```

The first launch asks you to create an administrator name and a password of at least 12 characters. Passwords and recovery keys are hashed with Argon2id. Store the one-time recovery key privately; password recovery rotates it. Login attempts are limited, and the workspace locks after the configured idle timeout.

The former browser-based admin portal and its Supabase-backed APIs have been retired. `/admin` and `admin.dioc.co.ke` now point to a notice; legacy admin API requests return `410 Gone`. The public website remains online and may continue using Supabase for its public catalogue and customer sign-in. The desktop app does not contain Supabase credentials and does not require the laptop to be online.

## Run and build the desktop app

From PowerShell:

```powershell
Set-Location .\desktop-admin
npm install
npm run tauri:dev
```

To produce a Windows installer:

```powershell
npm run tauri:build
```

Windows packaging requires Visual Studio Build Tools with the C++ workload/MSVC linker and a Windows SDK. Tauri also requires WebView2; NSIS is required for its NSIS installer target. The Windows NSIS installer has been built and verified at `desktop-admin/src-tauri/target/release/bundle/nsis/DIOC Local Administration_0.1.0_x64-setup.exe`.

## Product and image migration

Local imports are additive: they reject duplicate SKUs and never delete cloud or local records. The migration utility is a one-time, credential-free importer; it reads a JSON export and downloads only publicly readable product images. It does not write to Supabase.

1. Keep the existing cloud project and its data intact. In the Supabase SQL Editor for the correct project, run this **read-only** query after the product schema/migrations exist. Copy the `catalog` JSON value to a UTF-8 file such as `supabase-catalog.json`.

   ```sql
   select jsonb_pretty(
     coalesce(
       jsonb_agg(
         jsonb_build_object(
           'sku', p.sku,
           'name', p.name,
           'description', coalesce(p.description, ''),
           'category_name', c.name,
           'product_type', p.product_type,
           'gender', p.gender,
           'target_audience', p.target_audience,
           'price_kes', p.price_kes,
           'sale_price_kes', p.sale_price_kes,
           'is_sale', p.is_sale,
           'featured', p.featured,
           'is_new', p.is_new,
           'active', p.active,
           'available', p.available,
           'status', p.status,
           'created_at', p.created_at,
           'published_at', p.published_at,
           'stock', coalesce((
             select sum(v.stock_quantity)::integer
             from public.product_variants v
             where v.product_id = p.id
           ), 0),
           'sizes', coalesce((
             select jsonb_agg(distinct v.size) filter (where v.size is not null)
             from public.product_variants v
             where v.product_id = p.id
           ), '[]'::jsonb),
           'colours', coalesce((
             select jsonb_agg(distinct v.color) filter (where v.color is not null)
             from public.product_variants v
             where v.product_id = p.id
           ), '[]'::jsonb),
           'variants', coalesce((
             select jsonb_agg(jsonb_build_object(
               'size', v.size, 'color', v.color, 'stock_quantity', v.stock_quantity
             ) order by v.size, v.color)
             from public.product_variants v
             where v.product_id = p.id
           ), '[]'::jsonb),
           'images', coalesce((
             select jsonb_agg(jsonb_build_object(
               'storage_path', i.storage_path, 'sort_order', i.sort_order
             ) order by i.sort_order)
             from public.product_images i
             where i.product_id = p.id
           ), '[]'::jsonb)
         ) order by p.created_at desc, p.id desc
       ),
       '[]'::jsonb
     )
   ) as catalog
   from public.products p
   left join public.categories c on c.id = p.category_id;
   ```

2. With Node.js 18 or newer, create local import file(s). Replace the URL with the project URL (no secret key is used):

   ```powershell
   node .\desktop-admin\migrate-supabase-catalog.mjs .\supabase-catalog.json https://YOUR_PROJECT_REF.supabase.co .\supabase-import
   ```

   The utility fetches image objects from the public `product-images` bucket, validates their type and size, keeps `created_at`/`published_at`, and splits large exports into files below the app's 64 MB import limit. The bucket must allow public reads for this migration method.

3. In the desktop app, choose **Publishing → Import catalogue**, select each generated JSON file once, and verify product counts, images, categories, audience, stock, and creation dates. Duplicate SKUs are rejected rather than overwritten.

4. Do not remove cloud data or disable the public cloud catalogue until you have verified the local import and chosen a separate publishing workflow. Orders and customer records are not included in this product/image migration utility; they remain untouched in the cloud database and are not automatically imported.

The configured Supabase project previously checked in this workspace did not expose `public.products`; therefore no live data migration could be performed or verified here. Do not substitute demonstration data. Resolve the correct source project/schema first, and keep the cloud records until the local import is verified.

## Local operations and website publishing

- Products are ordered by `created_at DESC, id DESC`; edits preserve `created_at`. First publication is stored in `published_at`.
- Product images are compressed in the app, stored per product under the app data directory, and deleted/replaced from their managed folder when the product changes.
- Backups are encrypted with AES-256-GCM and contain the SQLite database and managed product images. The encryption key is held by the current Windows user account's credential store; keep a copy of the keychain/Windows profile as well as backups. A backup may not be restorable on a different Windows account or computer.
- Automatic backups are attempted daily; manual backup, validation, and restore are available in **Backups**. A successful restore locks the workspace and requires sign-in again.
- **Manual website publishing:** In the desktop app, export products and photos. From the website repository, run `node .\desktop-admin\publish-local-catalog.mjs .\path\to\dioc-products-....json`. The script includes only published, in-stock items and writes `lib/published-catalog.ts` plus product images under `public/catalog-images`. Review those generated files, set production `DIOC_LIVE_CATALOG=false`, and deploy the website. The storefront then serves this static snapshot while the laptop is off. Setting `DIOC_LIVE_CATALOG=true` selects the optional Supabase catalogue instead.
- The desktop app does not upload to the website or embed privileged cloud credentials. Publishing is complete only after the generated snapshot and images are included in a website deployment.
