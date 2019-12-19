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
        context.resizing.rotationButtons = resize_button.querySelectorAll('._se_resizing_btn_group ._se_rotation');
        context.resizing.percentageButtons = resize_button.querySelectorAll('._se_resizing_btn_group ._se_percentage');

        context.resizing.alignMenu = resize_button.querySelector('.se-resizing-align-list');
        context.resizing.alignMenuList = context.resizing.alignMenu.querySelectorAll('button');

        context.resizing.alignButton = resize_button.querySelector('._se_resizing_align_button');
        context.resizing.alignButtonIcon = context.resizing.alignButton.querySelector('i');

        context.resizing.autoSizeButton = resize_button.querySelector('._se_resizing_btn_group ._se_auto_size');
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
            '<div class="se-modal-resize"></div>' +
            '<div class="se-resize-dot">' +
                '<span class="tl"></span>' +
                '<span class="tr"></span>' +
                '<span class="bl"></span>' +
                '<span class="br"></span>' +
                '<span class="lw"></span>' +
                '<span class="th"></span>' +
                '<span class="rw"></span>' +
                '<span class="bh"></span>' +
                '<div class="se-resize-display"></div>' +
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
                '<button type="button" data-command="percent" data-value="1" class="se-tooltip _se_percentage">' +
                    '<span>100%</span>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.resize100 + '</span></span>' +
                '</button>' +
                '<button type="button" data-command="percent" data-value="0.75" class="se-tooltip _se_percentage">' +
                    '<span>75%</span>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.resize75 + '</span></span>' +
                '</button>' +
                '<button type="button" data-command="percent" data-value="0.5" class="se-tooltip _se_percentage">' +
                    '<span>50%</span>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.resize50 + '</span></span>' +
                '</button>' +
                '<button type="button" data-command="auto" class="se-tooltip _se_auto_size">' +
                    '<i class="se-icon-auto-size"></i>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.autoSize + '</span></span>' +
                '</button>' +
                '<button type="button" data-command="rotate" data-value="-90" class="se-tooltip _se_rotation">' +
                    '<i class="se-icon-rotate-left"></i>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.rotateLeft + '</span></span>' +
                '</button>' +
                '<button type="button" data-command="rotate" data-value="90" class="se-tooltip _se_rotation">' +
                    '<i class="se-icon-rotate-right"></i>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.rotateRight + '</span></span>' +
                '</button>' +
            '</div>' +
            '<div class="se-btn-group">' +
                '<button type="button" data-command="mirror" data-value="h" class="se-tooltip">' +
                    '<i class="se-icon-mirror-horizontal"></i>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.mirrorHorizontal + '</span></span>' +
                '</button>' +
                '<button type="button" data-command="mirror" data-value="v" class="se-tooltip">' +
                    '<i class="se-icon-mirror-vertical"></i>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.mirrorVertical + '</span></span>' +
                '</button>' +
                '<button type="button" data-command="onalign" class="se-tooltip _se_resizing_align_button">' +
                    '<i class="se-icon-align-justify"></i>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.toolbar.align + '</span></span>' +
                '</button>' +
                '<div class="se-btn-group-sub sun-editor-common se-list-layer se-resizing-align-list">' +
                    '<div class="se-list-inner">' +
                        '<ul class="se-list-basic">' +
                            '<li><button type="button" class="se-btn-list se-tooltip" data-command="align" data-value="basic">' +
                                '<i class="se-icon-align-justify"></i>' +
                                '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.basic + '</span></span>' +
                            '</button></li>' +
                            '<li><button type="button" class="se-btn-list se-tooltip" data-command="align" data-value="left">' +
                                '<i class="se-icon-align-left"></i>' +
                                '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.left + '</span></span>' +
                            '</button></li>' +
                            '<li><button type="button" class="se-btn-list se-tooltip" data-command="align" data-value="center">' +
                                '<i class="se-icon-align-center"></i>' +
                                '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.center + '</span></span>' +
                            '</button></li>' +
                            '<li><button type="button" class="se-btn-list se-tooltip" data-command="align" data-value="right">' +
                                '<i class="se-icon-align-right"></i>' +
                                '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.right + '</span></span>' +
                            '</button></li>' +
                        '</ul>' +
                    '</div>' +
                '</div>' +
                '<button type="button" data-command="caption" class="se-tooltip _se_resizing_caption_button">' +
                    '<i class="se-icon-caption"></i>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.caption + '</span></span>' +
                '</button>' +
                    '<button type="button" data-command="revert" class="se-tooltip">' +
                    '<i class="se-icon-revert"></i>' +
                '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.dialogBox.revertButton + '</span></span>' +
                '</button>' +
                '<button type="button" data-command="update" class="se-tooltip">' +
                    '<i class="se-icon-modify"></i>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.edit + '</span></span>' +
                '</button>' +
                '<button type="button" data-command="delete" class="se-tooltip">' +
                    '<i class="se-icon-delete"></i>' +
                    '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.remove + '</span></span>' +
                '</button>' +
            '</div>';

        return resize_button;
    },

    _module_getSizeX: function (contextPlugin, element, cover, container) {
        if (!element) element = contextPlugin._element;
        if (!cover) cover = contextPlugin._cover;
        if (!container) container = contextPlugin._container;

        if (!container || !cover || !element) return '';

        return !/%$/.test(element.style.width) ? element.style.width : (this.util.getNumber(container.style.width, 2) || 100) + '%';
    },

    _module_getSizeY: function (contextPlugin, element, cover, container) {
        if (!element) element = contextPlugin._element;
        if (!cover) cover = contextPlugin._cover;
        if (!container) container = contextPlugin._container;

        if (!container || !cover || !element) return '';

        return this.util.getNumber(cover.style.paddingBottom) > 0 && !this.context.resizing._rotateVertical ? cover.style.height : (!/%$/.test(element.style.height) || !/%$/.test(element.style.width) ? element.style.height : (this.util.getNumber(container.style.height, 2) || 100) + '%');
    },

    _module_setModifyInputSize: function (contextPlugin, currentModule) {
        const percentageRotation = contextPlugin._onlyPercentage && this.context.resizing._rotateVertical;
        contextPlugin.proportion.checked = contextPlugin._proportionChecked = contextPlugin._element.getAttribute('data-proportion') !== 'false';

        let x = percentageRotation ? '' : this.plugins.resizing._module_getSizeX.call(this, contextPlugin);
        if (x === contextPlugin._defaultSizeX) x = '';
        if (contextPlugin._onlyPercentage) x = this.util.getNumber(x, 2);
        contextPlugin.inputX.value = x;
        currentModule.setInputSize.call(this, 'x');
        
        if (!contextPlugin._onlyPercentage) {
            let y = percentageRotation ? '' : this.plugins.resizing._module_getSizeY.call(this, contextPlugin);
            if (y === contextPlugin._defaultSizeY) y = '';
            if (contextPlugin._onlyPercentage) y = this.util.getNumber(y, 2);
            contextPlugin.inputY.value = y;
        }
        
        contextPlugin.inputX.disabled = percentageRotation ? true : false;
        contextPlugin.inputY.disabled = percentageRotation ? true : false;
        contextPlugin.proportion.disabled = percentageRotation ? true : false;

        currentModule.setRatio.call(this);
    },

    _module_setInputSize: function (contextPlugin, xy) {
        if (contextPlugin._onlyPercentage) {
            if (xy === 'x' && contextPlugin.inputX.value > 100) contextPlugin.inputX.value = 100;
            return;
        }

        if (contextPlugin.proportion.checked && contextPlugin._ratio && /\d/.test(contextPlugin.inputX.value) && /\d/.test(contextPlugin.inputY.value)) {
            const xUnit = contextPlugin.inputX.value.replace(/\d+|\./g, '') || contextPlugin.sizeUnit;
            const yUnit = contextPlugin.inputY.value.replace(/\d+|\./g, '') || contextPlugin.sizeUnit;

            if (xUnit !== yUnit) return;

            const dec = xUnit === '%' ? 2 : 0;

            if (xy === 'x') {
                contextPlugin.inputY.value = this.util.getNumber(contextPlugin._ratioY * this.util.getNumber(contextPlugin.inputX.value, dec), dec) + yUnit;
            } else {
                contextPlugin.inputX.value = this.util.getNumber(contextPlugin._ratioX * this.util.getNumber(contextPlugin.inputY.value, dec), dec) + xUnit;
            }
        }
    },

    _module_setRatio: function (contextPlugin) {
        const xValue = contextPlugin.inputX.value;
        const yValue = contextPlugin.inputY.value;

        if (contextPlugin.proportion.checked && /\d+/.test(xValue) && /\d+/.test(yValue)) {
            const xUnit = xValue.replace(/\d+|\./g, '') || contextPlugin.sizeUnit;
            const yUnit = yValue.replace(/\d+|\./g, '') || contextPlugin.sizeUnit;

            if (xUnit !== yUnit) {
                contextPlugin._ratio = false;
            } else if (!contextPlugin._ratio) {
                const x = this.util.getNumber(xValue);
                const y = this.util.getNumber(yValue);

                contextPlugin._ratio = true;
                contextPlugin._ratioX = x / y;
                contextPlugin._ratioY = y / x;
            }
        } else {
            contextPlugin._ratio = false;
        }
    },

    _module_sizeRevert: function (contextPlugin) {
        if (contextPlugin._onlyPercentage) {
            contextPlugin.inputX.value = contextPlugin._origin_w > 100 ? 100 : contextPlugin._origin_w;
        } else {
            contextPlugin.inputX.value = contextPlugin._origin_w;
            contextPlugin.inputY.value = contextPlugin._origin_h;
        }
    },

    _module_saveCurrentSize: function (contextPlugin) {
        const x = this.plugins.resizing._module_getSizeX.call(this, contextPlugin);
        const y = this.plugins.resizing._module_getSizeY.call(this, contextPlugin);
        contextPlugin._element.setAttribute('data-size', x + ',' + y);
        if (!!contextPlugin._videoRatio) contextPlugin._videoRatio = y;
    },

    call_controller_resize: function (targetElement, plugin) {
        const contextResizing = this.context.resizing;
        const contextPlugin = this.context[plugin];
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

        // text
        const container = this.util.getParentElement(targetElement, this.util.isComponent);
        const cover = this.util.getParentElement(targetElement, 'FIGURE');
        const displayX = this.plugins.resizing._module_getSizeX.call(this, contextPlugin, targetElement, cover, container) || 'auto';
        const displayY = contextPlugin._onlyPercentage && plugin === 'image' ? '' : ', ' + (this.plugins.resizing._module_getSizeY.call(this, contextPlugin, targetElement, cover, container) || 'auto');
        this.util.changeTxt(contextResizing.resizeDisplay, this.lang.dialogBox[align] + ' (' + displayX + displayY + ')');

        // resizing display
        contextResizing.resizeButtonGroup.style.display = contextPlugin._resizing ? '' : 'none';
        const resizeDotShow = contextPlugin._resizing && !contextPlugin._resizeDotHide && !contextPlugin._onlyPercentage ? 'flex' : 'none';
        const resizeHandles = contextResizing.resizeHandles;
        for (let i = 0, len = resizeHandles.length; i < len; i++) {
            resizeHandles[i].style.display = resizeDotShow;
        }

        if (contextPlugin._resizing) {
            const rotations = contextResizing.rotationButtons;
            rotations[0].style.display = rotations[1].style.display = contextPlugin._rotation ? '' : 'none';
        }

        // align icon
        const alignList = contextResizing.alignMenuList;
        this.util.removeClass(contextResizing.alignButtonIcon, 'se-icon-align\\-[a-z]+');
        this.util.addClass(contextResizing.alignButtonIcon, 'se-icon-align-' + (align === 'basic' ? 'justify' : align));
        for (let i = 0, len = alignList.length; i < len; i++) {
            if (alignList[i].getAttribute('data-value') === align) this.util.addClass(alignList[i], 'on');
            else this.util.removeClass(alignList[i], 'on');
        }

        // percentage active
        const pButtons = contextResizing.percentageButtons;
        const value = /%$/.test(targetElement.style.width) && /%$/.test(container.style.width) ? (this.util.getNumber(container.style.width) / 100) + '' : '' ;
        for (let i = 0, len = pButtons.length; i < len; i++) {
            if (pButtons[i].getAttribute('data-value') === value) {
                this.util.addClass(pButtons[i], 'active');
            } else {
                this.util.removeClass(pButtons[i], 'active');
            }
        }

        // caption display, active
        if (!contextPlugin._captionShow) {
            contextResizing.captionButton.style.display = 'none';
        } else {
            contextResizing.captionButton.style.display = '';
            if (this.util.getChildElement(targetElement.parentNode, 'figcaption')) {
                this.util.addClass(contextResizing.captionButton, 'active');
                contextPlugin._captionChecked = true;
            } else {
                this.util.removeClass(contextResizing.captionButton, 'active');
                contextPlugin._captionChecked = false;
            }
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
        const currentModule = this.plugins[pluginName];

        e.preventDefault();

        if (typeof this.plugins.resizing._closeAlignMenu === 'function') {
            this.plugins.resizing._closeAlignMenu();
            if (command === 'onalign') return;
        }

        switch (command) {
            case 'auto':
                currentModule.setAutoSize.call(this);
                currentModule.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, pluginName));
                break;
            case 'percent':
                let percentY = this.plugins.resizing._module_getSizeY.call(this, currentContext);
                if (this.context.resizing._rotateVertical) {
                    const percentage = contextEl.getAttribute('data-percentage');
                    if (percentage) percentY = percentage.split(',')[1];
                }

                this.plugins.resizing.resetTransform.call(this, contextEl);
                currentModule.setPercentSize.call(this, (value * 100), percentY);
                currentModule.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, pluginName));
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
    
                currentModule.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, pluginName));
                break;
            case 'onalign':
                this.plugins.resizing.openAlignMenu.call(this);
                break;
            case 'align':
                const alignValue = value === 'basic' ? 'none' : value;
                currentModule.setAlign.call(this, alignValue, null, null, null);
                currentModule.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, pluginName));
                break;
            case 'caption':
                const caption = !currentContext._captionChecked;
                currentModule.openModify.call(this, true);
                currentContext._captionChecked = currentContext.captionCheckEl.checked = caption;

                if (pluginName === 'image') {
                    currentModule.update_image.call(this, false, false, false);
                } else if (pluginName === 'video') {
                    this.context.dialog.updateModal = true;
                    currentModule.submitAction.call(this);
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
                    currentModule.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, pluginName));
                    currentModule.openModify.call(this, true);
                }

                break;
            case 'revert':
                currentModule.setOriginSize.call(this);
                currentModule.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, pluginName));
                break;
            case 'update':
                currentModule.openModify.call(this);
                this.controllersOff();
                break;
            case 'delete':
                currentModule.destroy.call(this);
                break;
        }

        // history stack
        this.history.push(false);
    },

    resetTransform: function (element) {
        const size = (element.getAttribute('data-size') || element.getAttribute('data-origin') || '').split(',');
        this.context.resizing._rotateVertical = false;

        element.style.maxWidth = '';
        element.style.transform = '';
        element.style.transformOrigin = '';
        element.setAttribute('data-rotate', '');
        element.setAttribute('data-rotateX', '');
        element.setAttribute('data-rotateY', '');

        this.plugins[this.context.resizing._resize_plugin].setSize.call(this, size[0] ? size[0] : 'auto', size[1] ? size[1] : '', true);
    },

    setTransformSize: function (element, width, height) {
        let percentage = element.getAttribute('data-percentage');
        const isVertical = this.context.resizing._rotateVertical;
        const deg = element.getAttribute('data-rotate') * 1;
        let transOrigin = '';

        if (percentage && !isVertical) {
            percentage = percentage.split(',');
            if (percentage[0] === 'auto' && percentage[1] === 'auto') {
                this.plugins[this.context.resizing._resize_plugin].setAutoSize.call(this);
            } else {
                this.plugins[this.context.resizing._resize_plugin].setPercentSize.call(this, percentage[0], percentage[1]);
            }
        } else {
            const cover = this.util.getParentElement(element, 'FIGURE');
    
            const offsetW = width || element.offsetWidth;
            const offsetH = height || element.offsetHeight;
            const w = (isVertical ? offsetH : offsetW) + 'px';
            const h = (isVertical ? offsetW : offsetH) + 'px';
    
            this.plugins[this.context.resizing._resize_plugin].cancelPercentAttr.call(this);
            this.plugins[this.context.resizing._resize_plugin].setSize.call(this, offsetW + 'px', offsetH + 'px', true);
    
            cover.style.width = w;
            cover.style.height = (!!this.context[this.context.resizing._resize_plugin]._caption ? '' : h);

            if (isVertical) {
                let transW = (offsetW/2) + 'px ' + (offsetW/2) + 'px 0';
                let transH = (offsetH/2) + 'px ' + (offsetH/2) + 'px 0';
                transOrigin = deg === 90 || deg === -270 ? transH : transW;
            }
        }

        element.style.transformOrigin = transOrigin;
        this.plugins.resizing._setTransForm(element, deg.toString(), element.getAttribute('data-rotateX') || '', element.getAttribute('data-rotateY') || '');
        
        if (isVertical) element.style.maxWidth = 'none';
        else element.style.maxWidth = '';

        this.plugins.resizing.setCaptionPosition.call(this, element);
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
            element.style.maxWidth = '';
        }
        
        element.style.transform = 'rotate(' + r + 'deg)' + (x ? ' rotateX(' + x + 'deg)' : '') + (y ? ' rotateY(' + y + 'deg)' : '') + (translate ? ' translate' + translate + '(' + width + 'px)' : '');
    },

    setCaptionPosition: function (element) {
        const figcaption = this.util.getChildElement(this.util.getParentElement(element, 'FIGURE'), 'FIGCAPTION');
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

        const pluginName = this.context.resizing._resize_plugin;
        const contextEl = this.context[pluginName]._element;
        const currentModule = this.plugins[pluginName];

        contextResizing._resizeClientX = e.clientX;
        contextResizing._resizeClientY = e.clientY;
        this.context.element.resizeBackground.style.display = 'block';
        contextResizing.resizeButton.style.display = 'none';
        contextResizing.resizeDiv.style.float = /l/.test(direction) ? 'right' : /r/.test(direction) ? 'left' : 'none';

        const closureFunc_bind = function closureFunc(e) {
            if (e.type === 'keydown' && e.keyCode !== 27) return;

            const change = contextResizing._isChange;
            contextResizing._isChange = false;

            this.removeDocEvent('mousemove', resizing_element_bind);
            this.removeDocEvent('mouseup', closureFunc_bind);
            this.removeDocEvent('keydown', closureFunc_bind);
            
            if (e.type === 'keydown') {
                this.controllersOff();
                this.context.element.resizeBackground.style.display = 'none';
                this.plugins[this.context.resizing._resize_plugin].init.call(this);
            } else {
                // element resize
                this.plugins.resizing.cancel_controller_resize.call(this);
                // history stack
                if (change) this.history.push(false);
            }
            
            currentModule.onModifyMode.call(this, contextEl, this.plugins.resizing.call_controller_resize.call(this, contextEl, contextResizing._resize_plugin));
        }.bind(this);

        const resizing_element_bind = this.plugins.resizing.resizing_element.bind(this, contextResizing, direction, this.context[contextResizing._resize_plugin]);
        this.addDocEvent('mousemove', resizing_element_bind);
        this.addDocEvent('mouseup', closureFunc_bind);
        this.addDocEvent('keydown', closureFunc_bind);
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

        if (!isVertical && !/%$/.test(w)) {
            const padding = 16;
            const limit = this.context.element.wysiwygFrame.clientWidth - (padding * 2) - 2;
            
            if (this.util.getNumber(w) > limit) {
                h = this._w.Math.round((h / w) * limit);
                w = limit;
            }
        }

        this.plugins[this.context.resizing._resize_plugin].setSize.call(this, w, h, false);
        this.plugins[this.context.resizing._resize_plugin].init.call(this);
    }
};