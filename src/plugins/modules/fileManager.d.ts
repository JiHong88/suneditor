import { Module } from '../Module';

/**
 * @description Require context properties when fileManager module
    _infoList: [],
    _infoIndex: 0,
    _uploadFileLength: 0
*/
declare interface fileManager extends Module {
    /**
     * @description Upload the file to the server.
     * @param  uploadUrl Upload server url
     * @param  uploadHeader Request header
     * @param  formData FormData in body
     * @param  callBack Success call back function
     * @param  errorCallBack Error call back function
     * @example this.plugins.fileManager.upload.call(this, imageUploadUrl, this.options.imageUploadHeader, formData, this.plugins.image.callBack_imgUpload.bind(this, info), this.functions.onImageUploadError);
     */
    upload(uploadUrl: string, uploadHeader: Record<string, string> | null, formData: FormData, callBack: Function | null, errorCallBack: Function | null): void;

    /**
     * @description Checke the file's information and modify the tag that does not fit the format.
     * @param  pluginName Plugin name
     * @param  tagNames Tag array to check
     * @param  uploadEventHandler Event handler to process updated file info after checking (used in "setInfo")
     * @param  modifyHandler A function to modify a tag that does not fit the format (Argument value: Tag element)
     * @param  resizing True if the plugin is using a resizing module
     * @example 
     * const modifyHandler = function (tag) {
     *      imagePlugin.onModifyMode.call(this, tag, null);
     *      imagePlugin.openModify.call(this, true);
     *      imagePlugin.update_image.call(this, true, false, true);
     *  }.bind(this);
     *  this.plugins.fileManager.checkInfo.call(this, 'image', ['img'], this.functions.onImageUpload, modifyHandler, true);
     */
    checkInfo(pluginName: string, tagNames: string[], uploadEventHandler: Function | null, modifyHandler: Function | null, resizing: boolean): void;

    /**
     * @description Create info object of file and add it to "_infoList" (this.context[pluginName]._infoList[])
     * @param  pluginName Plugin name 
     * @param  element 
     * @param  uploadEventHandler Event handler to process updated file info (created in setInfo)
     * @param  file 
     * @param  resizing True if the plugin is using a resizing module
     * @example 
     * uploadCallBack {.. file = { name: fileList[i].name, size: fileList[i].size };
     * this.plugins.fileManager.setInfo.call(this, 'image', oImg, this.functions.onImageUpload, file, true);
     */
    setInfo(pluginName: string, element, uploadEventHandler: Function | null, file:Record<string, string|number> | null, resizing: boolean): void;

    /**
     * @description Delete info object at "_infoList"
     * @param  pluginName Plugin name 
     * @param  index index of info object (this.context[pluginName]._infoList[].index)
     * @param  uploadEventHandler Event handler to process updated file info (created in setInfo)
     */
    deleteInfo(pluginName: string, index, uploadEventHandler: Function | null): void;

    /**
     * @description Reset info object and "_infoList = []", "_infoIndex = 0"
     * @param  pluginName Plugin name 
     * @param  uploadEventHandler Event handler to process updated file info (created in setInfo)
     */
    resetInfo(pluginName: string, uploadEventHandler: Function | null): void;
}

export default fileManager;