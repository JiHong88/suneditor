import { PluginModal } from '../../interfaces';
import { Modal, Controller } from '../../modules/contracts';
import { dom, env, converter } from '../../helper';

const { _w, _d } = env;

/**
 * @typedef {Object} MathPluginOptions
 * @property {boolean} [canResize=true] - Whether the math modal can be resized.
 * @property {boolean} [autoHeight=false] - Whether to automatically adjust the height of the modal.
 * @property {Array<object>} [fontSizeList] - A list of font size options for rendering math expressions.
 * @property {?(...args: *) => *} [onPaste] - A callback function to handle paste events in the math input area.
 * @property {Object} [formSize={}] - An object specifying the dimensions for the math modal.
 * @property {string} [formSize.width="460px"] - The default width of the math modal.
 * @property {string} [formSize.height="14em"] - The default height of the math modal.
 * @property {string} [formSize.maxWidth] - The maximum width of the math modal.
 * @property {string} [formSize.maxHeight] - The maximum height of the math modal.
 * @property {string} [formSize.minWidth="400px"] - The minimum width of the math modal.
 * @property {string} [formSize.minHeight="40px"] - The minimum height of the math modal.
 */

/**
 * @class
 * @description Math plugin.
 * - This plugin provides support for rendering mathematical expressions using either the KaTeX or MathJax libraries.
 * - If external library is provided, a warning is issued.
 */
