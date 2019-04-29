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
            _resize_direction: '',
            _move_path: null,
            _isChange: false
        };

        /** resize controller, button */
        let resize_div_container = eval(this.setController_resize.call(core));
        context.resizing.resizeContainer = resize_div_container;

        context.resizing.resizeDiv = resize_div_container.getElementsByClassName('modal-resize')[0];
        context.resizing.resizeDot = resize_div_container.getElementsByClassName('resize-dot')[0];
        context.resizing.resizeDisplay = resize_div_container.getElementsByClassName('resize-display')[0];

        let resize_button = eval(this.setController_button.call(core));
        context.resizing.resizeButton = resize_button;
        resize_button.addEventListener('mousedown', function (e) { e.stopPropagation(); }, false);

        let resize_handles = context.resizing.resizeHandles = resize_div_container.querySelectorAll('.sun-editor-name-resize-handle');
        context.resizing.resizeButtonGroup = resize_button.getElementsByClassName('sun-editor-id-resize-button-group')[0];

        /** add event listeners */
        resize_div_container.getElementsByClassName('line-move-dot')[0].addEventListener('mousedown', this.onMouseDown_move_handle.bind(core));
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
        const resize_container = this.util.createElement('DIV');
        
        resize_container.className = 'modal-resize-container';
        resize_container.style.display = 'none';
        resize_container.innerHTML = '' +
            '<div class="modal-resize">' +
            '   <div class="resize-display"></div>' +
            '</div>' +
            '<div class="resize-dot">' +
            '   <div class="line-move-dot"></div>' +
            '   <span class="tl sun-editor-name-resize-handle"></span>' +
            '   <span class="tr sun-editor-name-resize-handle"></span>' +
            '   <span class="bl sun-editor-name-resize-handle"></span>' +
            '   <span class="br sun-editor-name-resize-handle"></span>' +
            '   <span class="lw sun-editor-name-resize-handle"></span>' +
            '   <span class="th sun-editor-name-resize-handle"></span>' +
            '   <span class="rw sun-editor-name-resize-handle"></span>' +
            '   <span class="bh sun-editor-name-resize-handle"></span>' +
            '</div>';

        return resize_container;
    },

    setController_button: function () {
        const lang = this.lang;
        const resize_button = this.util.createElement("DIV");

        resize_button.className = "controller-resizing";
        resize_button.style.display = "none";
        resize_button.innerHTML = '' +
            '<div class="arrow arrow-up"></div>' +
            '<div class="btn-group sun-editor-id-resize-button-group">' +
            '   <button type="button" data-command="percent" data-value="1" title="' + lang.controller.resize100 + '"><span class="note-fontsize-10">100%</span></button>' +
            '   <button type="button" data-command="percent" data-value="0.75" title="' + lang.controller.resize75 + '"><span class="note-fontsize-10">75%</span></button>' +
            '   <button type="button" data-command="percent" data-value="0.5" title="' + lang.controller.resize50 + '"><span class="note-fontsize-10">50%</span></button>' +
            '   <button type="button" data-command="percent" data-value="0.25" title="' + lang.controller.resize25 + '"><span class="note-fontsize-10">25%</span></button>' +
            '   <button type="button" data-command="rotate" data-value="-90" title="' + lang.controller.rotateLeft + '"><div class="icon-rotate-left"></div></button>' +
            '   <button type="button" data-command="rotate" data-value="90" title="' + lang.controller.rotateRight + '"><div class="icon-rotate-right"></div></button>' +
            '</div>' +
            '<div class="btn-group">' +
            '   <button type="button" data-command="mirror" data-value="h" title="' + lang.controller.mirrorHorizontal + '"><div class="icon-mirror-horizontal"></div></button>' +
            '   <button type="button" data-command="mirror" data-value="v" title="' + lang.controller.mirrorVertical + '"><div class="icon-mirror-vertical"></div></button>' +
            '   <button type="button" data-command="revert" title="' + lang.dialogBox.revertButton + '"><div class="icon-revert"></div></button>' +
            '   <button type="button" data-command="update" title="' + lang.controller.edit + '"><div class="icon-modify"></div></button>' +
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

        const isVertical = contextResizing._rotateVertical = /^(90|270)$/.test(Math.abs(targetElement.getAttribute('data-rotate')).toString());

        const w = isVertical ? targetElement.offsetHeight : targetElement.offsetWidth;
        const h = isVertical ? targetElement.offsetWidth : targetElement.offsetHeight;
        const t = offset.top;
        const l = offset.left - this.context.element.wysiwyg.scrollLeft;

        resizeContainer.style.top = t + 'px';
        resizeContainer.style.left = l + 'px';
        resizeContainer.style.width = w + 'px';
        resizeContainer.style.height = h + 'px';

        resizeDiv.style.top = '0px';
        resizeDiv.style.left = '0px';
        resizeDiv.style.width =  w + 'px';
        resizeDiv.style.height =  h + 'px';

        let align = targetElement.getAttribute('data-align') || 'basic';
        align = align === 'none' ? 'basic' : align;
        this.util.changeTxt(contextResizing.resizeDisplay, this.lang.dialogBox[align] + ' (' + w + ' x ' + h + ')');

        const resizeDisplay = this.context[plugin]._resizing ? 'flex' : 'none';
        const resizeHandles = contextResizing.resizeHandles;

        contextResizing.resizeButtonGroup.style.display = resizeDisplay;
        for (let i = 0, len = resizeHandles.length; i < len; i++) {
            resizeHandles[i].style.display = resizeDisplay;
        }

        this.controllersOn(contextResizing.resizeContainer, contextResizing.resizeButton);

        // button group
        const overLeft = this.context.element.relative.offsetWidth - l - contextResizing.resizeButton.offsetWidth;
        contextResizing.resizeButton.style.top = (h + t + 60) + 'px';
        contextResizing.resizeButton.style.left = (l + (overLeft < 0 ? overLeft : 0)) + 'px';

        contextResizing._resize_w = w;
        contextResizing._resize_h = h;

        const originSize = (targetElement.getAttribute('origin-size') || '').split(',');
        contextResizing._origin_w = originSize[0] || targetElement.naturalWidth;
        contextResizing._origin_h = originSize[1] || targetElement.naturalHeight;

        return {
            w: w,
            h: h,
            t: t,
            l: l
        };
    },

    cancel_controller_resize: function () {
        const isVertical = this.context.resizing._rotateVertical;
        this.controllersOff();
        this.context.element.resizeBackground.style.display = 'none';

        const w = isVertical ? this.context.resizing._resize_h : this.context.resizing._resize_w;
        const h = isVertical ? this.context.resizing._resize_w : this.context.resizing._resize_h;

        this.plugins[this.context.resizing._resize_plugin].setSize.call(this, w, h, isVertical);
        this.plugins.resizing.setTransformSize.call(this, this.context[this.context.resizing._resize_plugin]._element);
        
        this.plugins[this.context.resizing._resize_plugin].init.call(this);
    },

    cancel_controller_move: function () {
        const path = this.context.resizing._move_path;
        const parentPath = path.parentNode;
        const container = this.context[this.context.resizing._resize_plugin]._container;
        if (!path && !parentPath && path !== container) return;

        this.controllersOff();
        parentPath.insertBefore(container, path);
    },

    create_caption: function () {
        const caption = this.util.createElement('FIGCAPTION');
        caption.setAttribute('contenteditable', true);
        caption.innerHTML = '<p>' + this.lang.dialogBox.caption + '</p>';
        return caption;
    },

    set_cover: function (element) {
        const cover = this.util.createElement('FIGURE');
        cover.className = 'sun-editor-figure-cover';
        cover.appendChild(element);

        return cover;
    },

    set_container: function (cover, className) {
        const container = this.util.createElement('DIV');
        container.className = 'sun-editor-id-comp ' + className;
        container.setAttribute('contenteditable', false);
        container.appendChild(cover);

        return container;
    },

    onClick_resizeButton: function (e) {
        e.stopPropagation();

        const target = e.target;
        const command = target.getAttribute('data-command') || target.parentNode.getAttribute('data-command');

        if (!command) return;

        const value = target.getAttribute('data-value') || target.parentNode.getAttribute('data-value');
        const contextEl = this.context[this.context.resizing._resize_plugin]._element;
        const contextPlugin = this.plugins[this.context.resizing._resize_plugin];

        e.preventDefault();

        if (/percent/.test(command)) {
            this.plugins.resizing.resetTransform.call(this, contextEl);

            contextPlugin.setPercentSize.call(this, (value * 100) + '%', 'auto');

            const size = this.plugins.resizing.call_controller_resize.call(this, contextEl, this.context.resizing._resize_plugin);
            contextPlugin.onModifyMode.call(this, contextEl, size);
        }
        else if (/mirror/.test(command)) {
            const r = contextEl.getAttribute('data-rotate') || '0';
            let x = contextEl.getAttribute('data-rotateX') || '';
            let y = contextEl.getAttribute('data-rotateY') || '';

            if ((value === 'h' && !this.context.resizing._rotateVertical) || (value === 'v' && this.context.resizing._rotateVertical)) {
                y = y ? '' : '180';
            } else {
                x = x ? '' : '180';
            }

            contextEl.setAttribute('data-rotateX', x);
            contextEl.setAttribute('data-rotateY', y);

            this.plugins.resizing._setTransForm(contextEl, r, x, y);
        }
        else if (/rotate/.test(command)) {
            const contextResizing = this.context.resizing;
            const slope = (contextEl.getAttribute('data-rotate') * 1) + (value * 1);
            const deg = Math.abs(slope) >= 360 ? 0 : slope;

            contextEl.setAttribute('data-rotate', deg);
            contextResizing._rotateVertical = /^(90|270)$/.test(Math.abs(deg).toString());

            this.plugins.resizing.setTransformSize.call(this, contextEl);

            const size = this.plugins.resizing.call_controller_resize.call(this, contextEl, contextResizing._resize_plugin);
            contextPlugin.onModifyMode.call(this, contextEl, size);
        }
        else if (/revert/.test(command)) {
            if (contextPlugin.setAutoSize) {
                contextPlugin.setAutoSize.call(this);
            } else {
                contextPlugin.resetAlign.call(this);
                this.plugins.resizing.resetTransform.call(this, contextEl);
            }

            const size = this.plugins.resizing.call_controller_resize.call(this, contextEl, this.context.resizing._resize_plugin);
            contextPlugin.onModifyMode.call(this, contextEl, size);
        }
        else if (/update/.test(command)) {
            contextPlugin.openModify.call(this);
            this.controllersOff();
        }
        else if (/delete/.test(command)) {
            contextPlugin.destroy.call(this);
        }

        // history stack
        this.history.push();
    },

    resetTransform: function (element) {
        const originSize = (element.getAttribute('data-origin') || '').split(',');
        this.context.resizing._rotateVertical = false;

        element.style.transform = '';
        element.style.transformOrigin = '';
        element.setAttribute('data-rotate', '');
        element.setAttribute('data-rotateX', '');
        element.setAttribute('data-rotateY', '');

        element.style.width = (originSize[0] + 'px' || 'auto');
        element.style.height = (originSize[1] + 'px' || '');
        this.plugins.resizing.setTransformSize.call(this, element);
    },

    setTransformSize: function (element) {
        const cover = this.util.getParentElement(element, '.sun-editor-figure-cover');

        const isVertical = this.context.resizing._rotateVertical;
        const deg = element.getAttribute('data-rotate') * 1;

        const offsetW = element.offsetWidth;
        const offsetH = element.offsetHeight;
        const w = isVertical ? offsetH : offsetW;
        const h = isVertical ? offsetW : offsetH;

        this.plugins[this.context.resizing._resize_plugin].cancelPercentAttr.call(this);
        this.plugins[this.context.resizing._resize_plugin].setSize.call(this, offsetW, offsetH);

        cover.style.width = w + 'px';
        cover.style.height = (this.context[this.context.resizing._resize_plugin]._caption ? '' : h + 'px');

        let transOrigin = '';
        if (isVertical) {
            let transW = (offsetW/2) + 'px ' + (offsetW/2) + 'px 0';
            let transH = (offsetH/2) + 'px ' + (offsetH/2) + 'px 0';
            transOrigin = deg === 90 || deg === -270 ? transH : transW;
        }

        element.style.transformOrigin = transOrigin;

        this.plugins.resizing._setTransForm(element, deg.toString(), element.getAttribute('data-rotateX') || '', element.getAttribute('data-rotateY') || '');
        this.plugins.resizing._setCaptionPosition.call(this, element, this.util.getChildElement(this.util.getParentElement(element, '.sun-editor-figure-cover'), 'FIGCAPTION'));
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
        
        element.style.transform = 'rotate(' + r + 'deg)' + (x ? ' rotateX(' + x + 'deg)' : '') + (y ? ' rotateY(' + y + 'deg)' : '') + (translate ? ' translate' + translate + '(' + width + 'px)' : '');
    },

    _setCaptionPosition: function (element, figcaption) {
        if (figcaption) {
            figcaption.style.marginTop = (this.context.resizing._rotateVertical ? element.offsetWidth - element.offsetHeight : 0) + 'px';
        }
    },

    // moving
    onMouseDown_move_handle: function (e) {
        const contextResizing = this.context.resizing;
        e.stopPropagation();
        e.preventDefault();

        const closureFunc_bind = function closureFunc() {
            const change = contextResizing._isChange;
            contextResizing._isChange = false;

            this.context.element.wysiwyg.removeEventListener('mousemove', moving_element_bind);
            document.removeEventListener('mouseup', closureFunc_bind);

            // container move
            this.plugins.resizing.cancel_controller_move.call(this);
            // history stack
            if (change) this.history.push();
        }.bind(this);

        const moving_element_bind = this.plugins.resizing.moving_element.bind(this, contextResizing);
        this.context.element.wysiwyg.addEventListener('mousemove', moving_element_bind);
        document.addEventListener('mouseup', closureFunc_bind);
    },

    moving_element: function (contextResizing, e) {
        const path = contextResizing._move_path = this.util.getFormatElement(e.target);
        console.log('moving', path);
    },

    // resizing
    onMouseDown_resize_handle: function (e) {
        const contextResizing = this.context.resizing;
        const direction = contextResizing._resize_direction = e.target.classList[0];
        e.stopPropagation();
        e.preventDefault();

        contextResizing._resizeClientX = e.clientX;
        contextResizing._resizeClientY = e.clientY;
        this.context.element.resizeBackground.style.display = 'block';
        contextResizing.resizeButton.style.display = 'none';
        contextResizing.resizeDiv.style.float = /l/.test(direction) ? 'right' : /r/.test(direction) ? 'left' : 'none';

        const closureFunc_bind = function closureFunc() {
            const change = contextResizing._isChange;
            contextResizing._isChange = false;

            document.removeEventListener('mousemove', resizing_element_bind);
            document.removeEventListener('mouseup', closureFunc_bind);

            // element resize
            this.plugins.resizing.cancel_controller_resize.call(this);
            // history stack
            if (change) this.history.push();
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

        if (/^(t|b)[^h]$/.test(direction)) {
            contextResizing.resizeDiv.style.height = wh + 'px';
            resultH = wh;
        }
        else if (/^(t|b)h$/.test(direction)) {
            contextResizing.resizeDiv.style.height = h + 'px';
            resultH = h;
        }

        contextResizing._resize_w = resultW;
        contextResizing._resize_h = resultH;
        this.util.changeTxt(contextResizing.resizeDisplay, Math.round(resultW) + ' x ' + Math.round(resultH));
        contextResizing._isChange = true;
    }
};