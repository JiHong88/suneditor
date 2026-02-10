import type {} from '../../../typedef';
export default Toolbar;
/**
 * @description Toolbar class
 */
declare class Toolbar {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 * @param {Object} options - Toolbar options
	 * @param {"toolbar"|"toolbar_sub"} options.keyName - Toolbar key name
	 * @param {boolean} options.balloon - Balloon toolbar
	 * @param {boolean} options.inline - Inline toolbar
	 * @param {boolean} options.balloonAlways - Balloon toolbar always show
	 * @param {Array<Node>} options.res - Responsive toolbar button list
	 */
	constructor(
		kernel: SunEditor.Kernel,
		{
			keyName,
			balloon,
			inline,
			balloonAlways,
			res,
		}: {
			keyName: 'toolbar' | 'toolbar_sub';
			balloon: boolean;
			inline: boolean;
			balloonAlways: boolean;
			res: Array<Node>;
		},
	);
	isSub: boolean;
	/**
	 * @type {Object}
	 * @description Key names for the toolbar elements.
	 * @property {"toolbar_sub_main"|"toolbar_main"} main - Main toolbar key name
	 * @property {"toolbar_sub_buttonTray"|"toolbar_buttonTray"} buttonTray - Button tray key name
	 * @property {"toolbar_sub_width"|"toolbar_width"} width - Toolbar width key name
	 */
	keyName: any;
	currentMoreLayerActiveButton: HTMLButtonElement;
	isSticky: boolean;
	isBalloonMode: boolean;
	isInlineMode: boolean;
	isBalloonAlwaysMode: boolean;
	inlineToolbarAttr: {
		top: string;
		width: string;
		isShow: boolean;
	};
	balloonOffset: {
		top: number;
		left: number;
	};
	/**
	 * @description Disables all toolbar buttons.
	 */
	disable(): void;
	/**
	 * @description Enables all toolbar buttons.
	 */
	enable(): void;
	/**
	 * @description Shows the toolbar.
	 */
	show(): void;
	/**
	 * @description Hides the toolbar.
	 */
	hide(): void;
	/**
	 * @description Reset buttons of the responsive toolbar.
	 */
	resetResponsiveToolbar(): void;
	/**
	 * @description Reset the buttons on the toolbar. (Editor is not reloaded)
	 * - You cannot set a new plugin for the button.
	 * @param {Array} buttonList Button list
	 */
	setButtons(buttonList: any[]): void;
	/**
	 * @internal
	 * @description Reset the sticky toolbar position based on the editor state.
	 */
	_resetSticky(): void;
	/**
	 * @internal
	 * @description Set up responsive behavior for the toolbar buttons.
	 */
	_setResponsive(): void;
	/**
	 * @internal
	 * @description Show the balloon toolbar based on the current selection.
	 * @param {?Range} [rangeObj] - Selection range
	 */
	_showBalloon(rangeObj?: Range | null): void;
	/**
	 * @internal
	 * @description Adjust the balloon toolbar's position.
	 * @param {boolean} positionTop - Whether the toolbar should be positioned above the selection
	 * @param {Range} [range] - Selection range
	 */
	_setBalloonOffset(positionTop: boolean, range?: Range): void;
	/**
	 * @internal
	 * @description Show the inline toolbar mode.
	 */
	_showInline(): void;
	/**
	 * @internal
	 * @description Show a more options layer for toolbar buttons.
	 * @param {Node} button - Button element
	 * @param {Node} layer - More options layer element
	 */
	_moreLayerOn(button: Node, layer: Node): void;
	/**
	 * @internal
	 * @description Hide the currently active more options layer.
	 */
	_moreLayerOff(): void;
	/**
	 * @internal
	 * @description Destroy the Toolbar instance and release memory
	 */
	_destroy(): void;
	#private;
}