class Math_ extends PluginModal {
	static key = 'math';
	static className = '';
	/**
	 * @this {Math_}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		return dom.utils.hasClass(node, 'se-math|katex') && dom.check.isComponentContainer(node) ? node : null;
	}

	#element = null;

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {MathPluginOptions} pluginOptions
	 */
	constructor(editor, pluginOptions) {
		// plugin basic properties
		super(editor);
		this.title = this.lang.math;
		this.icon = 'math';

		// external library
		this.katex = null;
		this.mathjax = null;

		// exception
		if (!(this.katex = this.#CheckKatex(editor)) && !(this.mathjax = this.#CheckMathJax(editor))) {
			console.warn(
				'[SUNEDITOR.plugins.math.warn] The math plugin must need either "KaTeX" or "MathJax" library. Please add the katex or mathjax option. See: https://github.com/ARA-developer/suneditor/blob/develop/guide/external-libraries.md',
			);
		}

		this.pluginOptions = {
			formSize: {
				width: '460px',
				height: '14em',
				maxWidth: '',
				maxHeight: '',
				minWidth: '400px',
				minHeight: '40px',
				...pluginOptions.formSize,
			},
			canResize: pluginOptions.canResize ?? true,
			autoHeight: !!pluginOptions.autoHeight,
			fontSizeList: pluginOptions.fontSizeList || [
				{
					text: '1',
					value: '1em',
				},
				{
					text: '1.5',
					value: '1.5em',
				},
				{
					text: '2',
					value: '2em',
				},
				{
					text: '2.5',
					value: '2.5em',
				},
			],
			onPaste: typeof pluginOptions.onPaste === 'function' ? pluginOptions.onPaste : null,
		};
		if (this.pluginOptions.autoHeight) {
			this.pluginOptions.formSize.height = this.pluginOptions.formSize.minHeight;
		}

		// create HTML
		this.defaultFontSize = null;
		const modalEl = CreateHTML_modal(this);
		const controllerEl = CreateHTML_controller(editor);

		// modules
		this.modal = new Modal(this, modalEl);
		this.controller = new Controller(this, controllerEl, { position: 'bottom', disabled: true });

		// members
		/** @type {HTMLTextAreaElement} */
		this.textArea = modalEl.querySelector('.se-math-exp');
		/** @type {HTMLPreElement} */
		this.previewElement = modalEl.querySelector('.se-math-preview');
		/** @type {HTMLSelectElement} */
		this.fontSizeElement = modalEl.querySelector('.se-math-size');

		this.isUpdateState = false;

		// init
		this.previewElement.style.fontSize = this.defaultFontSize;
		this.eventManager.addEvent(this.textArea, 'input', this.#RenderMathExp.bind(this));
		this.eventManager.addEvent(
			this.fontSizeElement,
			'change',
			function (e) {
				this.fontSize = e.target.value;
			}.bind(this.previewElement.style),
		);
		if (this.pluginOptions.onPaste) {
			this.eventManager.addEvent(this.textArea, 'paste', this.pluginOptions.onPaste.bind(this));
		}
	}

	/**
	 * @override
	 * @type {PluginModal['open']}
	 */
	open() {
		this.modal.open();
	}

	/**
	 * @hook Editor.Core
	 * @type {SunEditor.Hook.Core.RetainFormat}
	 */
	retainFormat() {
		return {
			query: '.se-math, .katex, .MathJax',
			method: (element) => {
				if (!this.katex && !this.mathjax) return;

				const value = getValue(element);
				if (!value) return;

				const domParser = _d.createRange().createContextualFragment(this.#renderer(converter.entityToHTML(this.#escapeBackslashes(value, true))));
				element.innerHTML = domParser.querySelector('.se-math, .katex').innerHTML;
				element.setAttribute('contenteditable', 'false');
				dom.utils.addClass(element, 'se-component|se-inline-component|se-disable-pointer|se-math');

				if (this.katex) {
					dom.utils.addClass(element, 'katex');
				} else {
					dom.utils.removeClass(element, 'katex');
				}

				if (this.mathjax) {
					this.#renderMathJax(this.mathjax);
				}
			},
		};
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.On}
	 */
	modalOn(isUpdate) {
		this.isUpdateState = isUpdate;
		if (!isUpdate) {
			this.modalInit();
		} else if (this.controller.currentTarget) {
			const currentTarget = this.controller.currentTarget;
			const exp = converter.entityToHTML(this.#escapeBackslashes(getValue(currentTarget), true));
			const fontSize = getType(currentTarget) || '1em';
			this.textArea.value = exp;
			this.fontSizeElement.value = fontSize;
			this.previewElement.innerHTML = this.#renderer(exp);
			this.previewElement.style.fontSize = fontSize;
		}
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Action}
	 */
	async modalAction() {
		if (this.textArea.value.trim().length === 0 || dom.utils.hasClass(this.textArea, 'se-error')) {
			this.textArea.focus();
			return false;
		}

		const mathExp = this.textArea.value;

		/** @type {HTMLSpanElement} */
		const mathEl = this.previewElement.querySelector('.se-math, .katex');

		if (!mathEl) return false;
		dom.utils.addClass(mathEl, 'se-component|se-inline-component|se-disable-pointer|se-math');
		mathEl.setAttribute('contenteditable', 'false');
		mathEl.setAttribute('data-se-value', converter.htmlToEntity(this.#escapeBackslashes(mathExp, false)));
		mathEl.setAttribute('data-se-type', this.fontSizeElement.value);
		mathEl.style.fontSize = this.fontSizeElement.value;

		if (this.katex) {
			dom.utils.addClass(mathEl, 'katex');
			dom.utils.removeClass(mathEl, 'MathJax');
		} else {
			dom.utils.removeClass(mathEl, 'katex');
		}

		if (!this.isUpdateState) {
			const selectedFormats = this.format.getLines();

			if (selectedFormats.length > 1) {
				const oFormat = dom.utils.createElement(selectedFormats[0].nodeName, null, mathEl);
				this.component.insert(oFormat, { insertBehavior: 'none', scrollTo: false });
			} else {
				this.component.insert(mathEl, { insertBehavior: 'none', scrollTo: false });
			}
		} else {
			const containerEl = dom.query.getParentElement(this.controller.currentTarget, '.se-component');
			containerEl.replaceWith(mathEl);
			const compInfo = this.component.get(mathEl);
			this.component.select(compInfo.target, compInfo.pluginName);
			return true;
		}

		if (this.mathjax) {
			this.#renderMathJax(this.mathjax);
		}

		const r = this.selection.getNearRange(mathEl);
		if (r) {
			this.selection.setRange(r.container, r.offset, r.container, r.offset);
		} else {
			this.component.select(mathEl, Math_.key);
		}

		return true;
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Init}
	 */
	modalInit() {
		this.textArea.value = '';
		this.previewElement.innerHTML = '';
		dom.utils.removeClass(this.textArea, 'se-error');
	}

	/**
	 * @hook Modules.Controller
	 * @type {SunEditor.Hook.Controller.Action}
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		switch (command) {
			case 'update':
				this.modal.open();
				break;
			case 'copy':
				this.#copyTextToClipboard(this.#element);
				break;
			case 'delete':
				this.componentDestroy(this.controller.currentTarget);
		}
	}

	/**
	 * @hook Modules.Controller
	 * @type {SunEditor.Hook.Controller.Close}
	 */
	controllerClose() {
		this.#element = null;
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Select}
	 */
	componentSelect(target) {
		if (dom.utils.hasClass(target, 'se-math|katex') && getValue(target)) {
			this.#element = target;
			this.controller.open(target, null, { isWWTarget: false, initMethod: null, addOffset: null });
			return;
		}
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Destroy}
	 */
	async componentDestroy(target) {
		dom.utils.removeItem(target);
		this.controller.close();
		this.editor.focus();
		this.history.push(false);
	}

	/**
	 * @description Renders the given math expression using KaTeX or MathJax.
	 * @param {string} exp - The math expression to render.
	 * @returns {string} - The rendered math expression as HTML.
	 */
	#renderer(exp) {
		let result = '';
		try {
			dom.utils.removeClass(this.textArea, 'se-error');
			if (this.katex) {
				result = this.katex.src.renderToString(exp, { throwOnError: true, displayMode: true });
			} else if (this.mathjax) {
				result = this.mathjax.convert(exp).outerHTML;
				if (/<mjx-merror/.test(result)) {
					dom.utils.addClass(this.textArea, 'se-error');
					result = `<span class="se-math-error">${result}</span>`;
				} else {
					result = `<span class="se-math">${result}</span>`;
				}
			}
		} catch (error) {
			dom.utils.addClass(this.textArea, 'se-error');
			result = `<span class="se-math-error">Math syntax error. (Refer ${this.katex ? `<a href="${env.KATEX_WEBSITE}" target="_blank">KaTeX</a>` : `<a href="${env.MATHJAX_WEBSITE}" target="_blank">MathJax</a>`})</span>`;
			console.warn('[SUNEDITOR.math.error] ', error.message);
		}
		return result;
	}

	/**
	 * @description Escapes or unescapes backslashes in a given string.
	 * @param {string} str - The input string.
	 * @param {boolean} decode - If true, decodes escaped backslashes; otherwise, encodes them.
	 * @returns {string} - The processed string.
	 */
	#escapeBackslashes(str, decode) {
		return str.replace(/\\{2}/g, decode ? '\\' : '\\\\');
	}

	/**
	 * @description Copies the math expression text to clipboard.
	 * @param {Node} element - The math expression element.
	 * @returns {Promise<void>}
	 */
	async #copyTextToClipboard(element) {
		if (!navigator.clipboard || !element) return;

		try {
			const text = getValue(element);
			await this.html.copy(text);
			dom.utils.addClass(element, 'se-copy');
			// copy effect
			_w.setTimeout(() => {
				dom.utils.removeClass(element, 'se-copy');
			}, 120);
		} catch (err) {
			console.error('[SUNEDITOR.math.copy.fail]', err);
		}
	}

	/**
	 * @description Handles rendering of math expressions in the preview.
	 * @param {InputEvent} e - The input event.
	 */
	#RenderMathExp(e) {
		/** @type {HTMLInputElement} */
		const eventTarget = dom.query.getEventTarget(e);
		if (this.pluginOptions.autoHeight) {
			eventTarget.style.height = '5px';
			eventTarget.style.height = eventTarget.scrollHeight + 5 + 'px';
		}

		this.previewElement.innerHTML = this.#renderer(eventTarget.value);
		if (this.mathjax) this.#renderMathJax(this.mathjax);
	}

	/**
	 * @param {*} mathjax - The MathJax instance.
	 */
	#renderMathJax(mathjax) {
		mathjax.clear();
		mathjax.updateDocument();
	}

	/**
	 * @param {SunEditor.Core} editor - The root editor instance.
	 * @returns {*} - The KaTeX instance or null if the instance is invalid.
	 */
	#CheckKatex(editor) {
		const katex = editor.options.get('externalLibs').katex;
		if (!katex) return null;
		if (!katex.src) {
			console.warn('[SUNEDITOR.math.katex.fail] The katex option is set incorrectly.');
			return null;
		}

		const katexOptions = [
			{
				throwOnError: false,
			},
			katex.options || {},
		].reduce((init, option) => {
			for (const key in option) {
				init[key] = option[key];
			}
			return init;
		}, {});

		katex.options = katexOptions;
		return katex;
	}

