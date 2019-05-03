/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2019 JiHong Lee.
 * MIT license.
 */
'use strict';

const history = function (core, change) {
    const _w = window;
    const editor = core.context.element.wysiwyg;
    const undo = core.context.tool.undo;
    const redo = core.context.tool.redo;
    let pushDelay = null;
    let stackIndex = 0;
    let stack = [{
        contents: core.getContents(),
        s: {
            path: [0, 0],
            offset: 0
        },
        e: {
            path: [0, 0],
            offset: 0
        }
    }];

    function createHistoryPath (node) {
        const path = [];

        core.util.getParentElement(node, function (el) {
            if (!this.isWysiwygDiv(el)) path.push(el);
            return false;
        }.bind(core.util));
        
        return path.map(core.util.getPositionIndex).reverse();
    }

    function getNodeFromStack (offsets) {
        let current = editor;
        let nodes;

        for (let i = 0, len = offsets.length; i < len; i++) {
            nodes = current.childNodes;
            if (nodes.length <= offsets[i]) {
                current = nodes[nodes.length - 1];
            } else {
                current = nodes[offsets[i]];
            }
        }

        return current;
    }

    function setContentsFromStack () {
        const item = stack[stackIndex];
        editor.innerHTML = item.contents;

        core.setRange(getNodeFromStack(item.s.path), item.s.offset, getNodeFromStack(item.e.path), item.e.offset);
        core.focus();

        if (stackIndex === 0) {
            if (undo) undo.setAttribute('disabled', true);
            if (redo) redo.removeAttribute('disabled');
        } else if (stackIndex === stack.length - 1) {
            if (undo) undo.removeAttribute('disabled');
            if (redo) redo.setAttribute('disabled', true);
        } else {
            if (undo) undo.removeAttribute('disabled');
            if (redo) redo.removeAttribute('disabled');
        }

        // onChange
        change();
    }

    function pushStack () {
        const current = core.getContents();
        if (!current || current === stack[stackIndex].contents) return;

        stackIndex++;
        const range = core.getRange();

        if (stack.length > stackIndex) {
            stack = stack.slice(0, stackIndex);
            if (redo) redo.setAttribute('disabled', true);
        }

        stack[stackIndex] = {
            contents: current,
            s: {
                path: createHistoryPath(range.startContainer),
                offset: range.startOffset
            },
            e: {
                path: createHistoryPath(range.endContainer),
                offset: range.endOffset
            }
        };

        if (stackIndex === 1 && undo) undo.removeAttribute('disabled');

        // onChange
        change();
    }

    return {
        /**
         * @description Saving the current status to the history object stack
         */
        push: function () {
            if (pushDelay) {
                _w.clearTimeout(pushDelay);
            }

            pushDelay = _w.setTimeout(function () {
                _w.clearTimeout(pushDelay);
                pushDelay = null;
                pushStack();
            }, 500);
        },

        /**
         * @description Undo function
         */
        undo: function () {
            if (stackIndex > 0) {
                stackIndex--;
                setContentsFromStack();
            }
        },

        /**
         * @description Redo function
         */
        redo: function () {
            if (stack.length - 1 > stackIndex) {
                stackIndex++;
                setContentsFromStack();
            }
        },
        
        /**
         * @description Reset the history object
         */
        reset: function () {
            stackIndex = 0;
            stack = stack[stackIndex];
        }
    };
}

export default history;