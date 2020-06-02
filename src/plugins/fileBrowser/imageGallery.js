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
            url: context.options.imageGalleryUrl, // @Required @Override fileBrowser - File server url.
            listClass: 'se-image-list', // @Required @Override fileBrowser - Class name of list div.
            itemTemplateHandler: this.drawItems, // @Required @Override fileBrowser - Function that defines the HTML of an file item.
            selectorHandler: this.setImage.bind(core), // @Required @Override fileBrowser - Function that action when item click.
            columnSize: 4 // @Option @Override fileBrowser - Number of "div.se-file-item-column" to be created (default: 4)
        };
    },
    
    /**
     * @Required @Override fileBrowser
     * @description Open a file browser.
     * @param {Function|null} selectorHandler When the function comes as an argument value, it substitutes "context.selectorHandler".
     */
    open: function (selectorHandler) {
        this.plugins.fileBrowser.open.call(this, 'imageGallery', selectorHandler);
    },

    /**
     * @Required @Override fileBrowser
     * @description Define the HTML of the item to be put in "div.se-file-item-column".
     * Format: [
     *      { src: "image src", alt: "image alt(@option)", tag: "tag name(@option)" }
     * ]
     * @param {Object} item Item of the response data's array
     */
    drawItems: function (item) {
        return  '<div class="se-file-item-img"><img src="' + item.src + '" alt="' + (item.alt || item.src.split('/').pop()) + '" data-command="pick"></div>';
    },

    setImage: function (target) {
        this.callPlugin('image', this.plugins.image.create_image.bind(this, target.src, '', false, this.context.image._origin_w, this.context.image._origin_h, 'none', null), null);
    }
};