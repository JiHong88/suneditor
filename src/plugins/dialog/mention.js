/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
"use strict";

import dialog from "../modules/dialog";

export default {
  name: "mention",
  display: "dialog",
  title: "mention",
  buttonClass: "",
  innerHTML: "@",
  focussed: 0,

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
    mention.getItems(term).then((items) => {
      mention.items = items;
      mention.list.innerHTML = items
        .map(
          (item, idx) =>
            `<li class="se-mention-item ${
              idx === mention.focussed ? "se-mention-active" : ""
            }">
          ${mention.renderItem(item)}
        </li>`
        )
        .join("");
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
        mention.add();
        e.preventDefault();
        e.stopPropagation();
        break;

      default:
        mention.focussed = 0;
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
      add: this.addMention.bind(core),
      mentions: [],
      items: [],
      renderList: this.renderList.bind(core),
      getId: this.getId.bind(core),
      getValue: this.getValue.bind(core),
      getLinkHref: this.getLinkHref.bind(core),
      open: this.open.bind(core),
      focussed: this.focussed,
      renderItem: this.renderItem,
      getItems: this.getItems,
    };
    core.context.dialog.modal.appendChild(_dialog);
  },
  action: function() {},
};
