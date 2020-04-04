import { SunEditorOptions } from './../options.d';

declare interface EditorElement {
    originElement: Element;
    topArea: Element;
    relative: Element;
    toolbar: Element;
    resizingBar: Element;
    navigation: Element;
    charWrapper: Element;
    charCounter: Element;
    editorArea: Element;
    wysiwygFrame: Element;
    wysiwyg: Element;
    code: Element;
    placeholder: Element;
    loading: Element;
    lineBreaker: Element;
    resizeBackground: Element;
}

export interface Context {
    element: EditorElement;
    tool: Record<string, Element>;
    options: SunEditorOptions;
    option: SunEditorOptions;
}

// TODO type "constructor"
declare function _Context(element: Element, cons: any, options: SunEditorOptions): Context;

export default _Context;

