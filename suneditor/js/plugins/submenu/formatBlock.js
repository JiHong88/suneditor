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
        var listDiv = eval(this.setSubmenu());

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickUp.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
    },

    setSubmenu: function () {
        var listDiv = document.createElement('DIV');
        listDiv.className = 'layer_editor layer_size';
        listDiv.style.display = 'none';
        listDiv.innerHTML = '' +
            '<div class="inner_layer">' +
            '   <ul class="list_editor format_list">' +
            '       <li><button type="button" class="btn_edit" style="height:30px;" data-value="P"><p style="font-size:13pt;">Normal</p></button></li>' +
            '       <li><button type="button" class="btn_edit" style="height:45px;" data-value="h1"><h1>Header 1</h1></button></li>' +
            '       <li><button type="button" class="btn_edit" style="height:34px;" data-value="h2"><h2>Header 2</h2></button></li>' +
            '       <li><button type="button" class="btn_edit" style="height:26px;" data-value="h3"><h3>Header 3</h3></button></li>' +
            '       <li><button type="button" class="btn_edit" style="height:23px;" data-value="h4"><h4>Header 4</h4></button></li>' +
            '       <li><button type="button" class="btn_edit" style="height:19px;" data-value="h5"><h5>Header 5</h5></button></li>' +
            '       <li><button type="button" class="btn_edit" style="height:15px;" data-value="h6"><h6>Header 6</h6></button></li>' +
            '   </ul>' +
            '</div>';

        return listDiv;
    },

    pickUp: function (e) {
        e.preventDefault();
        e.stopPropagation();

        var target = e.target;
        var value = null;
        while (!value && !/UL/i.test(target.tagName)) {
            value = target.getAttribute('data-value');
            target = target.parentNode;
        }

        this.focus();
        this.execCommand('formatBlock', false, value);
        this.submenuOff();
    }
};