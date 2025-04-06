export default Toolbar;
export type ToolbarThis = Omit<Toolbar & Partial<__se__EditorInjector>, 'toolbar' | 'subToolbar'>;
/**
 * @typedef {Omit<Toolbar & Partial<__se__EditorInjector>, 'toolbar' | 'subToolbar'>} ToolbarThis
 */
/**
 * @constructor
 * @this {ToolbarThis}
 * @description Toolbar class
 * @param {__se__EditorCore} editor - The root editor instance
 * @param {Object} options - toolbar options
 * @param {String} options.keyName - toolbar key name
 * @param {Boolean} options.balloon - balloon toolbar
 * @param {Boolean} options.inline - inline toolbar
 * @param {Boolean} options.balloonAlways - balloon toolbar always show
 * @param {Array<Node>} options.res - responsive toolbar button list
 */
declare function Toolbar(
	this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>,
	editor: __se__EditorCore,
	{
		keyName,
		balloon,
		inline,
		balloonAlways,
		res
	}: {
		keyName: string;
		balloon: boolean;
		inline: boolean;
		balloonAlways: boolean;
		res: Array<Node>;
	}
): void;
declare class Toolbar {
	/**
	 * @typedef {Omit<Toolbar & Partial<__se__EditorInjector>, 'toolbar' | 'subToolbar'>} ToolbarThis
	 */
	/**
	 * @constructor
	 * @this {ToolbarThis}
	 * @description Toolbar class
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {Object} options - toolbar options
	 * @param {String} options.keyName - toolbar key name
	 * @param {Boolean} options.balloon - balloon toolbar
	 * @param {Boolean} options.inline - inline toolbar
	 * @param {Boolean} options.balloonAlways - balloon toolbar always show
	 * @param {Array<Node>} options.res - responsive toolbar button list
	 */
	constructor(
		editor: __se__EditorCore,
		{
			keyName,
			balloon,
			inline,
			balloonAlways,
			res
		}: {
			keyName: string;
			balloon: boolean;
			inline: boolean;
			balloonAlways: boolean;
			res: Array<Node>;
		}
	);
	keyName: string;
	isSub: boolean;
	currentMoreLayerActiveButton: HTMLButtonElement;
	_isBalloon: boolean;
	_isInline: boolean;
	_isBalloonAlways: boolean;
	_responsiveCurrentSize: string;
	_originRes: Node[];
	_rButtonArray: Node[];
	_rButtonsInfo: {
		default: Node;
	};
	_rButtonsize: any[];
	_sticky: boolean;
	_isViewPortSize: boolean;
	_inlineToolbarAttr: {
		top: string;
		width: string;
		isShow: boolean;
	};
	_balloonOffset: {
		top: number;
		left: number;
	};
	/**
	 * @this {ToolbarThis}
	 * @description Disable the toolbar
	 */
	disable(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>): void;
	/**
	 * @this {ToolbarThis}
	 * @description Enable the toolbar
	 */
	enable(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>): void;
	/**
	 * @this {ToolbarThis}
	 * @description Show the toolbar
	 */
	show(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>): void;
	/**
	 * @this {ToolbarThis}
	 * @description Hide the toolbar
	 */
	hide(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>): void;
	/**
	 * @this {ToolbarThis}
	 * @description Reset buttons of the responsive toolbar.
	 */
	resetResponsiveToolbar(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>): void;
	/**
	 * @this {ToolbarThis}
	 * @description Reset the buttons on the toolbar. (Editor is not reloaded)
	 * - You cannot set a new plugin for the button.
	 * @param {Array} buttonList Button list
	 */
	setButtons(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>, buttonList: any[]): void;
	/**
	 * @private
	 * @this {ToolbarThis}
	 * @description Reset the sticky toolbar position based on the editor state.
	 */
	_resetSticky(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>): void;
	/**
	 * @private
	 * @this {ToolbarThis}
	 * @description Enable sticky toolbar mode and adjust position.
	 */
	_onSticky(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>, inlineOffset: any): void;
	/**
	 * @private
	 * @this {ToolbarThis}
	 * @description Get the viewport's top offset.
	 * @returns {number}
	 */
	__getViewportTop(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>): number;
	/**
	 * @private
	 * @this {ToolbarThis}
	 * @description Disable sticky toolbar mode.
	 */
	_offSticky(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>): void;
	/**
	 * @private
	 * @this {ToolbarThis}
	 * @description Set up responsive behavior for the toolbar buttons.
	 */
	_setResponsive(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>): void;
	/**
	 * @private
	 * @this {ToolbarThis}
	 * @description Show the balloon toolbar based on the current selection.
	 * @param {?Range=} rangeObj - Selection range
	 */
	_showBalloon(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>, rangeObj?: (Range | null) | undefined): void;
	/**
	 * @private
	 * @this {ToolbarThis}
	 * @description Adjust the balloon toolbar's position.
	 * @param {boolean} positionTop - Whether the toolbar should be positioned above the selection
	 * @param {Range} [range] - Selection range
	 */
	_setBalloonOffset(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>, positionTop: boolean, range?: Range): void;
	/**
	 * @private
	 * @this {ToolbarThis}
	 * @description Show the inline toolbar mode.
	 */
	_showInline(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>): void;
	/**
	 * @private
	 * @this {ToolbarThis}
	 * @description Show a more options layer for toolbar buttons.
	 * @param {Node} button - Button element
	 * @param {Node} layer - More options layer element
	 */
	_moreLayerOn(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>, button: Node, layer: Node): void;
	/**
	 * @private
	 * @this {ToolbarThis}
	 * @description Hide the currently active more options layer.
	 */
	_moreLayerOff(this: Omit<Toolbar & Partial<import('../../editorInjector').default>, 'toolbar' | 'subToolbar'>): void;
}
