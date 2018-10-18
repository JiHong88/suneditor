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
            '   <button type="button" data-command="100" title="' + lang.controller.resize100 + '"><span class="note-fontsize-10">100%</span></button>' +
            '   <button type="button" data-command="75" title="' + lang.controller.resize75 + '"><span class="note-fontsize-10">75%</span></button>' +
            '   <button type="button" data-command="50" title="' + lang.controller.resize50 + '"><span class="note-fontsize-10">50%</span></button>' +
            '   <button type="button" data-command="25" title="' + lang.controller.resize25 + '"><span class="note-fontsize-10">25%</span></button>' +
            '   <button type="button" data-command="rotate" data-value="h" title="' + lang.controller.mirrorHorizontal + '"><div class="icon-mirror-horizontal"></div></button>' +
            '   <button type="button" data-command="rotate" data-value="v" title="' + lang.controller.mirrorVertical + '"><div class="icon-mirror-vertical"></div></button>' +
            '   <button type="button" data-command="update" title="' + lang.toolbar.image + '"><div class="icon-modify"></div></button>' +
            '   <button type="button" data-command="delete" title="' + lang.controller.remove + '"><div aria-hidden="true" class="icon-delete"></div></button>' +
            '</div>';

        return resize_button;
    },

    call_controller_resize: function (targetElement, plugin) {
        this.context.resizing._resize_plugin = plugin;

        const resizeContainer = this.context.resizing.resizeContainer;
        const resizeDiv = this.context.resizing.resizeDiv;
        const offset = this.util.getOffset(targetElement);

        const w = targetElement.offsetWidth;
        const h = targetElement.offsetHeight;
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

        this.context.resizing.resizeButton.style.top = (h + t) + 'px';
        this.context.resizing.resizeButton.style.left = l + 'px';

        this.util.changeTxt(this.context.resizing.resizeDisplay, w + ' x ' + h);

        this.context.resizing.resizeContainer.style.display = 'block';
        this.context.resizing.resizeButton.style.display = 'block';
        this.context.resizing.resizeDot.style.display = 'block';

        this.context.resizing._resize_w = w;
        this.context.resizing._resize_h = h;

        this.controllerArray = [this.context.resizing.resizeContainer, this.context.resizing.resizeButton];

        return {
            w: w,
            h: h,
            t: t,
            l: l
        };
    },

    cancel_controller_resize: function () {
        this.context[this.context.resizing._resize_plugin]._resize_element.style.width = this.context.resizing._resize_w + 'px';
        this.context[this.context.resizing._resize_plugin]._resize_element.style.height =this.context.resizing._resize_h + 'px';

        this.controllersOff();
        this.context.element.resizeBackground.style.display = 'none';
        this.plugins[this.context.resizing._resize_plugin].init.call(this);
    },

    onClick_resizeButton: function (e) {
        e.stopPropagation();

        const command = e.target.getAttribute('data-command') || e.target.parentNode.getAttribute('data-command');
        if (!command) return;

        e.preventDefault();

        if (/^\d+$/.test(command)) {
            this.plugins[this.context.resizing._resize_plugin].setSize.call(this, command + '%', '');
        }
        else if (/rotate/.test(command)) {
            const value = e.target.getAttribute('data-value') || e.target.parentNode.getAttribute('data-value');
            const contextEl = this.context[this.context.resizing._resize_plugin]._resize_element;
            const transform = contextEl.style.transform;

            if (value === 'h') {
                contextEl.style.transform = transform.match(/rotateY/) ? transform.replace(/rotateY\(\d+deg\)(?:\s|;|$)/, '') : transform + ' rotateY(180deg)';
            } else {
                contextEl.style.transform = transform.match(/rotateX/) ? transform.replace(/rotateX\(\d+deg\)(?:\s|;|$)/, '') : transform + ' rotateX(180deg)';
            }

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

    onMouseDown_resize_handle: function (e) {
        const direction = this.context.resizing._resize_direction = e.target.classList[0];
        e.stopPropagation();
        e.preventDefault();

        this.context.resizing.resizeDot.style.display = 'none';
        this.context.resizing._resizeClientX = e.clientX;
        this.context.resizing._resizeClientY = e.clientY;
        this.context.element.resizeBackground.style.display = 'block';
        this.context.resizing.resizeButton.style.display = 'none';
        this.context.resizing.resizeDiv.style.float = /l/.test(direction) ? 'right' : /r/.test(direction) ? 'left' : 'none';

        const closureFunc_bind = function closureFunc() {
            this.plugins.resizing.cancel_controller_resize.call(this);
            document.removeEventListener('mousemove', resizing_element_bind);
            document.removeEventListener('mouseup', closureFunc_bind);
        }.bind(this);

        const resizing_element_bind = this.plugins.resizing.resizing_element.bind(this);

        document.addEventListener('mousemove', resizing_element_bind);
        document.addEventListener('mouseup', closureFunc_bind);
    },

    resizing_element: function (e) {
        const direction = this.context.resizing._resize_direction;
        const clientX = e.clientX;
        const clientY = e.clientY;
        const plugin = this.context[this.context.resizing._resize_plugin];

        let resultW = plugin._element_w;
        let resultH = plugin._element_h;

        const w = plugin._element_w + (/r/.test(direction) ? clientX - this.context.resizing._resizeClientX : this.context.resizing._resizeClientX - clientX);
        const h = plugin._element_h + (/b/.test(direction) ? clientY - this.context.resizing._resizeClientY : this.context.resizing._resizeClientY - clientY);
        const wh = ((plugin._element_h / plugin._element_w) * w);

        if (/t/.test(direction)) this.context.resizing.resizeDiv.style.top = (plugin._element_h - (/h/.test(direction) ? h : wh)) + 'px';
        if (/l/.test(direction)) this.context.resizing.resizeDiv.style.left = (plugin._element_w - w) + 'px';

        if (/r|l/.test(direction)) {
            this.context.resizing.resizeDiv.style.width = w + 'px';
            resultW = w;
        }

        if (/^(?:t|b)[^h]$/.test(direction)) {
            this.context.resizing.resizeDiv.style.height = wh + 'px';
            resultH = wh;
        }
        else if (/^(?:t|b)h$/.test(direction)) {
            this.context.resizing.resizeDiv.style.height = h + 'px';
            resultH = h;
        }

        this.context.resizing._resize_w = resultW;
        this.context.resizing._resize_h = resultH;
        this.util.changeTxt(this.context.resizing.resizeDisplay, Math.round(resultW) + ' x ' + Math.round(resultH));
    }
};