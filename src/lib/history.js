'use strict';

export default class history {
    constructor (core, contents = '') {
        this.core = core;
        this.wysiwyg = core.context.element.wysiwyg;
        this.delay = false;
        this.stack = { 
            undo: [{
                contents: contents,
                s: {
                    path: [0, 0],
                    offset: 0
                },
                e: {
                    path: [0, 0],
                    offset: 0
                }
            }],
            redo: [] 
        };
    }

    createHistoryPath (node) {
        const path = [];

        this.core.util.getParentElement(node, function (el) {
            if (!this.isWysiwygDiv(el)) path.push(el);
            return false;
        }.bind(this.core.util));
        
        return path.map(this.core.util.getPositionIndex).reverse();
    }

    getNodeFromStack (offsets) {
        let current = this.core.context.element.wysiwyg;
        for (let i = 0, len = offsets.length; i < len; i++) {
            if (current.childNodes.length <= offsets[i]) {
                current = current.childNodes[current.childNodes.length - 1];
            } else {
                current = current.childNodes[offsets[i]];
            }
        }
        return current;
    }

    setContentsFromStack (item) {
        this.wysiwyg.innerHTML = item.contents;
        this.core.setRange(this.getNodeFromStack(item.s.path), item.s.offset, this.getNodeFromStack(item.e.path), item.e.offset);
    }

    push (current) {
        if (this.delay) return;
        if (current === this.stack.undo[this.stack.undo.length - 1].contents) return;
        this.delay = true;
        
        const range = this.core.getRange();
        this.stack.undo.push({
            contents: current,
            s: {
                path: this.createHistoryPath(range.startContainer),
                offset: range.startOffset
            },
            e: {
                path: this.createHistoryPath(range.endContainer),
                offset: range.endOffset
            }
        });

        console.log('stack', this.stack)

        this.delay = false;
    }

    undo () {
        const item = this.stack.undo.pop();
        if (item) {
            console.log('undo', this.stack)
            this.stack.redo.push(item);
            this.setContentsFromStack(item);
        }
    }
    
    redo () {
        const item = this.stack.redo.pop();
        if (item) {
            console.log('redo', this.stack)
            this.stack.undo.push(item);
            this.setContentsFromStack(item);
        }
    }
};