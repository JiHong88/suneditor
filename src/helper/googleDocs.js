/**
 * @description Cleans Google Docs clipboard HTML.
 */

/** Matches the Google Docs clipboard wrapper id */
const _RE_GUID = /id=["']?docs-internal-guid-/i;

/**
 * @description Whether the HTML string is a Google Docs clipboard payload.
 * @param {string} html HTML string
 * @returns {boolean}
 */
export function isGoogleDocs(html) {
	return _RE_GUID.test(html);
}

/**
 * @description Removes the Google Docs clipboard wrapper tags, keeping their children.
 * - Only the guid-carrying inline wrappers (`b`/`span`) are unwrapped; real formatting tags inside are untouched.
 * @param {string} html HTML string
 * @returns {string} HTML string
 */
export function cleanHTML(html) {
	const doc = new DOMParser().parseFromString(html, 'text/html');
	const wrappers = doc.body.querySelectorAll('b[id^="docs-internal-guid-"], span[id^="docs-internal-guid-"]');
	if (wrappers.length === 0) return html;

	for (let i = 0, len = wrappers.length, w; i < len; i++) {
		w = wrappers[i];
		while (w.firstChild) w.parentNode.insertBefore(w.firstChild, w);
		w.parentNode.removeChild(w);
	}

	return doc.body.innerHTML;
}

export default {
	isGoogleDocs,
	cleanHTML,
};
