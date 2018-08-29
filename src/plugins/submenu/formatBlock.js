/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.formatBlock = {
    add: function (_this, targetElement) {
        /** set submenu */
        let listDiv = eval(this.setSubmenu());

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickUp.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const lang = SUNEDITOR.lang;
        const listDiv = document.createElement('DIV');

        listDiv.className = 'layer_editor layer_size';
        listDiv.style.display = 'none';
        listDiv.innerHTML = '' +
            '<div class="inner_layer">' +
            '   <ul class="list_editor format_list">' +
            '       <li style="border-bottom:1px solid #dedede;"><button type="button" class="btn_edit" data-value="P" style="height:24px;"><span style="font-size:13px;">' + lang.toolbar.tag_p + '</span></button></li>' +
            '       <li><button type="button" class="btn_edit" data-value="DIV" style="height:24px; border-bottom:1px solid #dedede;"><span style="font-size:13px;">' + lang.toolbar.tag_div + '</span></button></li>' +
            '       <li><button type="button" class="btn_edit" data-value="H1" style="height:45px;"><h1>' + lang.toolbar.tag_h + ' 1</h1></button></li>' +
            '       <li><button type="button" class="btn_edit" data-value="H2" style="height:34px;"><h2>' + lang.toolbar.tag_h + ' 2</h2></button></li>' +
            '       <li><button type="button" class="btn_edit" data-value="H3" style="height:26px;"><h3>' + lang.toolbar.tag_h + ' 3</h3></button></li>' +
            '       <li><button type="button" class="btn_edit" data-value="H4" style="height:23px;"><h4>' + lang.toolbar.tag_h + ' 4</h4></button></li>' +
            '       <li><button type="button" class="btn_edit" data-value="H5" style="height:19px;"><h5>' + lang.toolbar.tag_h + ' 5</h5></button></li>' +
            '       <li><button type="button" class="btn_edit" data-value="H6" style="height:15px;"><h6>' + lang.toolbar.tag_h + ' 6</h6></button></li>' +
            '   </ul>' +
            '</div>';

        return listDiv;
    },

    pickUp: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let target = e.target;
        let value = null;
        
        while (!value && !/UL/i.test(target.tagName)) {
            value = target.getAttribute('data-value');
            target = target.parentNode;
        }

        this.focus();
        this.dom.changeTxt(this.commandMap['FORMAT'], value);
        this.execCommand('formatBlock', false, value);
        this.submenuOff();
    }
};