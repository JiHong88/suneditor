import EditorInjector from '../../editorInjector';
import { Modal, Controller } from '../../modules';
import { domUtils, env, converter, unicode } from '../../helper';

const Math_ = function (editor, pluginOptions) {
	// exception
	if (!(this.katex = CheckKatex(pluginOptions.katex))) {
		console.warn('[SUNEDITOR.plugins.math.warn] The math plugin must need the "KaTeX" library, Please add the katex option.');
	}

	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.math;
	this.icon = 'math';

	// create HTML
	const modalEl = CreateHTML_modal(editor, this, pluginOptions.fontSizeList);
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
};

Math_.key = 'math';
Math_.type = 'modal';
Math_.className = '';
Math_.prototype = {
	/**
	 * @override core
	 */
	active(element) {
		if (element?.getAttribute('data-se-value')) {
			this._element = element;
			this.controller.open(element, null, null, null);
			domUtils.addClass(element, 'se-focus');
			return true;
		}

		return false;
	},

	/**
	 * @override controller
	 */
	close() {
		domUtils.removeClass(this._element, 'se-focus');
		this._element = null;
	},

	/**
	 * @override core
	 */
	maintainPattern() {
		return {
			query: '.katex',
			method: (element) => {
				if (!element.getAttribute('data-se-value') || !this.katex) return;
				const dom = this._d.createRange().createContextualFragment(this._renderer(converter.entityToHTML(element.getAttribute('data-se-value'))));
				element.innerHTML = dom.querySelector('.katex').innerHTML;
				element.setAttribute('contenteditable', false);
			}
		};
	},

	/**
	 * @override type = "modal"
	 */
	open() {
		this.modal.open();
	},

	/**
	 * @override modal
	 * @param {boolean} isUpdate open state is update
	 */
	on(isUpdate) {
		this.isUpdateState = isUpdate;
		if (!isUpdate) {
			this.init();
		} else if (this.controller.currentTarget) {
			const exp = converter.entityToHTML(this.controller.currentTarget.getAttribute('data-se-value'));
			const fontSize = this.controller.currentTarget.getAttribute('data-se-type') || '1em';
			this.textArea.value = exp;
			this.fontSizeElement.value = fontSize;
			this.previewElement.innerHTML = this._renderer(exp);
			this.previewElement.style.fontSize = fontSize;
		}
	},

	/**
	 * @override modal
	 * @returns {boolean | undefined}
	 */
	modalAction() {
		if (this.textArea.value.trim().length === 0) return false;

		const mathExp = this.textArea.value;
		const katexEl = this.previewElement.querySelector('.katex');

		if (!katexEl) return false;
		katexEl.className = '__se__katex ' + katexEl.className;
		katexEl.setAttribute('contenteditable', false);
		katexEl.setAttribute('data-se-value', converter.htmlToEntity(mathExp));
		katexEl.setAttribute('data-se-type', this.fontSizeElement.value);
		katexEl.style.fontSize = this.fontSizeElement.value;

		if (!this.isUpdateState) {
			const selectedFormats = this.format.getLines();

			if (selectedFormats.length > 1) {
				const oFormat = domUtils.createElement(selectedFormats[0].nodeName, null, katexEl);
				if (!this.html.insertNode(oFormat, null, false)) return false;
			} else {
				if (!this.html.insertNode(katexEl, null, false)) return false;
			}

			const empty = domUtils.createTextNode(unicode.zeroWidthSpace);
			katexEl.parentNode.insertBefore(empty, katexEl.nextSibling);
			this.selection.setRange(katexEl, 0, katexEl, 1);
		} else {
			const containerEl = domUtils.getParentElement(this.controller.currentTarget, '.katex');
			containerEl.parentNode.replaceChild(katexEl, containerEl);
			this.selection.setRange(katexEl, 0, katexEl, 1);
		}

		return true;
	},

	/**
	 * @override modal
	 */
	init() {
		this.controller.close();
		this.textArea.value = '';
		this.previewElement.innerHTML = '';
	},

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		if (/update/.test(command)) {
			this.modal.open();
		} else {
			/** delete */
			domUtils.removeItem(this.controller.currentTarget);
			this.controller.close();
			this.editor.focus();
			this.history.push(false);
		}
	},

	_renderer(exp) {
		let result = '';
		try {
			domUtils.removeClass(this.textArea, 'se-error');
			result = this.katex.src.renderToString(exp, { throwOnError: true, displayMode: true });
		} catch (error) {
			domUtils.addClass(this.textArea, 'se-error');
			result = '<span class="se-math-katex-error">Katex syntax error. (Refer <a href="' + env.KATEX_WEBSITE + '" target="_blank">KaTeX</a>)</span>';
			console.warn('[SUNEDITOR.math.Katex.error] ', error.message);
		}
		return result;
	},

	constructor: Math_
};

function RenderMathExp(e) {
	this.previewElement.innerHTML = this._renderer(e.target.value);
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
	].reduce(function (init, option) {
		for (let key in option) {
			init[key] = option[key];
		}
		return init;
	}, {});

	katex.options = katexOptions;
	return katex;
}

function CreateHTML_modal(editor, math, fontSizeList) {
	const lang = editor.lang;
	const fontSize = fontSizeList || [
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
	];
	let defaultFontSize = fontSize[0].value;
	let html = `
    <form>
        <div class="se-modal-header">
            <button type="button" data-command="close" class="se-btn se-close-btn" title="${lang.close}" aria-label="${lang.close}">
                ${editor.icons.cancel}
            </button>
            <span class="se-modal-title">${lang.math_modal_title}</span>
        </div>
        <div class="se-modal-body">
            <div class="se-modal-form">
                <label>${lang.math_modal_inputLabel} (<a href="${env.KATEX_WEBSITE}" target="_blank">KaTeX</a>)</label>
                <textarea class="se-input-form se-math-exp" type="text" data-focus></textarea>
            </div>
            <div class="se-modal-form">
                <label>${lang.math_modal_fontSizeLabel}</label>
                <select class="se-input-select se-math-size">`;

	for (let i = 0, len = fontSize.length, f; i < len; i++) {
		f = fontSize[i];
		if (f.default) defaultFontSize = f.value;
		html += `<option value="${f.value}"${f.default ? ' selected' : ''}>${f.text}</option>`;
	}

	html += `</select>
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

	math.defaultFontSize = defaultFontSize;
	return domUtils.createElement('DIV', { class: 'se-modal-content' }, html);
}

function CreateHTML_controller(core) {
	const lang = core.lang;
	const html = `
    <div class="se-arrow se-arrow-up"></div>
    <div class="link-content">
        <div class="se-btn-group">
            <button type="button" data-command="update" tabindex="-1" class="se-btn se-tooltip">
                ${core.icons.edit}
                <span class="se-tooltip-inner">
                    <span class="se-tooltip-text">${lang.edit}</span>
                </span>
            </button>
            <button type="button" data-command="delete" tabindex="-1" class="se-btn se-tooltip">
                ${core.icons.delete}
                <span class="se-tooltip-inner">
                    <span class="se-tooltip-text">${lang.remove}</span>
                </span>
            </button>
        </div>
    </div>`;

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-link' }, html);
}

export default Math_;
