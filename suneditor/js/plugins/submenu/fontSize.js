/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.fontSize = {
    add: function (_this, targetElement) {
        /** set submenu */
        var listDiv = eval(this.setSubmenu(_this.context.user));

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
    },

    setSubmenu: function (user) {
        var listDiv = document.createElement('DIV');
        listDiv.className = 'layer_editor layer_size';
        listDiv.style.display = 'none';

        var sizeList = !user.fontSizeList ? [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72] : user.fontSizeList;

        var list = '<div class="inner_layer">' +
            '   <ul class="list_editor font_size_list">';
        for (var i = 0; i < sizeList.length; i++) {
            var size = sizeList[i];
            list += '<li><button type="button" class="btn_edit" data-value="' + size + '" style="font-size:' + size + 'pt;">' + size + '</button></li>';
        }
        list += '   </ul>' +
            '</div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    removeChildTag: function (element, nodeName, fontsize) {
        var sNode = document.createElement('SPAN');
        sNode.style.fontSize = fontsize;

        (function recursionFunc(current, node) {
            var childNode = current.childNodes;

            for (var i = 0; i < childNode.length; i++) {
                var child = childNode[i];
                if (child.nodeName !== nodeName) {
                    node.appendChild(child);
                }
                recursionFunc(child, child);
            }

            if(node.length > 0 && sNode !== node) sNode.appendChild(node);
        })(element, sNode);

        return sNode;
    },

    appendSpan: function (fontsize) {
        fontsize = fontsize + "pt";

        var nativeRng = this.getRange();
        var startCon = nativeRng.startContainer;
        var startOff = nativeRng.startOffset;
        var endCon = nativeRng.endContainer;
        var endOff = nativeRng.endOffset;
        var commonCon = nativeRng.commonAncestorContainer;

        var lineNodesP = SUNEDITOR.dom.getListChildren(commonCon, function (current) { return /BODY/i.test(current.parentNode.nodeName); });

        for (var i = 0; i < lineNodesP.length; i++) {
            var newNode = SUNEDITOR.plugin.fontSize.removeChildTag(lineNodesP[i], 'SPAN', fontsize);
            lineNodesP[i].innerHTML = '';
            lineNodesP[i].appendChild(newNode);
        }
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (!/^BUTTON$/i.test(e.target.tagName)) {
            return false;
        }

        this.focus();
        SUNEDITOR.plugin.fontSize.appendSpan.call(this, e.target.getAttribute('data-value'));
        this.submenuOff();
    }
};