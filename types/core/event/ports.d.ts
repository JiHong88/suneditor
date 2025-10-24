import type {} from '../../typedef';
/**
 * @typedef {import('./eventManager').EventManagerThis} EventManagerInstanceType
 */
/**
 * @typedef {import('../class/selection').default} Selection
 * @typedef {import('../class/format').default} Format
 * @typedef {import('../class/listFormat').default} ListFormat
 * @typedef {import('../class/component').default} Component
 * @typedef {import('../class/html').default} Html
 * @typedef {import('../class/nodeTransform').default} NodeTransform
 * @typedef {import('../class/char').default} Char
 * @typedef {import('../class/menu').default} Menu
 */
/**
 * @typedef {Object} SelectionPorts
 * @property {(...args: Parameters<Selection['getRange']>) => ReturnType<Selection['getRange']>} getRange
 * @property {(...args: Parameters<Selection['getNode']>) => ReturnType<Selection['getNode']>} getNode
 * @property {(...args: Parameters<Selection['setRange']>) => ReturnType<Selection['setRange']>} setRange
 * @property {(...args: Parameters<Selection['get']>) => ReturnType<Selection['get']>} get
 */
/**
 * @typedef {Object} FormatPorts
 * @property {(...args: Parameters<Format['isLine']>) => ReturnType<Format['isLine']>} isLine
 * @property {(...args: Parameters<Format['getLine']>) => ReturnType<Format['getLine']>} getLine
 * @property {(...args: Parameters<Format['getLines']>) => ReturnType<Format['getLines']>} getLines
 * @property {(...args: Parameters<Format['getBrLine']>) => ReturnType<Format['getBrLine']>} getBrLine
 * @property {(...args: Parameters<Format['getBlock']>) => ReturnType<Format['getBlock']>} getBlock
 * @property {(...args: Parameters<Format['isNormalLine']>) => ReturnType<Format['isNormalLine']>} isNormalLine
 * @property {(...args: Parameters<Format['isBrLine']>) => ReturnType<Format['isBrLine']>} isBrLine
 * @property {(...args: Parameters<Format['isClosureBrLine']>) => ReturnType<Format['isClosureBrLine']>} isClosureBrLine
 * @property {(...args: Parameters<Format['isClosureBlock']>) => ReturnType<Format['isClosureBlock']>} isClosureBlock
 * @property {(...args: Parameters<Format['isEdgeLine']>) => ReturnType<Format['isEdgeLine']>} isEdgeLine
 * @property {(...args: Parameters<Format['removeBlock']>) => ReturnType<Format['removeBlock']>} removeBlock
 * @property {(...args: Parameters<Format['addLine']>) => ReturnType<Format['addLine']>} addLine
 */
/**
 * @typedef {Object} ListFormatPorts
 * @property {(...args: Parameters<ListFormat['applyNested']>) => ReturnType<ListFormat['applyNested']>} applyNested
 */
/**
 * @typedef {Object} ComponentPorts
 * @property {(...args: Parameters<Component['deselect']>) => ReturnType<Component['deselect']>} deselect
 * @property {(...args: Parameters<Component['is']>) => ReturnType<Component['is']>} is
 * @property {(...args: Parameters<Component['get']>) => ReturnType<Component['get']>} get
 * @property {(...args: Parameters<Component['select']>) => ReturnType<Component['select']>} select
 */
/**
 * @typedef {Object} HtmlPorts
 * @property {(...args: Parameters<Html['remove']>) => ReturnType<Html['remove']>} remove
 * @property {(...args: Parameters<Html['insert']>) => ReturnType<Html['insert']>} insert
 * @property {(...args: Parameters<Html['insertNode']>) => ReturnType<Html['insertNode']>} insertNode
 */
/**
 * @typedef {Object} NodeTransformPorts
 * @property {(...args: Parameters<NodeTransform['removeAllParents']>) => ReturnType<NodeTransform['removeAllParents']>} removeAllParents
 * @property {(...args: Parameters<NodeTransform['split']>) => ReturnType<NodeTransform['split']>} split
 */
