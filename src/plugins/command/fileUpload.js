import EditorInjector from '../../editorInjector';
// import { domUtils } from '../../helper';

const FileUpload = function (editor) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.fileUpload;
	this.icon = 'file_upload';

	// members
};

FileUpload.key = 'fileUpload';
FileUpload.type = 'command';
FileUpload.className = '';
FileUpload.prototype = {
	constructor: FileUpload
};

export default FileUpload;
