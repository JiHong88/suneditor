/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'resizing',
    add: function (core) {
        const context = core.context;
        context.resizing = {
            _resizeClientX: 0,
            _resizeClientY: 0,
            _resize_plugin: '',
            _resize_w: 0,
            _resize_h: 0,
            _origin_w: 0,
            _origin_h: 0,
            _rotateVertical: false,
            _resize_direction: ''
        };

        /** resize controller, button */
        let resize_div_container = eval(this.setController_resize());
        context.resizing.resizeContainer = resize_div_container;

        context.resizing.resizeDiv = resize_div_container.getElementsByClassName('modal-resize')[0];
        context.resizing.resizeDot = resize_div_container.getElementsByClassName('resize-dot')[0];
        context.resizing.resizeDisplay = resize_div_container.getElementsByClassName('resize-display')[0];

        let resize_button = eval(this.setController_button(core.lang));
        context.resizing.resizeButton = resize_button;

        let resize_handles = resize_div_container.getElementsByClassName('sun-editor-name-resize-handle');

        /** add event listeners */
        resize_handles[0].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(core));
        resize_handles[1].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(core));
        resize_handles[2].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(core));
        resize_handles[3].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(core));
        resize_handles[4].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(core));
        resize_handles[5].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(core));
        resize_handles[6].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(core));
        resize_handles[7].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(core));
        resize_button.addEventListener('click', this.onClick_resizeButton.bind(core));

        /** append html */
        context.element.relative.appendChild(resize_div_container);
        context.element.relative.appendChild(resize_button);

        /** empty memory */
        resize_div_container = null, resize_button = null, resize_handles = null;
    },

    /** resize controller, button (image, iframe) */
    setController_resize: function () {
        const resize_container = document.createElement('DIV');
        resize_container.className = 'modal-resize-container';
        resize_container.style.display = 'none';
        resize_container.innerHTML = '' +
            '<div class="modal-resize">' +
            '   <div class="resize-display"></div>' +
            '</div>' +
            '<div class="resize-dot">' +
            '   <div class="tl sun-editor-name-resize-handle"></div>' +
            '   <div class="tr sun-editor-name-resize-handle"></div>' +
            '   <div class="bl sun-editor-name-resize-handle"></div>' +
            '   <div class="br sun-editor-name-resize-handle"></div>' +
            '   <div class="lw sun-editor-name-resize-handle"></div>' +
            '   <div class="th sun-editor-name-resize-handle"></div>' +
            '   <div class="rw sun-editor-name-resize-handle"></div>' +
            '   <div class="bh sun-editor-name-resize-handle"></div>' +
            '</div>';

        return resize_container;
    },

    setController_button: function (lang) {
        const resize_button = document.createElement("DIV");
        resize_button.className = "resize-btn";
        resize_button.style.display = "none";
        resize_button.innerHTML = '' +
            '<div class="btn-group">' +
            '   <button type="button" data-command="percent" data-value="1" title="' + lang.controller.resize100 + '"><span class="note-fontsize-10">100%</span></button>' +
            '   <button type="button" data-command="percent" data-value="0.75" title="' + lang.controller.resize75 + '"><span class="note-fontsize-10">75%</span></button>' +
            '   <button type="button" data-command="percent" data-value="0.5" title="' + lang.controller.resize50 + '"><span class="note-fontsize-10">50%</span></button>' +
            '   <button type="button" data-command="percent" data-value="0.25" title="' + lang.controller.resize25 + '"><span class="note-fontsize-10">25%</span></button>' +
            '   <button type="button" data-command="rotate" data-value="-90" title="' + lang.controller.rotateLeft + '"><div class="icon-rotate-left"></div></button>' +
            '   <button type="button" data-command="rotate" data-value="90" title="' + lang.controller.rotateRight + '"><div class="icon-rotate-right"></div></button>' +
            '   <button type="button" data-command="mirror" data-value="h" title="' + lang.controller.mirrorHorizontal + '"><div class="icon-mirror-horizontal"></div></button>' +
            '   <button type="button" data-command="mirror" data-value="v" title="' + lang.controller.mirrorVertical + '"><div class="icon-mirror-vertical"></div></button>' +
            '   <button type="button" data-command="update" title="' + lang.toolbar.image + '"><div class="icon-modify"></div></button>' +
            '   <button type="button" data-command="delete" title="' + lang.controller.remove + '"><div aria-hidden="true" class="icon-delete"></div></button>' +
            '</div>';

        return resize_button;
    },

    call_controller_resize: function (targetElement, plugin) {
        const contextResizing = this.context.resizing;
        contextResizing._resize_plugin = plugin;

        const resizeContainer = contextResizing.resizeContainer;
        const resizeDiv = contextResizing.resizeDiv;
        const offset = this.util.getOffset(targetElement);

        contextResizing._rotateVertical = /^(90|270)$/.test(Math.abs(targetElement.getAttribute('data-rotate')).toString());

        const w = contextResizing._rotateVertical ? targetElement.offsetHeight : targetElement.offsetWidth;
        const h = contextResizing._rotateVertical ? targetElement.offsetWidth : targetElement.offsetHeight;
        const t = offset.top;
        const l = offset.left;

        resizeContainer.style.top = t + 'px';
        resizeContainer.style.left = l + 'px';
        resizeContainer.style.width = w + 'px';
        resizeContainer.style.height = h + 'px';

        resizeDiv.style.top = '0px';
        resizeDiv.style.left = '0px';
        resizeDiv.style.width =  w + 'px';
        resizeDiv.style.height =  h + 'px';

        contextResizing.resizeButton.style.top = (h + t) + 'px';
        contextResizing.resizeButton.style.left = l + 'px';

        this.util.changeTxt(contextResizing.resizeDisplay, w + ' x ' + h);

        contextResizing.resizeContainer.style.display = 'block';
        contextResizing.resizeButton.style.display = 'block';
        contextResizing.resizeDot.style.display = 'block';

        contextResizing._resize_w = w;
        contextResizing._resize_h = h;

        this.controllerArray = [contextResizing.resizeContainer, contextResizing.resizeButton];

        const originSize = targetElement.getAttribute('origin-size').split(',');
        contextResizing._origin_w = originSize[0] || targetElement.naturalWidth;
        contextResizing._origin_h = originSize[1] || targetElement.naturalHeight;

        return {
            w: w,
            h: h,
            t: t,
            l: l
        };
    },

    cancel_controller_resize: function (isVertical) {
        this.context[this.context.resizing._resize_plugin]._resize_element.style.width = (isVertical ? this.context.resizing._resize_h : this.context.resizing._resize_w) + 'px';
        this.context[this.context.resizing._resize_plugin]._resize_element.style.height = (isVertical ? this.context.resizing._resize_w : this.context.resizing._resize_h) + 'px';

        this.controllersOff();
        this.context.element.resizeBackground.style.display = 'none';
        this.plugins[this.context.resizing._resize_plugin].init.call(this);
    },

    onClick_resizeButton: function (e) {
        e.stopPropagation();

        const target = e.target;
        const command = target.getAttribute('data-command') || target.parentNode.getAttribute('data-command');

        if (!command) return;

        const value = target.getAttribute('data-value') || target.parentNode.getAttribute('data-value');
        const contextEl = this.context[this.context.resizing._resize_plugin]._resize_element;

        e.preventDefault();

        if (/percent/.test(command)) {
            contextEl.setAttribute('data-percent', value * 100);
            let w, h;

            if (this.context.resizing._rotateVertical) {
                w = (this.context.resizing._origin_w * value) + 'px';
                h = (this.context.resizing._origin_h * value) + 'px';
            } else {
                w = (value * 100) + '%';
                h = 'auto';
            }

            this.plugins[this.context.resizing._resize_plugin].setPercentSize.call(this, w, h);
        }
        else if (/mirror/.test(command)) {
            const transform = contextEl.style.transform;
            const r = /rotate\(/.test(transform) ? transform.match(/rotate\((-?\d+)deg\)(?:\s|;|$)/)[1] : '0';
            let x = /rotateX/.test(transform) ? transform.match(/rotateX\(\d+deg\)(?:\s|;|$)/)[0] : '';
            let y = /rotateY/.test(transform) ? transform.match(/rotateY\(\d+deg\)(?:\s|;|$)/)[0] : '';

            if ((value === 'h' && !this.context.resizing._rotateVertical) || (value === 'v' && this.context.resizing._rotateVertical)) {
                y = y ? '' : ' rotateY(180deg)';
            } else {
                x = x ? '' : ' rotateX(180deg)';
            }

            this.plugins.resizing._setTransForm(contextEl, r, x, y);
            return;
        }
        else if (/rotate/.test(command)) {
            const contextResizing = this.context.resizing;
            
            const cover = contextEl.parentNode;
            const transform = contextEl.style.transform;
            const slope = (contextEl.getAttribute('data-rotate') * 1) + (value * 1);
            const deg = Math.abs(slope) >= 360 ? 0 : slope;
            const isVertical = contextResizing._rotateVertical = /^(90|270)$/.test(Math.abs(deg).toString());
            const offsetW = contextEl.offsetWidth;
            const offsetH = contextEl.offsetHeight;
            const w = isVertical ? offsetH : offsetW;
            const h = isVertical ? offsetW : offsetH;

            if (/^(?:0|180)$/.test(Math.abs(deg).toString()) && contextEl.getAttribute('data-percent')) {
                contextEl.style.width = contextEl.getAttribute('data-percent') + '%';
                contextEl.style.height = 'auto';
                cover.style.width = 'auto';
                cover.style.height = 'auto';
            } else {
                contextEl.style.width = offsetW + 'px';
                contextEl.style.height = offsetH + 'px';
                cover.style.width = w + 'px';
                cover.style.height = h + 'px';
            }

            let transOrigin = '';
            if (isVertical) {
                let transW = (offsetW/2) + 'px ' + (offsetW/2) + 'px 0';
                let transH = (offsetH/2) + 'px ' + (offsetH/2) + 'px 0';
                transOrigin = deg === 90 || deg === -270 ? transH : transW;
            }

            contextEl.style.transformOrigin = transOrigin;

            if (contextEl.nextElementSibling) {
                contextEl.nextElementSibling.style.marginTop = (isVertical ? w/2 - 40 : 0) + 'px';
            }

            const x = /rotateX/.test(transform) ? transform.match(/rotateX\(\d+deg\)(?:\s|;|$)/)[0] : '';
            const y = /rotateY/.test(transform) ? transform.match(/rotateY\(\d+deg\)(?:\s|;|$)/)[0] : '';

            contextEl.setAttribute('data-rotate', deg);
            this.plugins.resizing._setTransForm(contextEl, deg.toString(), x, y);

            this.plugins.resizing.call_controller_resize.call(this, contextEl, contextResizing._resize_plugin);
            return;
        }
        else if (/update/.test(command)) {
            this.plugins[this.context.resizing._resize_plugin].openModify.call(this);
        }
        else if (/delete/.test(command)) {
            this.plugins[this.context.resizing._resize_plugin].destroy.call(this);
        }

        this.submenuOff();
        this.focus();
    },

    _setTransForm: function (element, r, x, y) {
        let width = (element.offsetWidth - element.offsetHeight) * (/-/.test(r) ? 1 : -1);
        let translate = '';

        if (/[1-9]/.test(r) && (x || y)) {
            translate = x ? 'Y' : 'X';

            switch (r) {
                case '90':
                    translate = x && y ? 'X' : y ? translate : '';
                    break;
                case '270':
                    width *= -1;
                    translate = x && y ? 'Y' : x ? translate : '';
                    break;
                case '-90':
                    translate = x && y ? 'Y' : x ? translate : '';
                    break;
                case '-270':
                    width *= -1;
                    translate = x && y ? 'X' : y ? translate : '';
                    break;
                default:
                    translate = '';
            }
        }
        
        element.style.transform = 'rotate(' + r + 'deg)' + x + y + (translate ? ' translate' + translate + '(' + width + 'px)' : '');
    },

    onMouseDown_resize_handle: function (e) {
        const contextResizing = this.context.resizing;
        const direction = contextResizing._resize_direction = e.target.classList[0];
        e.stopPropagation();
        e.preventDefault();

        contextResizing.resizeDot.style.display = 'none';
        contextResizing._resizeClientX = e.clientX;
        contextResizing._resizeClientY = e.clientY;
        this.context.element.resizeBackground.style.display = 'block';
        contextResizing.resizeButton.style.display = 'none';
        contextResizing.resizeDiv.style.float = /l/.test(direction) ? 'right' : /r/.test(direction) ? 'left' : 'none';

        const closureFunc_bind = function closureFunc() {
            this.plugins.resizing.cancel_controller_resize.call(this, this.context.resizing._rotateVertical);
            document.removeEventListener('mousemove', resizing_element_bind);
            document.removeEventListener('mouseup', closureFunc_bind);
        }.bind(this);

        const resizing_element_bind = this.plugins.resizing.resizing_element.bind(this, contextResizing, direction, this.context[contextResizing._resize_plugin]);

        document.addEventListener('mousemove', resizing_element_bind);
        document.addEventListener('mouseup', closureFunc_bind);
    },

    resizing_element: function (contextResizing, direction, plugin, e) {
        const clientX = e.clientX;
        const clientY = e.clientY;

        let resultW = plugin._element_w;
        let resultH = plugin._element_h;

        const w = plugin._element_w + (/r/.test(direction) ? clientX - contextResizing._resizeClientX : contextResizing._resizeClientX - clientX);
        const h = plugin._element_h + (/b/.test(direction) ? clientY - contextResizing._resizeClientY : contextResizing._resizeClientY - clientY);
        const wh = ((plugin._element_h / plugin._element_w) * w);

        if (/t/.test(direction)) contextResizing.resizeDiv.style.top = (plugin._element_h - (/h/.test(direction) ? h : wh)) + 'px';
        if (/l/.test(direction)) contextResizing.resizeDiv.style.left = (plugin._element_w - w) + 'px';

        if (/r|l/.test(direction)) {
            contextResizing.resizeDiv.style.width = w + 'px';
            resultW = w;
        }

        if (/^(?:t|b)[^h]$/.test(direction)) {
            contextResizing.resizeDiv.style.height = wh + 'px';
            resultH = wh;
        }
        else if (/^(?:t|b)h$/.test(direction)) {
            contextResizing.resizeDiv.style.height = h + 'px';
            resultH = h;
        }

        contextResizing._resize_w = resultW;
        contextResizing._resize_h = resultH;
        this.util.changeTxt(contextResizing.resizeDisplay, Math.round(resultW) + ' x ' + Math.round(resultH));
    }
};