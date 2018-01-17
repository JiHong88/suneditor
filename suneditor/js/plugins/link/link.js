(function () {
    SUNEDITOR.plugin.link = {
        add : function(_this) {
            var context = _this.context;
            var dialog_div = context.dialog.modalArea;

            /** 이미지 다이얼로그 */
            context.dialog.modal.appendChild(eval(this.setDialog()));
            context.dialog.link = dialog_div.getElementsByClassName('sun-editor-id-dialog-link')[0];
            context.dialog.linkText = dialog_div.getElementsByClassName('sun-editor-id-linkurl')[0];
            context.dialog.linkAnchorText = dialog_div.getElementsByClassName('sun-editor-id-linktext')[0];
            context.dialog.linkNewWindowCheck = dialog_div.getElementsByClassName('sun-editor-id-linkCheck')[0];

            /** 링크 수정 버튼 */
            var link_button = document.createElement("DIV");
            link_button.className = "sun-editor-id-link-btn";
            link_button.appendChild(eval(this.setLinkBtn()));

            context.element.linkBtn = link_button;

            context.element.linkBtn.addEventListener('click', SUNEDITOR.plugin.link.onClick_linkBtn.bind(_this));
            context.dialog.link.getElementsByClassName("btn-primary")[0].addEventListener('click', SUNEDITOR.plugin.link.submit_dialog.bind(_this));

            context.element.relative.appendChild(link_button);

            return context;
        },

        /** 링크 삽입 다이얼로그 */
        setDialog : function() {
            var lang = SUNEDITOR.lang;
            var dialog = document.createElement('DIV');
            dialog.className = 'modal-content sun-editor-id-dialog-link';
            dialog.style.display = 'none';
            dialog.innerHTML = ''+
                '<form class="editor_link">'+
                '   <div class="modal-header">'+
                '       <button type="button" data-command="close" class="close" aria-label="Close">'+
                '           <span aria-hidden="true" data-command="close">×</span>'+
                '       </button>'+
                '       <h5 class="modal-title">'+lang.dialogBox.linkBox.title+'</h5>'+
                '   </div>'+
                '   <div class="modal-body">'+
                '       <div class="form-group">'+
                '           <label>'+lang.dialogBox.linkBox.url+'</label>'+
                '           <input class="form-control sun-editor-id-linkurl" type="text" />'+
                '       </div>'+
                '       <div class="form-group">'+
                '           <label>'+lang.dialogBox.linkBox.text+'</label><input class="form-control sun-editor-id-linktext" type="text" />'+
                '       </div>'+
                '       <label class="label-check"><input type="checkbox" class="sun-editor-id-linkCheck" />&nbsp;' + lang.dialogBox.linkBox.newWindowCheck + '</label>'+
                '   </div>'+
                '   <div class="modal-footer">'+
                '       <button type="submit" class="btn btn-primary sun-editor-id-submit-link"><span>'+lang.dialogBox.submitButton+'</span></button>'+
                '   </div>'+
                '</form>';

            return dialog;
        },

        setLinkBtn : function() {
            var lang = SUNEDITOR.lang;
            var link_btn = document.createElement("DIV");
            link_btn.className = "modal-image-resize";
            link_btn.innerHTML = ''+
                '<div class="arrow"></div>'+
                '<div class="link-content"><span><a target="_blank" href=""></a>&nbsp;</span>'+
                '   <div class="btn-group">'+
                '     <button type="button" data-command="update" tabindex="-1" title="'+lang.editLink.edit+'"><div class="img_editor ico_url"></div></button>'+
                '     <button type="button" data-command="delete" tabindex="-1" title="'+lang.editLink.remove+'">X</button>'+
                '   </div>'+
                '</div>';

            return link_btn;
        },

        onClick_linkBtn : function(e) {
            e.stopPropagation();

            var command = e.target.getAttribute("data-command") || e.target.parentNode.getAttribute("data-command");
            if(!command) return;

            e.preventDefault();

            if(/update/.test(command)) {
                context.dialog.linkText.value = context.argument._linkAnchor.href;
                context.dialog.linkAnchorText.value = context.argument._linkAnchor.textContent;
                context.dialog.linkNewWindowCheck.checked = (/_blank/i.test(context.argument._linkAnchor.target)? true: false);
                this.openDialog('link');
            }
            else { /** delete */
            dom.removeItem(context.argument._linkAnchor);
                context.argument._linkAnchor = null;
                this.focus();
            }

            context.element.linkBtn.style.display = "none";
        },

        submit_dialog : function(e) {
            this.showLoading();

            e.preventDefault();
            e.stopPropagation();

            function submitAction() {
                if(this.context.dialog.linkText.value.trim().length === 0) return false;

                var url = /^https?:\/\//.test(this.context.dialog.linkText.value)? this.context.dialog.linkText.value: "http://" +  this.context.dialog.linkText.value;
                var anchor = this.context.dialog.linkAnchorText || this.context.dialog.document.getElementById("linkAnchorText");
                var anchorText = anchor.value.length === 0? url: anchor.value;

                if(this.context.argument._linkAnchor === null) {
                    var oA = document.createElement("A");
                    oA.href = url;
                    oA.textContent = anchorText;
                    oA.target = (this.context.dialog.linkNewWindowCheck.checked? "_blank": "");

                    this.insertNode(oA);
                } else {
                    this.context.argument._linkAnchor.href = url;
                    this.context.argument._linkAnchor.textContent = anchorText;
                    this.context.argument._linkAnchor.target = (this.context.dialog.linkNewWindowCheck.checked? "_blank": "");
                }

                this.context.dialog.linkText.value = "";
                this.context.dialog.linkAnchorText.value = "";
            }

            try {
                submitAction.call(this);
            } finally {
                this.subOff();
                this.closeLoading();
            }

            return false;
        },

        call_link_button : function(selectionParent) {
            this.editLink = this.context.argument._linkAnchor = selectionParent;
            var linkBtn = this.context.element.linkBtn;

            linkBtn.getElementsByTagName("A")[0].href = selectionParent.href;
            linkBtn.getElementsByTagName("A")[0].textContent = selectionParent.textContent;

            linkBtn.style.left = selectionParent.offsetLeft + "px";
            linkBtn.style.top = (selectionParent.offsetTop + selectionParent.offsetHeight + this.context.tool.bar.offsetHeight + 10) + "px";
            linkBtn.style.display = "block";

            linkBtn = null;
        }
    }
})();