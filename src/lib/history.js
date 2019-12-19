/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2019 JiHong Lee.
 * MIT license.
 */
'use strict';

export default function (core, change) {
    const _w = window;
    const editor = core.context.element;
    const util = core.util;
    const undo = core.context.tool.undo;
    const redo = core.context.tool.redo;
    let pushDelay = null;
    let stackIndex = 0;
    let stack = [];

    function setContentsFromStack () {
        const item = stack[stackIndex];
        editor.wysiwyg.innerHTML = item.contents;

        core.setRange(util.getNodeFromPath(item.s.path, editor.wysiwyg), item.s.offset, util.getNodeFromPath(item.e.path, editor.wysiwyg), item.e.offset);
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

        core._checkComponents();
        core._charCount(0, false);
        core._resourcesStateChange();
        
        // onChange
        change();
    }

    function pushStack () {
        const current = core.getContents(true);
        if (!!stack[stackIndex] && current === stack[stackIndex].contents) return;

        stackIndex++;
        const range = core.getRange();

        if (stack.length > stackIndex) {
            stack = stack.slice(0, stackIndex);
            if (redo) redo.setAttribute('disabled', true);
        }

        stack[stackIndex] = {
            contents: current,
            s: {
                path: util.getNodePath(range.startContainer, null),
                offset: range.startOffset
            },
            e: {
                path: util.getNodePath(range.endContainer, null),
                offset: range.endOffset
            }
        };

        if (stackIndex === 1 && undo) undo.removeAttribute('disabled');

        core._checkComponents();
        core._charCount(0, false);
        // onChange
        change();
    }

    return {
        /**
         * @description History stack
         */
        stack: stack,

        /**
         * @description Saving the current status to the history object stack
         * If "delay" is true, it will be saved after 500 miliseconds
         * If the function is called again with the "delay" argument true before it is saved, the delay time is renewal
         * @param {Boolean} delay If true, delays 500 milliseconds
         */
        push: function (delay) {
            _w.setTimeout(core._resourcesStateChange);
            
            if (!delay || pushDelay) {
                _w.clearTimeout(pushDelay);
                if (!delay) {
                    pushStack();
                    return;
                }
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
         * @description Go to the history stack for that index.
         * If "index" is -1, go to the last stack
         * @param {Number} index Stack index
         */
        go: function (index) {
            stackIndex = index < 0 ? (stack.length - 1) : index;
            setContentsFromStack();
        },
        
        /**
         * @description Reset the history object
         */
        reset: function (ignoreChangeEvent) {
            if (undo) undo.setAttribute('disabled', true);
            if (redo) redo.setAttribute('disabled', true);
            if (core.context.tool.save) core.context.tool.save.setAttribute('disabled', true);
            
            stack.splice(0);
            stackIndex = 0;

            // pushStack
            stack[stackIndex] = {
                contents: core.getContents(true),
                s: {
                    path: [0, 0],
                    offset: 0
                },
                e: {
                    path: [0, 0],
                    offset: 0
                }
            };

            if (!ignoreChangeEvent) change();
        }
    };
}