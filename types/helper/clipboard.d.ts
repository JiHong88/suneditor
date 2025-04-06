/**
 * @description Write the content to the clipboard
 * - Iframe is replaced with a placeholder : <div data-se-iframe-holder-src="iframe.src">[iframe: iframe.src]</div>
 * - "iframe placeholder" is re-rendered in html.clean when pasted into the editor.
 * @param {Element|Text|string} content Content to be copied to the clipboard
 * @returns {Promise<void>}
 */
export function write(content: Element | Text | string): Promise<void>;
declare namespace _default {
	export { write };
}
export default _default;
