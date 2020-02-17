/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'blockquote',
    command: 'command',
    add: function (core, targetElement) {
        const context = core.context;
        context.blockquote = {
            commandButton: targetElement,
            tag: core.util.createElement('BLOCKQUOTE')
        };
    },

    action: function () {
        const currentBlockquote = this.util.getParentElement(this.getSelectionNode(), 'blockquote');

        if (currentBlockquote) {
            this.detachRangeFormatElement(currentBlockquote, this.getSelectedElements(), null, false, false);
        } else {
            this.applyRangeFormatElement(this.context.blockquote.tag.cloneNode(false));
        }
    },

    active: function (element) {
        if (!!element && /blockquote/i.test(element.nodeName)) {
            this.util.addClass(this.context.blockquote.commandButton, 'active');
            return true;
        } else {
            this.util.removeClass(this.context.blockquote.commandButton, 'active');
            return false;
        }
    }
};