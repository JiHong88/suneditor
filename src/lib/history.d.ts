import { Core } from "./core";

export interface History {
    /**
     * @description History stack
     */
    stack: any[];
    /**
     * @description Saving the current status to the history object stack
     * If "delay" is true, it will be saved after (options.historyStackDelayTime || 400) miliseconds
     * If the function is called again with the "delay" argument true before it is saved, the delay time is renewal
     * You can specify the delay time by sending a number.
     * @param {Boolean} delay If true, Add stack without delay time.
     */
    push: (delay: boolean | number) => void;
    /**
     * @description Undo function
     */
    undo: () => void;
    /**
     * @description Redo function
     */
    redo: () => void;
    /**
     * @description Go to the history stack for that index.
     * If "index" is -1, go to the last stack
     * @param {Number} index Stack index
     */
    go: (index: number) => void;

    /**
     * @description Get the current history stack index.
     * @returns
     */
    getCurrentIndex: () => number;
    
    /**
     * @description Reset the history object
     */
    reset: (ignoreChangeEvent: any) => void;
    /**
     * @description Remove all stacks and remove the timeout function.
     * @private
     */
    _destroy: () => void;
}

export default function _default(core: Core, change: any): History;
