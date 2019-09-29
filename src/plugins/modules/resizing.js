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
        let resize_div_container = this.setController_resize.call(core);
        context.resizing.resizeContainer = resize_div_container;

        context.resizing.resizeDiv = resize_div_container.querySelector('.se-modal-resize');
        context.resizing.resizeDot = resize_div_container.querySelector('.se-resize-dot');
        context.resizing.resizeDisplay = resize_div_container.querySelector('.se-resize-display');

        let resize_button = this.setController_button.call(core);
        context.resizing.resizeButton = resize_button;
        resize_button.addEventListener('mousedown', function (e) { e.stopPropagation(); }, false);

        let resize_handles = context.resizing.resizeHandles = context.resizing.resizeDot.querySelectorAll('span');
        context.resizing.resizeButtonGroup = resize_button.querySelector('._se_resizing_btn_group');

        context.resizing.alignMenu = resize_button.querySelector('.se-resizing-align-list');
        context.resizing.alignMenuList = context.resizing.alignMenu.querySelectorAll('button');

        context.resizing.alignButton = resize_button.querySelector('._se_resizing_align_button');
        context.resizing.alignButtonIcon = context.resizing.alignButton.querySelector('i');

        context.resizing.captionButton = resize_button.querySelector('._se_resizing_caption_button');

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
        const resize_container = this.util.createElement('DIV');
        
        resize_container.className = 'se-resizing-container';
        resize_container.style.display = 'none';
        resize_container.innerHTML = '' +
            '<div class="se-modal-resize">' +
            '   <div class="se-resize-display"></div>' +
            '</div>' +
            '<div class="se-resize-dot">' +
            '   <span class="tl"></span>' +
            '   <span class="tr"></span>' +
            '   <span class="bl"></span>' +
            '   <span class="br"></span>' +
            '   <span class="lw"></span>' +
            '   <span class="th"></span>' +
            '   <span class="rw"></span>' +
            '   <span class="bh"></span>' +
            '</div>';

        return resize_container;
    },

    setController_button: function () {
        const lang = this.lang;
        const resize_button = this.util.createElement("DIV");

        resize_button.className = "se-controller se-controller-resizing";
        resize_button.innerHTML = '' +
            '<div class="se-arrow se-arrow-up"></div>' +
            '<div class="se-btn-group _se_resizing_btn_group">' +
            '   <button type="button" data-command="percent" data-value="1" class="se-tooltip">' +
            '       <span>100%</span>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.resize100 + '</span></span>' +
            '   </button>' +
            '   <button type="button" data-command="percent" data-value="0.75" class="se-tooltip">' +
            '       <span>75%</span>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.resize75 + '</span></span>' +
            '   </button>' +
            '   <button type="button" data-command="percent" data-value="0.5" class="se-tooltip">' +
            '       <span>50%</span>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.resize50 + '</span></span>' +
            '   </button>' +
            '   <button type="button" data-command="percent" data-value="0.25" class="se-tooltip">' +
            '       <span>25%</span>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.resize25 + '</span></span>' +
            '   </button>' +
            '   <button type="button" data-command="rotate" data-value="-90" class="se-tooltip">' +
            '       <i class="se-icon-rotate-left"></i>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.rotateLeft + '</span></span>' +
            '   </button>' +
            '   <button type="button" data-command="rotate" data-value="90" class="se-tooltip">' +
            '       <i class="se-icon-rotate-right"></i>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.rotateRight + '</span></span>' +
            '   </button>' +
            '</div>' +
            '<div class="se-btn-group">' +
            '   <button type="button" data-command="mirror" data-value="h" class="se-tooltip">' +
            '       <i class="se-icon-mirror-horizontal"></i>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.mirrorHorizontal + '</span></span>' +
            '   </button>' +
            '   <button type="button" data-command="mirror" data-value="v" class="se-tooltip">' +
            '       <i class="se-icon-mirror-vertical"></i>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.mirrorVertical + '</span></span>' +
            '   </button>' +
            '   <button type="button" data-command="onalign" class="se-tooltip _se_resizing_align_button">' +
            '       <i class="se-icon-align-justify"></i>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.toolbar.align + '</span></span>' +
            '   </button>' +
            '   <div class="se-btn-group-sub sun-editor-common se-list-layer se-resizing-align-list">' +
            '       <div class="se-list-inner">' +
            '           <ul class="se-list-basic">' +
            '               <li><button type="button" class="se-btn-list se-tooltip" data-command="align" data-value="basic">' +
            '                   <i class="se-icon-align-justify"></i>' +
            '                   <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.basic + '</span></span>' +
            '               </button></li>' +
            '               <li><button type="button" class="se-btn-list se-tooltip" data-command="align" data-value="left">' +
            '                   <i class="se-icon-align-left"></i>' +
            '                   <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.left + '</span></span>' +
            '               </button></li>' +
            '               <li><button type="button" class="se-btn-list se-tooltip" data-command="align" data-value="center">' +
            '                   <i class="se-icon-align-center"></i>' +
            '                   <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.center + '</span></span>' +
            '               </button></li>' +
            '               <li><button type="button" class="se-btn-list se-tooltip" data-command="align" data-value="right">' +
            '                   <i class="se-icon-align-right"></i>' +
            '                   <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.right + '</span></span>' +
            '               </button></li>' +
            '           </ul>' +
            '       </div>' +
            '   </div>' +
            '   <button type="button" data-command="caption" class="se-tooltip _se_resizing_caption_button">' +
            '       <i class="se-icon-caption"></i>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.caption + '</span></span>' +
            '   </button>' +
            '   <button type="button" data-command="revert" class="se-tooltip">' +
            '       <i class="se-icon-revert"></i>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.revertButton + '</span></span>' +
            '   </button>' +
            '   <button type="button" data-command="update" class="se-tooltip">' +
            '       <i class="se-icon-modify"></i>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.edit + '</span></span>' +
            '   </button>' +
            '   <button type="button" data-command="delete" class="se-tooltip">' +
            '       <i class="se-icon-delete"></i>' +
            '       <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.remove + '</span></span>' +
            '   </button>' +
            '</div>';

        return resize_button;
    },

    call_controller_resize: function (targetElement, plugin) {
        const contextResizing = this.context.resizing;
        contextResizing._resize_plugin = plugin;

        const resizeContainer = contextResizing.resizeContainer;
        const resizeDiv = contextResizing.resizeDiv;
        const offset = this.util.getOffset(targetElement, this.context.element.wysiwygFrame);

        const isVertical = contextResizing._rotateVertical = /^(90|270)$/.test(Math.abs(targetElement.getAttribute('data-rotate')).toString());

        const w = isVertical ? targetElement.offsetHeight : targetElement.offsetWidth;
        const h = isVertical ? targetElement.offsetWidth : targetElement.offsetHeight;
        const t = offset.top;
        const l = offset.left - this.context.element.wysiwygFrame.scrollLeft;

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

        // align icon
        const alignList = contextResizing.alignMenuList;
        this.util.removeClass(contextResizing.alignButtonIcon, 'se-icon-align\\-[a-z]+');
        this.util.addClass(contextResizing.alignButtonIcon, 'se-icon-align-' + (align === 'basic' ? 'justify' : align));
        for (let i = 0, len = alignList.length; i < len; i++) {
            if (alignList[i].getAttribute('data-value') === align) this.util.addClass(alignList[i], 'on');
            else this.util.removeClass(alignList[i], 'on');
        }

        // caption active
        if (this.util.getChildElement(targetElement.parentNode, 'figcaption')) {
            this.util.addClass(contextResizing.captionButton, 'active');
            this.context[plugin]._captionChecked = true;
        } else {
            this.util.removeClass(contextResizing.captionButton, 'active');
            this.context[plugin]._captionChecked = false;
        }

        this._resizingName = plugin;
        this.controllersOn(contextResizing.resizeContainer, contextResizing.resizeButton);

        // button group
        const overLeft = this.context.element.wysiwygFrame.offsetWidth - l - contextResizing.resizeButton.offsetWidth;

        contextResizing.resizeButton.style.top = (h + t + 60) + 'px';
        contextResizing.resizeButton.style.left = (l + (overLeft < 0 ? overLeft : 0)) + 'px';

        if (overLeft < 0) {
            contextResizing.resizeButton.firstElementChild.style.left = (20 - overLeft) + 'px';
        } else {
            contextResizing.resizeButton.firstElementChild.style.left = '20px';
        }

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

    _closeAlignMenu: null,
    openAlignMenu: function () {
        this.util.addClass(this.context.resizing.alignButton, 'on');
        this.context.resizing.alignMenu.style.display = 'inline-table';

        this.plugins.resizing._closeAlignMenu = function () {
            this.util.removeClass(this.context.resizing.alignButton, 'on');
            this.context.resizing.alignMenu.style.display = 'none';
            this.removeDocEvent('mousedown', this.plugins.resizing._closeAlignMenu);
            this.plugins.resizing._closeAlignMenu = null;
        }.bind(this);

        this.addDocEvent('mousedown', this.plugins.resizing._closeAlignMenu);
    },

    create_caption: function () {
        const caption = this.util.createElement('FIGCAPTION');
        caption.setAttribute('contenteditable', true);
        caption.innerHTML = '<div>' + this.lang.dialogBox.caption + '</div>';
        return caption;
    },

    set_cover: function (element) {
        const cover = this.util.createElement('FIGURE');
        cover.appendChild(element);

        return cover;
    },

    set_container: function (cover, className) {
        const container = this.util.createElement('DIV');
        container.className = 'se-component ' + className;
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

        const pluginName = this.context.resizing._resize_plugin;
        const currentContext = this.context[pluginName];
        const contextEl = currentContext._element;
        const contextPlugin = this.plugins[pluginName];

        e.preventDefault();

        if (typeof this.plugins.resizing._closeAlignMenu === 'function') {
            this.plugins.resizing._closeAlignMenu();
            if (command === 'onalign') return;
        }

        switch (command) {
            case 'percent':
                this.plugins.resizing.resetTransform.call(this, contextEl);
                contextPlugin.setPercentSize.call(this, (value * 100) + '%', 'auto');
                contextPlugin.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, pluginName));
                break;
            case 'mirror':
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
                break;
            case 'rotate':
                const contextResizing = this.context.resizing;
                const slope = (contextEl.getAttribute('data-rotate') * 1) + (value * 1);
                const deg = this._w.Math.abs(slope) >= 360 ? 0 : slope;
    
                contextEl.setAttribute('data-rotate', deg);
                contextResizing._rotateVertical = /^(90|270)$/.test(this._w.Math.abs(deg).toString());
                this.plugins.resizing.setTransformSize.call(this, contextEl, null, null);
    
                contextPlugin.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, contextResizing._resize_plugin));
                break;
            case 'onalign':
                this.plugins.resizing.openAlignMenu.call(this);
                break;
            case 'align':
                const alignValue = value === 'basic' ? 'none' : value;
        
                if (alignValue && 'none' !== alignValue) {
                    currentContext._cover.style.margin = 'auto';
                } else {
                    currentContext._cover.style.margin = '0';
                }
    
                this.util.removeClass(currentContext._container, currentContext._floatClassRegExp);
                this.util.addClass(currentContext._container, '__se__float-' + alignValue);
                contextEl.setAttribute('data-align', alignValue);
    
                contextPlugin.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, pluginName));
                break;
            case 'caption':
                const caption = !currentContext._captionChecked;
                contextPlugin.openModify.call(this, true);
                currentContext._captionChecked = currentContext.captionCheckEl.checked = caption;

                if (pluginName === 'image') {
                    contextPlugin.update_image.call(this, false, false);
                } else if (pluginName === 'video') {
                    this.context.dialog.updateModal = true;
                    contextPlugin.submitAction.call(this);
                }

                if (caption) {
                    const captionText = this.util.getChildElement(currentContext._caption, function (current) {
                        return current.nodeType === 3;
                    });

                    if (!captionText) {
                        currentContext._caption.focus();
                    } else {
                        this.setRange(captionText, 0, captionText, captionText.textContent.length);
                    }

                    this.controllersOff();
                } else {
                    contextPlugin.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, pluginName));
                    contextPlugin.openModify.call(this, true);
                }

                break;
            case 'revert':
                if (contextPlugin.setAutoSize) {
                    contextPlugin.setAutoSize.call(this);
                } else {
                    contextPlugin.resetAlign.call(this);
                    this.plugins.resizing.resetTransform.call(this, contextEl);
                }
    
                contextPlugin.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, pluginName));
                break;
            case 'update':
                contextPlugin.openModify.call(this);
                this.controllersOff();
                break;
            case 'delete':
                contextPlugin.destroy.call(this);
                break;
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

        element.style.width = originSize[0] ? originSize[0] + 'px' : 'auto';
        element.style.height = originSize[1] ? originSize[1] + 'px' : '';
        this.plugins.resizing.setTransformSize.call(this, element, null, null);
    },

    setTransformSize: function (element, width, height) {
        const cover = this.util.getParentElement(element, 'FIGURE');

        const isVertical = this.context.resizing._rotateVertical;
        const deg = element.getAttribute('data-rotate') * 1;

        const offsetW = width || element.offsetWidth;
        const offsetH = height || element.offsetHeight;
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
        this.plugins.resizing._setCaptionPosition.call(this, element, this.util.getChildElement(this.util.getParentElement(element, 'FIGURE'), 'FIGCAPTION'));
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

        if (r % 180 === 0) {
            element.style.maxWidth = '100%';
        }
        
        element.style.transform = 'rotate(' + r + 'deg)' + (x ? ' rotateX(' + x + 'deg)' : '') + (y ? ' rotateY(' + y + 'deg)' : '') + (translate ? ' translate' + translate + '(' + width + 'px)' : '');
    },

    _setCaptionPosition: function (element, figcaption) {
        if (figcaption) {
            figcaption.style.marginTop = (this.context.resizing._rotateVertical ? element.offsetWidth - element.offsetHeight : 0) + 'px';
        }
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
        this.util.changeTxt(contextResizing.resizeDisplay, this._w.Math.round(resultW) + ' x ' + this._w.Math.round(resultH));
        contextResizing._isChange = true;
    },

    cancel_controller_resize: function () {
        const isVertical = this.context.resizing._rotateVertical;
        this.controllersOff();
        this.context.element.resizeBackground.style.display = 'none';

        let w = this._w.Math.round(isVertical ? this.context.resizing._resize_h : this.context.resizing._resize_w);
        let h = this._w.Math.round(isVertical ? this.context.resizing._resize_w : this.context.resizing._resize_h);

        if (!isVertical && !/^\d+%$/.test(w)) {
            const padding = 16;
            const limit = this.context.element.wysiwygFrame.clientWidth - (padding * 2) - 2;
            
            if (w.toString().match(/\d+/)[0] > limit) {
                w = limit;
                h = this.context.resizing._resize_plugin === 'video' ? (h / w) * limit : 'auto';
            }
        }

        this.plugins[this.context.resizing._resize_plugin].setSize.call(this, w, h);
        this.plugins.resizing.setTransformSize.call(this, this.context[this.context.resizing._resize_plugin]._element, w, h);
        
        this.plugins[this.context.resizing._resize_plugin].init.call(this);
    }
};