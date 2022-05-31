'use strict';

export default {
    name: "FormatPainter",
    display: "command",
    title: "Format Painter",
    innerHTML: "Format Painter",
    add: function add(core, targetElement) {
      const context = core.context;
      context.formatPainterCustomCommand = {
        targetButton: targetElement,
        destinationTag: null,
        styleToBeApplied: null
      };
    },
    active: function active(element) {
      const context = this.context.formatPainterCustomCommand;
      if (element && this.util.hasClass(context.targetButton, "active")) {
        context.destinationTag = element;
        for (const key of context.styleToBeApplied) {
          context.destinationTag.style.setProperty(
            key,
            context.styleToBeApplied.getPropertyValue(key),
            context.styleToBeApplied.getPropertyPriority(key)
          );
        }
        context.destinationTag = null;
        context.styleToBeApplied = null;
        this.util.removeClass(context.targetButton, "active");
      }
    },
    action: function action() {
      const context = this.context.formatPainterCustomCommand;
      if (this.util.hasClass(context.targetButton, "active")) {
        context.destinationTag = null;
        context.styleToBeApplied = null;
        this.util.removeClass(context.targetButton, "active");
      } else {
        let selectedText = this.getSelection();
        context.styleToBeApplied = getComputedStyle(
          selectedText.anchorNode.parentElement
        );
        this.util.addClass(context.targetButton, "active");
      }
    }
  };
  