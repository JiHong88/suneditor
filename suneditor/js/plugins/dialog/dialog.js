(function () {
    SUNEDITOR.plugin.dialog = {
        add : function(_this) {
            var dialog_div = null;
            var context = _this.context;
            if(!context.dialog.modalArea) {
                dialog_div = document.createElement("DIV");
                dialog_div.className = "sun-editor-id-dialogBox";

                var dialog_back = document.createElement("DIV");
                dialog_back.className = "modal-dialog-background sun-editor-id-dialog-back";
                dialog_back.style.display = "none";

                var dialog_area = document.createElement("DIV");
                dialog_area.className = "modal-dialog sun-editor-id-dialog-modal";
                dialog_area.style.display = "none";

                dialog_div.appendChild(dialog_back);
                dialog_div.appendChild(dialog_area);

                context.dialog.modalArea = dialog_div;
                context.dialog.back = dialog_back;
                context.dialog.modal = dialog_area;
                context.dialog.forms = {};
            } else {
                dialog_div = context.dialog.modalArea;
            }

            context.dialog.image = dialog_div.getElementsByClassName('sun-editor-id-dialog-image')[0];
            context.dialog.imgInputFile = dialog_div.getElementsByClassName('sun-editor-id-image-file')[0];
            context.dialog.imgInputUrl = dialog_div.getElementsByClassName('sun-editor-id-image-url')[0];

            context.dialog.modal.addEventListener('click', SUNEDITOR.plugin.dialog.onClick_dialog.bind(_this));
            context.element.topArea.getElementsByClassName('sun-editor-container')[0].appendChild(dialog_div);

            return context;
        },

        onClick_dialog : function(e) {
            e.stopPropagation();

            if(/modal-dialog/.test(e.target.className) || /close/.test(e.target.getAttribute("data-command"))) {
                SUNEDITOR.editor.subOff.call(this);
            }
        }
    }
})();