/**
 * @typedef {Object} CharPorts
 * @property {(...args: Parameters<Char['check']>) => ReturnType<Char['check']>} check
 */
/**
 * @typedef {Object} MenuPorts
 * @property {(...args: Parameters<Menu['dropdownOff']>) => ReturnType<Menu['dropdownOff']>} dropdownOff
 */
/**
 * @description Create ports for event reducers
 * @param {EventManagerInstanceType} inst - EventManager instance
 * @param {Object} param1 - Additional parameters
 * @param {*} param1._styleNodes - Style nodes reference object
 */
export function makePorts(
	inst: EventManagerInstanceType,
	{
		_styleNodes
	}: {
		_styleNodes: any;
	}
): {
	editor: {
		_nativeFocus: () => void;
		blur: () => void;
	};
	selection: {
		getRange: () => Range;
		getNode: () => HTMLElement | Text;
		setRange: (se: any, so: any, ec: any, eo: any) => Range;
		get: () => globalThis.Selection;
	};
	format: {
		isLine: (n: any) => n is HTMLElement;
		getLine: (n: any, p: any) => HTMLElement;
		getLines: (v: any) => HTMLElement[];
		getBrLine: (n: any, p: any) => HTMLBRElement;
		getBlock: (n: any, p: any) => HTMLElement;
		isNormalLine: (n: any) => n is HTMLElement;
		isBrLine: (n: any) => n is HTMLElement;
		isClosureBrLine: (n: any) => n is HTMLElement;
		isClosureBlock: (n: any) => n is HTMLElement;
		isEdgeLine: (node: any, offset: any, dir: any) => node is HTMLElement;
		removeBlock: (
			n: any,
			p: any
		) => {
			cc: Node;
			sc: Node;
			so: number;
			ec: Node;
			eo: number;
			removeArray: Array<Node> | null;
		};
		addLine: (el: any, nextOrTag: any) => HTMLElement;
	};
	listFormat: {
		applyNested: (
			cells: any,
			shift: any
		) => {
			sc: Node;
			so: number;
			ec: Node;
			eo: number;
		};
	};
	component: {
		deselect: () => void;
		is: (n: any) => boolean;
		get: (n: any) => SunEditor.ComponentInfo;
		select: (t: any, p: any) => boolean;
	};
	html: {
		remove: () => {
			container: Node;
			offset: number;
			commonCon?: Node | null;
			prevContainer?: Node | null;
		};
		insert: (h: any, p: any) => HTMLElement;
		insertNode: (n: any, p: any) => any;
	};
	history: {
		push: (hard: any) => void;
	};
	nodeTransform: {
		removeAllParents: (
			s: any,
			n: any,
			p: any
		) => {
			sc: Node | null;
			ec: Node | null;
		};
		split: (n: any, o: any, d: any) => HTMLElement;
	};
	char: {
		check: (content: any) => boolean;
	};
	menu: {
		dropdownOff: () => void;
	};
	setDefaultLine: (tag: any) => any;
	hideToolbar: () => void;
	hideToolbar_sub: () => void;
	styleNodeCache: () => Node[];
	formatAttrsTempCache: (attrs: any) => any;
	setOnShortcutKey: (v: any) => any;
	/**
	 * @description Scrolls the editor view to the caret position after pressing Enter. (Ignored on mobile devices)
	 * @param {Range} range Range object
	 */
	enterScrollTo(range: Range): void;
	/**
	 * @description Prevents the default behavior of the Enter key and refocuses the editor.
	 * @param {Event} e The keyboard event
	 */
	enterPrevent(e: Event): void;
};
export type EventManagerInstanceType = import('./eventManager').EventManagerThis;
export type Selection = import('../class/selection').default;
export type Format = import('../class/format').default;
export type ListFormat = import('../class/listFormat').default;
export type Component = import('../class/component').default;
export type Html = import('../class/html').default;
export type NodeTransform = import('../class/nodeTransform').default;
export type Char = import('../class/char').default;
export type Menu = import('../class/menu').default;
export type SelectionPorts = {
	getRange: (...args: Parameters<Selection['getRange']>) => ReturnType<Selection['getRange']>;
	getNode: (...args: Parameters<Selection['getNode']>) => ReturnType<Selection['getNode']>;
	setRange: (...args: Parameters<Selection['setRange']>) => ReturnType<Selection['setRange']>;
	get: (...args: Parameters<Selection['get']>) => ReturnType<Selection['get']>;
};
export type FormatPorts = {
	isLine: (...args: Parameters<Format['isLine']>) => ReturnType<Format['isLine']>;
	getLine: (...args: Parameters<Format['getLine']>) => ReturnType<Format['getLine']>;
	getLines: (...args: Parameters<Format['getLines']>) => ReturnType<Format['getLines']>;
	getBrLine: (...args: Parameters<Format['getBrLine']>) => ReturnType<Format['getBrLine']>;
	getBlock: (...args: Parameters<Format['getBlock']>) => ReturnType<Format['getBlock']>;
	isNormalLine: (...args: Parameters<Format['isNormalLine']>) => ReturnType<Format['isNormalLine']>;
	isBrLine: (...args: Parameters<Format['isBrLine']>) => ReturnType<Format['isBrLine']>;
	isClosureBrLine: (...args: Parameters<Format['isClosureBrLine']>) => ReturnType<Format['isClosureBrLine']>;
	isClosureBlock: (...args: Parameters<Format['isClosureBlock']>) => ReturnType<Format['isClosureBlock']>;
	isEdgeLine: (...args: Parameters<Format['isEdgeLine']>) => ReturnType<Format['isEdgeLine']>;
	removeBlock: (...args: Parameters<Format['removeBlock']>) => ReturnType<Format['removeBlock']>;
	addLine: (...args: Parameters<Format['addLine']>) => ReturnType<Format['addLine']>;
};
export type ListFormatPorts = {
	applyNested: (...args: Parameters<ListFormat['applyNested']>) => ReturnType<ListFormat['applyNested']>;
};
export type ComponentPorts = {
	deselect: (...args: Parameters<Component['deselect']>) => ReturnType<Component['deselect']>;
	is: (...args: Parameters<Component['is']>) => ReturnType<Component['is']>;
	get: (...args: Parameters<Component['get']>) => ReturnType<Component['get']>;
	select: (...args: Parameters<Component['select']>) => ReturnType<Component['select']>;
};
export type HtmlPorts = {
	remove: (...args: Parameters<Html['remove']>) => ReturnType<Html['remove']>;
	insert: (...args: Parameters<Html['insert']>) => ReturnType<Html['insert']>;
	insertNode: (...args: Parameters<Html['insertNode']>) => ReturnType<Html['insertNode']>;
};
export type NodeTransformPorts = {
	removeAllParents: (...args: Parameters<NodeTransform['removeAllParents']>) => ReturnType<NodeTransform['removeAllParents']>;
	split: (...args: Parameters<NodeTransform['split']>) => ReturnType<NodeTransform['split']>;
};
export type CharPorts = {
	check: (...args: Parameters<Char['check']>) => ReturnType<Char['check']>;
};
export type MenuPorts = {
	dropdownOff: (...args: Parameters<Menu['dropdownOff']>) => ReturnType<Menu['dropdownOff']>;
};
export type EventReducerPorts = {
	editor: {
		_nativeFocus: () => void;
		blur: () => void;
	};
	selection: SelectionPorts;
	format: FormatPorts;
	listFormat: ListFormatPorts;
	component: ComponentPorts;
	html: HtmlPorts;
	history: {
		push: (hard: boolean) => void;
	};
	nodeTransform: NodeTransformPorts;
	char: CharPorts;
	menu: MenuPorts;
	setDefaultLine: (tag: string) => void;
	hideToolbar: () => void;
	hideToolbar_sub: () => void;
	styleNodeCache: () => void;
	formatAttrsTempCache: (attrs: { [x: string]: any }) => void;
	setOnShortcutKey: (v: boolean) => void;
	enterPrevent: (e: Event) => void;
	enterScrollTo: (range: Range) => void;
};