	/**
	 * @param {SunEditor.Core} editor - The root editor instance.
	 * @returns {*}
	 */
	#CheckMathJax(editor) {
		const mathjax = editor.options.get('externalLibs').mathjax;
		if (!mathjax) return null;
		if (editor.frameOptions.get('iframe')) {
			console.warn('[SUNEDITOR.math.mathjax.fail] The MathJax option is not supported in the iframe.');
		}

		try {
			const adaptor = mathjax.browserAdaptor();
			mathjax.RegisterHTMLHandler(adaptor);

			const tex = new mathjax.TeX();
			const chtml = new mathjax.CHTML();

			return mathjax.src.document(document, {
				InputJax: tex,
				OutputJax: chtml,
			});
		} catch (error) {
			console.warn('[SUNEDITOR.math.mathjax.fail] The MathJax option is set incorrectly.', error);
			return null;
		}
	}
}

function CreateHTML_modal(inst) {
	const { lang, icons, pluginOptions, katex } = inst;
	const { formSize, fontSizeList, canResize, autoHeight } = pluginOptions;
	const { width, height, maxWidth, maxHeight, minWidth, minHeight } = formSize;
	const resizeType = !canResize ? 'none' : autoHeight ? 'horizontal' : 'auto';

	let defaultFontSize = fontSizeList[0].value;
	let html = /*html*/ `
    <form>
        <div class="se-modal-header">
            <button type="button" data-command="close" class="se-btn se-close-btn" title="${lang.close}" aria-label="${lang.close}">
                ${icons.cancel}
            </button>
            <span class="se-modal-title">${lang.math_modal_title}</span>
        </div>
        <div class="se-modal-body">
            <div class="se-modal-form">
                <label>${lang.math_modal_inputLabel} ${katex ? `(<a href="${env.KATEX_WEBSITE}" target="_blank">KaTeX</a>)` : `(<a href="${env.MATHJAX_WEBSITE}" target="_blank">MathJax</a>)`}</label>
                <textarea class="se-input-form se-math-exp se-modal-resize-form" type="text" data-focus style="width: ${width}; height: ${height}; min-width: ${minWidth}; min-height: ${minHeight}; resize: ${resizeType};"></textarea>
            </div>
            <div class="se-modal-form">
                <label>${lang.math_modal_fontSizeLabel}</label>
                <select class="se-input-select se-math-size">`;

	for (let i = 0, len = fontSizeList.length, f; i < len; i++) {
		f = fontSizeList[i];
		if (f.default) defaultFontSize = f.value;
		html += /*html*/ `<option value="${f.value}"${f.default ? ' selected' : ''}>${f.text}</option>`;
	}

	html += /*html*/ `</select>
            </div>
            <div class="se-modal-form">
                <label>${lang.math_modal_previewLabel}</label>
                <p class="se-math-preview"></p>
            </div>
        </div>
        <div class="se-modal-footer">
            <button type="submit" class="se-btn-primary" title="${lang.submitButton}" aria-label="${lang.submitButton}">
                <span>${lang.submitButton}</span>
            </button>
        </div>
    </form>`;

	inst.defaultFontSize = defaultFontSize;
	return dom.utils.createElement('DIV', { class: 'se-modal-content se-modal-responsive', style: `max-width: ${maxWidth}; max-height: ${maxHeight};` }, html);
}

