# Upgrading Canvas — v7.x.x → v8.0.0 (Complete Guide)

Canvas **8.0.0** is a **major** release. The major version bump is driven by three breaking dependency upgrades — **jQuery 3 → 4**, **Swiper 11 → 12**, and a modernized **build toolchain** — plus a refreshed set of demos and a full content/SEO pass. Existing projects will keep working in almost all cases, but because of the jQuery and Swiper majors you should **retest before deploying**.

This guide is deliberately exhaustive. Read **§1–§3** first, then follow **Track A** (static HTML) or **Track B** (build from source), and use **§7 Troubleshooting** + **§8 FAQ** if anything misbehaves.

---

## Table of contents

1. [Before you start (backup & inventory)](#1-before-you-start)
2. [What changed in 8.0.0](#2-what-changed-in-800)
3. [Compatibility impact at a glance](#3-compatibility-impact-at-a-glance)
4. [Track A — Static HTML users (no build)](#4-track-a--static-html-users-no-build)
5. [Track B — Developers (build from source)](#5-track-b--developers-build-from-source)
6. [jQuery 4 migration reference](#6-jquery-4-migration-reference)
7. [Troubleshooting](#7-troubleshooting)
8. [FAQ](#8-faq)
9. [Testing checklist](#9-testing-checklist)
10. [Rollback](#10-rollback)

---

## 1. Before you start

1. **Back up everything.** Copy your entire project folder (and database/server, if this is a live site) to a safe location. Do not skip this — it is your one-click rollback (see §10).
2. **Record your current version.** Open `style.css` and read the `Version:` line in the header comment (e.g. `Version: 7.4`). Knowing your starting point helps if you need support.
3. **Inventory your customizations.** The upgrade replaces *framework* files only; these are the things you must preserve:
   - Your edited `*.html` pages and their content.
   - **`css/custom.css`** — your style overrides.
   - Your own images in `images/` and any custom assets under `demos/<your-demo>/`.
   - Any custom JavaScript you added (ideally in your own file, not inside `js/functions.js`).
   - Any third‑party plugins you integrated.
4. **Note any core-file edits.** If you edited Canvas's core `style.css`, `js/functions.js`, or other framework files directly (instead of using `css/custom.css`), write those changes down — you'll re-apply them after upgrading. **Going forward, keep all overrides in `css/custom.css`** so future updates are a clean drop-in.
5. **Check your tooling (Track B only).** If you compile from SCSS, confirm **Node ≥ 20.19.0** (`node -v`).

---

## 2. What changed in 8.0.0

### 2.1 Dependencies

| Package | From | To | Type | Notes |
|---|---|---|---|---|
| **jQuery** | 3.7.0 | **4.0.0** | major | Several legacy APIs removed; Canvas ships a compatibility shim (see §6). |
| **Swiper** | 11.0.5 | **12.1.3** | major | Slider engine; retest any customized sliders. |
| **Bootstrap** | 5.3.2 | **5.3.8** | patch | Recompiled; no action expected. |
| **jQuery Validation** | 1.19.5 | **1.22.1** | minor | Retest custom form-validation rules. |

### 2.2 jQuery 4 compatibility (built in)

jQuery 4.0 removed a number of long-deprecated helpers. Canvas handles this for you in two layers so the theme and its bundled plugins keep working:

- **Runtime shim** — `js/functions.js` (and the bundled `js/functions.bundle.js`) install `applyJQueryCompat($)`, which re-adds each removed API as a thin wrapper around its modern equivalent. It runs the moment Canvas detects jQuery, *before* any legacy plugin executes, and is idempotent.
- **Source patches** — internal plugins that used removed APIs were updated directly: `js/jquery.calendario.js`, `js/components/typehead.js`, `js/components/daterangepicker.js`, `js/plugins.countdown.js`, `js/plugins.hashchange.js`.

`js/jquery.js` itself is the clean, unmodified jQuery 4 build, so future jQuery updates stay a simple drop-in.

### 2.3 Build toolchain (Track B)

The gulp pipeline was modernized and hardened (only relevant if you build from source):

- Minifiers swapped to **terser**-based plugins (`gulp-terser`, `gulp-html-minifier-terser`) so modern JS (`const`/arrow/class) minifies correctly.
- Native gulp 5 source maps (the old sourcemaps plugin was removed).
- Added `gulp-plumber` so a single Sass/JS error no longer kills `gulp watch`.
- New standalone **`gulp rtl`** task, also chained into `gulp scsscompile` so `style-rtl.css` is always regenerated.
- **`"engines": { "node": ">=20.19.0" }`** added (floor set by the Sass version).

### 2.4 Content & SEO

All demo and component pages received a content + SEO refresh: real placeholder copy (no more Lorem Ipsum), unique titles and meta descriptions, Open Graph + Twitter Card tags, canonical URLs, `theme-color`, and JSON‑LD structured data. This is purely additive — replace the pages only if you have *not* customized them (see §4).

### 2.5 Files touched by the upgrade

| Area | Files |
|---|---|
| Stylesheets | `style.css`, `style-rtl.css`, `style.scss` |
| Sass sources | `sass/**` (Bootstrap 5.3.8 partials, etc.) |
| Scripts | `js/**` (jQuery 4, Swiper 12, patched plugins, `functions.js` shim) |
| Build | `package.json`, `gulpfile.js` |
| Content | demo/component `*.html` + `demos/**` assets |

---

## 3. Compatibility impact at a glance

- ✅ **HTML structure is unchanged** by the upgrade itself — your pages remain compatible.
- ✅ **Canvas core + bundled plugins** work on jQuery 4 out of the box (shim).
- ⚠️ **Your custom jQuery code / third‑party plugins** may use APIs removed in jQuery 4 — see §6.
- ⚠️ **Customized Swiper sliders** — retest; Swiper 12 is a major upgrade.
- ✅ **Bootstrap** change is a patch — no action expected.

---

## 4. Track A — Static HTML users (no build)

*Recommended for most buyers.* You replace only the framework assets and keep all of your own content.

### 4.1 Replace these (overwrite from the v8.0.0 package)

- `style.css` and `style-rtl.css`
- the entire **`js/`** folder (brings jQuery 4, Swiper 12, the patched plugins, and `functions.js` with the compatibility shim)
- the **`css/`** folder — **except keep your own `css/custom.css`**
- `sass/` — only if you also compile SCSS (otherwise optional)

### 4.2 Never overwrite

- your edited `*.html` pages
- `css/custom.css`
- your `images/`
- any custom files under `demos/<your-demo>/`

### 4.3 Step by step

1. Make your backup (§1).
2. Copy the new `style.css`, `style-rtl.css`, and the `js/` folder over your project, replacing the old ones.
3. Copy the new `css/` folder **but do not overwrite `css/custom.css`** (copy the other files, keep yours).
4. Re-apply any edits you had made directly to core files (move them into `css/custom.css` where possible).
5. Want a **new v8 demo or block**? Copy that page's `.html` **plus** its matching `demos/<name>/` asset folder.
6. **Bust caches:** hard-refresh the browser, and if you version your asset links bump them, e.g. `style.css?v=8.0.0`.
7. Run through the **testing checklist** (§9).

---

## 5. Track B — Developers (build from source)

1. Ensure **Node ≥ 20.19.0** (`node -v`).
2. Replace the source: `sass/`, `js/`, `gulpfile.js`, `package.json` (and `package-lock.json` if present).
3. **Clean install** dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```
4. **Rebuild** assets:
   ```bash
   npx gulp scsscompile   # → style.css + style-rtl.css (RTL auto-regenerated)
   npx gulp buildjs       # → JS bundles
   npx gulp minify        # → minified css/js/html + plugin concat + demo RTL + images
   ```
   Live development:
   ```bash
   npx gulp watch         # rebuild on change
   npm start              # browser-sync live preview
   ```
   Individual tasks are also available: `cssminify`, `jsminify`, `htmlminify`, `imageminify`, `concatplugins`, `rtl`, `demosrtl`.
5. Re-apply source customizations — ideally isolated in your own SCSS partials and `css/custom.css`.

---

## 6. jQuery 4 migration reference

Canvas's shim covers the theme and its plugins. If **you** maintain custom scripts, update them to the modern equivalents (the shim keeps the old calls working, but new code should not rely on it):

| Removed in jQuery 4 | Use instead |
|---|---|
| `$.isFunction(x)` | `typeof x === 'function'` |
| `$.isArray(x)` | `Array.isArray(x)` |
| `$.proxy(fn, ctx)` | `fn.bind(ctx)` |
| `$.parseJSON(s)` | `JSON.parse(s)` |
| `$.trim(s)` | `s.trim()` |
| `$.now()` | `Date.now()` |
| `$.type(x)` | `typeof` / explicit checks |
| `$.camelCase(s)` | manual camel-casing |
| `$.nodeName(el, n)` | `el.nodeName.toLowerCase() === n` |
| `$.unique(arr)` | `$.uniqueSort(arr)` |
| `$.holdReady()` | (no longer needed) |

Other jQuery 4 notes: `jQuery.fn.* ` ajax/event APIs are unchanged for typical usage; if you wrote low-level plugins, review the official jQuery 4 upgrade guide.

---

## 7. Troubleshooting

**A slider/carousel doesn't initialize or looks broken.**
Swiper went 11 → 12 (major). If you customized slider markup or options, recheck against Swiper 12. Confirm `js/plugins.swiper.js` was replaced and that your page loads it. Clear cache.

**A third‑party jQuery plugin throws `$.xxx is not a function`.**
That plugin uses an API removed in jQuery 4. Canvas's shim covers the APIs the theme uses; if your plugin needs another, either update the plugin or add the missing alias in your own script after jQuery loads. See §6.

**My styling changes disappeared after upgrading.**
You likely edited the core `style.css` directly and then overwrote it. Restore from your backup, move those overrides into `css/custom.css`, then re-upgrade.

**RTL layout looks off.**
Replace `style-rtl.css` too (Track A), or run `npx gulp scsscompile` / `npx gulp rtl` (Track B) so RTL is regenerated alongside the main stylesheet.

**`gulp` fails on install or build (Track B).**
Check Node ≥ 20.19.0. Do a clean install (`rm -rf node_modules && npm install`). The pipeline uses terser-based minifiers and native source maps; old global plugins are not required.

**Fonts/icons missing.**
Ensure the full `css/` folder (and any icon font files it references) was copied, and that relative paths from your pages are intact.

**Console shows a Content-Security-Policy or mixed-content error.**
Unrelated to the upgrade itself, but verify any CDN/asset URLs you added still resolve over HTTPS.

---

## 8. FAQ

**Do I have to upgrade?** Only if you want the new demos, the dependency/security updates, or the content/SEO improvements. 7.x keeps working.

**Will the upgrade overwrite my content?** Not if you follow Track A (replace framework files only and keep your pages + `css/custom.css`).

**Is jQuery 4 required?** Canvas 8.0.0 ships and is tested against jQuery 4. Staying on jQuery 3 is not supported in 8.0.0.

**Can I take just the new demos without upgrading the framework?** Generally no — new demos may rely on the 8.0.0 JS/CSS. Upgrade the framework, then add the demo page + its `demos/<name>/` folder.

**Do I need Node / gulp?** Only for Track B (building from source). Static HTML users never run a build.

**Where do my customizations go so updates stay easy?** `css/custom.css` for styles; your own `.js` file for scripts; your own SCSS partials if you build.

---

## 9. Testing checklist

After upgrading, click through these and confirm **no JavaScript errors** in the browser console:

- Sliders / carousels (**Swiper 12**), tabs, accordions/toggles, modals, off-canvas panels.
- Sticky header/footer, mobile menu, side panel, back-to-top.
- Forms: **validation + AJAX submit**, date/range pickers, counters, countdowns.
- Lightbox/galleries, Isotope/portfolio filtering, lazy load, infinite scroll.
- Mega menus and dropdowns.
- RTL layout (if used) and dark / adaptive color scheme.
- Responsive behaviour at mobile, tablet, and desktop breakpoints.

---

## 10. Rollback

If anything goes wrong, restore the pre-update backup you made in §1. Because the framework files are isolated from your content — and overrides live in `css/custom.css` — reverting is simply a file restore. Then re-attempt the upgrade, addressing whatever surfaced (usually a custom-jQuery or customized-Swiper item from §6/§7).

---

*See `CHANGELOG.md` (in the source package) for the complete, file-by-file list of changes in 8.0.0.*
