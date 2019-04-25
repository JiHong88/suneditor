/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'formatBlock',
    add: function (core, targetElement) {
        /** set submenu */
        let listDiv = eval(this.setSubmenu.call(core));

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickUp.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const lang = this.lang;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'sun-editor-submenu layer_editor layer_block';
        listDiv.style.display = 'none';
        listDiv.innerHTML = '' +
            '<div class="inner_layer">' +
            '   <ul class="list_editor format_list">' +
            '       <li><button type="button" class="btn_edit" data-command="replace" data-value="P" title="' + lang.toolbar.tag_p + '"><p style="font-size:13px; height:22px; line-height:1.5;">' + lang.toolbar.tag_p + '</p></button></li>' +
            '       <li><button type="button" class="btn_edit" data-command="replace" data-value="DIV" title="' + lang.toolbar.tag_div + '"><div style="font-size:13px; height:22px; line-height:1.5;">' + lang.toolbar.tag_div + '</div></button></li>' +
            '       <li><button type="button" class="btn_edit" data-command="range" data-value="BLOCKQUOTE" title="' + lang.toolbar.tag_quote + '">' +
            '               <blockquote class="quote_ex">' + lang.toolbar.tag_quote + '</blockquote>' +
            '           </button>' +
            '       </li>' +
            '       <li><button type="button" class="btn_edit" data-command="range" data-value="PRE" title="' + lang.toolbar.pre + '">' +
            '               <pre class="pre_ex">' + lang.toolbar.pre + '</pre>' +
            '           </button>' +
            '       </li>' +
            '       <li><button type="button" class="btn_edit" data-command="replace" data-value="H1" title="' + lang.toolbar.tag_h + ' 1" style="height:40px;"><h1>' + lang.toolbar.tag_h + ' 1</h1></button></li>' +
            '       <li><button type="button" class="btn_edit" data-command="replace" data-value="H2" title="' + lang.toolbar.tag_h + ' 2" style="height:34px;"><h2>' + lang.toolbar.tag_h + ' 2</h2></button></li>' +
            '       <li><button type="button" class="btn_edit" data-command="replace" data-value="H3" title="' + lang.toolbar.tag_h + ' 3" style="height:26px;"><h3>' + lang.toolbar.tag_h + ' 3</h3></button></li>' +
            '       <li><button type="button" class="btn_edit" data-command="replace" data-value="H4" title="' + lang.toolbar.tag_h + ' 4" style="height:23px;"><h4>' + lang.toolbar.tag_h + ' 4</h4></button></li>' +
            '       <li><button type="button" class="btn_edit" data-command="replace" data-value="H5" title="' + lang.toolbar.tag_h + ' 5" style="height:19px;"><h5>' + lang.toolbar.tag_h + ' 5</h5></button></li>' +
            '       <li><button type="button" class="btn_edit" data-command="replace" data-value="H6" title="' + lang.toolbar.tag_h + ' 6" style="height:15px;"><h6>' + lang.toolbar.tag_h + ' 6</h6></button></li>' +
            '   </ul>' +
            '</div>';

        return listDiv;
    },

    pickUp: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let target = e.target;
        let command = null, value = null;
        
        while (!command && !/UL/i.test(target.tagName)) {
            command = target.getAttribute('data-command');
            value = target.getAttribute('data-value');
            target = target.parentNode;
        }

        if (!command || !value) return;

        // blockquote, pre
        if (command === 'range') {
            const rangeElement = this.util.createElement(value);
            this.wrapToTags(rangeElement);
            this.setRange(rangeElement.firstChild, 0, rangeElement.firstChild, 0);
            this.appendFormatTag(rangeElement, this.util.isCell(this.getSelectionNode()) ? 'DIV' : '');
        }
        // others
        else {
            this.execCommand('formatBlock', false, value);
        }

        this.submenuOff();
        this.focus();
    }
};
