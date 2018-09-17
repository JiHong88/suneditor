export default {
    name: 'custom_plugin_test',
    add: function (_this, targetElement) {
        const context = _this.context;
        context.custom = {
            textElement: null
        };

        /** set submenu */
        let listDiv = eval(this.setSubmenu(_this.lang));
        _this.context.custom.textElement = listDiv.getElementsByTagName('INPUT')[0]

        /** add event listeners */
        listDiv.getElementsByTagName('BUTTON')[0].addEventListener('click', this.onClick.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
    },

    setSubmenu: function (lang) {
        const listDiv = document.createElement('DIV');

        listDiv.className = 'layer_editor layer_align';
        listDiv.style.display = 'none';
        listDiv.innerHTML = '' +
            '<div class="inner_layer">' +
            '   <ul class="list_editor">' +
            '       <li><input type="text" style="width: 100%; border: 1px solid #CCC;" /></li>' +
            '       <li><button type="button" class="btn_edit" title="Append text">Append text</button></li>' +
            '   </ul>' +
            '</div>';

        return listDiv;
    },

    onClick: function () {
        const value = document.createTextNode(this.context.custom.textElement.value);
        this.insertNode(value);
    }
}