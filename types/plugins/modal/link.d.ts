import type {} from '../../typedef';
export default Link;
export type LinkOptions = {
	/**
	 * - The URL endpoint for file uploads.
	 */
	uploadUrl?: string;
	/**
	 * - Additional headers for file upload requests.
	 */
	uploadHeaders?: {
		[x: string]: string;
	};
	/**
	 * - The total file upload size limit in bytes.
	 */
	uploadSizeLimit?: number;
	/**
	 * - The single file upload size limit in bytes.
	 */
	uploadSingleSizeLimit?: number;
	/**
	 * - Accepted file formats for link uploads.
	 */
	acceptedFormats?: string;
};
export type LinkPluginOptions = Omit<LinkOptions & import('../../modules/utils/ModalAnchorEditor').ModalAnchorEditorParams, ''>;
/**
 * @typedef {Object} LinkOptions
 * @property {string} [uploadUrl] - The URL endpoint for file uploads.
 * @property {Object<string, string>} [uploadHeaders] - Additional headers for file upload requests.
 * @property {number} [uploadSizeLimit] - The total file upload size limit in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file upload size limit in bytes.
 * @property {string} [acceptedFormats] - Accepted file formats for link uploads.
 */
/**
 * @typedef {Omit<LinkOptions & import('../../modules/utils/ModalAnchorEditor').ModalAnchorEditorParams, ''>} LinkPluginOptions
 */
/**
 * @class
 * @description Link plugin.
 * - This plugin provides link insertion and editing functionality within the editor.
 * - It also supports file uploads if an upload URL is provided.
 */
declare class Link extends PluginModal {
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {LinkPluginOptions} pluginOptions
	 */
	constructor(editor: SunEditor.Core, pluginOptions: LinkPluginOptions);
	title: any;
	target: HTMLAnchorElement;
	isUpdateState: boolean;
	pluginOptions: {
		uploadUrl: string;
		uploadHeaders: {
			[x: string]: string;
		} & {
			[x: string]: string;
		};
		uploadSizeLimit: number;
		uploadSingleSizeLimit: number;
		acceptedFormats: string;
		enableFileUpload: boolean;
		/**
		 * - Modal title display.
		 */
		title?: boolean;
		/**
		 * - Create Text to display input.
		 */
		textToDisplay?: boolean;
		/**
		 * - Default checked value of the "Open in new window" checkbox.
		 */
		openNewWindow?: boolean;
		/**
		 * - If true, disables the automatic prefixing of the host URL to the value of the link.
		 */
		noAutoPrefix?: boolean;
		/**
		 * - The "rel" attribute list of anchor tag.
		 */
		relList?: Array<string>;
		/**
		 * - Default "rel" attributes of anchor tag.
		 */
		defaultRel?: {
			default?: string;
			check_new_window?: string;
			check_bookmark?: string;
		};
	};
	anchor: ModalAnchorEditor;
	modal: Modal;
	controller: Controller;
	active(element?: HTMLElement | null, target?: HTMLElement | null): boolean | void;
	modalOn(isUpdate: boolean): void;
	modalAction(): Promise<boolean>;
	modalInit(): void;
	controllerAction(target: HTMLButtonElement): void;
	controllerClose(): void;
	#private;
}
import { PluginModal } from '../../interfaces';
import { Modal } from '../../modules/contracts';
import { Controller } from '../../modules/contracts';
import { ModalAnchorEditor } from '../../modules/utils';
