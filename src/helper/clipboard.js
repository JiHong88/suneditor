/**
 * @fileoverview clipboard helper
 */
import { isClipboardSupported } from './env';
import { isElement } from './dom/domCheck';

/**
 * @description Write the content to the clipboard
 * - Iframe is replaced with a placeholder : <div data-se-iframe-holder-src="iframe.src">[iframe: iframe.src]</div>
 * - "iframe placeholder" is re-rendered in html.clean when pasted into the editor.
 * @param {Element|Text|string} content Content to be copied to the clipboard
 * @returns {Promise<void|false>} If it fails, it returns false.
 */
export async function write(content) {
	if (!isClipboardSupported) {
		console.error('Clipboard is not supported in this browser.');
		return false;
	}

	let htmlString = '';
	let plainText = '';

	if (typeof content === 'string') {
		htmlString = content;
		plainText = content;
	} else if (isElement(content)) {
		content.querySelectorAll('iframe').forEach((iframe) => {
			const placeholder = document.createElement('div');
			const iframeAttrs = {};
			for (const attr of Array.from(iframe.attributes)) {
				iframeAttrs[attr.name] = attr.value;
			}

			placeholder.setAttribute('data-se-iframe-holder', '1');
			placeholder.setAttribute('data-se-iframe-holder-attrs', JSON.stringify(iframeAttrs));
			placeholder.innerText = `[iframe: ${iframe.src}]`;

			iframe.replaceWith(placeholder);
		});
		htmlString = content.outerHTML;
		plainText = content.textContent;
	} else {
		htmlString = content.textContent;
		plainText = content.textContent;
	}

	try {
		await navigator.clipboard.write([
			/* eslint-disable-next-line compat/compat */
			new ClipboardItem({
				'text/html': new Blob([htmlString], { type: 'text/html' }),
				'text/plain': new Blob([plainText], { type: 'text/plain' })
			})
		]);
	} catch {
		console.warn('[SUNEDITOR.copy.warn] This browser is not supported Clipboard API');
		try {
			await navigator.clipboard.writeText(plainText || stripHtml(htmlString));
		} catch (err) {
			console.error('[SUNEDITOR.copy.fail] ' + err);
		}
	}
}

function stripHtml(html) {
	const div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent || div.innerText || '';
}

export default {
	write
};
