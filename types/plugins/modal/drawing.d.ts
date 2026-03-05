import type {} from '../../typedef';
export default Drawing;
export type DrawingPluginOptions = {
	/**
	 * - The output format of the drawing. Options: `"dataurl"`, `"svg"`.
	 */
	outputFormat?: string;
	/**
	 * - Whether to enable format type selection (`block` vs `inline`).
	 */
	useFormatType?: boolean;
	/**
	 * - The default format type, either `"block"` or `"inline"`.
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
	 * - The style of the line cap (`"butt"`, `"round"`, or `"square"`).
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
 * @property {string} [outputFormat="dataurl"] - The output format of the drawing. Options: `"dataurl"`, `"svg"`.
 * @property {boolean} [useFormatType=false] - Whether to enable format type selection (`block` vs `inline`).
 * @property {string} [defaultFormatType="block"] - The default format type, either `"block"` or `"inline"`.
 * @property {boolean} [keepFormatType=false] - Whether to maintain the chosen format type after drawing.
 * @property {number} [lineWidth=5] - The width of the drawing line.
 * @property {boolean} [lineReconnect=false] - Whether to reconnect lines when drawing.
 * @property {CanvasLineCap} [lineCap="round"] - The style of the line cap (`"butt"`, `"round"`, or `"square"`).
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
declare class Drawing extends PluginModal {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {DrawingPluginOptions} pluginOptions
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: DrawingPluginOptions);
	title: any;
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
	modalOff(isUpdate: boolean): void;
	modalAction(): Promise<boolean>;
	#private;
}
import { PluginModal } from '../../interfaces';
import { Modal } from '../../modules/contract';
