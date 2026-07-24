# Hattrick DOM fragility audit

Static audit of Foxtrick page utils and high-traffic modules against Hattrick HTML.
Status defaults to **Pending** until verified on a live logged-in session.

Related regression: HT full-body avatar update (2023-11) broke `Player.getAttributes`
(selector `#mainBody > p .skill`); fixed in commit `1ddebfa60` → `.playerInfo > p .skill`.

## Verification priority

1. Player.aspx — `getAttributes`, info table row map, skill links
2. Players list — `getPlayerNodes`, new-design rows, `trForm` / `trStamina` / `trSpeciality`
3. Transfer search — `isNewDesign` nesting, `#playersTable` columns
4. Match ratings matrix + timeline hidden inputs
5. IA bypasses that duplicate page-util selectors

## Cross-cutting themes

| Area | Pattern | Risk | Status |
|------|---------|------|--------|
| Theme | New vs old player card (`.transferPlayerInformation` / `.playerInfoOld`) | High | Pending |
| Theme | ASP.NET `ctl00_…` / `getMBElement` / `[id$="…"]` | High | Pending |
| Theme | Hardcoded `table.rows[n].cells[m]` | High | Pending |
| Theme | `.skill` link order + URL heuristics | High | Pending |
| Theme | Live match dual stack (`UpdatePanelMatch` / `#ngLive`) | High | Pending |
| Theme | Match order classic vs Angular | High | Pending |

## Page utils

### `Foxtrick.Pages.Player` (`content/pages/player.js`)

| Symbol / selector | Risk | Notes | Status |
|-------------------|------|-------|--------|
| `getAttributes` / `.playerInfo > p .skill` | High | Full-body regression fixed; re-verify after layout changes | Pending |
| `getAttributes` row indices `FORM_ROW_NEW` / `STAMINA_ROW_NEW` | High | New-design table row order | Pending |
| `getInfoTable` / `.transferPlayerInformation` vs `.playerInfo` | High | Design detection hinge | Pending |
| `getTsi` / `getWageCell` / `getCards` row indices | High | Coupled to info table layout | Pending |
| `getSpecialtyNumber` / `tr[id$="trSpeciality"]` | High | ASP.NET id suffix | Pending |
| `parseSeniorSkills` / `parseYouthSkills` | High | Multiple HT skill UI generations | Pending |
| `getBidInfo` / `getMBElement(..., 'updBid')` | High | ASP.NET | Pending |
| `getAge` / `.byline` regex | Medium | Locale/text fragile | Pending |

Dependents include: `player-positions-evaluations`, `psico-tsi`, `links-player-detail`, `loyalty-display`, `htms-points`, `extended-player-details`, `copy-player-ad`, `transfer-deadline`.

### `Foxtrick.Pages.Players` (`content/pages/players.js`)

| Symbol / selector | Risk | Notes | Status |
|-------------------|------|-------|--------|
| `getPlayerNodes` / `.playerList` / `.playerInfo*` | High | List discovery | Pending |
| New design `.transferPlayerInformation` row map | High | Anon row indexing | Pending |
| `tr[id$="trSpeciality\|trForm\|trStamina"]` | High | ASP.NET | Pending |
| Last match rating SVG / star images | High | Geometry/image based | Pending |

Dependents include: `skill-table`, `team-stats`, `extra-player-info`, `player-filters`, `youth-skills`, `match-order`.

### `Foxtrick.Pages.Match` (`content/pages/match.js`)

| Symbol / selector | Risk | Notes | Status |
|-------------------|------|-------|--------|
| Live tabs `.rtsSelected` / `.live-scoreboard-teamname` | High | Live UI churn | Pending |
| `getRatingsTable` / `.teamMatchRatingsTable table` | High | Ratings hub | Pending |
| Hardcoded ratings matrix rows/cells | High | iSP length variants | Pending |
| Timeline inputs `[id$="_time"]` etc. | High | ASP.NET suffixes | Pending |
| `getLiveContainer` / `UpdatePanelMatch` | High | Live listeners | Pending |
| `parsePlayerData` / `[id$="lblPlayerData"]` JSON | High | Hidden field schema | Pending |

### `Foxtrick.Pages.TransferSearchResults` (`content/pages/transfer-search-results.js`)

| Symbol / selector | Risk | Notes | Status |
|-------------------|------|-------|--------|
| `isNewDesign` nesting heuristic | High | Parent ≠ `#mainBody` | Pending |
| `#playersTable` column indices | High | Club-weeks column | Pending |
| Skill cell indexing new vs old | High | Order differs | Pending |
| Bid `span[id$="lblDeadline"]` / `updFastBid` | High | ASP.NET | Pending |

### `Foxtrick.Pages.All` (`content/pages/all.js`)

| Symbol / selector | Risk | Notes | Status |
|-------------------|------|-------|--------|
| `getNotes` / `ctl00_updNotifications` variants | High | Explicit ctl00 IDs | Pending |
| `getMainHeader` / `.mainRegular h2` etc. | Medium | Layout classes | Pending |
| `isLoggedIn` / `#teamLinks` | Low–Medium | Header chrome | Pending |

## High-risk module bypasses

| Module area | Pattern | Risk | Status |
|-------------|---------|------|--------|
| `psico-tsi` | `.ownerAndStatusPlayerInfo ~ .flex`; own TL containers | High | Pending |
| `extended-player-details` | Duplicates owner/injury table logic | High | Pending |
| `youth-skills` | `nth-of-type` row arithmetic | High | Pending |
| `skill-table` | Own player-list discovery | High | Pending |
| `transfer-compare-players` | Hardcoded history columns | High | Pending |
| `match-lineup-tweaks` | Deep `.playersField` chains | High | Pending |
| `match-order` / `match-order-new` | Classic IDs vs Angular | High | Pending |
| `match-lineup-fixes` | Timeline + `.matchevent` | High | Pending |

## Live verification log

Automated browser smoke against hattrick.org from CI/agent environments is often blocked by
Cloudflare bot checks. Prefer a manual logged-in session (see [LocalDev.md](LocalDev.md)).

| Date | Page | Module / util | Result | Notes |
|------|------|---------------|--------|-------|
| 2026-07-24 | hattrick.org | — | Blocked | Cloudflare interstitial; no DOM audit possible without login |

## Infra note

`Foxtrick.getMainIDPrefix()` → `ctl00_ctl00_CPContent_CPMain_` in `content/util/dom.js`.
Any HT control-tree rename breaks bid panel, live match, notes, and many modules.
