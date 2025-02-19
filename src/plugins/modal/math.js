import EditorInjector from '../../editorInjector';
import { Modal, Controller } from '../../modules';
import { domUtils, env, converter } from '../../helper';

const { _w } = env;

/**
 * @typedef {Object} MathPluginOptions
 * @property {boolean=} [canResize=true] - Whether the math modal can be resized.
 * @property {boolean=} [autoHeight=false] - Whether to automatically adjust the height of the modal.
 * @property {Array<object>=} [fontSizeList] - A list of font size options for rendering math expressions.
 * @property {function=} [onPaste] - A callback function to handle paste events in the math input area.
 * @property {Object} [formSize={}] - An object specifying the dimensions for the math modal.
 * @property {string=} [formSize.width="460px"] - The default width of the math modal.
 * @property {string=} [formSize.height="14em"] - The default height of the math modal.
 * @property {string=} [formSize.maxWidth] - The maximum width of the math modal.
 * @property {string=} [formSize.maxHeight] - The maximum height of the math modal.
 * @property {string=} [formSize.minWidth="400px"] - The minimum width of the math modal.
 * @property {string=} [formSize.minHeight="40px"] - The minimum height of the math modal.
 */

/**
 * @class
 * @description Math plugin.
 * - This plugin provides support for rendering mathematical expressions using either the KaTeX or MathJax libraries.
 * - If external library is provided, a warning is issued.
 * @param {EditorCore} editor - The root editor instance
 * @param {MathPluginOptions} pluginOptions
 */
function Math_(editor, pluginOptions) {
	// external library
	this.katex = null;
	this.mathjax = null;

	// exception
	if (!(this.katex = CheckKatex(editor.options.get('externalLibs').katex)) && !(this.mathjax = CheckMathJax(editor.options.get('externalLibs').mathjax, editor))) {
		console.warn('[SUNEDITOR.plugins.math.warn] The math plugin must need either "KaTeX" or "MathJax" library. Please add the katex or mathjax option.');
	}

	// plugin basic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.math;
	this.icon = 'math';

	this.pluginOptions = {
		formSize: {
			width: '460px',
			height: '14em',
			maxWidth: '',
			maxHeight: '',
			minWidth: '400px',
			minHeight: '40px',
			...pluginOptions.formSize
		},
		canResize: pluginOptions.canResize ?? true,
		autoHeight: !!pluginOptions.autoHeight,
		fontSizeList: pluginOptions.fontSizeList || [
			{
				text: '1',
				value: '1em'
			},
			{
				text: '1.5',
				value: '1.5em'
			},
			{
				text: '2',
				value: '2em'
			},
			{
				text: '2.5',
				value: '2.5em'
			}
		],
		onPaste: typeof pluginOptions.onPaste === 'function' ? pluginOptions.onPaste : null
	};
	if (this.pluginOptions.autoHeight) {
		this.pluginOptions.formSize.height = this.pluginOptions.formSize.minHeight;
	}

	// create HTML
	const modalEl = CreateHTML_modal(this);
	const controllerEl = CreateHTML_controller(editor);

	// modules
	this.modal = new Modal(this, modalEl);
	this.controller = new Controller(this, controllerEl, { position: 'bottom', disabled: true });

	// members
	this.textArea = modalEl.querySelector('.se-math-exp');
	this.previewElement = modalEl.querySelector('.se-math-preview');
	this.fontSizeElement = modalEl.querySelector('.se-math-size');
	this.isUpdateState = false;
	this._element = null;

	// init
	this.previewElement.style.fontSize = this.defaultFontSize;
	this.eventManager.addEvent(this.textArea, 'input', RenderMathExp.bind(this));
	this.eventManager.addEvent(
		this.fontSizeElement,
		'change',
		function (e) {
			this.fontSize = e.target.value;
		}.bind(this.previewElement.style)
	);
	if (this.pluginOptions.onPaste) {
		this.eventManager.addEvent(this.textArea, 'paste', this.pluginOptions.onPaste.bind(this));
	}
}

