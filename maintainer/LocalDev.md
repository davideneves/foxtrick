# Local development setup

Foxtrick can be loaded **unpacked** from this repository. You do **not** need `make` for day-to-day development.

## Remotes (fork workflow)

```text
origin    git@github.com:davideneves/foxtrick.git   # your fork
upstream  git@github.com:minj/foxtrick.git          # official
```

Sync `master` with upstream:

```bash
git checkout master
git fetch upstream
git merge upstream/master
git push origin master
```

Work on topic branches (`feature/…`, `bugfix/…`, `chore/…`) branched from an up-to-date `master`.

## Chrome / Chromium (recommended)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the repository root (the folder that contains `manifest.json`)
4. After code changes: click **Reload** on the extension card, then refresh the Hattrick tab

Background debugger: open the extension details → inspect `background.html`.

Enable Foxtrick logging (Chrome prefs / experiment as needed). Preference key used by the project:

```text
extensions.foxtrick.prefs.logDisabled = false
```

A ready-made Firefox `user.js` snippet lives at [dev-prefs.js](dev-prefs.js).

## Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on…**
3. Choose `manifest.json` at the repository root

Temporary add-ons are removed when Firefox restarts. Reload the temporary add-on after code changes.

## Smoke test checklist

On [hattrick.org](https://www.hattrick.org/) (logged in):

- [ ] Extension loads without background errors
- [ ] Page action / toolbar popup opens (`content/popup.html`)
- [ ] Preferences open (`content/preferences.html`)
- [ ] Core modules run (see console / Foxtrick log; entry point `content/entry.js` → `docLoad`)
- [ ] Disable temporary toggle works from the popup

Automated browser automation may be blocked by Cloudflare on hattrick.org; prefer manual smoke tests.

## Manifest sanity check

From the repo root (Python 3):

```bash
python3 maintainer/check-manifest.py
```

All script paths referenced by `manifest.json` and `content/background.html` must exist.
