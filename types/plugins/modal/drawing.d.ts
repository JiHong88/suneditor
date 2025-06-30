export default Drawing;
export type DrawingPluginOptions = {
	/**
	 * - The output format of the drawing. Options: "dataurl", "svg".
	 */
	outputFormat?: string;
	/**
	 * - Whether to enable format type selection (block vs inline).
	 */
	useFormatType?: boolean;
	/**
	 * - The default format type, either "block" or "inline".
	 */
	defaultFormatType?: string;
	/**
	 * - Whether to maintain the chosen format type after drawing.
	 */
	keepFormatType?: boolean;
	/**
	 * - The width of the drawing line.
	 */
	lineWidth?: number;
	/**
	 * - Whether to reconnect lines when drawing.
	 */
	lineReconnect?: boolean;
	/**
	 * - The style of the line cap ("butt", "round", or "square").
	 */
	lineCap?: CanvasLineCap;
	/**
	 * - The color of the drawing line.
	 */
	lineColor?: string;
	/**
	 * - Whether the modal form can be resized.
	 */
	canResize?: boolean;
	/**
	 * - Whether to maintain the aspect ratio when resizing.
	 */
	maintainRatio?: boolean;
	/**
	 * - The size configuration for the drawing modal form.
	 */
	formSize?: {
		width?: string;
		height?: string;
		maxWidth?: string;
		maxHeight?: string;
		minWidth?: string;
		minHeight?: string;
	};
};
/**
 * @typedef {Object} DrawingPluginOptions
 * @property {string} [outputFormat="dataurl"] - The output format of the drawing. Options: "dataurl", "svg".
 * @property {boolean} [useFormatType=false] - Whether to enable format type selection (block vs inline).
 * @property {string} [defaultFormatType="block"] - The default format type, either "block" or "inline".
 * @property {boolean} [keepFormatType=false] - Whether to maintain the chosen format type after drawing.
 * @property {number} [lineWidth=5] - The width of the drawing line.
 * @property {boolean} [lineReconnect=false] - Whether to reconnect lines when drawing.
 * @property {CanvasLineCap} [lineCap="round"] - The style of the line cap ("butt", "round", or "square").
 * @property {string} [lineColor=""] - The color of the drawing line.
 * @property {boolean} [canResize=true] - Whether the modal form can be resized.
 * @property {boolean} [maintainRatio=true] - Whether to maintain the aspect ratio when resizing.
 * @property {Object} [formSize={}] - The size configuration for the drawing modal form.
 * @property {string} [formSize.width="750px"] - The width of the modal form.
 * @property {string} [formSize.height="50vh"] - The height of the modal form.
 * @property {string} [formSize.maxWidth=""] - The maximum width of the modal form.
 * @property {string} [formSize.maxHeight=""] - The maximum height of the modal form.
 * @property {string} [formSize.minWidth="150px"] - The minimum width of the modal form.
 * @property {string} [formSize.minHeight="100px"] - The minimum height of the modal form.
 */
/**
 * @class
 * @description Drawing modal plugin.
 */
declare class Drawing extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {DrawingPluginOptions} pluginOptions
	 */
	constructor(editor: __se__EditorCore, pluginOptions: DrawingPluginOptions);
	title: any;
	icon: string;
	pluginOptions: {
		outputFormat: string;
		useFormatType: boolean;
		defaultFormatType: string;
		keepFormatType: boolean;
		lineWidth: number;
		lineReconnect: boolean;
		lineCap: CanvasLineCap;
		lineColor: string;
		formSize: {
			/**
			 * - The width of the modal form.
			 */
			width: string;
			/**
			 * - The height of the modal form.
			 */
			height: string;
			/**
			 * - The maximum width of the modal form.
			 */
			maxWidth: string;
			/**
			 * - The maximum height of the modal form.
			 */
			maxHeight: string;
			/**
			 * - The minimum width of the modal form.
			 */
			minWidth: string;
			/**
			 * - The minimum height of the modal form.
			 */
			minHeight: string;
		};
		canResize: boolean;
		maintainRatio: boolean;
	};
	modal: Modal;
	as: string;
	asBlock: Element;
	asInline: Element;
	/**
	 * @type {HTMLCanvasElement}
	 */
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	isDrawing: boolean;
	points: any[];
	paths: any[];
	resizeObserver: ResizeObserver;
	__events: {
		touchstart: any;
		touchmove: any;
		mousedown: any;
		mousemove: any;
		mouseup: any;
		mouseleave: any;
		mouseenter: any;
	};
	__eventsRegister: {
		touchstart: any;
		touchmove: any;
		mousedown: any;
		mousemove: any;
		mouseup: any;
		mouseleave: any;
		mouseenter: any;
	};
	__eventNameMap: {
		mousedown: string;
		mousemove: string;
		mouseup: string;
		mouseleave: string;
		mouseenter: string;
	};
	/**
	 * @editorMethod Modules.Modal
	 * @description Executes the method that is called when a "Modal" module's is opened.
	 */
	open(): void;
	/**
	 * @editorMethod Modules.Modal
	 * @description Executes the method that is called when a plugin's "modal" is closed.
	 */
	off(): void;
	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called when a form within a modal window is "submit".
	 * @returns {boolean} Success or failure
	 */
	modalAction(): boolean;
	/**
	 * @private
	 * @description Initializes the drawing canvas, sets up event listeners, and configures resize handling.
	 */
	private _initDrawing;
	/**
	 * @private
	 * @description Destroys the drawing canvas, removes event listeners, and clears stored drawing data.
	 */
	private _destroyDrawing;
	/**
	 * @private
	 * @description Configures the drawing context (canvas settings like line width, color, etc.).
	 */
	private _setCtx;
	/**
	 * @private
	 * @description Draws the current stroke based on collected points.
	 */
	private _draw;
	/**
	 * @private
	 * @description Redraws all stored paths onto the canvas.
	 */
	private _drawAll;
	/**
	 * @private
	 * @description Adjusts all stored paths to fit new canvas dimensions after a resize event.
	 * @param {number} prevWidth - The previous width of the canvas.
	 * @param {number} prevHeight - The previous height of the canvas.
	 * @param {number} newWidth - The new width of the canvas.
	 * @param {number} newHeight - The new height of the canvas.
	 */
	private _adjustPathsToNewDimensions;
	/**
	 * @private
	 * @description Clears the canvas and resets stored drawing paths.
	 */
	private _clearCanvas;
	/**
	 * @private
	 * @description Generates an SVG representation of the drawn content.
	 * @returns {*} The generated SVG element.
	 */
	private _getSVG;
	/**
	 * @private
	 * @description Converts the SVG element into a downloadable file.
	 * @returns {FileList} A FileList containing the generated SVG file.
	 */
	private _getSVGFileList;
	/**
	 * @private
	 * @description Retrieves touch coordinates relative to the canvas.
	 * @param {TouchEvent} e - The touch event.
	 * @returns {{x: number, y: number}} An object containing the x and y coordinates.
	 */
	private _getCanvasTouchPointer;
	/**
	 * @private
	 * @description Activates either block or inline format mode for inserted drawings.
	 * @param {boolean} isInline - Whether the drawing should be inserted as an inline element.
	 */
	private _activeAsInline;
	#private;
}
import EditorInjector from '../../editorInjector';
import { Modal } from '../../modules';
