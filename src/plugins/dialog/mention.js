/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
"use strict";

import dialog from "../modules/dialog";

const icon = '<svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path fill-opacity=".9" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"></path></svg>';

function insertAt(parent, child, index) {
  if (!index) index = 0;
  if (index >= parent.children.length) {
    parent.appendChild(child);
  } else {
    parent.insertBefore(child, parent.children[index]);
  }
}

export default {
  name: "mention",
  display: "dialog",
  title: "Mention", //TODO: how do i translate this?
  innerHTML: icon,

  renderItem: function(item) {
    return `<span>${item}</span>`;
  },

  getItems: function(term) {
    return Promise.resolve(
      ["overwite", "the", "mention", "plugin", "getItems", "method"].filter(
        (w) => w.includes(term.toLowerCase())
      )
    );
  },

  renderList: function(term) {
    const { mention } = this.context;
    let promise = Promise.resolve();
    if (mention.term !== term) {
      mention.focussed = 0;
      mention.term = term;
      promise = mention.getItems(term).then((items) => {
        mention.items = items;

        Object.keys(mention._itemElements).forEach((id) => {
          if (!items.find((i) => mention.getId(i) === id)) {
            const child = mention._itemElements[id];
            child.parentNode.removeChild(child);
            delete mention._itemElements[id];
          }
        });

        items.forEach((item, idx) => {
          const id = mention.getId(item);
          if (!mention._itemElements[id]) {
            const el = this.util.createElement("LI");
            el.setAttribute("data-mention", id);
            this.util.addClass(el, 'se-mention-item');
            el.innerHTML = mention.renderItem(item);
            el.addEventListener("click", () => {
              mention.focussed = idx;
              mention.addMention();
            });
            insertAt(mention.list, el, idx);
            mention._itemElements[id] = el;
          }
        });
      });
    }

    promise.then(() => {
      const current = mention.list.querySelectorAll(".se-mention-item")[
        mention.focussed
      ];
      if (current && !this.util.hasClass(current, "se-mention-active")) {
        const prev = mention.list.querySelector(".se-mention-active");
        if (prev) this.util.removeClass(prev, "se-mention-active");
        this.util.addClass(current, "se-mention-active");
      }
    });
  },

  setDialog: function() {
    const mention_dialog = this.util.createElement("DIV");
    const lang = this.lang;
    mention_dialog.className = "se-dialog-content";
    mention_dialog.style.display = "none";
    const html = `
      <form class="se-dialog-form">
        <div class="se-dialog-header">
          <button type="button" data-command="close" class="se-btn se-dialog-close" aria-label="Close" title="${lang.dialogBox.close}">
            ${this.icons.cancel}
          </button>
          <span class="se-modal-title">${lang.dialogBox.mentionBox.title}</span>
        </div>
        <div class="se-dialog-body">
          <input class="se-input-form se-mention-search" type="text" placeholder="${lang.dialogBox.browser.search}" />
          <ul class="se-mention-list">
          </ul>
        </div>
      </form>
    `;
    mention_dialog.innerHTML = html;
    return mention_dialog;
  },

  getId(mention) {
    return mention;
  },

  getValue(mention) {
    return `@${mention}`;
  },

  getLinkHref(/*mention*/) {
    return "";
  },

  open: function() {
    const { mention } = this.context;
    this.plugins.dialog.open.call(
      this,
      "mention",
      "mention" === this.currentControllerName
    );
    mention.search.focus();
    mention.renderList("");
  },

  on: function(update) {
    if (update) return;
    this.plugins.mention.init.call(this);
  },

  init: function() {
    const { mention } = this.context;
    mention.search.value = "";
    mention.focussed = 0;
    mention.items = [];
    mention._itemElements = {};
    mention.list.innerHTML = "";
    delete mention.term;
  },

  onKeyPress: function(e) {
    const { mention } = this.context;
    switch (e.key) {
      case "ArrowDown":
        mention.focussed += 1;
        e.preventDefault();
        e.stopPropagation();
        break;

      case "ArrowUp":
        if (mention.focussed > 0) {
          mention.focussed -= 1;
        }
        e.preventDefault();
        e.stopPropagation();
        break;

      case "Enter":
        mention.addMention();
        e.preventDefault();
        e.stopPropagation();
        break;

      default:
    }
  },

  onKeyUp: function(e) {
    const { mention } = this.context;
    mention.renderList(e.target.value);
  },

  getMentions: function() {
    const { mentions, getId } = this.context.mention;
    return mentions.filter((mention) => {
      const id = getId(mention);
      return this.context.element.wysiwyg.querySelector(
        `[data-mention="${id}"]`
      );
    });
  },

  addMention: function() {
    const { mention } = this.context;
    const new_mention = mention.items[mention.focussed];
    if (new_mention) {
      if (
        !mention.mentions.find(
          (m) => mention.getId(m) === mention.getId(new_mention)
        )
      ) {
        mention.mentions.push(new_mention);
      }
      const el = this.util.createElement("A");
      el.href = mention.getLinkHref(new_mention);
      el.target = "_blank";
      el.innerHTML = mention.getValue(new_mention);
      el.setAttribute("data-mention", mention.getId(new_mention));
      this.insertNode(el, null, false);
      const spacer = this.util.createElement("SPAN");
      spacer.innerHTML = " ";
      this.insertNode(spacer, el, false);
    }
    this.plugins.dialog.close.call(this);
  },
  add: function(core) {
    core.addModule([dialog]);
    this.title = core.lang.toolbar.mention;
    const _dialog = this.setDialog.call(core);
    core.getMentions = this.getMentions.bind(core);

    const search = _dialog.querySelector(".se-mention-search");
    search.addEventListener("keyup", this.onKeyUp.bind(core));
    search.addEventListener("keydown", this.onKeyPress.bind(core));
    const list = _dialog.querySelector(".se-mention-list");

    core.context.mention = {
      modal: _dialog,
      search,
      list,
      triggerKey: this.triggerKey,
      visible: false,
      addMention: this.addMention.bind(core),
      mentions: [],
      items: [],
      _itemElements: {},
      renderList: this.renderList.bind(core),
      getId: this.getId.bind(core),
      getValue: this.getValue.bind(core),
      getLinkHref: this.getLinkHref.bind(core),
      open: this.open.bind(core),
      focussed: 0,
      renderItem: this.renderItem,
      getItems: this.getItems,
    };
    core.context.dialog.modal.appendChild(_dialog);
  },
  action: function() {},
};
