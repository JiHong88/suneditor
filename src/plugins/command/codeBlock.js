import { PluginCommand, PluginDropdown } from '../../interfaces';
import { converter, dom } from '../../helper';
import { Controller } from '../../modules/contract';
import { SelectMenu } from '../../modules/ui';

void PluginDropdown;

const DEFAULT_LANGS = ['javascript', 'typescript', 'html', 'css', 'json', 'python', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'bash', 'markdown', 'xml', 'yaml'];

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
class CodeBlock extends PluginCommand {
	static key = 'codeBlock';
	static className = '';

	#preTag;
	#langItems;
	#langs;

	// hover UI
	#hoverButton;
	#hoverSelectMenu;
	#hoverController;
	#hoverCurrentPre;
	#mouseLeaveEvent;
	#removeEventFunc;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {CodeBlockPluginOptions} pluginOptions - Configuration options for the CodeBlock plugin.
	 */
	constructor(kernel, pluginOptions) {
		super(kernel);
		this.title = this.$.lang.codeBlock || 'Code Block';
		this.icon = 'code_block';

		this.#preTag = dom.utils.createElement('PRE');
		this.#langs = pluginOptions?.langs ?? DEFAULT_LANGS;

		if (!this.#langs.length) return;

		/**
		 * ──────────────────────────────────
		 * [[ langs select ]]
		 * ──────────────────────────────────
		 */

		// ───────────────── [[toolbar dropdown type]] ─────────────────
		this.afterItem = dom.utils.createElement(
			'button',
			{ class: 'se-btn se-tooltip se-sub-arrow-btn', 'data-command': CodeBlock.key, 'data-type': 'dropdown' },
			`${this.$.icons.arrow_down}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.$.lang.codeLanguage || 'Language'}</span></span>`,
		);

		const menu = CreateDropdownHTML(this.$, this.#langs);
		this.#langItems = menu.querySelectorAll('li button');
		this.$.menu.initDropdownTarget({ key: CodeBlock.key, type: 'dropdown' }, menu);

		// ───────────────── [hover UI] ─────────────────
		// controller
		const containerEl = dom.utils.createElement('DIV', { class: 'se-controller se-code-lang' });
		this.#hoverButton = dom.utils.createElement('DIV', { class: 'se-code-lang-button' });
		this.#updateHoverButtonText('');
		containerEl.appendChild(this.#hoverButton);

		this.#hoverController = new Controller(this, this.$, containerEl, { position: 'top', isWWTarget: true });

		// mouseleave handler
		this.#removeEventFunc = converter.debounce((e) => {
			this.#mouseLeaveEvent = this.$.eventManager.removeEvent(this.#mouseLeaveEvent);

			if (e && containerEl.contains(e.relatedTarget)) {
				this.#addCtrlLeaveEvent();
			} else {
				this.#hideHover();
			}
		}, 0);

		// SelectMenu
		this.#hoverSelectMenu = new SelectMenu(this.$, {
			position: 'bottom-right',
			dir: this.$.options.get('_rtl') ? 'rtl' : 'ltr',
			maxHeight: '214px',
			minWidth: '132px',
			closeMethod: this.#removeEventFunc,
		});

		this.#hoverSelectMenu.on(this.#hoverButton, this.#onHoverSelect.bind(this));
		this.#buildHoverMenu('');

