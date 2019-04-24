/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2019 JiHong Lee.
 * MIT license.
 */
'use strict';

const history = function (core) {
    const _w = window;
    const editor = core.context.element.wysiwyg;
    const sec = 500;
    let delay = 0;
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
    }

    function pushStack () {
        const current = core.getContents();
        if (!current || current === stack[stackIndex].contents) return;

        stackIndex++;
        const range = core.getRange();

        if (stack.length > stackIndex) {
            stack = stack.slice(0, stackIndex);
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
    }

    return {
        /**
         * @description Saving the current status to the history object stack
         */
        push: function () {
            if (delay > 0) {
                delay += sec/10;
                return;
            }

            delay = sec;

            const interval = _w.setInterval(function () {
                delay -= sec;
                if (delay > 0 && delay < sec * 2) return;

                pushStack();
                _w.clearInterval(interval);

                delay = 0;
            }, sec);
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