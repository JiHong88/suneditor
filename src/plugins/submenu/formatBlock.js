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
        let listDiv = this.setSubmenu.call(core);

        /** add event listeners */
        listDiv.querySelector('ul').addEventListener('click', this.pickUp.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const lang = this.lang;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'se-submenu se-list-layer';
        listDiv.style.display = 'none';
        listDiv.innerHTML = '' +
            '<div class="se-list-inner">' +
            '   <ul class="se-list-basic se-list-format">' +
            '       <li><button type="button" class="se-btn-list" data-command="replace" data-value="P" title="' + lang.toolbar.tag_p + '"><span class="p_ex">' + lang.toolbar.tag_p + '</span></button></li>' +
            '       <li><button type="button" class="se-btn-list" data-command="replace" data-value="DIV" title="' + lang.toolbar.tag_div + '"><span class="div_ex">' + lang.toolbar.tag_div + '</span></button></li>' +
            '       <li><button type="button" class="se-btn-list" data-command="range" data-value="BLOCKQUOTE" title="' + lang.toolbar.tag_quote + '">' +
            '               <blockquote class="quote_ex">' + lang.toolbar.tag_quote + '</blockquote>' +
            '           </button>' +
            '       </li>' +
            '       <li><button type="button" class="se-btn-list" data-command="range" data-value="PRE" title="' + lang.toolbar.pre + '">' +
            '               <pre class="pre_ex">' + lang.toolbar.pre + '</pre>' +
            '           </button>' +
            '       </li>' +
            '       <li><button type="button" class="se-btn-list" data-command="replace" data-value="H1" title="' + lang.toolbar.tag_h + ' 1" style="height:40px;"><span class="h1_ex">' + lang.toolbar.tag_h + ' 1</span></button></li>' +
            '       <li><button type="button" class="se-btn-list" data-command="replace" data-value="H2" title="' + lang.toolbar.tag_h + ' 2" style="height:34px;"><span class="h2_ex">' + lang.toolbar.tag_h + ' 2</span></button></li>' +
            '       <li><button type="button" class="se-btn-list" data-command="replace" data-value="H3" title="' + lang.toolbar.tag_h + ' 3" style="height:26px;"><span class="h3_ex">' + lang.toolbar.tag_h + ' 3</span></button></li>' +
            '       <li><button type="button" class="se-btn-list" data-command="replace" data-value="H4" title="' + lang.toolbar.tag_h + ' 4" style="height:23px;"><span class="h4_ex">' + lang.toolbar.tag_h + ' 4</span></button></li>' +
            '       <li><button type="button" class="se-btn-list" data-command="replace" data-value="H5" title="' + lang.toolbar.tag_h + ' 5" style="height:19px;"><span class="h5_ex">' + lang.toolbar.tag_h + ' 5</span></button></li>' +
            '       <li><button type="button" class="se-btn-list" data-command="replace" data-value="H6" title="' + lang.toolbar.tag_h + ' 6" style="height:15px;"><span class="h6_ex">' + lang.toolbar.tag_h + ' 6</span></button></li>' +
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
            this.applyRangeFormatElement(rangeElement);
        }
        // others
        else {
            const range = this.getRange();
            const startOffset = range.startOffset;
            const endOffset = range.endOffset;

            let selectedFormsts = this.getSelectedElementsAndComponents();
            if (selectedFormsts.length === 0) return;

            let first = selectedFormsts[0];
            let last = selectedFormsts[selectedFormsts.length - 1];
            const firstPath = this.util.getNodePath(range.startContainer, first);
            const lastPath = this.util.getNodePath(range.endContainer, last);
            
            // remove list
            let rangeArr = {};
            let listFirst = false;
            let listLast = false;
            const passComponent = function (current) { return !this.isComponent(current); }.bind(this.util);
            for (let i = 0, len = selectedFormsts.length, r, o, lastIndex, isList; i < len; i++) {
                lastIndex = i === len - 1;
                o = this.util.getRangeFormatElement(selectedFormsts[i], passComponent);
                isList = this.util.isList(o);
                if (!r && isList) {
                    r = o;
                    rangeArr = {r: r, f: [this.util.getParentElement(selectedFormsts[i], 'LI')]};
                    if (i === 0) listFirst = true;
                } else if (r && isList) {
                    if (r !== o) {
                        const edge = this.detachRangeFormatElement(rangeArr.r, rangeArr.f, null, false, true);
                        if (listFirst) {
                            first = edge.sc;
                            listFirst = false;
                        }
                        if (lastIndex) last = edge.ec;

                        if (isList) {
                            r = o;
                            rangeArr = {r: r, f: [this.util.getParentElement(selectedFormsts[i], 'LI')]};
                            if (lastIndex) listLast = true;
                        } else {
                            r = null;
                        }
                    } else {
                        rangeArr.f.push(this.util.getParentElement(selectedFormsts[i], 'LI'));
                        if (lastIndex) listLast = true;
                    }
                }

                if (lastIndex && this.util.isList(r)) {
                    const edge = this.detachRangeFormatElement(rangeArr.r, rangeArr.f, null, false, true);
                    if (listLast || len === 1) {
                        last = edge.ec;
                        if (listFirst) first = edge.sc || last;
                    }
                }
            }

            // change format tag
            this.setRange(this.util.getNodeFromPath(firstPath, first), startOffset, this.util.getNodeFromPath(lastPath, last), endOffset);
            selectedFormsts = this.getSelectedElementsAndComponents();
            for (let i = 0, len = selectedFormsts.length, node, newFormat; i < len; i++) {
                node = selectedFormsts[i];
                
                if (node.nodeName !== value && !this.util.isComponent(node)) {
                    newFormat = this.util.createElement(value);
                    newFormat.innerHTML = node.innerHTML;
                    node.parentNode.insertBefore(newFormat, node);
                    this.util.removeItem(node);
                }

                if (i === 0) first = newFormat || node;
                if (i === len - 1) last = newFormat || node;
                newFormat = null;
            }

            this.setRange(this.util.getNodeFromPath(firstPath, first), startOffset, this.util.getNodeFromPath(lastPath, last), endOffset);
            // history stack
            this.history.push();
        }

        this.submenuOff();
    }
};
