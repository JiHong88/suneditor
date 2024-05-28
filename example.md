# Example usage in the framework
This is just a simple example and is not a complete answer.
If there are any examples or errors in other frameworks, please participate and correct them.
- [React](#react-component)
- [React class](#react-class)
- [Vue](#vue-component)


## React Component

### React class

### 1. Editor.tsx
```typescript
import React, { Component, createRef } from "react";
import suneditor from "suneditor";
import { en } from "suneditor/src/lang";
import plugins from "suneditor/src/plugins";
import CodeMirror from "codemirror";
import katex from "katex";
import "suneditor/dist/css/suneditor.min.css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/lib/codemirror.css";
import "katex/dist/katex.min.css";
import "./Editor.scss"


interface Props {
    contents?: string;
    onBlur?: Function;
    onSave: Function;
}

interface State {
    imageList: any[];
    selectedImages: any[];
    imageSize: string;
}

class Editor extends Component<Props, State> {
    txtArea: any;
    editor: any;
        
    constructor(props: any) {
        super(props);
        this.txtArea = createRef();
        this.state = {
            imageList: [],
            selectedImages: [],
            imageSize: "0KB",
          };
    }

    componentDidMount() {
        const editor: any = this.editor = suneditor.create(this.txtArea.current, {
            plugins: plugins,
            lang: en,
            callBackSave: (contents: string) => this.props.onSave(contents),
            codeMirror: CodeMirror,
            stickyToolbar: 0,
            katex: katex,
            width: '100%',
            height: 'auto',
            minHeight: '400px',
            value: this.props.contents,
            // imageUploadUrl: `url`,
            imageMultipleFile: true,
            previewTemplate: `
                <div style="width:auto; max-width:1136px; min-height:400px; margin:auto;">
                {{contents}}
                </div>
            `,
            buttonList: [
                // default
                ['undo', 'redo'],
                ['font', 'fontSize', 'formatBlock'],
                ['paragraphStyle', 'blockquote'],
                ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                ['fontColor', 'hiliteColor', 'textStyle'],
                ['removeFormat'],
                ['outdent', 'indent'],
                ['align', 'horizontalRule', 'list', 'lineHeight'],
                ['table', 'link', 'image', 'video'],
                ['fullScreen', 'showBlocks', 'codeView'],
                ['preview'],
                ['save'],
                // responsive
                ['%1161', [
                    ['undo', 'redo'],
                    [':p-Formats-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                    ['fontColor', 'hiliteColor', 'textStyle'],
                    ['removeFormat'],
                    ['outdent', 'indent'],
                    ['align', 'horizontalRule', 'list', 'lineHeight'],
                    ['-right', 'save'],
                    ['-right', ':i-Etc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview'],
                    ['-right', ':r-Table&Media-default.more_plus', 'table', 'link', 'image', 'video'],
                ]],
                ['%893', [
                    ['undo', 'redo'],
                    [':p-Formats-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                    ['bold', 'underline', 'italic', 'strike'],
                    [':t-Fonts-default.more_text', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle'],
                    ['removeFormat'],
                    ['outdent', 'indent'],
                    ['align', 'horizontalRule', 'list', 'lineHeight'],
                    ['-right', 'save'],
                    ['-right', ':i-Etc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview'],
                    ['-right', ':r-Table&Media-default.more_plus', 'table', 'link', 'image', 'video'],
                ]],
                ['%855', [
                    ['undo', 'redo'],
                    [':p-Formats-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                    [':t-Fonts-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle'],
                    ['removeFormat'],
                    ['outdent', 'indent'],
                    ['align', 'horizontalRule', 'list', 'lineHeight'],
                    [':r-Table&Media-default.more_plus', 'table', 'link', 'image', 'video'],
                    ['-right', 'save'],
                    ['-right', ':i-Etc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview'],
                ]],
                ['%563', [
                    ['undo', 'redo'],
                    [':p-Formats-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                    [':t-Fonts-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle'],
                    ['removeFormat'],
                    ['outdent', 'indent'],
                    [':e-List&Line-default.more_horizontal', 'align', 'horizontalRule', 'list', 'lineHeight'],
                    [':r-Table&Media-default.more_plus', 'table', 'link', 'image', 'video'],
                    ['-right', 'save'],
                    ['-right', ':i-Etc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview'],
                ]],
                ['%458', [
                    ['undo', 'redo'],
                    [':p-Formats-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                    [':t-Fonts-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle', 'removeFormat'],
                    [':e-List&Line-default.more_horizontal', 'outdent', 'indent', 'align', 'horizontalRule', 'list', 'lineHeight'],
                    [':r-Table&Media-default.more_plus', 'table', 'link', 'image', 'video'],
                    ['-right', 'save'],
                    ['-right', ':i-Etc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview'],
                ]]
            ]
        });

        editor.onBlur = () => {
            if (typeof this.props.onBlur === 'function') this.props.onBlur()
        }

        editor.onImageUpload = this.imageUpload.bind(this);
        // editor.onVideoUpload = videoUpload;
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.contents !== prevProps.contents) {
            this.editor.setContents(this.props.contents);
            this.editor.core.history.reset(true);
        }
    }

    componentWillUnmount() {
        if (this.editor) this.editor.destroy();
    }

    // image, video
    findIndex(arr: any[], index: number) {
        let idx = -1;
    
        arr.some(function (a, i) {
            if ((typeof a === 'number' ? a : a.index) === index) {
                idx = i;
                return true;
            }
            return false;
        })
    
        return idx;
    }
    
    imageUpload(targetElement: Element, index: number, state: string, imageInfo: Record<string, string>, remainingFilesCount: number) {
        if (state === 'delete') {
            this.state.imageList.splice(this.findIndex(this.state.imageList, index), 1)
            this.setState({
                imageList: this.state.imageList
            })
        } else {
            if (state === 'create') {
                const imageList = this.state.imageList;
                imageList.push(imageInfo)
                this.setState({
                    imageList: imageList
                })
            } else { // update
                //
            }
        }

        if (remainingFilesCount === 0) {
            this.setImageList()
        }
    }

    setImageList() {
        const imageList = this.state.imageList;    
        let size = 0;

        for (let i = 0; i < imageList.length; i++) {
            size += Number((imageList[i].size / 1000).toFixed(1));
        }

        this.setState({
            imageSize: size.toFixed(1) + 'KB'
        })
    }

    selectImage(evt: any, type: string, index: number) {
        evt.preventDefault();
        evt.stopPropagation();
        this.state.imageList[this.findIndex(this.state.imageList, index)][type]();
    }

    checkImage(index: number) {
        const selectedImages = this.state.selectedImages;
        const currentImageIdx = this.findIndex(selectedImages, index)

        if (currentImageIdx > -1) {
            selectedImages.splice(currentImageIdx, 1)
        } else {
            selectedImages.push(index)
        }

        this.setState({
            selectedImages: selectedImages
        })
    }

    deleteCheckedImages() {
        const iamgesInfo = this.editor.getImagesInfo();

        for (let i = 0; i < iamgesInfo.length; i++) {
            if (this.state.selectedImages.indexOf(iamgesInfo[i].index as number) > -1) {
                iamgesInfo[i].delete();
                i--;
            }
        }

        this.setState({
            selectedImages: [],
        })
    }

    fileUploadToEditor(e: any) {
        if (e.target.files) {
            this.editor.insertImage(e.target.files)
            e.target.value = ''
        }
    }

    render() {
        return <div>
            <textarea ref={this.txtArea} />
            <div className="component-list">
                <div className="file-list-info">
                    <span>Attach files</span>
                    <span className="xefu-btn">
                        <span className="files-text">Images</span>
                    </span>
                    <input type="file" id="files_upload" accept=".jpg, .jpeg, .png, .ico, .tif, .tiff, .gif, .bmp, .raw" multiple className="files-text files-input" onChange={(e: any) => this.fileUploadToEditor(e)} />
                    <span id="image_size" className="total-size text-small-2">{this.state.imageSize}</span>
                    <button className="btn btn-md btn-danger" id="image_remove" disabled={this.state.selectedImages.length === 0} onClick={() => this.deleteCheckedImages()}>삭제</button>
                </div>
                <div className="file-list">
                    <ul id="image_list">
                        {
                            this.state.imageList.map((v, i) => {
                                return <li key={i} onClick={() => this.checkImage(v.index)} className={this.state.selectedImages.includes(v.index) ? "checked" : ""}>
                                    <div>
                                        <div className="image-wrapper"><img src={v.src} /></div>
                                    </div>
                                    <a onClick={(evt: any) => this.selectImage(evt, "select", v.index)} className="image-size">{(v.size / 1000).toFixed(1)}KB</a>
                                    <div className="image-check"><svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg></div>
                                </li>
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>;
    }
}

export default Editor;
```

### 2 PostEdit.tsx
```typescript
import React, { Component, createRef } from "react";
import Editor from "./Editor";

interface Props {}

interface State {
	content: string;
}

class PostEdit extends Component<Props, State> {
	editorRef: any = createRef();

	constructor(props: Props) {
		super(props);
		this.state = {
			content: "Test",
		};
	}

	save() {
		const contents = this.editorRef.current.editor.getContents();
		console.log("save", contents);
	}

	render() {
		return (
			<div>
				<Editor ref={this.editorRef} contents={this.state.content} onSave={this.save.bind(this)}></Editor>

				<button onClick={() => this.save()}>
					<span>Save</span>
				</button>
			</div>
		);
	}
}

export default PostEdit;

```

### 3. Editor file component Scss
```scss
.sun-editor .se-dialog .se-dialog-inner .se-dialog-content {
	margin: 100px auto !important;
}
.sun-editor .se-wrapper .se-wrapper-wysiwyg {
	padding-bottom: 200px !important;
}

.sun-editor-editable .se-component.__se__float-left {
	margin: 0 0 10px 0;
}
.sun-editor-editable .se-component.__se__float-right {
	margin: 0 0 10px 0;
}

.sun-editor-editable a {
	color: #004cff !important;
	text-decoration: none !important;
}

// image list
/** image list */
.component-list {
	display: flex;
	box-sizing: border-box;
	position: relative;
	width: 100%;
	margin: 10px 0 10px 0;
	padding: 4px;
	background: #fff;
}

.xefu-btn {
	display: inline-block;
	*display: inline;
	margin: 0;
	padding: 0 12px !important;
	height: 24px !important;
	overflow: visible;
	border: 1px solid #bbb;
	border-radius: 2px;
	text-decoration: none !important;
	text-align: center;
	vertical-align: top;
	line-height: 24px !important;
	font-family: inherit;
	font-size: 12px;
	color: #333;
	*zoom: 1;
	cursor: pointer;
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
	background-color: #f5f5f5;
	*background-color: #e6e6e6;
	background-image: -moz-linear-gradient(top, #ffffff, #e6e6e6);
	background-image: -webkit-linear-gradient(top, #ffffff, #e6e6e6);
	background-image: -webkit-gradient(top, #ffffff, #e6e6e6);
	background-image: -o-linear-gradient(top, #ffffff, #e6e6e6);
	background-image: linear-gradient(top, #ffffff, #e6e6e6);
	background-repeat: repeat-x;
	filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffff',endColorstr='#e6e6e6',GradientType=0);
	filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
}

.component-list .files-text {
	display: inline-block;
	margin: 0 -12px !important;
	padding: 0 12px !important;
	overflow: visible;
	width: auto;
	height: 24px;
	border: 0;
	vertical-align: top;
	text-decoration: none !important;
	line-height: 24px;
	font-family: inherit;
	font-size: 12px;
	color: #333;
	cursor: pointer;
	background: 0 0;
}

.component-list .files-input {
	position: absolute;
	width: 86px;
	left: 26px;
	top: 27px;
	opacity: 0;
	-ms-filter: "alpha(opacity=0)";
	font-size: 8px !important;
	direction: ltr;
	cursor: pointer;
}

.component-list * {
	box-sizing: border-box;
}

.component-list button {
	margin: 0 !important;
}

.component-list .file-list-info {
	float: left;
	white-space: nowrap;
	padding: 10px;
	background: #f5f5f5;
	border: 1px solid #ccc;
}

.component-list .file-list-info span {
	display: block;
	width: 100%;
	margin: 12px 0;
}

.component-list .file-list-info .total-size {
	color: #333;
}

.component-list .file-list {
	padding: 0 0 0 0;
	margin: 0 0 0 10px;
	border: none;
}

.component-list .file-list ul {
	margin: 0;
	padding: 0;
	height: auto;
	width: 100%;
	background-color: #f5f5f5;
	border: 1px solid #ccc;
}

.component-list .file-list ul li {
	position: relative;
	display: inline-block;
	margin: 3px;
	width: auto;
	height: auto;
	border: 3px solid #fff;
}

.component-list .file-list ul li .image-wrapper {
	width: 54px;
	height: auto;
}

.component-list .file-list ul li .file-wrapper {
	cursor: default;
	width: 70px;
	height: 21px;
	font-size: 11px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: pre;
	word-break: break-all;
	padding-top: 4px;
}
.component-list .file-list ul li .file-wrapper svg {
    vertical-align: sub;
}

.component-list .file-list ul li.checked {
	border: 3px solid #dc3545;
}

.component-list .file-list ul li img {
	width: 100%;
	height: auto;
}

.component-list .file-list ul li .image-size {
	color: #666;
	font-size: 10px;
}

.component-list .file-list ul li .image-check {
	position: absolute;
	height: 12px;
	width: 12px;
	top: 0;
	left: auto;
	right: 0;
	margin: 0;
	padding: 1px 0 1px 2px;
	border: 0;
	border-radius: 0 0 0 5px;
	outline: none;
	background-color: #dc3545;
}

.component-list .file-list ul li.checked .image-check {
	display: block;
}

.component-list .file-list ul li:not(.checked) .image-check {
	display: none;
}

.component-list .file-list ul li .image-check svg {
	display: inline-block;
	font-size: 10px;
	height: 1em;
	width: 1em;
	overflow: visible;
	vertical-align: 0.875em;
	margin: 0;
	padding: 0;
	color: #fff;
}

/** video */
.component-list .component-file-list {
	width: 100%;
	padding: 0 0 0 0;
	margin: 0 0 0 10px;
	border: none;
}
.component-list .component-file-list ul {
	margin: 0;
	padding: 0;
	height: auto;
	width: 100%;
	background-color: #f5f5f5;
	border: 1px solid #ccc;
}
.component-list .component-file-list ul li {
	position: relative;
	display: inline-block;
	width: 100%;
	height: 24px;
	margin: 0;
	border: 0;
	overflow: hidden;
}
.component-list .component-file-list ul li button {
	width: 30px;
	height: 24px;
	padding: 0;
}
.component-list .component-file-list ul li a {
	color: #333;
}

```


## Vue Component