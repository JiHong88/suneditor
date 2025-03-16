export default FileManager;
export type FileStateInfo = {
	/**
	 * File source
	 */
	src: string;
	/**
	 * File index
	 */
	index: number;
	/**
	 * File name
	 */
	name: string;
	/**
	 * File size
	 */
	size: number;
};
export type FileStateParams = {
	/**
	 * - The root editor instance
	 */
	editor: __se__EditorCore;
	/**
	 * File element
	 */
	element: Node;
	/**
	 * File index
	 */
	index: number;
	/**
	 * File state ("create"|"update"|"delete")
	 */
	state: string;
	/**
	 * File information
	 */
	info: FileStateInfo;
	/**
	 * Remaining file count
	 */
	remainingFilesCount: number;
	/**
	 * Plugin name
	 */
	pluginName: string;
};
export type FileManagerParams = {
	/**
	 * The query selector used to find file elements in the editor
	 */
	query: string;
	/**
	 * A function to handle the loaded file information
	 */
	loadHandler?: ((params: Array<FileStateInfo>) => void) | undefined;
	/**
	 * A function to handle file-related events
	 */
	eventHandler?: ((info: FileStateParams) => void) | undefined;
};
/**
 * @typedef {Object} FileStateInfo
 * @property {string} src File source
 * @property {number} index File index
 * @property {string} name File name
 * @property {number} size File size
 */
/**
 * @typedef {Object} FileStateParams
 * @property {__se__EditorCore} editor - The root editor instance
 * @property {Node} element File element
 * @property {number} index File index
 * @property {string} state File state ("create"|"update"|"delete")
 * @property {FileStateInfo} info File information
 * @property {number} remainingFilesCount Remaining file count
 * @property {string} pluginName Plugin name
 */
/**
 * @typedef {Object} FileManagerParams
 * @property {string} query The query selector used to find file elements in the editor
 * @property {(params: Array<FileStateInfo>) => void=} loadHandler A function to handle the loaded file information
 * @property {(info: FileStateParams) => void=} eventHandler A function to handle file-related events
 */
/**
 * @class
 * @description This module manages the file information of the editor.
 */
declare class FileManager extends CoreInjector {
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {FileManagerParams} params FileManager options
	 */
	constructor(inst: any, params: FileManagerParams);
	ui: import('../../types/core/class/ui').default;
	kind: any;
	inst: any;
	component: any;
	query: string;
	loadHandler: (params: Array<FileStateInfo>) => void;
	eventHandler: (info: FileStateParams) => void;
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
	 * @param {?(xmlHttp: XMLHttpRequest) => boolean=} callBack Success call back function
	 * @param {?(res: *, xmlHttp: XMLHttpRequest) => string=} errorCallBack Error call back function
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
		callBack?: (((xmlHttp: XMLHttpRequest) => boolean) | null) | undefined,
		errorCallBack?: (((res: any, xmlHttp: XMLHttpRequest) => string) | null) | undefined
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
			  }
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
			size
		}: {
			name: string;
			size: number;
		}
	): void;
	/**
	 * @private
	 * @description Create info object of file and add it to "infoList"
	 * @param {HTMLMediaElement} element
	 * @param {{name: string, size: number}|null} file File information
	 */
	private _setInfo;
	/**
	 * @description Gets the sum of the sizes of the currently saved files.
	 * @returns {number} Size
	 */
	getSize(): number;
	/**
	 * @private
	 * @description Checke the file's information and modify the tag that does not fit the format.
	 * @param {boolean} loaded Whether the editor is loaded
	 */
	private _checkInfo;
	/**
	 * @private
	 * @description Reset info object and "infoList = []", "infoIndex = 0"
	 */
	private _resetInfo;
	/**
	 * @private
	 * @description Delete info object at "infoList"
	 * @param {number} index index of info object infoList[].index)
	 */
	private _deleteInfo;
}
import CoreInjector from '../editorInjector/_core';
import ApiManager from './ApiManager';
