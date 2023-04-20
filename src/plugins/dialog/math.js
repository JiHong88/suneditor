'use strict';

import dialog from '../modules/dialog';

const KATEX_WEBSITE = "https://katex.org/docs/supported.html";

export default {
    name: 'math',
    display: 'dialog',
    add: function (core) {
        core.addModule([dialog]);

        const context = core.context;
        context.math = {
            focusElement: null, // @Override dialog // This element has focus when the dialog is opened.
            previewElement: null,
            fontSizeElement: null,
            defaultFontSize: '',
            _mathExp: null
        };

        /** math dialog */
        let math_dialog = this.setDialog(core);
        context.math.modal = math_dialog;
        context.math.focusElement = math_dialog.querySelector('.se-math-exp');
        context.math.previewElement = math_dialog.querySelector('.se-math-preview');
        context.math.fontSizeElement = math_dialog.querySelector('.se-math-size');
        context.math.focusElement.addEventListener(core.util.isIE ? 'textinput' : 'input', this._renderMathExp.bind(core, context.math), false);
        context.math.fontSizeElement.addEventListener('change', function (e) { this.fontSize = e.target.value; }.bind(context.math.previewElement.style), false);

        /** math controller */
        let math_controller = this.setController_MathButton(core);
        context.math.mathController = math_controller;
        context.math._mathExp = null;

        /** add event listeners */
        math_dialog.querySelector('form').addEventListener('submit', this.submit.bind(core), false);
        math_controller.addEventListener('click', this.onClick_mathController.bind(core));
        context.math.previewElement.style.fontSize = context.math.defaultFontSize;

        /** append html */
        context.dialog.modal.appendChild(math_dialog);
        context.element.relative.appendChild(math_controller);

        /** empty memory */
        math_dialog = null, math_controller = null;
    },

    /** dialog */
    setDialog: function (core) {
        const lang = core.lang;
        const dialog = core.util.createElement('DIV');
        const fontSize = core.options.mathFontSize;
        let defaultFontSize = fontSize[0].value;

        dialog.className = 'se-dialog-content';
        dialog.style.display = 'none';
        let html = '' +
        '<form>' +
            '<div class="se-dialog-header">' +
                '<button type="button" data-command="close" class="se-btn se-dialog-close" title="' + lang.dialogBox.close + '" aria-label="' + lang.dialogBox.close + '">' +
                    core.icons.cancel +
                '</button>' +
                '<span class="se-modal-title">' + lang.dialogBox.mathBox.title + '</span>' +
            '</div>' +
            '<div class="se-dialog-body">' +
                '<div class="se-dialog-form">' +
                    '<label>' + lang.dialogBox.mathBox.inputLabel + ' (<a href="' + KATEX_WEBSITE + '" target="_blank">KaTeX</a>)</label>' +
                    '<textarea class="se-input-form se-math-exp" type="text"></textarea>' +
                '</div>' +
                '<div class="se-dialog-form">' +
                    '<label>' + lang.dialogBox.mathBox.fontSizeLabel + '</label>' +
                    '<select class="se-input-select se-math-size">';
                    for (let i = 0, len = fontSize.length, f; i < len; i++) {
                        f = fontSize[i];
                        if (f.default) defaultFontSize = f.value;
                        html += '<option value="' + f.value + '"' + (f.default ? ' selected' : '') + '>' + f.text + '</option>';
                    }
                html += '</select>' +
                '</div>' +
                '<div class="se-dialog-form">' +
                    '<label>' + lang.dialogBox.mathBox.previewLabel + '</label>' +
                    '<p class="se-math-preview"></p>' +
                '</div>' +
            '</div>' +
            '<div class="se-dialog-footer">' +
                '<button type="submit" class="se-btn-primary" title="' + lang.dialogBox.submitButton + '" aria-label="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '</div>' +
        '</form>';

        core.context.math.defaultFontSize = defaultFontSize;
        dialog.innerHTML = html;
        return dialog;
    },

    /** modify controller button */
    setController_MathButton: function (core) {
        const lang = core.lang;
        const math_btn = core.util.createElement('DIV');

        math_btn.className = 'se-controller se-controller-link';
        math_btn.innerHTML = '' +
        '<div class="se-arrow se-arrow-up"></div>' +
        '<div class="link-content">' +
            '<div class="se-btn-group">' +
                '<button type="button" data-command="update" tabindex="-1" class="se-btn se-tooltip">' +
                    core.icons.edit +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.edit + '</span></span>' +
                '</button>' +
                '<button type="button" data-command="delete" tabindex="-1" class="se-btn se-tooltip">' +
                    core.icons.delete +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.remove + '</span></span>' +
                '</button>' +
            '</div>' +
        '</div>' +
        '';

        return math_btn;
    },

    /**
     * @Required @Override dialog
     */
    open: function () {
        this.plugins.dialog.open.call(this, 'math', 'math' === this.currentControllerName);
    },

    /**
     * @Override core - managedTagsInfo
     */
    managedTags: function () {
        return {
            className: 'katex',
            method: function (element) {
                if (!element.getAttribute('data-exp') || !this.options.katex) return;
                const dom = this._d.createRange().createContextualFragment(this.plugins.math._renderer.call(this, this.util.HTMLDecoder(element.getAttribute('data-exp'))));
                element.innerHTML = dom.querySelector('.katex').innerHTML;
                element.setAttribute('contenteditable', false);
            }
        };
    },

    _renderer: function (exp) {
        let result = '';
        try {
            this.util.removeClass(this.context.math.focusElement, 'se-error');
            result = this.options.katex.src.renderToString(exp, {throwOnError: true, displayMode: true});
        } catch(error) {
            this.util.addClass(this.context.math.focusElement, 'se-error');
            result = '<span class="se-math-katex-error">Katex syntax error. (Refer <a href="' + KATEX_WEBSITE + '" target="_blank">KaTeX</a>)</span>';
            console.warn('[SUNEDITOR.math.Katex.error] ', error);
        }
        return result;
    },

    _renderMathExp: function (contextMath, e) {
        contextMath.previewElement.innerHTML = this.plugins.math._renderer.call(this, e.target.value);
    },

    submit: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        const submitAction = function () {
            if (this.context.math.focusElement.value.trim().length === 0) return false;

            const contextMath = this.context.math;
            const mathExp = contextMath.focusElement.value;
            const katexEl = contextMath.previewElement.querySelector('.katex');

            if (!katexEl) return false;
            katexEl.className = '__se__katex ' + katexEl.className;
            katexEl.setAttribute('contenteditable', false);
            katexEl.setAttribute('data-exp', this.util.HTMLEncoder(mathExp));
            katexEl.setAttribute('data-font-size', contextMath.fontSizeElement.value);
            katexEl.style.fontSize = contextMath.fontSizeElement.value;

            if (!this.context.dialog.updateModal) {
                const selectedFormats = this.getSelectedElements();

                if (selectedFormats.length > 1) {
                    const oFormat = this.util.createElement(selectedFormats[0].nodeName);
                    oFormat.appendChild(katexEl);
                    if (!this.insertNode(oFormat, null, true)) return false;
                } else {
                    if (!this.insertNode(katexEl, null, true)) return false;
                }

                const empty = this.util.createTextNode(this.util.zeroWidthSpace);
                katexEl.parentNode.insertBefore(empty, katexEl.nextSibling);
                this.setRange(katexEl, 0, katexEl, 1);
            } else {
                const containerEl = this.util.getParentElement(contextMath._mathExp, '.katex');
                containerEl.parentNode.replaceChild(katexEl, containerEl);
                this.setRange(katexEl, 0, katexEl, 1);
            }

            contextMath.focusElement.value = '';
            contextMath.fontSizeElement.value = '1em';
            contextMath.previewElement.style.fontSize = '1em';
            contextMath.previewElement.innerHTML = '';

            return true;
        }.bind(this);

        try {
            if (submitAction()) {
                this.plugins.dialog.close.call(this);
                // history stack
                this.history.push(false);
            }
        } catch (e) {
            this.plugins.dialog.close.call(this);
        } finally {
            this.closeLoading();
        }

        return false;
    },

    active: function (element) {
        if (!element) {
            if (this.controllerArray.indexOf(this.context.math.mathController) > -1) {
                this.controllersOff();
            }
        } else if (element.getAttribute('data-exp')) {
            if (this.controllerArray.indexOf(this.context.math.mathController) < 0) {
                this.setRange(element, 0, element, 1);
                this.plugins.math.call_controller.call(this, element);
            }
            return true;
        }

        return false;
    },

    on: function (update) {
        if (!update) {
            this.plugins.math.init.call(this);
        } else {
            const contextMath = this.context.math;
            if (contextMath._mathExp) {
                const exp = this.util.HTMLDecoder(contextMath._mathExp.getAttribute('data-exp'));
                const fontSize = contextMath._mathExp.getAttribute('data-font-size') || '1em';
                this.context.dialog.updateModal = true;
                contextMath.focusElement.value = exp;
                contextMath.fontSizeElement.value = fontSize;
                contextMath.previewElement.innerHTML = this.plugins.math._renderer.call(this, exp);
                contextMath.previewElement.style.fontSize = fontSize;
            }
        }
    },

    call_controller: function (mathTag) {
        this.context.math._mathExp = mathTag;
        const mathBtn = this.context.math.mathController;

        this.setControllerPosition(mathBtn, mathTag, 'bottom', {left: 0, top: 0});
        this.controllersOn(mathBtn, mathTag, 'math');
    },

    onClick_mathController: function (e) {
        e.stopPropagation();

        const command = e.target.getAttribute('data-command') || e.target.parentNode.getAttribute('data-command');
        if (!command) return;

        e.preventDefault();

        if (/update/.test(command)) {
            this.context.math.focusElement.value = this.util.HTMLDecoder(this.context.math._mathExp.getAttribute('data-exp'));
            this.plugins.dialog.open.call(this, 'math', true);
        } else {
            /** delete */
            this.util.removeItem(this.context.math._mathExp);
            this.context.math._mathExp = null;
            this.focus();

            // history stack
            this.history.push(false);
        }

        this.controllersOff();
    },

    init: function () {
        const contextMath = this.context.math;
        contextMath.mathController.style.display = 'none';
        contextMath._mathExp = null;
        contextMath.focusElement.value = '';
        contextMath.previewElement.innerHTML = '';
    }
};