		// selectMenu
		this.$.eventManager.addEvent(this.#hoverButton, 'click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			if (this.#hoverSelectMenu.isOpen) {
				this.#hoverSelectMenu.close();
			} else {
				const currentLang = this.#getPreLang(this.#hoverCurrentPre);
				this.#buildHoverMenu(currentLang);
				const items = this.#hoverSelectMenu.items;
				const idx = currentLang ? items.indexOf(currentLang) : 0;
				this.#hoverSelectMenu.open(null, idx >= 0 ? `[data-index="${idx}"]` : null);
			}
		});
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnMouseMove}
	 */
	onMouseMove({ event }) {
		if (!this.#hoverController) return;
		const eventTarget = dom.query.getEventTarget(event);
		const pre = eventTarget.closest('pre');

		if (pre && !this.#isHoverOpen() && this.$.ui.opendControllers.length === 0) {
			this.#showHover(pre);
		}
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.Active}
	 */
	active(element, target) {
		if (/^PRE$/i.test(element?.nodeName)) {
			dom.utils.addClass(target, 'active');
			return true;
		}

		dom.utils.removeClass(target, 'active');
		return false;
	}

	/**
	 * @override
	 * @type {PluginCommand['action']}
	 */
	action(target) {
		const lang = target?.getAttribute('data-value') || '';
		const selNode = this.$.selection.getNode();
		const currentPre = dom.query.getParentElement(selNode, (el) => /^PRE$/i.test(el.nodeName));

		if (currentPre && !lang) {
			// toggle off: convert <pre> to default line
			this.$.format.setLine(dom.utils.createElement(this.$.options.get('defaultLine')));
		} else {
			// toggle on or change language
			if (!currentPre) {
				this.$.format.setBrLine(this.#preTag.cloneNode(false));
			}

			if (lang) {
				const pre = dom.query.getParentElement(this.$.selection.getNode(), (el) => /^PRE$/i.test(el.nodeName));
				if (pre) this.#setLang(pre, lang);
			}
		}

		this.$.menu.dropdownOff();
		this.$.focusManager.focus();
		this.$.history.push(false);
	}

	/**
	 * @impl Dropdown
	 * @type {PluginDropdown['on']}
	 */
	on() {
		if (!this.#langItems) return;
		const currentLang = this.#getPreLang(this.$.selection.getNode());

		for (let i = 0, len = this.#langItems.length; i < len; i++) {
			const item = this.#langItems[i];
			dom.utils.toggleClass(item, 'active', item.getAttribute('data-value') === currentLang);
		}
	}

	/**
	 * @description Shows the hover language selector over the given pre element.
	 * @param {HTMLElement} preElement
	 */
	#showHover(preElement) {
		if (this.#hoverCurrentPre === preElement && this.#hoverController.isOpen) return;

		if (this.#hoverCurrentPre && this.#hoverCurrentPre !== preElement) {
			dom.utils.removeClass(this.#hoverCurrentPre, 'se-pre-code-focus');
		}
		this.#hoverCurrentPre = preElement;
		dom.utils.addClass(preElement, 'se-pre-code-focus');

		this.#hoverController.open(preElement, null, { passive: true, addOffset: { right: preElement.offsetWidth } });
		this.#updateHoverButtonText(this.#getPreLang(preElement));

		this.#addPreLeaveEvent();
	}

	#hideHover() {
		if (this.#hoverSelectMenu?.isOpen) return;
		this.#closeHover();
	}

	#closeHover() {
		if (this.#hoverSelectMenu?.isOpen) this.#hoverSelectMenu.close();
		dom.utils.removeClass(this.#hoverCurrentPre, 'se-pre-code-focus');
		this.#hoverController.close(true);
	}

	/** @hook Module.Controller */
	controllerClose() {
		if (this.#hoverCurrentPre) {
			dom.utils.removeClass(this.#hoverCurrentPre, 'se-pre-code-focus');
			this.#hoverCurrentPre = null;
		}
	}

	#onHoverSelect(langValue) {
		if (!this.#hoverCurrentPre) return;
		this.#setLang(this.#hoverCurrentPre, langValue);
		this.#updateHoverButtonText(langValue);
		this.#hoverSelectMenu.close();
		this.#hideHover();
		this.$.focusManager.focus();
		this.$.history.push(false);
	}

	#addPreLeaveEvent() {
		this.#mouseLeaveEvent ??= this.$.eventManager.addEvent(this.#hoverCurrentPre, 'mouseleave', this.#removeEventFunc);
	}

	#addCtrlLeaveEvent() {
		this.#mouseLeaveEvent ??= this.$.eventManager.addEvent(this.#hoverController.form, 'mouseleave', this.#removeEventFunc);
	}

	#buildHoverMenu(currentLang) {
		const noneLabel = this.$.lang.codeLanguage_none || 'None';
		const hasExtra = currentLang && !this.#langs.includes(currentLang);
		const items = hasExtra ? ['', currentLang, ...this.#langs] : ['', ...this.#langs];
		const menus = hasExtra ? [noneLabel, currentLang, ...this.#langs] : [noneLabel, ...this.#langs];
		this.#hoverSelectMenu.create(items, menus);
	}

	#updateHoverButtonText(lang) {
		this.#hoverButton.innerHTML = /* html */ `<span class="se-code-lang-icon">&lt;/&gt;</span><span class="se-code-lang-text">${lang || this.$.lang.codeLanguage || 'Language'}</span>`;
	}

	#isHoverOpen() {
		return this.#hoverSelectMenu?.isOpen || this.#hoverController?.isOpen;
	}

	/**
	 * @description Get the language from a pre element's class.
	 * @param {?Node} preOrChild - The pre element or a node inside it
	 * @returns {string}
	 */
	#getPreLang(preOrChild) {
		const pre = preOrChild?.nodeName === 'PRE' ? preOrChild : dom.query.getParentElement(preOrChild, (el) => /^PRE$/i.test(el.nodeName));
		if (!pre) return '';
		return /** @type {HTMLElement} */ (pre).className.match(/language-(\S+)/)?.[1] || '';
	}

	/**
	 * @description Set language class on a pre element.
	 * @param {HTMLElement} pre
	 * @param {string} lang
	 */
	#setLang(pre, lang) {
		pre.className = pre.className.replace(/\s*language-\S+/g, '').trim();
		if (lang) {
			dom.utils.addClass(pre, 'language-' + lang);
			pre.setAttribute('data-se-lang', lang);
		} else {
			pre.removeAttribute('data-se-lang');
		}
	}

	/**
	 * @description Cleans up resources.
	 */
	destroy() {
		if (this.#hoverCurrentPre) {
			dom.utils.removeClass(this.#hoverCurrentPre, 'se-pre-code-focus');
		}
		this.#hoverController?.form?.parentNode?.removeChild(this.#hoverController.form);
		this.#hoverCurrentPre = null;
	}
}

/**
 * @param {SunEditor.Deps} $
 * @param {string[]} langs
 * @returns {HTMLElement}
 */
function CreateDropdownHTML($, langs) {
	const noneLabel = $.lang.codeLanguage_none || 'None';
	let list = '<div class="se-list-inner"><ul class="se-list-basic">';

	list += `<li><button type="button" class="se-btn se-btn-list" data-command="codeBlock" data-value="" title="${noneLabel}">${noneLabel}</button></li>`;
	for (const lang of langs) {
		list += `<li><button type="button" class="se-btn se-btn-list" data-command="codeBlock" data-value="${lang}" title="${lang}">${lang}</button></li>`;
	}

	list += '</ul></div>';
	return dom.utils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-code-block' }, list);
}

export default CodeBlock;
