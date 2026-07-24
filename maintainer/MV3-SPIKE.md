# Manifest V3 spike

Status: **spike / not production**. Default builds still use Manifest V2
(`manifest.json` → `content/background.html`).

## Why MV3 is hard for Foxtrick

| Blocker | Where | MV3 impact |
|---------|-------|------------|
| Persistent background page | `content/background.html` | Must become a service worker |
| `chrome.extension.getBackgroundPage()` | formerly `popup.js`; still `env.js` | Unavailable in SW; use messaging |
| DOM APIs in background (`Image`, `canvas`, `document`) | `requests.getDataUrl`, L10n helpers | Need Offscreen Document / alternate approach |
| In-memory resource bundle on `pageLoad` | `background.js` `updateResources` | SW can sleep; hydrate from `chrome.storage` / IndexedDB |
| `localStorage` in background | `prefs-util.js`, `background.js` | Move to `chrome.storage.local` |
| Host permissions shape | `manifest.json` `permissions` | Split into `permissions` + `host_permissions` |
| `page_action` | `manifest.json` | Becomes `action` |

## Done in this spike (MV2-compatible)

1. **Popup no longer uses `getBackgroundPage()`** — `content/popup.js` talks to the
   background via `popupGetState`, `setValue`, and `clearCaches` messages.
2. **Background handlers** added in `content/background.js` for those requests.
3. **Experimental files**
   - `content/background-sw.js` — minimal SW with `swPing`
   - `manifest.v3.json` — illustrative MV3 shape (not used by Makefile)
4. **Local validation**: `python3 maintainer/check-manifest.py` (MV2 manifest)

## How to experiment

1. Keep developing on MV2 unpacked load (see [LocalDev.md](LocalDev.md)).
2. Optionally load `manifest.v3.json` in a **throwaway** Chromium profile after
   renaming/copying over `manifest.json` — expect incomplete behaviour (SW spike
   only answers `swPing` / error stubs).
3. Next incremental PRs (suggested order):
   - Replace remaining `getBackgroundPage` uses in `env.js`
   - Move prefs off `localStorage` in the background
   - Replace `getDataUrl` canvas path
   - `importScripts` ordered bundle or a real bundler for the SW
   - Flip default manifest to MV3 when Chrome + Firefox both pass smoke tests

## Test plan (spike)

- [x] MV2: popup opens and toggles prefs via messaging
- [ ] MV2: clear cache from popup
- [ ] MV3 experimental: `swPing` returns `{ ok: true }`
- [ ] Player / Match / Transfer pages still run modules under MV2 after popup change

## References

- [LocalDev.md](LocalDev.md)
- [HT-AUDIT.md](HT-AUDIT.md)
- [LIBS.md](LIBS.md)
- Chrome: [Migrate to Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate)