Math_.key = 'math';
Math_.type = 'modal';
Math_.className = '';
Math_.component = function (node) {
	return domUtils.hasClass(node, 'se-math|katex') && domUtils.hasClass(node, 'se-component') ? node : null;
};
Math_.prototype = {
	/**
	 * @editorMethod Modules.Component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {Element} target Target component element
	 */
	select(target) {
		if (domUtils.hasClass(target, 'se-math|katex') && getValue(target)) {
			this._element = target;
			this.controller.open(target, null, { isWWTarget: false, initMethod: null, addOffset: null });
			return;
		}
	},

	/**
	 * @editorMethod Modules.Controller
	 * @description This function is called before the "controller" before it is closed.
	 */
	close() {
		this._element = null;
	},

	/**
	 * @editorMethod Editor.core
	 * @description This method is used to validate and preserve the format of the component within the editor.
	 * - It ensures that the structure and attributes of the element are maintained and secure.
	 * - The method checks if the element is already wrapped in a valid container and updates its attributes if necessary.
	 * - If the element isn't properly contained, a new container is created to retain the format.
	 * @returns {Object} The format retention object containing the query and method to process the element.
	 * @returns {string} query - The selector query to identify the relevant elements (in this case, 'audio').
	 * @returns {(element: Element) => void} method - The function to execute on the element to validate and preserve its format.
	 * - The function takes the element as an argument, checks if it is contained correctly, and applies necessary adjustments.
	 */
	retainFormat() {
		return {
			query: '.se-math, .katex, .MathJax',
			method: (element) => {
				if (!this.katex && !this.mathjax) return;

				const value = getValue(element);
				if (!value) return;

				const dom = this._d.createRange().createContextualFragment(this._renderer(converter.entityToHTML(this._escapeBackslashes(value, true))));
				element.innerHTML = dom.querySelector('.se-math, .katex').innerHTML;
				element.setAttribute('contenteditable', false);
				domUtils.addClass(element, 'se-component|se-inline-component|se-disable-pointer|se-math');

				if (this.katex) {
					domUtils.addClass(element, 'katex');
				} else {
					domUtils.removeClass(element, 'katex');
				}

				if (this.mathjax) {
					renderMathJax(this.mathjax);
					this._applyMathJaxStyleOnIframe();
				}
			}
		};
	},

	/**
	 * @editorMethod Modules.Modal
	 * @description Executes the method that is called when a "Modal" module's is opened.
	 */
	open() {
		this.modal.open();
	},

	/**
	 * @editorMethod Modules.Modal
	 * @description Executes the method that is called when a plugin's modal is opened.
	 * @param {boolean} isUpdate "Indicates whether the modal is for editing an existing component (true) or registering a new one (false)."
	 */
	on(isUpdate) {
		this.isUpdateState = isUpdate;
		if (!isUpdate) {
			this.init();
		} else if (this.controller.currentTarget) {
			const currentTarget = this.controller.currentTarget;
			const exp = converter.entityToHTML(this._escapeBackslashes(getValue(currentTarget), true));
			const fontSize = getType(currentTarget) || '1em';
			this.textArea.value = exp;
			this.fontSizeElement.value = fontSize;
			this.previewElement.innerHTML = this._renderer(exp);
			this.previewElement.style.fontSize = fontSize;
		}
	},

	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called when a form within a modal window is "submit".
	 * @returns {boolean} Success or failure
	 */
	modalAction() {
		if (this.textArea.value.trim().length === 0 || domUtils.hasClass(this.textArea, 'se-error')) {
			this.textArea.focus();
			return false;
		}

		const mathExp = this.textArea.value;
		const mathEl = this.previewElement.querySelector('.se-math, .katex');

		if (!mathEl) return false;
		domUtils.addClass(mathEl, 'se-component|se-inline-component|se-disable-pointer|se-math');
		mathEl.setAttribute('contenteditable', false);
		mathEl.setAttribute('data-se-value', converter.htmlToEntity(this._escapeBackslashes(mathExp, false)));
		mathEl.setAttribute('data-se-type', this.fontSizeElement.value);
		mathEl.style.fontSize = this.fontSizeElement.value;

		if (this.katex) {
			domUtils.addClass(mathEl, 'katex');
			domUtils.removeClass(mathEl, 'MathJax');
		} else {
			domUtils.removeClass(mathEl, 'katex');
		}

		if (!this.isUpdateState) {
			const selectedFormats = this.format.getLines();

			if (selectedFormats.length > 1) {
				const oFormat = domUtils.createElement(selectedFormats[0].nodeName, null, mathEl);
				this.component.insert(oFormat, { skipCharCount: false, skipSelection: true, skipHistory: false });
			} else {
				this.component.insert(mathEl, { skipCharCount: false, skipSelection: true, skipHistory: false });
			}
		} else {
			const containerEl = domUtils.getParentElement(this.controller.currentTarget, '.se-component');
			containerEl.parentNode.replaceChild(mathEl, containerEl);
			const compInfo = this.component.get(mathEl);
			this.component.select(compInfo.target, compInfo.pluginName, false);
			return true;
		}

		if (this.mathjax) {
			renderMathJax(this.mathjax);
			this._applyMathJaxStyleOnIframe();
		}

		const r = this.selection.getNearRange(mathEl);
		if (r) {
			this.selection.setRange(r.container, r.offset, r.container, r.offset);
		} else {
			this.component.select(mathEl, Math_.key, false);
		}

		return true;
	},

	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called before the modal window is opened, but before it is closed.
	 */
	init() {
		this.textArea.value = '';
		this.previewElement.innerHTML = '';
		domUtils.removeClass(this.textArea, 'se-error');
	},

	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method that is called when a button is clicked in the "controller".
	 * @param {Element} target Target button element
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		switch (command) {
			case 'update':
				this.modal.open();
				break;
			case 'copy':
				copyTextToClipboard(this._element);
				break;
			case 'delete':
				this.destroy(this.controller.currentTarget);
		}
	},

	/**
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {Element} target Target element
	 */
	destroy(element) {
		domUtils.removeItem(element);
		this.controller.close();
		this.editor.focus();
		this.history.push(false);
	},

	/**
	 * @private
	 * @description Renders the given math expression using KaTeX or MathJax.
	 * @param {string} exp - The math expression to render.
	 * @returns {string} - The rendered math expression as HTML.
	 */
	_renderer(exp) {
		let result = '';
		try {
			domUtils.removeClass(this.textArea, 'se-error');
			if (this.katex) {
				result = this.katex.src.renderToString(exp, { throwOnError: true, displayMode: true });
			} else if (this.mathjax) {
				result = this.mathjax.convert(exp).outerHTML;
				if (/<mjx-merror/.test(result)) {
					domUtils.addClass(this.textArea, 'se-error');
					result = `<span class="se-math-error">${result}</span>`;
				} else {
					result = `<span class="se-math">${result}</span>`;
				}
			}
		} catch (error) {
			domUtils.addClass(this.textArea, 'se-error');
			result = `<span class="se-math-error">Math syntax error. (Refer ${this.katex ? `<a href="${env.KATEX_WEBSITE}" target="_blank">KaTeX</a>` : `<a href="${env.MATHJAX_WEBSITE}" target="_blank">MathJax</a>`})</span>`;
			console.warn('[SUNEDITOR.math.error] ', error.message);
		}
		return result;
	},

	/**
	 * @private
	 * @description Escapes or unescapes backslashes in a given string.
	 * @param {string} str - The input string.
	 * @param {boolean} decode - If true, decodes escaped backslashes; otherwise, encodes them.
	 * @returns {string} - The processed string.
	 */
	_escapeBackslashes(str, decode) {
		return str.replace(/\\{2}/g, decode ? '\\' : '\\\\');
	},

	constructor: Math_
};

