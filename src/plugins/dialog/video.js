/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import dialog from '../modules/dialog';
import resizing from '../modules/resizing';

export default {
    name: 'video',
    display: 'dialog',
    add: function (core) {
        core.addModule([dialog, resizing]);

        const context = core.context;
        const contextVideo = context.video = {
            _videosInfo: [],
            _videoIndex: 0,
            sizeUnit: context.option._videoSizeUnit,
            _align: 'none',
            _floatClassRegExp: '__se__float\\-[a-z]+',
            _youtubeQuery: context.option.youtubeQuery,
            _videoRatio: (context.option.videoRatio * 100) + '%',
            _defaultRatio: (context.option.videoRatio * 100) + '%',
            // @overriding resizing properties
            inputX: null,
            inputY: null,
            _container: null,
            _cover: null,
            _element: null,
            _element_w: 1,
            _element_h: 1,
            _element_l: 0,
            _element_t: 0,
            _defaultSizeX: '100%',
            _defaultSizeY: (context.option.videoRatio * 100) + '%',
            _origin_w: context.option.videoWidth === '100%' ? '' : context.option.videoWidth,
            _origin_h: context.option.videoHeight === '56.25%' ? '' : context.option.videoHeight,
            _proportionChecked: true,
            _resizing: context.option.videoResizing,
            _resizeDotHide: !context.option.videoHeightShow,
            _rotation: context.option.videoRotation,
            _onlyPercentage: context.option.videoSizeOnlyPercentage,
            _ratio: false,
            _ratioX: 1,
            _ratioY: 1,
            _captionShow: false
        };

        /** video dialog */
        let video_dialog = this.setDialog.call(core);
        contextVideo.modal = video_dialog;
        contextVideo.focusElement = video_dialog.querySelector('._se_video_url');

        /** add event listeners */
        video_dialog.querySelector('.se-btn-primary').addEventListener('click', this.submit.bind(core));

        contextVideo.proportion = {};
        contextVideo.videoRatioOption = {};
        contextVideo.inputX = {};
        contextVideo.inputY = {};
        if (context.option.videoResizing) {
            contextVideo.proportion = video_dialog.querySelector('._se_video_check_proportion');
            contextVideo.videoRatioOption = video_dialog.querySelector('.se-video-ratio');
            contextVideo.inputX = video_dialog.querySelector('._se_video_size_x');
            contextVideo.inputY = video_dialog.querySelector('._se_video_size_y');
            contextVideo.inputX.value = context.option.videoWidth;
            contextVideo.inputY.value = context.option.videoHeight;

            contextVideo.inputX.addEventListener('keyup', this.setInputSize.bind(core, 'x'));
            contextVideo.inputY.addEventListener('keyup', this.setInputSize.bind(core, 'y'));

            contextVideo.inputX.addEventListener('change', this.setRatio.bind(core));
            contextVideo.inputY.addEventListener('change', this.setRatio.bind(core));
            contextVideo.proportion.addEventListener('change', this.setRatio.bind(core));
            contextVideo.videoRatioOption.addEventListener('change', this.setVideoRatio.bind(core));

            video_dialog.querySelector('.se-dialog-btn-revert').addEventListener('click', this.sizeRevert.bind(core));
        }

        /** append html */
        context.dialog.modal.appendChild(video_dialog);

        /** empty memory */
        video_dialog = null;
    },

    /** dialog */
    setDialog: function () {
        const option = this.context.option;
        const lang = this.lang;
        const dialog = this.util.createElement('DIV');

        dialog.className = 'se-dialog-content';
        dialog.style.display = 'none';
        let html = '' +
            '<form class="editor_video">' +
                '<div class="se-dialog-header">' +
                    '<button type="button" data-command="close" class="se-btn se-dialog-close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
                        this.icons.cancel +
                    '</button>' +
                    '<span class="se-modal-title">' + lang.dialogBox.videoBox.title + '</span>' +
                '</div>' +
                '<div class="se-dialog-body">' +
                    '<div class="se-dialog-form">' +
                        '<label>' + lang.dialogBox.videoBox.url + '</label>' +
                        '<input class="se-input-form _se_video_url" type="text" />' +
                    '</div>';

            if (option.videoResizing) {
                const ratioList = option.videoRatioList || [{name: '16:9', value: 0.5625}, {name: '4:3', value: 0.75}, {name: '21:9', value: 0.4285}];
                const ratio = option.videoRatio;
                const onlyPercentage = option.videoSizeOnlyPercentage;
                const onlyPercentDisplay = onlyPercentage ? ' style="display: none !important;"' : '';
                const heightDisplay = !option.videoHeightShow ? ' style="display: none !important;"' : '';
                const ratioDisplay = !option.videoRatioShow ? ' style="display: none !important;"' : '';
                const onlyWidthDisplay = !onlyPercentage && !option.videoHeightShow && !option.videoRatioShow ? ' style="display: none !important;"' : '';
                html += '' +
                    '<div class="se-dialog-form">' +
                        '<div class="se-dialog-size-text">' +
                            '<label class="size-w">' + lang.dialogBox.width + '</label>' +
                            '<label class="se-dialog-size-x">&nbsp;</label>' +
                            '<label class="size-h"' + heightDisplay + '>' + lang.dialogBox.height + '</label>' +
                            '<label class="size-h"' + ratioDisplay + '>(' + lang.dialogBox.ratio + ')</label>' +
                        '</div>' +
                        '<input class="se-input-control _se_video_size_x" placeholder="100%"' + (onlyPercentage ? ' type="number" min="1"' : 'type="text"') + (onlyPercentage ? ' max="100"' : '') + '/>' +
                        '<label class="se-dialog-size-x"' + onlyWidthDisplay + '>' + (onlyPercentage ? '%' : 'x') + '</label>' +
                        '<input class="se-input-control _se_video_size_y" placeholder="' + (option.videoRatio * 100) + '%"' + (onlyPercentage ? ' type="number" min="1"' : 'type="text"') + (onlyPercentage ? ' max="100"' : '') + heightDisplay + '/>' +
                        '<select class="se-input-select se-video-ratio" title="' + lang.dialogBox.ratio + '"' + ratioDisplay + '>';
                            if (!heightDisplay) html += '<option value=""> - </option>';
                            for (let i = 0, len = ratioList.length; i < len; i++) {
                                html += '<option value="' + ratioList[i].value + '"' + (ratio.toString() === ratioList[i].value.toString() ? ' selected' : '') + '>' + ratioList[i].name + '</option>';
                            }
                        html += '</select>' +
                        '<button type="button" title="' + lang.dialogBox.revertButton + '" class="se-btn se-dialog-btn-revert" style="float: right;">' + this.icons.revert + '</button>' +
                    '</div>' +
                    '<div class="se-dialog-form se-dialog-form-footer"' + onlyPercentDisplay + onlyWidthDisplay + '>' +
                        '<label><input type="checkbox" class="se-dialog-btn-check _se_video_check_proportion" checked/>&nbsp;' + lang.dialogBox.proportion + '</label>' +
                    '</div>';
            }

            html += '' +
                '</div>' +
                '<div class="se-dialog-footer">' +
                    '<div>' +
                        '<label><input type="radio" name="suneditor_video_radio" class="se-dialog-btn-radio" value="none" checked>' + lang.dialogBox.basic + '</label>' +
                        '<label><input type="radio" name="suneditor_video_radio" class="se-dialog-btn-radio" value="left">' + lang.dialogBox.left + '</label>' +
                        '<label><input type="radio" name="suneditor_video_radio" class="se-dialog-btn-radio" value="center">' + lang.dialogBox.center + '</label>' +
                        '<label><input type="radio" name="suneditor_video_radio" class="se-dialog-btn-radio" value="right">' + lang.dialogBox.right + '</label>' +
                    '</div>' +
                    '<button type="submit" class="se-btn-primary" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
                '</div>' +
            '</form>';

        dialog.innerHTML = html;

        return dialog;
    },

    /**
     * @overriding dialog
     */
    open: function () {
        this.plugins.dialog.open.call(this, 'video', 'video' === this.currentControllerName);
    },
    
    setVideoRatio: function (e) {
        const contextVideo = this.context.video;
        const value = e.target.options[e.target.selectedIndex].value;

        contextVideo._defaultSizeY = contextVideo._videoRatio = !value ? contextVideo._defaultSizeY : (value * 100) + '%';
        contextVideo.inputY.placeholder = !value ? '' : (value * 100) + '%';
        contextVideo.inputY.value = '';
    },

    /**
     * @overriding resizing
     * @param {String} xy 'x': width, 'y': height
     * @param {KeyboardEvent} e Event object
     */
    setInputSize: function (xy, e) {
        if (e && e.keyCode === 32) {
            e.preventDefault();
            return;
        }

        const contextVideo = this.context.video;
        this.plugins.resizing._module_setInputSize.call(this, contextVideo, xy);

        if (xy === 'y') {
            this.plugins.video.setVideoRatioSelect.call(this, e.target.value || contextVideo._defaultRatio);
        }
    },

    /**
     * @overriding resizing
     */
    setRatio: function () {
        this.plugins.resizing._module_setRatio.call(this, this.context.video);
    },

    submitAction: function () {
        if (this.context.video.focusElement.value.trim().length === 0) return false;
        this.context.resizing._resize_plugin = 'video';

        const contextVideo = this.context.video;
        let oIframe = null;
        let cover = null;
        let container = null;
        let url = contextVideo.focusElement.value.trim();
        contextVideo._align = contextVideo.modal.querySelector('input[name="suneditor_video_radio"]:checked').value;

        /** iframe source */
        if (/^<iframe.*\/iframe>$/.test(url)) {
            oIframe = (new this._w.DOMParser()).parseFromString(url, 'text/html').querySelector('iframe');
        }
        /** url */
        else {
            oIframe = this.util.createElement('IFRAME');
            /** youtube */
            if (/youtu\.?be/.test(url)) {
                if (!/^http/.test(url)) url = 'https://' + url;
                url = url.replace('watch?v=', '');
                if (!/^\/\/.+\/embed\//.test(url)) {
                    url = url.replace(url.match(/\/\/.+\//)[0], '//www.youtube.com/embed/').replace('&', '?&');
                }

                if (contextVideo._youtubeQuery.length > 0) {
                    if (/\?/.test(url)) {
                        const splitUrl = url.split('?');
                        url = splitUrl[0] + '?' + contextVideo._youtubeQuery + '&' + splitUrl[1];
                    } else {
                        url += '?' + contextVideo._youtubeQuery;
                    }
                }
            }
            oIframe.src = url;
        }

        let init = false;
        /** update */
        if (this.context.dialog.updateModal) {
            if (contextVideo._element.src !== oIframe.src) {
                contextVideo._element.src = oIframe.src;
                init = true;
            }
            container = contextVideo._container;
            cover = this.util.getParentElement(contextVideo._element, 'FIGURE');
            oIframe = contextVideo._element;
        }
        /** create */
        else {
            init = true;
            oIframe.frameBorder = '0';
            oIframe.allowFullscreen = true;
            contextVideo._element = oIframe;

            /** cover */
            cover = this.plugins.resizing.set_cover.call(this, oIframe);

            /** container */
            container = this.plugins.resizing.set_container.call(this, cover, 'se-video-container');
        }

        /** rendering */
        contextVideo._cover = cover;
        contextVideo._container = container;

        const inputUpdate = (this.plugins.resizing._module_getSizeX.call(this, contextVideo) !== (contextVideo.inputX.value || contextVideo._defaultSizeX)) || (this.plugins.resizing._module_getSizeY.call(this, contextVideo) !== (contextVideo.inputY.value || contextVideo._videoRatio));
        const changeSize = !this.context.dialog.updateModal || inputUpdate;

        if (contextVideo._resizing) {
            this.context.video._proportionChecked = contextVideo.proportion.checked;
            oIframe.setAttribute('data-proportion', contextVideo._proportionChecked);
        }

        // size
        let isPercent = false;
        if (changeSize) {
            isPercent = this.plugins.video.applySize.call(this);
        }

        // align
        if (!(isPercent && contextVideo._align === 'center')) {
            this.plugins.video.setAlign.call(this, null, oIframe, cover, container);
        }

        if (!this.context.dialog.updateModal) {
            this.insertComponent(container, false);
        } else if (contextVideo._resizing && this.context.resizing._rotateVertical && changeSize) {
            this.plugins.resizing.setTransformSize.call(this, oIframe, null, null);
        }

        if (init) {
            this.plugins.video.setVideosInfo.call(this, oIframe);
        }

        this.context.resizing._resize_plugin = '';

        // history stack
        if (this.context.dialog.updateModal) {
            this.history.push(false);
        }
    },

    submit: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        try {
            this.plugins.video.submitAction.call(this);
        } finally {
            this.plugins.dialog.close.call(this);
            this.closeLoading();
        }

        this.focus();

        return false;
    },

    _update_videoCover: function (oIframe) {
        if (!oIframe) return;

        const contextVideo = this.context.video;
        oIframe.frameBorder = '0';
        oIframe.allowFullscreen = true;
        
        const existElement = this.util.getParentElement(oIframe, this.util.isMediaComponent) || 
            this.util.getParentElement(oIframe, function (current) {
                return this.isWysiwygDiv(current.parentNode);
            }.bind(this.util));

        contextVideo._element = oIframe = oIframe.cloneNode(false);
        const cover = contextVideo._cover = this.plugins.resizing.set_cover.call(this, oIframe);
        const container = contextVideo._container = this.plugins.resizing.set_container.call(this, cover, 'se-video-container');

        const figcaption = existElement.querySelector('figcaption');
        let caption = null;
        if (!!figcaption) {
            caption = this.util.createElement('DIV');
            caption.innerHTML = figcaption.innerHTML;
            this.util.removeItem(figcaption);
        }

        const size = (oIframe.getAttribute('data-size') || oIframe.getAttribute('data-origin') || '').split(',');
        this.plugins.video.applySize.call(this, (size[0] || this.context.option.videoWidth), (size[1] || this.context.option.videoHeight));

        existElement.parentNode.replaceChild(container, existElement);
        if (!!caption) existElement.parentNode.insertBefore(caption, container.nextElementSibling);
        this.plugins.video.setVideosInfo.call(this, oIframe);
    },

    /**
     * @overriding resizing
     */
    onModifyMode: function (element, size) {
        const contextVideo = this.context.video;
        contextVideo._element = element;
        contextVideo._cover = this.util.getParentElement(element, 'FIGURE');
        contextVideo._container = this.util.getParentElement(element, this.util.isMediaComponent);

        contextVideo._align = element.getAttribute('data-align') || 'none';

        if (size) {
            contextVideo._element_w = size.w;
            contextVideo._element_h = size.h;
            contextVideo._element_t = size.t;
            contextVideo._element_l = size.l;
        }

        let origin = contextVideo._element.getAttribute('data-size') || contextVideo._element.getAttribute('data-origin');
        if (origin) {
            origin = origin.split(',');
            contextVideo._origin_w = origin[0];
            contextVideo._origin_h = origin[1];
        } else if (size) {
            contextVideo._origin_w = size.w;
            contextVideo._origin_h = size.h;
        }
    },

    /**
     * @overriding resizing
     */
    openModify: function (notOpen) {
        const contextVideo = this.context.video;

        contextVideo.focusElement.value = contextVideo._element.src;
        contextVideo.modal.querySelector('input[name="suneditor_video_radio"][value="' + contextVideo._align + '"]').checked = true;

        if (contextVideo._resizing) {
            this.plugins.resizing._module_setModifyInputSize.call(this, contextVideo, this.plugins.video);
            
            const y = contextVideo._videoRatio = this.plugins.resizing._module_getSizeY.call(this, contextVideo);
            const ratioSelected = this.plugins.video.setVideoRatioSelect.call(this, y);
            if (!ratioSelected) contextVideo.inputY.value = contextVideo._onlyPercentage ? this.util.getNumber(y, 2) : y;
        }

        if (!notOpen) this.plugins.dialog.open.call(this, 'video', true);
    },

    /**
     * @overriding dialog
     */
    on: function (update) {
        const contextVideo = this.context.video;

        if (!update) {
            contextVideo.inputX.value = contextVideo._origin_w = this.context.option.videoWidth === contextVideo._defaultSizeX ? '' : this.context.option.videoWidth;
            contextVideo.inputY.value = contextVideo._origin_h = this.context.option.videoHeight === contextVideo._defaultSizeY ? '' : this.context.option.videoHeight;
            contextVideo.proportion.disabled = true;
        }

        if (contextVideo._resizing) {
            this.plugins.video.setVideoRatioSelect.call(this, contextVideo._origin_h || contextVideo._defaultRatio);
        }
    },
    
    setVideoRatioSelect: function (value) {
        let ratioSelected = false;
        const contextVideo = this.context.video;
        const ratioOptions = contextVideo.videoRatioOption.options;

        if (/%$/.test(value) || contextVideo._onlyPercentage) value = (this.util.getNumber(value, 2) / 100) + '';
        else if (!this.util.isNumber(value) || (value * 1) >= 1) value = '';

        contextVideo.inputY.placeholder = '';
        for (let i = 0, len = ratioOptions.length; i < len; i++) {
            if (ratioOptions[i].value === value) {
                ratioSelected = ratioOptions[i].selected = true;
                contextVideo.inputY.placeholder = !value ? '' : (value * 100) + '%';
            }
            else ratioOptions[i].selected = false;
        }

        return ratioSelected;
    },

    setVideosInfo: function (frame) {
        const _resize_plugin = this.context.resizing._resize_plugin;
        this.context.resizing._resize_plugin = 'video';

        const videosInfo = this.context.video._videosInfo;
        let dataIndex = frame.getAttribute('data-index');
        let info = null;
        let state = '';

        // create
        if (!dataIndex || this._componentsInfoInit) {
            state = 'create';
            dataIndex = this.context.video._videoIndex++;

            frame.setAttribute('data-index', dataIndex);

            info = {
                src: frame.src,
                index: dataIndex * 1
            };

            videosInfo.push(info);
        } else { // update
            state = 'update';
            dataIndex *= 1;
    
            for (let i = 0, len = videosInfo.length; i < len; i++) {
                if (dataIndex === videosInfo[i].index) {
                    info = videosInfo[i];
                    break;
                }
            }

            if (!info) {
                dataIndex = this.context.video._videoIndex++;
                info = { index: dataIndex };
                videosInfo.push(info);
            }

            info.src = frame.src;
        }

        // method bind
        info.element = frame;
        info.delete = this.plugins.video.destroy.bind(this, frame);
        info.select = function () {
            frame.scrollIntoView(true);
            this._w.setTimeout(function () {
                this.plugins.video.onModifyMode.call(this, frame, this.plugins.resizing.call_controller_resize.call(this, frame, 'video'));
            }.bind(this));
        }.bind(this);

        if (!frame.getAttribute('data-origin')) {
            const container = this.util.getParentElement(frame, this.util.isMediaComponent);
            const cover = this.util.getParentElement(frame, 'FIGURE');

            const w = this.plugins.resizing._module_getSizeX.call(this, this.context.video, frame, cover, container);
            const h = this.plugins.resizing._module_getSizeY.call(this, this.context.video, frame, cover, container);
            
            frame.setAttribute('data-origin', w + ',' + h);
            frame.setAttribute('data-size', w + ',' + h);
        }

        if (!frame.style.width) {
            const size = (frame.getAttribute('data-size') || frame.getAttribute('data-origin') || '').split(',');
            this.plugins.video.onModifyMode.call(this, frame, null);
            this.plugins.video.applySize.call(this, (size[0] || this.context.option.videoWidth), (size[1] || this.context.option.videoHeight));
        }

        this.context.resizing._resize_plugin = _resize_plugin;
        this._videoUpload(frame, dataIndex, state, info, 0);
    },

    /**
     * @overriding core
     */
    checkComponentInfo: function () {
        const videos = [].slice.call(this.context.element.wysiwyg.getElementsByTagName('IFRAME'));
        const videoPlugin = this.plugins.video;
        const videosInfo = this.context.video._videosInfo;

        if (videos.length === videosInfo.length) {
            // reset
            if (this._componentsInfoReset) {
                for (let i = 0, len = videos.length, frame; i < len; i++) {
                    frame = videos[i];
                    videoPlugin.setVideosInfo.call(this, frame);
                }
                return;
            } else {
                let infoUpdate = false;
                for (let i = 0, len = videosInfo.length, info; i < len; i++) {
                    info = videosInfo[i];
                    if (videos.filter(function (frame) { return info.src === frame.src && info.index.toString() === frame.getAttribute('data-index'); }).length === 0) {
                        infoUpdate = true;
                        break;
                    }
                }
                // pass
                if (!infoUpdate) return;
            }
        }

        const _resize_plugin = this.context.resizing._resize_plugin;
        this.context.resizing._resize_plugin = 'video';
        const currentVideos = [];
        const infoIndex = [];
        for (let i = 0, len = videosInfo.length; i < len; i++) {
            infoIndex[i] = videosInfo[i].index;
        }

        for (let i = 0, len = videos.length, video, container; i < len; i++) {
            video = videos[i];
            container = this.util.getParentElement(video, this.util.isMediaComponent);
            if (!container || container.getElementsByTagName('figcaption').length > 0) {
                currentVideos.push(this.context.video._videoIndex);
                videoPlugin._update_videoCover.call(this, video);
            } else if (!video.getAttribute('data-index') || infoIndex.indexOf(video.getAttribute('data-index') * 1) < 0) {
                currentVideos.push(this.context.video._videoIndex);
                video.removeAttribute('data-index');
                videoPlugin.setVideosInfo.call(this, video);
            } else {
                currentVideos.push(video.getAttribute('data-index') * 1);
            }
        }

        for (let i = 0, dataIndex; i < videosInfo.length; i++) {
            dataIndex = videosInfo[i].index;
            if (currentVideos.indexOf(dataIndex) > -1) continue;

            videosInfo.splice(i, 1);
            this._videoUpload(null, dataIndex, 'delete', null, 0);
            i--;
        }

        this.context.resizing._resize_plugin = _resize_plugin;
    },

    /**
     * @overriding core
     */
    resetComponentInfo: function () {
        this.context.video._videosInfo = [];
        this.context.video._videoIndex = 0;
    },

    sizeRevert: function () {
        this.plugins.resizing._module_sizeRevert.call(this, this.context.video);
    },

    applySize: function (w, h) {
        const contextVideo = this.context.video;

        if (!w) w = contextVideo.inputX.value;
        if (!h) h = contextVideo.inputY.value;
        
        if (contextVideo._onlyPercentage || /%$/.test(w) || !w) {
            this.plugins.video.setPercentSize.call(this, (w || '100%'), (h || (/%$/.test(contextVideo._videoRatio) ? contextVideo._videoRatio : contextVideo._defaultRatio)));
            return true;
        } else if ((!w || w === 'auto') && (!h || h === 'auto')) {
            this.plugins.video.setAutoSize.call(this);
        } else {
            this.plugins.video.setSize.call(this, w, (h || contextVideo._videoRatio || contextVideo._defaultRatio), false);
        }

        return false;
    },

    /**
     * @overriding resizing
     */
    setSize: function (w, h, notResetPercentage, direction) {
        const contextVideo = this.context.video;
        const onlyW = /^(rw|lw)$/.test(direction);
        const onlyH = /^(th|bh)$/.test(direction);

        if (!onlyH) w = this.util.getNumber(w, 0);
        if (!onlyW) h = this.util.isNumber(h) ? h + contextVideo.sizeUnit : !h ? '' : h;

        if (!onlyH) contextVideo._element.style.width = w ? w + contextVideo.sizeUnit : '';
        if (!onlyW) contextVideo._cover.style.paddingBottom = contextVideo._cover.style.height = h;

        if (!onlyH && !/%$/.test(w)) {
            contextVideo._cover.style.width = '';
            contextVideo._container.style.width = '';
        }

        if (!onlyW && !/%$/.test(h)) {
            contextVideo._element.style.height = h;
        } else {
            contextVideo._element.style.height = '';
        }

        if (!notResetPercentage) contextVideo._element.removeAttribute('data-percentage');

        // save current size
        this.plugins.resizing._module_saveCurrentSize.call(this, contextVideo);
    },

    /**
     * @overriding resizing
     */
    setAutoSize: function () {
        this.plugins.video.setPercentSize.call(this, 100, this.context.video._defaultRatio);
    },

    /**
     * @overriding resizing
     */
    setOriginSize: function (dataSize) {
        const contextVideo = this.context.video;
        contextVideo._element.removeAttribute('data-percentage');

        this.plugins.resizing.resetTransform.call(this, contextVideo._element);
        this.plugins.video.cancelPercentAttr.call(this);

        const originSize = ((dataSize ? contextVideo._element.getAttribute('data-size') : '') || contextVideo._element.getAttribute('data-origin') || '').split(',');
        
        if (originSize) {
            const w = originSize[0];
            const h = originSize[1];

            if (contextVideo._onlyPercentage || (/%$/.test(w) && (/%$/.test(h) || !/\d/.test(h)))) {
                this.plugins.video.setPercentSize.call(this, w, h);
            } else {
                this.plugins.video.setSize.call(this, w, h);
            }

            // save current size
            this.plugins.resizing._module_saveCurrentSize.call(this, contextVideo);
        }
    },

    /**
     * @overriding resizing
     */
    setPercentSize: function (w, h) {
        const contextVideo = this.context.video;
        h = !!h && !/%$/.test(h) && !this.util.getNumber(h, 0) ? this.util.isNumber(h) ? h + '%' : h : this.util.isNumber(h) ? h + contextVideo.sizeUnit : (h || contextVideo._defaultRatio);

        contextVideo._container.style.width = this.util.isNumber(w) ? w + '%' : w;
        contextVideo._container.style.height = '';
        contextVideo._cover.style.width = '100%';
        contextVideo._cover.style.height = h;
        contextVideo._cover.style.paddingBottom = h;
        contextVideo._element.style.width = '100%';
        contextVideo._element.style.height = '100%';
        contextVideo._element.style.maxWidth = '';

        if (contextVideo._align === 'center') this.plugins.video.setAlign.call(this, null, null, null, null);
        contextVideo._element.setAttribute('data-percentage', w + ',' + h);

        // save current size
        this.plugins.resizing._module_saveCurrentSize.call(this, contextVideo);
    },

    /**
     * @overriding resizing
     */
    cancelPercentAttr: function () {
        const contextVideo = this.context.video;
        
        contextVideo._cover.style.width = '';
        contextVideo._cover.style.height = '';
        contextVideo._cover.style.paddingBottom = '';
        contextVideo._container.style.width = '';
        contextVideo._container.style.height = '';

        this.util.removeClass(contextVideo._container, this.context.video._floatClassRegExp);
        this.util.addClass(contextVideo._container, '__se__float-' + contextVideo._align);

        if (contextVideo._align === 'center') this.plugins.video.setAlign.call(this, null, null, null, null);
    },

    /**
     * @overriding resizing
     */
    setAlign: function (align, element, cover, container) {
        const contextVideo = this.context.video;
        
        if (!align) align = contextVideo._align;
        if (!element) element = contextVideo._element;
        if (!cover) cover = contextVideo._cover;
        if (!container) container = contextVideo._container;

        if (align && align !== 'none') {
            cover.style.margin = 'auto';
        } else {
            cover.style.margin = '0';
        }

        if (/%$/.test(element.style.width) && align === 'center') {
            container.style.minWidth = '100%';
            cover.style.width = container.style.width;
            cover.style.height = cover.style.height;
            cover.style.paddingBottom = !/%$/.test(cover.style.height) ? cover.style.height : this.util.getNumber((this.util.getNumber(cover.style.height, 2) / 100) * this.util.getNumber(cover.style.width, 2), 2) + '%';
        } else {
            container.style.minWidth = '';
            cover.style.width = this.context.resizing._rotateVertical ? (element.style.height || element.offsetHeight) : (element.style.width || '100%');
            cover.style.paddingBottom = cover.style.height;
        }

        if (!this.util.hasClass(container, '__se__float-' + align)) {
            this.util.removeClass(container, contextVideo._floatClassRegExp);
            this.util.addClass(container, '__se__float-' + align);
        }
        
        element.setAttribute('data-align', align);
    },

    resetAlign: function () {
        const contextVideo = this.context.video;

        contextVideo._element.setAttribute('data-align', '');
        contextVideo._align = 'none';
        contextVideo._cover.style.margin = '0';
        this.util.removeClass(contextVideo._container, contextVideo._floatClassRegExp);
    },

    /**
     * @overriding resizing
     */
    destroy: function (element) {
        const frame = element || this.context.video._element;
        const container = this.context.video._container;
        const dataIndex = frame.getAttribute('data-index') * 1;
        let focusEl = (container.previousElementSibling || container.nextElementSibling);

        const emptyDiv = container.parentNode;
        this.util.removeItem(container);
        this.plugins.video.init.call(this);
        this.controllersOff();

        if (emptyDiv !== this.context.element.wysiwyg) this.util.removeItemAllParents(emptyDiv, function (current) { return current.childNodes.length === 0; }, null);

        // focus
        this.focusEdge(focusEl);

        // event
        if (dataIndex >= 0) {
            const videosInfo = this.context.video._videosInfo;

            for (let i = 0, len = videosInfo.length; i < len; i++) {
                if (dataIndex === videosInfo[i].index) {
                    videosInfo.splice(i, 1);
                    this._videoUpload(null, dataIndex, 'delete', null, 0);
                    break;
                }
            }
        }

        // history stack
        this.history.push(false);
    },

    /**
     * @overriding dialog
     */
    init: function () {
        const contextVideo = this.context.video;
        contextVideo.focusElement.value = '';
        contextVideo._origin_w = this.context.option.videoWidth;
        contextVideo._origin_h = this.context.option.videoHeight;

        contextVideo.modal.querySelector('input[name="suneditor_video_radio"][value="none"]').checked = true;
        
        if (contextVideo._resizing) {
            contextVideo.inputX.value = this.context.option.videoWidth === contextVideo._defaultSizeX ? '' : this.context.option.videoWidth;
            contextVideo.inputY.value = this.context.option.videoHeight === contextVideo._defaultSizeY ? '' : this.context.option.videoHeight;
            contextVideo.proportion.checked = true;
            contextVideo.proportion.disabled = true;
            this.plugins.video.setVideoRatioSelect.call(this, contextVideo._defaultRatio);
        }
    }
};
