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
            title: core.lang.toolbar.imageGallery, // @Required @Override fileBrowser - File browser window title.
            url: core.options.imageGalleryUrl, // @Required @Override fileBrowser - File server url.
            header: core.options.imageGalleryHeader, // @Required @Override fileBrowser - File server http header.
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
     *      { src: "image src", name: "name(@option)", alt: "image alt(@option)", tag: "tag name(@option)" }
     * ]
     * @param {Object} item Item of the response data's array
     */
    drawItems: function (item) {
        const srcName = item.src.split('/').pop();
        return  '<div class="se-file-item-img"><img src="' + (item.thumbnail || item.src) + '" alt="' + (item.alt || srcName) + '" data-command="pick" data-value="' + (item.src || item.thumbnail) + '">' +
                    '<div class="se-file-img-name se-file-name-back"></div>' +
                    '<div class="se-file-img-name __se__img_name">' + (item.name || srcName) + '</div>' +
                '</div>';
    },

    setImage: function (target) {
        this.callPlugin('image', function () {
            const file = {name: target.parentNode.querySelector('.__se__img_name').textContent, size: 0};
            this.plugins.image.create_image.call(this, target.getAttribute('data-value'), null, this.context.image._origin_w, this.context.image._origin_h, 'none', file, target.alt);
        }.bind(this), null);
    }
};