import { converter, dom } from '../../helper';
import { Controller } from '../../modules/contract';
import { SelectMenu } from '../../modules/ui';

/**
 * @description Manages code language selection UI for `<pre>` blocks.
 * - Shows a language selector button on hover over `<pre>` elements.
 * - Handles input/output conversion between editor format and standard HTML.
 */
class CodeLang {
	#$;

	#button;
	#selectMenu;
	#langs;
	#currentPre;

	#removeEventFunc;
	#mouseLeaveEvent;

	/**
	 * @constructor
	 * @param {SunEditor.Deps} $ Deps bag
	 * @param {Array<string>} langs Language list from options
	 */
	constructor($, langs) {
		this.#$ = $;
		this.#langs = langs;

		// container
		const containerEl = dom.utils.createElement('DIV', { class: 'se-controller se-code-lang' });
		this.#button = dom.utils.createElement('DIV', { class: 'se-code-lang-button' });
		this.#updateButtonText('');

		// code lang selector - remove event
		this.#removeEventFunc = converter.debounce((e) => {
			this.#mouseLeaveEvent = this.#$.eventManager.removeEvent(this.#mouseLeaveEvent);

			if (e && containerEl.contains(e.relatedTarget)) {
				this.#addCtrlLeaveEvent();
			} else {
				this.hide();
			}
		}, 150);

		// controller
		containerEl.appendChild(this.#button);
		this.controller = new Controller(this, $, containerEl, { position: 'top', isWWTarget: true });

		// selectMenu
		this.#selectMenu = new SelectMenu($, {
			position: 'bottom-right',
			dir: $.options.get('_rtl') ? 'rtl' : 'ltr',
			maxHeight: '214px',
			minWidth: '132px',
			closeMethod: this.#removeEventFunc,
		});
		this.#selectMenu.on(this.#button, this.#onSelect.bind(this));
		this.#buildMenu('');

		// button click → toggle selectMenu
		$.eventManager.addEvent(this.#button, 'click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			if (this.#selectMenu.isOpen) {
				this.#selectMenu.close();
			} else {
				const currentLang = this.#getCurrentLang();
				this.#buildMenu(currentLang);
				const items = this.#selectMenu.items;
				const idx = currentLang ? items.indexOf(currentLang) : 0;
				this.#selectMenu.open(null, idx >= 0 ? `[data-index="${idx}"]` : null);
			}
		});
	}

	/**
	 * @description Shows the language selector over the given pre element.
	 * @param {HTMLElement} preElement The `<pre>` element
	 */
	show(preElement) {
		if (this.#currentPre === preElement && this.controller.isOpen) return;

		if (this.#currentPre && this.#currentPre !== preElement) {
			dom.utils.removeClass(this.#currentPre, 'se-pre-code-focus');
		}
		this.#currentPre = preElement;
		dom.utils.addClass(preElement, 'se-pre-code-focus');

		this.controller.open(preElement, null, { addOffset: { right: preElement.offsetWidth, top: 1 } });
		this.#updateButtonText(this.#getCurrentLang());

		this.#addPreLeaveEvent();
	}

	/**
	 * @description Hides the language selector.
	 */
	hide() {
		if (this.#selectMenu.isOpen) return;
		this.close();
	}

	/**
	 * @description Force close the language selector and selectMenu.
	 */
	close() {
		if (this.#selectMenu.isOpen) this.#selectMenu.close();
		dom.utils.removeClass(this.#currentPre, 'se-pre-code-focus');
		this.controller.close(true);
	}

	/**
	 * @description Whether the selector UI is currently visible (button or menu open).
	 * @returns {boolean}
	 */
	isOpen() {
		return this.#selectMenu.isOpen || this.controller.isOpen;
	}

	/**
	 * @hook Module.Controller
	 * @description Called when the controller is closed.
	 */
	controllerClose() {
		if (this.#currentPre) {
			dom.utils.removeClass(this.#currentPre, 'se-pre-code-focus');
			this.#currentPre = null;
		}
	}

	/**
	 * @description Gets the current language from the pre element's class.
	 * @returns {string} Language string or empty string
	 */
	#getCurrentLang() {
		if (!this.#currentPre) return '';
		const match = this.#currentPre.className.match(/language-(\S+)/);
		return match ? match[1] : '';
	}

	/**
	 * @description Rebuilds the menu items list. If the current language is not in the default list, it is inserted after 'None'.
	 * @param {string} currentLang Current language
	 */
	#buildMenu(currentLang) {
		const noneLabel = this.#$.lang.codeLanguage_none || 'None';
		const hasExtra = currentLang && !this.#langs.includes(currentLang);
		const items = hasExtra ? ['', currentLang, ...this.#langs] : ['', ...this.#langs];
		const menus = hasExtra ? [noneLabel, currentLang, ...this.#langs] : [noneLabel, ...this.#langs];
		this.#selectMenu.create(items, menus);
	}

	/**
	 * @param {string} lang Language string
	 */
	#updateButtonText(lang) {
		this.#button.innerHTML = '<span class="se-code-lang-icon">&lt;/&gt;</span><span class="se-code-lang-text">' + (lang || this.#$.lang.codeLanguage || 'Language') + '</span>';
	}

	/**
	 * @description Handles language selection from the SelectMenu.
	 * @param {string} langValue Selected language value
	 */
	#onSelect(langValue) {
		if (!this.#currentPre) return;

		const pre = this.#currentPre;

		// remove existing language- class
		pre.className = pre.className.replace(/\s*language-\S+/g, '').trim();

		if (langValue) {
			dom.utils.addClass(pre, 'language-' + langValue);
			pre.setAttribute('data-se-lang', langValue);
		} else {
			pre.removeAttribute('data-se-lang');
		}

		this.#updateButtonText(langValue);

		this.#selectMenu.close();
		this.hide();
		this.#$.focusManager.focus();
		this.#$.history.push(false);
	}

	#addPreLeaveEvent() {
		this.#mouseLeaveEvent ??= this.#$.eventManager.addEvent(this.#currentPre, 'mouseleave', this.#removeEventFunc);
	}

	#addCtrlLeaveEvent() {
		this.#mouseLeaveEvent ??= this.#$.eventManager.addEvent(this.controller.form, 'mouseleave', this.#removeEventFunc);
	}

	/**
	 * @description Input conversion: `<pre><code class="language-xxx">...</code></pre>` → `<pre class="language-xxx" data-se-lang="xxx">...`
	 * @param {HTMLElement} preElement The `<pre>` element to unwrap
	 */
	static unwrapCode(preElement) {
		const firstChild = preElement.firstElementChild;
		if (preElement.children.length !== 1 || !firstChild || firstChild.nodeName !== 'CODE') return;

		const codeEl = firstChild;
		const langMatch = (codeEl.className || '').match(/language-(\S+)/);

		if (langMatch) {
			dom.utils.addClass(preElement, 'language-' + langMatch[1]);
			preElement.setAttribute('data-se-lang', langMatch[1]);
		}

		// unwrap code contents into pre
		while (codeEl.firstChild) {
			preElement.insertBefore(codeEl.firstChild, codeEl);
		}
		preElement.removeChild(codeEl);
	}

	/**
	 * @description Output conversion: `<pre class="language-xxx" data-se-lang="xxx">...` → `<pre><code class="language-xxx">...</code></pre>`
	 * @param {Element} preElement The `<pre>` element to wrap
	 */
	static wrapCode(preElement) {
		const langMatch = (preElement.className || '').match(/language-(\S+)/);
		if (!langMatch) return;

		const lang = langMatch[1];
		const codeEl = document.createElement('CODE');
		codeEl.className = 'language-' + lang;

		// move pre contents into code
		while (preElement.firstChild) {
			codeEl.appendChild(preElement.firstChild);
		}
		preElement.appendChild(codeEl);

		// clean up pre
		preElement.className = preElement.className.replace(/\s*language-\S+/g, '').trim();
		preElement.removeAttribute('data-se-lang');
	}

	/**
	 * @description Cleans up resources.
	 */
	destroy() {
		if (this.#currentPre) {
			dom.utils.removeClass(this.#currentPre, 'se-pre-code-focus');
		}
		this.controller.form?.parentNode?.removeChild(this.controller.form);
		this.#currentPre = null;
	}
}

export default CodeLang;