function CreateHTML_controller({ lang, icons }) {
	const html = /*html*/ `
    <div class="se-arrow se-arrow-up"></div>
    <div class="link-content">
        <div class="se-btn-group">
            <button type="button" data-command="update" tabindex="-1" class="se-btn se-tooltip">
                ${icons.edit}
                <span class="se-tooltip-inner">
                    <span class="se-tooltip-text">${lang.edit}</span>
                </span>
            </button>
            <button type="button" data-command="copy" tabindex="-1" class="se-btn se-tooltip">
                ${icons.copy}
                <span class="se-tooltip-inner">
                    <span class="se-tooltip-text">${lang.copy}</span>
                </span>
            </button>
            <button type="button" data-command="delete" tabindex="-1" class="se-btn se-tooltip">
                ${icons.delete}
                <span class="se-tooltip-inner">
                    <span class="se-tooltip-text">${lang.remove}</span>
                </span>
            </button>
        </div>
    </div>`;

	return dom.utils.createElement('DIV', { class: 'se-controller se-controller-link' }, html);
}

function getValue(element) {
	const seAttr = element.getAttribute('data-se-value');
	if (seAttr) return seAttr;

	// v2-migration
	const v2SeAttr = element.getAttribute(`data-exp`);
	if (!v2SeAttr) return null;
	element.removeAttribute(`data-exp`);
	element.setAttribute(`data-se-value`, v2SeAttr);
	return v2SeAttr;
}

function getType(element) {
	const seAttr = element.getAttribute('data-se-type');
	if (seAttr) return seAttr;

	// v2-migration
	const v2SeAttr = element.getAttribute(`data-exp`);
	if (!v2SeAttr) return null;
	element.removeAttribute(`data-font-size`);
	element.setAttribute(`data-se-type`, v2SeAttr);
	return v2SeAttr;
}

export default Math_;
