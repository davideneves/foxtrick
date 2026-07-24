# Third-party libraries inventory (`content/lib/`)

Static inventory for modernization. Do **not** bulk-upgrade without manual HT testing.

| Library | File | Used by | Update risk | Notes |
|---------|------|---------|-------------|-------|
| OAuth | `oauth.js` | CHPP (`content/util/api.js`) | High | Auth critical; leave pinned |
| SHA1 | `sha1.js` | OAuth / API signing | High | Keep with OAuth |
| PluralForm | `PluralForm.js` | `content/l10n.js` | Medium | Mozilla-style plural rules |
| YAML | `yaml.js` | FAQ / release notes loaders | Medium | Used for YAML resources |
| Psico | `psico.js` | PsicoTSI module / prefs | Medium | Domain-specific; vendor carefully |
| Gauge | `gauge.js` | HTMS prediction UI | Low–Medium | UI helper |
| Exceptionless | `exceptionless.universal.js` | Error reporting (`util/log.js`) | Medium | Large vendor bundle |
| IDBStore | `idbstore.js` | `util/local-store.js` | Medium | IndexedDB wrapper |
| IndexedDB polyfill | `indexedDB.polyfill.js` | Background / older browsers | Low | Candidate to drop if min browsers rise |
| Integration | `integration.js` | Extension glue | Low | Foxtrick-owned adapter |
| jQuery | `jquery.js` | Preferences UI only (legacy) | Medium | **Candidate for removal** if prefs rewritten; not used by modules (no jQuery in modules by policy) |

## Recommendations

1. Prefer not touching OAuth/SHA1/Exceptionless in casual PRs.
2. IndexedDB polyfill: re-evaluate after raising `minimum_chrome_version` / Gecko min.
3. jQuery: track as cleanup after prefs UI messaging work (MV3-adjacent).
4. Any library bump needs a logged smoke test on Player, Players, Match, Transfer list pages.

See also [HT-AUDIT.md](HT-AUDIT.md) and [MV3-SPIKE.md](MV3-SPIKE.md).
