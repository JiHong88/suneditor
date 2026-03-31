import type {} from '../../typedef';
export default CodeBlock;
export type CodeBlockPluginOptions = {
	/**
	 * - List of selectable programming languages for code blocks.
	 * - Defaults to 21 common languages
	 * - [javascript, typescript, html, css, json, python, java, c, cpp, csharp, go, rust, ruby, php, swift, kotlin, sql, bash, markdown, xml, yaml].
	 * - Set to empty array `[]` to disable language selection UI entirely.
	 * ```js
	 * { codeBlock: { langs: ['javascript', 'python', 'html', 'css'] } }
	 * ```
	 */
	langs?: Array<string>;
};
/**
 * @typedef {Object} CodeBlockPluginOptions
 * @property {Array<string>} [langs] - List of selectable programming languages for code blocks.
 * - Defaults to 21 common languages
 * - [javascript, typescript, html, css, json, python, java, c, cpp, csharp, go, rust, ruby, php, swift, kotlin, sql, bash, markdown, xml, yaml].
 * - Set to empty array `[]` to disable language selection UI entirely.
 * ```js
 * { codeBlock: { langs: ['javascript', 'python', 'html', 'css'] } }
 * ```
 */
/**
 * @class
 * @implements {PluginDropdown}
 * @description Code block plugin — toggles `<pre>` formatting with language selection.
 * - Toolbar: command button (toggle `<pre>`) + optional dropdown (language list)
 * - Hover UI: shows language selector on `<pre>` hover (Controller + SelectMenu)
 * - I/O conversion: `<pre class="language-xxx">` ↔ `<pre><code class="language-xxx">`
 */
declare class CodeBlock extends PluginCommand implements PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {CodeBlockPluginOptions} pluginOptions - Configuration options for the CodeBlock plugin.
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: CodeBlockPluginOptions);
	title: any;
	onMouseMove(params: SunEditor.HookParams.MouseEvent): void;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	on(target?: HTMLElement): void;
	/** @hook Module.Controller */
	controllerClose(): void;
	/**
	 * @description Cleans up resources.
	 */
	destroy(): void;
	#private;
}
import { PluginDropdown } from '../../interfaces';
import { PluginCommand } from '../../interfaces';
