/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import fileBrowser from '../modules/fileBrowser';

export default {
    name: 'imageGallery',
    /**
     * @description Constructor
     * @param {Object} core Core object 
     */
    add: function (core) {
        core.addModule([fileBrowser]);

        const context = core.context;
        context.imageGallery = {
            listClass: 'se-image-list',
            itemTemplate: '<div class="se-file-item-img"><img src="${src}"></div>',
            url: context.options.imageGalleryUrl,
            selectorHandler: this.setImage.bind(core)
        };
    },
    
    /**
     * @Required @Override fileBrowser
     */
    open: function (selectorHandler) {
        this.plugins.fileBrowser.open.call(this, 'imageGallery', selectorHandler);
    },

    setImage: function (target) {
        this.callPlugin('image', this.plugins.image.create_image.bind(this, target.src, '', false, this.context.image._origin_w, this.context.image._origin_h, 'none', null), null);
    }
};