/**
 * background-sw.js
 *
 * Manifest V3 service-worker spike for Foxtrick.
 *
 * This file is NOT wired into the default MV2 `manifest.json`.
 * Use `manifest.v3.json` only for experimental loads.
 *
 * Blockers vs the current background page (`background.html` + `background.js`):
 * - No DOM: `document`, `Image`, `canvas` (see `requests.getDataUrl`) must be replaced
 * - No persistent page: in-memory caches must move to `chrome.storage` / IndexedDB
 * - No `getBackgroundPage()`: popup/prefs must use messaging (popup.js already does)
 * - `importScripts` can load the legacy script list, but many scripts assume a Window
 *
 * Spike goal: prove messaging + lifecycle. Full migration is incremental.
 */

'use strict';

/* global chrome */

const FT_SW = {
	version: 'mv3-spike-0',
};

chrome.runtime.onInstalled.addListener(() => {
	console.info('Foxtrick MV3 SW spike installed', FT_SW.version); // eslint-disable-line no-console
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (!request || !request.req) {
		return false;
	}

	// Minimal handlers for spike validation when the full BG stack is not imported.
	if (request.req === 'swPing') {
		sendResponse({ ok: true, version: FT_SW.version, sender: sender.tab && sender.tab.id });
		return false;
	}

	// Delegate note: a full port would importScripts(...) then call
	// Foxtrick.loader.background.contentRequestsListener
	sendResponse({
		error: 'Foxtrick MV3 SW spike: full background stack not loaded. Use MV2 background page.',
		req: request.req,
	});
	return false;
});
