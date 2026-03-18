import type {} from '../../typedef';
export default CodeLang;
/**
 * @description Manages code language selection UI for `<pre>` blocks.
 * - Shows a language selector button on hover over `<pre>` elements.
 * - Handles input/output conversion between editor format and standard HTML.
 */
declare class CodeLang {
	/**
	 * @description Input conversion: `<pre><code class="language-xxx">...</code></pre>` → `<pre class="language-xxx" data-se-lang="xxx">...`
	 * @param {HTMLElement} preElement The `<pre>` element to unwrap
	 */
	static unwrapCode(preElement: HTMLElement): void;
	/**
	 * @description Output conversion: `<pre class="language-xxx" data-se-lang="xxx">...` → `<pre><code class="language-xxx">...</code></pre>`
	 * @param {Element} preElement The `<pre>` element to wrap
	 */
	static wrapCode(preElement: Element): void;
	/**
	 * @constructor
	 * @param {SunEditor.Deps} $ Deps bag
	 * @param {Array<string>} langs Language list from options
	 */
	constructor($: SunEditor.Deps, langs: Array<string>);
	controller: Controller;
	/**
	 * @description Shows the language selector over the given pre element.
	 * @param {HTMLElement} preElement The `<pre>` element
	 */
	show(preElement: HTMLElement): void;
	/**
	 * @description Hides the language selector.
	 */
	hide(): void;
	/**
	 * @description Force close the language selector and selectMenu.
	 */
	close(): void;
	/**
	 * @description Whether the selector UI is currently visible (button or menu open).
	 * @returns {boolean}
	 */
	isOpen(): boolean;
	/**
	 * @hook Module.Controller
	 * @description Called when the controller is closed.
	 */
	controllerClose(): void;
	/**
	 * @description Cleans up resources.
	 */
	destroy(): void;
	#private;
}
import { Controller } from '../../modules/contract';
