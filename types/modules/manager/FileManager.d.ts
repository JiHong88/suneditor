import type {} from '../../typedef';
export default FileManager;
export type FileManagerParams = {
	/**
	 * The query selector used to find file elements in the editor
	 */
	query: string;
	/**
	 * Event name for file load (e.g., `'onImageLoad'`)
	 */
	loadEventName: string;
	/**
	 * Event name for file action (e.g., `'onImageAction'`)
	 */
	actionEventName: string;
};
/**
 * @typedef {Object} FileManagerParams
 * @property {string} query The query selector used to find file elements in the editor
 * @property {string} loadEventName Event name for file load (e.g., `'onImageLoad'`)
 * @property {string} actionEventName Event name for file action (e.g., `'onImageAction'`)
 */
/**
 * @class
 * @description This module manages the file information of the editor.
 */
declare class FileManager {
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {FileManagerParams} params FileManager options
	 */
	constructor(inst: any, $: SunEditor.Deps, params: FileManagerParams);
	kind: any;
	inst: any;
	query: string;
	loadEventName: string;
	actionEventName: string;
	infoList: any[];
	infoIndex: number;
	uploadFileLength: number;
	__updateTags: any[];
	apiManager: ApiManager;
	/**
	 * @description Upload the file to the server.
	 * @param {string} uploadUrl Upload server url
	 * @param {?Object<string, string>} uploadHeader Request header
	 * @param {FileList|File[]|{formData: FormData, size: number}} data FormData in body or Files array
	 * @param {?(xmlHttp: XMLHttpRequest) => boolean} [callBack] Success call back function
	 * @param {?(res: *, xmlHttp: XMLHttpRequest) => string} [errorCallBack] Error call back function
	 */
	upload(
		uploadUrl: string,
		uploadHeader: {
			[x: string]: string;
		} | null,
		data:
			| FileList
			| File[]
			| {
					formData: FormData;
					size: number;
			  },
		callBack?: ((xmlHttp: XMLHttpRequest) => boolean) | null,
		errorCallBack?: ((res: any, xmlHttp: XMLHttpRequest) => string) | null,
	): void;
	/**
	 * @description Upload the file to the server.
	 * @param {string} uploadUrl Upload server url
	 * @param {?Object<string, string>} uploadHeader Request header
	 * @param {FileList|File[]|{formData: FormData, size: number}} data FormData in body or Files array
	 * @returns {Promise<XMLHttpRequest>}
	 */
	asyncUpload(
		uploadUrl: string,
		uploadHeader: {
			[x: string]: string;
		} | null,
		data:
			| FileList
			| File[]
			| {
					formData: FormData;
					size: number;
			  },
	): Promise<XMLHttpRequest>;
	/**
	 * @description Set the file information to the element.
	 * @param {Node} element File information element
	 * @param {Object} params
	 * @param {string} params.name File name
	 * @param {number} params.size File size
	 * @returns
	 */
	setFileData(
		element: Node,
		{
			name,
			size,
		}: {
			name: string;
			size: number;
		},
	): void;
	/**
	 * @description Gets the sum of the sizes of the currently saved files.
	 * @returns {number} Size
	 */
	getSize(): number;
	/**
	 * @internal
	 * @description Checke the file's information and modify the tag that does not fit the format.
	 * @param {boolean} loaded Whether the editor is loaded
	 */
	_checkInfo(loaded: boolean): void;
	/**
	 * @internal
	 * @description Reset info object and `infoList = []`, `infoIndex = 0`
	 */
	_resetInfo(): void;
	#private;
}
import ApiManager from './ApiManager';
