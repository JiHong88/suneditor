'use strict';

import dialog from '../modules/dialog';

const katexJsSrc = 'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js';
const katexCssSrc = 'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css';

const script = document.createElement('script');
script.type = 'text/javascript';
script.src = katexJsSrc;

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = katexCssSrc;

document.head.appendChild(link);
document.head.appendChild(script);

const htmlMathString = function (exp) {
    return window.katex.renderToString(exp, {
        throwOnError: false,
    });
}

export default {
    name: 'math',
    add: function (core) {
        core.addModule([dialog]);

        const context = core.context;
        context.math = {
            focusElement: null,
            previewElement: null,
            fontSizeElement: null,
            _mathExp: null
        };

        /** math dialog */
        let math_dialog = this.setDialog.call(core);
        context.math.modal = math_dialog;
        context.math.focusElement = math_dialog.querySelector('._se_math_exp');
        context.math.previewElement = math_dialog.querySelector('._se_math_preview');
        context.math.fontSizeElement = math_dialog.querySelector('._se_math_size');

        const renderMathExp = function () {
            context.math.previewElement.innerHTML = htmlMathString(this.value);
        };

        context.math.focusElement.onkeyup = renderMathExp;
        context.math.focusElement.onchange = renderMathExp;

        context.math.fontSizeElement.onchange = function () {
            context.math.previewElement.style.fontSize = this.value;
        };

        /** math button */
        let math_button = this.setController_MathButton.call(core);
        context.math.mathBtn = math_button;
        context.math._mathExp = null;
        math_button.addEventListener('mousedown', function (e) { e.stopPropagation(); }, false);

        /** add event listeners */
        math_dialog.querySelector('.se-btn-primary').addEventListener('click', this.submit.bind(core));
        math_button.addEventListener('click', this.onClick_mathBtn.bind(core));

        /** append html */
        context.dialog.modal.appendChild(math_dialog);
        context.element.relative.appendChild(math_button);

        /** empty memory */
        math_dialog = null, math_button = null;
    },

    /** dialog */
    setDialog: function () {
        const lang = this.lang;
        const dialog = this.util.createElement('DIV');

        dialog.className = 'se-dialog-content';
        dialog.style.display = 'none';
        dialog.innerHTML = '' +
        '<form class="editor_math">' +
            '<div class="se-dialog-header">' +
                '<button type="button" data-command="close" class="close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
                    '<i aria-hidden="true" data-command="close" class="se-icon-cancel"></i>' +
                '</button>' +
                '<span class="se-modal-title">' + lang.dialogBox.mathBox.title + '</span>' +
            '</div>' +
            '<div class="se-dialog-body">' +
                '<div class="se-dialog-form">' +
                    '<label>' + lang.dialogBox.mathBox.inputLabel + ' (<a href="https://katex.org/docs/supported.html" target="_blank">KaTeX</a>):</label>' +
                    '<textarea style="height: 4rem;border: 1px solid #ccc !important;" class="se-input-form _se_math_exp" type="text"></textarea>' +
                '</div>' +
                '<div class="se-dialog-form">' +
                    '<label>' + lang.dialogBox.mathBox.fontSizeLabel + ':</label>' +
                    '<select style="width:6em;margin-left: 1em;" class="_se_math_size">' +
                        '<option value="1em">1</option>' +
                        '<option value="1.5em">1.5</option>' +
                        '<option value="2em">2</option>' +
                        '<option value="2.5em">2.5</option>' +
                    '</select>' +
                '</div>' +
                '<div class="se-dialog-form">' +
                    '<label>' + lang.dialogBox.mathBox.previewLabel + ':</label>' +
                    '<p style="font-size:13px;" class="_se_math_preview"></p>' +
                '</div>' +
            '</div>' +
            '<div class="se-dialog-footer">' +
                '<button type="submit" class="se-btn-primary" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '</div>' +
        '</form>' +
        '';

        return dialog;
    },

    /** modify controller button */
    setController_MathButton: function () {
        const lang = this.lang;
        const math_btn = this.util.createElement('DIV');

        math_btn.className = 'se-controller se-controller-link';
        math_btn.innerHTML = '' +
        '<div class="se-arrow se-arrow-up"></div>' +
        '<div class="link-content">' +
            '<div class="se-btn-group">' +
                '<button type="button" data-command="update" tabindex="-1" class="se-tooltip">' +
                    '<i class="se-icon-edit"></i>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.edit + '</span></span>' +
                '</button>' +
                '<button type="button" data-command="delete" tabindex="-1" class="se-tooltip">' +
                    '<i class="se-icon-delete"></i>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.remove + '</span></span>' +
                '</button>' +
            '</div>' +
        '</div>' +
        '';

        return math_btn;
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
            katexEl.setAttribute('data-exp', mathExp);
            katexEl.setAttribute('data-font-size', contextMath.fontSizeElement.value);
            katexEl.style.fontSize = contextMath.fontSizeElement.value;

            if (!this.context.dialog.updateModal) {
                const selectedFormats = this.getSelectedElements();

                if (selectedFormats.length > 1) {
                    const oFormat = this.util.createElement(selectedFormats[0].nodeName);
                    oFormat.appendChild(katexEl);
                    this.insertNode(oFormat);
                } else {
                    this.insertNode(katexEl);
                }

                const empty = this.util.createTextNode(this.util.zeroWidthSpace);
                katexEl.parentNode.insertBefore(empty, katexEl.nextSibling);
            } else {
                const findParent = function (child, className) {
                    if (child.classList.contains(className)) return child;

                    const parent = child.parentNode;

                    if (parent === document.body) return;

                    if (parent.classList.contains(className)) {
                        return parent;
                    } else {
                        findParent(parent, className);
                    }
                };
                const containerEl = findParent(contextMath._mathExp, 'katex');
                containerEl.parentNode.replaceChild(katexEl, containerEl);
            }

            // history stack
            this.history.push(false);

            contextMath.focusElement.value = '';
            contextMath.fontSizeElement.value = '1em';
            contextMath.previewElement.style.fontSize = '1em';
            contextMath.previewElement.innerHTML = '';
        }.bind(this);

        try {
            submitAction();
        } finally {
            this.plugins.dialog.close.call(this);
            this.closeLoading();
            this.focus();
        }

        return false;
    },

    on: function (update) {
        if (this.context.math._mathExp && update) {
            const exp = this.context.math._mathExp.getAttribute('data-exp');
            const fontSize = this.context.math._mathExp.getAttribute('data-font-size') || '1em';

            this.context.dialog.updateModal = true;
            this.context.math.focusElement.value = exp;
            this.context.math.fontSizeElement.value = fontSize;
            this.context.math.previewElement.innerHTML = htmlMathString(exp);
            this.context.math.previewElement.style.fontSize = fontSize;
        }
    },

    call_controller_mathButton: function (selectionATag) {
        this.editMath = this.context.math._mathExp = selectionATag;
        const mathBtn = this.context.math.mathBtn;

        const offset = this.util.getOffset(selectionATag, this.context.element.wysiwygFrame);
        mathBtn.style.top = (offset.top + selectionATag.offsetHeight + 10) + 'px';
        mathBtn.style.left = (offset.left - this.context.element.wysiwygFrame.scrollLeft) + 'px';

        mathBtn.style.display = 'block';

        const overLeft = this.context.element.wysiwygFrame.offsetWidth - (mathBtn.offsetLeft + mathBtn.offsetWidth);
        if (overLeft < 0) {
            mathBtn.style.left = (mathBtn.offsetLeft + overLeft) + 'px';
            mathBtn.firstElementChild.style.left = (20 - overLeft) + 'px';
        } else {
            mathBtn.firstElementChild.style.left = '20px';
        }

        this.controllersOn(mathBtn, this.plugins.math.init.bind(this));
    },

    onClick_mathBtn: function (e) {
        e.stopPropagation();

        const command = e.target.getAttribute('data-command') || e.target.parentNode.getAttribute('data-command');
        if (!command) return;

        e.preventDefault();

        if (/update/.test(command)) {
            this.context.math.focusElement.value = this.context.math._mathExp.getAttribute('data-exp');
            this.plugins.dialog.open.call(this, 'math', true);
        } else if (/unlink/.test(command)) {
            // do nothing
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
        if (!/math/i.test(this.context.dialog.kind)) {
            const contextMath = this.context.math;
            contextMath.mathBtn.style.display = 'none';
            contextMath._mathExp = null;
            contextMath.focusElement.value = '';
            contextMath.previewElement.innerHTML = '';
        }
    }
};
