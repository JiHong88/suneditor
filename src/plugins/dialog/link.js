/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.link = {
    add: function (_this) {
        var context = _this.context;
        context.link = {};

        /** link dialog */
        var link_dialog = eval(this.setDialog());
        context.link.modal = link_dialog;
        context.link.focusElement = link_dialog.getElementsByClassName('sun-editor-id-linkurl')[0];
        context.link.linkAnchorText = link_dialog.getElementsByClassName('sun-editor-id-linktext')[0];
        context.link.linkNewWindowCheck = link_dialog.getElementsByClassName('sun-editor-id-linkCheck')[0];

        /** link button */
        var link_button = eval(this.setController_LinkBtn());
        context.link.linkBtn = link_button;
        context.link._linkAnchor = null;

        /** add event listeners */
        link_dialog.getElementsByClassName("btn-primary")[0].addEventListener('click', this.submit_dialog.bind(_this));
        link_button.addEventListener('click', this.onClick_linkBtn.bind(_this));

        /** append html */
        context.dialog.modal.appendChild(link_dialog);
        context.element.relative.appendChild(link_button);
    },

    /** dialog */
    setDialog: function () {
        var lang = SUNEDITOR.lang;
        var dialog = document.createElement('DIV');
        dialog.className = 'modal-content sun-editor-id-dialog-link';
        dialog.style.display = 'none';
        dialog.innerHTML = '' +
            '<form class="editor_link">' +
            '   <div class="modal-header">' +
            '       <button type="button" data-command="close" class="close" aria-label="Close">' +
            '           <span aria-hidden="true" data-command="close">×</span>' +
            '       </button>' +
            '       <h5 class="modal-title">' + lang.dialogBox.linkBox.title + '</h5>' +
            '   </div>' +
            '   <div class="modal-body">' +
            '       <div class="form-group">' +
            '           <label>' + lang.dialogBox.linkBox.url + '</label>' +
            '           <input class="form-control sun-editor-id-linkurl" type="text" />' +
            '       </div>' +
            '       <div class="form-group">' +
            '           <label>' + lang.dialogBox.linkBox.text + '</label><input class="form-control sun-editor-id-linktext" type="text" />' +
            '       </div>' +
            '       <label class="label-check"><input type="checkbox" class="sun-editor-id-linkCheck" />&nbsp;' + lang.dialogBox.linkBox.newWindowCheck + '</label>' +
            '   </div>' +
            '   <div class="modal-footer">' +
            '       <button type="submit" class="btn btn-primary sun-editor-id-submit-link"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '   </div>' +
            '</form>';

        return dialog;
    },

    submit_dialog: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        function submitAction() {
            if (this.context.link.focusElement.value.trim().length === 0) return false;

            var url = /^https?:\/\//.test(this.context.link.focusElement.value) ? this.context.link.focusElement.value : "http://" + this.context.link.focusElement.value;
            var anchor = this.context.link.linkAnchorText || this.context.dialog.document.getElementById("linkAnchorText");
            var anchorText = anchor.value.length === 0 ? url : anchor.value;

            if (this.context.link._linkAnchor === null) {
                var oA = document.createElement("A");
                oA.href = url;
                oA.textContent = anchorText;
                oA.target = (this.context.link.linkNewWindowCheck.checked ? "_blank" : "");

                this.insertNode(oA);
            } else {
                this.context.link._linkAnchor.href = url;
                this.context.link._linkAnchor.textContent = anchorText;
                this.context.link._linkAnchor.target = (this.context.link.linkNewWindowCheck.checked ? "_blank" : "");
            }

            this.context.link.focusElement.value = "";
            this.context.link.linkAnchorText.value = "";
        }

        try {
            submitAction.call(this);
        } finally {
            SUNEDITOR.plugin.dialog.closeDialog.call(this);
            this.closeLoading();
        }

        return false;
    },

    init: function () {
        this.context.link.linkBtn.style.display = "none";
        this.context.link._linkAnchor = null;
        this.context.link.focusElement.value = "";
        this.context.link.linkAnchorText.value = "";
        this.context.link.linkNewWindowCheck.checked = false;
    },

    /** button */
    setController_LinkBtn: function () {
        var lang = SUNEDITOR.lang;
        var link_btn = document.createElement("DIV");
        link_btn.className = "sun-editor-id-link-btn";
        link_btn.style.display = "none";
        link_btn.innerHTML = '' +
            '<div class="arrow"></div>' +
            '<div class="link-content"><span><a target="_blank" href=""></a>&nbsp;</span>' +
            '   <div class="btn-group">' +
            '     <button type="button" data-command="update" tabindex="-1" title="' + lang.editLink.edit + '"><div class="ico_url"></div></button>' +
            '     <button type="button" data-command="delete" tabindex="-1" title="' + lang.editLink.remove + '">x</button>' +
            '   </div>' +
            '</div>';

        return link_btn;
    },

    call_controller_linkButton: function (selectionATag) {
        this.editLink = this.context.link._linkAnchor = selectionATag;
        var linkBtn = this.context.link.linkBtn;

        linkBtn.getElementsByTagName("A")[0].href = selectionATag.href;
        linkBtn.getElementsByTagName("A")[0].textContent = selectionATag.textContent;

        linkBtn.style.left = selectionATag.offsetLeft + "px";
        linkBtn.style.top = (selectionATag.offsetTop + selectionATag.offsetHeight + this.context.tool.bar.offsetHeight + 10 - this.context.element.wysiwygWindow.pageYOffset) + "px";
        linkBtn.style.display = "block";

        this.controllerArray = [linkBtn];
        linkBtn = null;
    },

    onClick_linkBtn: function (e) {
        e.stopPropagation();

        var command = e.target.getAttribute("data-command") || e.target.parentNode.getAttribute("data-command");
        if (!command) return;

        e.preventDefault();

        if (/update/.test(command)) {
            this.context.link.focusElement.value = this.context.link._linkAnchor.href;
            this.context.link.linkAnchorText.value = this.context.link._linkAnchor.textContent;
            this.context.link.linkNewWindowCheck.checked = (/_blank/i.test(this.context.link._linkAnchor.target) ? true : false);
            SUNEDITOR.plugin.dialog.openDialog.call(this, 'link');
        }
        else {
            /** delete */
            SUNEDITOR.dom.removeItem(this.context.link._linkAnchor);
            this.context.link._linkAnchor = null;
            this.focus();
        }

        this.context.link.linkBtn.style.display = "none";
    }
};