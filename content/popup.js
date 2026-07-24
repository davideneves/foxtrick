'use strict';
/**
 * popup.js
 *
 * Toolbar popup. Uses extension messaging instead of getBackgroundPage()
 * so the same code path works toward Manifest V3 service workers.
 *
 * @author LA-MJ
 */

/* global chrome */

// jscs:disable disallowFunctionDeclarations

/**
 * @param  {object} msg
 * @return {Promise<*>}
 */
function send(msg) {
	return new Promise(function(resolve, reject) {
		chrome.runtime.sendMessage(msg, function(response) {
			var err = chrome.runtime.lastError;
			if (err) {
				reject(new Error(err.message));
				return;
			}
			resolve(response);
		});
	});
}

function shutDown() {
	window.close();
}

function visitLink(ev) {
	ev.preventDefault();
	// jshint -W040
	chrome.tabs.create({ url: this.href });
	// jshint +W040
	window.close();
	return false;
}

/**
 * @param {string} key
 * @param {string} checkboxId
 */
function togglePref(key, checkboxId) {
	var checked = document.getElementById(checkboxId).checked;
	send({ req: 'setValue', key: key, value: checked }).then(shutDown, function(e) {
		console.error('Foxtrick popup setValue failed', e); // eslint-disable-line no-console
		shutDown();
	});
}

function toggleEnabled() {
	togglePref('disableTemporary', 'foxtrick-toolbar-deactivate');
}

function toggleHighlight() {
	togglePref('featureHighlight', 'foxtrick-toolbar-highlight');
}

function toggleTranslationKeys() {
	togglePref('translationKeys', 'foxtrick-toolbar-translationKeys');
}

function clearCache() {
	send({ req: 'clearCaches' }).then(shutDown, function(e) {
		console.error('Foxtrick popup clearCaches failed', e); // eslint-disable-line no-console
		shutDown();
	});
}

function openPrefs() {
	document.location.href = 'preferences.html?width=700#tab=on_page';
}

/**
 * @param {object} state
 */
function applyState(state) {
	var checkbox, label, strings = state.strings || {};

	checkbox = document.getElementById('foxtrick-toolbar-deactivate');
	checkbox.checked = !!state.disableTemporary;
	checkbox.addEventListener('click', toggleEnabled);

	checkbox = document.getElementById('foxtrick-toolbar-highlight');
	checkbox.checked = !!state.featureHighlight;
	checkbox.addEventListener('click', toggleHighlight);

	checkbox = document.getElementById('foxtrick-toolbar-translationKeys');
	checkbox.checked = !!state.translationKeys;
	checkbox.addEventListener('click', toggleTranslationKeys);

	document.getElementById('foxtrick-toolbar-deactivate-label').textContent =
		strings.disableTemporary || '';
	document.getElementById('foxtrick-toolbar-highlight-label').textContent =
		strings.featureHighlight || '';
	document.getElementById('foxtrick-toolbar-translationKeys-label').textContent =
		strings.translationKeys || '';

	label = document.getElementById('foxtrick-toolbar-options-label');
	label.textContent = strings.preferences || '';
	label.addEventListener('click', openPrefs);

	label = document.getElementById('foxtrick-toolbar-homepage-label');
	label.textContent = strings.homepage || '';
	label.addEventListener('click', visitLink);

	label = document.getElementById('foxtrick-toolbar-contribute-label');
	label.textContent = strings.contribute || '';
	label.addEventListener('click', visitLink);

	label = document.getElementById('foxtrick-toolbar-clearCache-label');
	label.textContent = strings.clearCache || '';
	label.title = strings.clearCacheTitle || '';
	label.addEventListener('click', clearCache);
}

function init() {
	send({ req: 'popupGetState' }).then(function(state) {
		if (!state || state.error) {
			console.error('Foxtrick popup init failed', state); // eslint-disable-line no-console
			return;
		}
		applyState(state);
	}, function(e) {
		console.error('Foxtrick popup init failed', e); // eslint-disable-line no-console
	});
}

init();
