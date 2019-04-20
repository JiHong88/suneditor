/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2019 JiHong Lee.
 * MIT license.
 */
'use strict';

const history = function (core) {
    const editor = core.context.element.wysiwyg;
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
    }

    return {
        push: function () {
            const current = core.getContents();
            if (current === stack[stackIndex].contents) return;

            stackIndex++;
            const range = core.getRange();

            console.log('stack', stack)
            console.log('stackIndex', stackIndex)

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
        },
        undo: function () {
            if (stackIndex > 0) {
                stackIndex--;
                setContentsFromStack();
            }
        },
        redo: function () {
            if (stack.length - 1 > stackIndex) {
                stackIndex++;
                setContentsFromStack();
            }
        }
    }
};

export default history;