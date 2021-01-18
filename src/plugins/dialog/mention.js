/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
"use strict";

import dialog from "../modules/dialog";


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
        mention._items = items;

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
              mention._addMention(item);
            });
            insertAt(mention._list, el, idx);
            mention._itemElements[id] = el;
          }
        });
      });
    }

    promise.then(() => {
      const current = mention._list.querySelectorAll(".se-mention-item")[
        mention.focussed
      ];
      if (current && !this.util.hasClass(current, "se-mention-active")) {
        const prev = mention._list.querySelector(".se-mention-active");
        if (prev) this.util.removeClass(prev, "se-mention-active");
        this.util.addClass(current, "se-mention-active");
      }
    });
  },

  setDialog: function(core) {
    const mention_dialog = core.util.createElement("DIV");
    const lang = core.lang;
    mention_dialog.className = "se-dialog-content";
    mention_dialog.style.display = "none";
    const html = `
      <form class="se-dialog-form">
        <div class="se-dialog-header">
          <button type="button" data-command="close" class="se-btn se-dialog-close" aria-label="Close" title="${lang.dialogBox.close}">
            ${core.icons.cancel}
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
    mention._search.focus();
    mention.renderList("");
  },

  on: function(update) {
    if (update) return;
    this.plugins.mention.init.call(this);
  },

  init: function() {
    const { mention } = this.context;
    mention._search.value = "";
    mention.focussed = 0;
    mention._items = [];
    mention._itemElements = {};
    mention._list.innerHTML = "";
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
        mention._addMention();
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

  getMentions: function(core) {
    const { mentions, getId } = core.context.mention;
    return mentions.filter((mention) => {
      const id = getId(mention);
      return core.context.element.wysiwyg.querySelector(
        `[data-mention="${id}"]`
      );
    });
  },

  _addMention: function(item) {
    const { mention } = this.context;
    const new_mention = item || mention._items[mention.focussed];
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
    const _dialog = this.setDialog(core);
    core.getMentions = this.getMentions(core);

    const _search = _dialog.querySelector(".se-mention-search");
    _search.addEventListener("keyup", this.onKeyUp.bind(core));
    _search.addEventListener("keydown", this.onKeyPress.bind(core));
    const _list = _dialog.querySelector(".se-mention-list");

    core.context.mention = {
      _addMention: this._addMention.bind(core),
      _itemElements: {},
      _items: [],
      _list,
      _search,
      focussed: 0,
      getId: this.getId.bind(core),
      getItems: this.getItems,
      getLinkHref: this.getLinkHref.bind(core),
      getValue: this.getValue.bind(core),
      mentions: [],
      modal: _dialog,
      open: this.open.bind(core),
      renderItem: this.renderItem,
      renderList: this.renderList.bind(core),
    };
    core.context.dialog.modal.appendChild(_dialog);
  },
  action: function() {},
};