/**
 * @description Copies the math expression text to clipboard.
 * @param {Element} element - The math expression element.
 * @returns {Promise<void>}
 */
async function copyTextToClipboard(element) {
	if (!navigator.clipboard || !element) return;

	try {
		const text = getValue(element);
		await navigator.clipboard.writeText(text);
		domUtils.addClass(element, 'se-copy');
		// copy effect
		_w.setTimeout(() => {
			domUtils.removeClass(element, 'se-copy');
		}, 120);
	} catch (err) {
		console.error('[SUNEDITOR.math.copy.fail]', err);
	}
}

/**
 * @description Handles rendering of math expressions in the preview.
 * @param {Event} event - The input event.
 */
function RenderMathExp({ target }) {
	if (this.pluginOptions.autoHeight) {
		target.style.height = '5px';
		target.style.height = target.scrollHeight + 5 + 'px';
	}

	this.previewElement.innerHTML = this._renderer(target.value);
	if (this.mathjax) renderMathJax(this.mathjax);
}

function renderMathJax(mathjax) {
	mathjax.clear();
	mathjax.updateDocument();
}

function CheckKatex(katex) {
	if (!katex) return null;
	if (!katex.src) {
		console.warn('[SUNEDITOR.math.katex.fail] The katex option is set incorrectly.');
		return null;
	}

	const katexOptions = [
		{
			throwOnError: false
		},
		katex.options || {}
	].reduce((init, option) => {
		for (const key in option) {
			init[key] = option[key];
		}
		return init;
	}, {});

	katex.options = katexOptions;
	return katex;
}

function CheckMathJax(mathjax, editor) {
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
			OutputJax: chtml
		});
	} catch (error) {
		console.warn('[SUNEDITOR.math.mathjax.fail] The MathJax option is set incorrectly.');
		return null;
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
	return domUtils.createElement('DIV', { class: 'se-modal-content se-modal-responsive', style: `max-width: ${maxWidth}; max-height: ${maxHeight};` }, html);
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

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-link' }, html);
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
