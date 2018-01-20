/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
(function () {
    SUNEDITOR.plugin.foreColor = {
        add: function (_this, targetElement) {
            /** set submenu */
            var color_picker = eval(this.setSubmenu());

            /** add event listeners */
            color_picker.getElementsByTagName('UL')[0].addEventListener('click', this.colorPick.bind(_this));

            /** append html */
            targetElement.parentNode.appendChild(color_picker);
        },

        setSubmenu: function () {
            var foreColor_div = document.createElement('DIV');
            foreColor_div.className = 'layer_editor layer_color';
            foreColor_div.setAttribute('data-command', 'foreColor');
            foreColor_div.style.display = 'none';

            var colorList = ['#ff0000','#ff5e00','#ffe400','#abf200','#00d8ff','#0055ff','#6600ff','#ff00dd','#000000','#ffd8d8','#fae0d4','#faf4c0','#e4f7ba','#d4f4fa','#d9e5ff','#e8d9ff','#ffd9fa',
                '#ffffff','#ffa7a7','#ffc19e','#faed7d','#cef279','#b2ebf4','#b2ccff','#d1b2ff','#ffb2f5','#bdbdbd','#f15f5f','#f29661','#e5d85c','#bce55c','#5cd1e5','#6699ff','#a366ff','#f261df','#8c8c8c',
                '#980000','#993800','#998a00','#6b9900','#008299','#003399','#3d0099','#990085','#353535','#670000','#662500','#665c00','#476600','#005766','#002266','#290066','#660058','#222222'];

            var list = '<div class="inner_layer">'+
                       '   <div class="pallet_bgcolor">'+
                       '       <ul class="list_color list_bgcolor">';

            for(var i=0; i<colorList.length; i++) {
                var color = colorList[i];
                list += '<li>' +
                        '   <button type="button" class="btn_color" data-value="'+color+'" style="background-color:'+color+';">'+color+'' +
                        '       <span class="bg_check"></span>' +
                        '       <span class="bg_btnframe"></span>' +
                        '   </button>' +
                        '</li>';
            }

            list += '       </ul>'+
                    '   </div>'+
                    '</div>';

            foreColor_div.innerHTML = list;

            return foreColor_div;
        },

        colorPick : function (e) {
            if(!/btn_color/.test(e.target.className)) {
                return false;
            }

            e.preventDefault();
            e.stopPropagation();

            this.focus();
            this.pure_execCommand('foreColor', false, e.target.getAttribute('data-value'));
            this.subOff();
        }
    }
})();