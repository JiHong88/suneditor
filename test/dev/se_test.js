import suneditor from '../../src/suneditor';
import { getPageStyle } from '../../src/helper/env';
import '../../src/typedef'; // Import typedef for global SunEditor namespace
require('../../src/assets/suneditor.css');
require('../../src/assets/suneditor-contents.css');
require('../../src/themes/dark.css');

// katex
import Katex from 'katex';
require('katex/dist/katex.css');

// MathJax
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { browserAdaptor } from 'mathjax-full/js/adaptors/browserAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';

// codemirror6
import { EditorView, basicSetup, minimalSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';

// // codemirror5
import Codemirror5 from 'codemirror5';
require('codemirror5/lib/codemirror.css');
require('codemirror5/mode/htmlmixed/htmlmixed');

// perfect-freehand
// import PerfectFreehand from 'perfect-freehand';

import langs, { pl } from '../../src/langs';
// import blockquote from '../../src/plugins/command/blockquote';
// import align from '../../src/plugins/dropdown/align';
// import font from '../../src/plugins/dropdown/font';
// import fontColor from '../../src/plugins/dropdown/fontColor';
// import backgroundColor from '../../src/plugins/dropdown/backgroundColor';
// import fontSize from '../../src/plugins/dropdown/fontSize';
// import blockStyle from '../../src/plugins/dropdown/blockStyle';
// import hr from '../../src/plugins/dropdown/hr';
// import lineHeight from '../../src/plugins/dropdown/lineHeight';
// import list from '../../src/plugins/dropdown/list';
// import paragraphStyle from '../../src/plugins/dropdown/paragraphStyle';
// import template from '../../src/plugins/dropdown/template';
// import layout from '../../src/plugins/dropdown/layout';
// import textStyle from '../../src/plugins/dropdown/textStyle';
// import table from '../../src/plugins/dropdown/table';
// import math from '../../src/plugins/modal/math';
// import link from '../../src/plugins/modal/link';
// import audio from '../../src/plugins/modal/audio';
// import image from '../../src/plugins/modal/image';
// import video from '../../src/plugins/modal/video';
// import imageGallery from '../../src/plugins/browser/imageGallery';
import plugins from '../../src/plugins';
import { getClientSize } from '../../src/helper/dom/domUtils';

// , 'dir_ltr', 'dir_rtl', 'list'
const bl = [
	// full size
	['undo', 'redo', '|', 'dir', 'newDocument', 'selectAll', 'save', 'preview', 'print', 'exportPDF'],
	'|',
	['blockquote', '|', 'blockStyle', 'font', 'fontSize', '|', 'paragraphStyle', 'textStyle'],
	'|',
	['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
	['fontColor', 'backgroundColor'],
	'|',
	['removeFormat', 'copyFormat'],
	'|',
	['align', 'lineHeight'],
	'/',
	['list_numbered', 'list_bulleted'],
	'|',
	['outdent', 'indent'],
	'|',
	['table', 'hr', 'link', 'anchor', 'math'],
	'|',
	['image', 'drawing', 'video', 'audio', 'embed'],
	'|',
	['imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
	'|',
	['fileUpload', 'template', 'layout'],
	'|',
	['fullScreen', 'showBlocks', 'codeView'],
	'|',
	['pageBreak', 'pageNavigator', 'pageUp', 'pageDown'],
	'|',
	['copy'],
	// (min-width: 1200)
	[
		'%1200',
		[
			['undo', 'redo', '|', 'dir', 'newDocument', 'selectAll', 'save', 'preview', 'print', 'exportPDF'],
			'|',
			[':Paragraph-default.more_paragraph', 'blockquote', '|', 'blockStyle', 'font', 'fontSize', '|', 'paragraphStyle'],
			'|',
			['textStyle'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor'],
			'|',
			['removeFormat', 'copyFormat'],
			'/',
			['outdent', 'indent'],
			'|',
			[':Lists & Align-default.more_list', 'align', 'lineHeight', 'list_numbered', 'list_bulleted'],
			[':Media-default.more_media', 'image', 'drawing', 'video', 'audio', 'embed'],
			[':Galleries-default.more_gallery', 'imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
			'|',
			['table', 'hr', 'link', 'anchor', 'math'],
			'|',
			['fileUpload', 'template', 'layout'],
			'|',
			['fullScreen', 'showBlocks', 'codeView'],
			'|',
			['pageBreak', 'pageNavigator', 'pageUp', 'pageDown'],
			'|',
			['copy'],
		],
	],
	// (min-width: 992)
	[
		'%992',
		[
			['undo', 'redo', '|', 'dir', 'newDocument', 'selectAll', 'save', 'preview', 'print', 'exportPDF'],
			'|',
			[':Paragraph-default.more_paragraph', 'blockquote', '|', 'blockStyle', 'font', 'fontSize', '|', 'paragraphStyle'],
			'|',
			[':Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', '|', 'removeFormat', 'copyFormat', 'textStyle', 'copy'],
			['outdent', 'indent'],
			'|',
			[':Insert-default.more_plus', 'hr', 'link', 'anchor', 'math'],
			['table'],
			'|',
			[':Lists & Align-default.more_list', 'align', 'lineHeight', 'list_numbered', 'list_bulleted'],
			[':Media-default.more_media', 'image', 'drawing', 'video', 'audio', 'embed'],
			[':Galleries-default.more_gallery', 'imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
			[':File-default.more_file', 'fileUpload', 'template', 'layout'],
			['-right', ':View-default.more_view', 'preview', 'print', 'fullScreen', 'showBlocks', 'codeView'],
		],
	],
	// (min-width: 768)
	[
		'%768',
		[
			['undo', 'redo'],
			'|',
			[':Docs-default.more_horizontal', 'dir', 'newDocument', 'selectAll'],
			['save'],
			[':Paragraph-default.more_paragraph', 'blockquote', '|', 'blockStyle', 'font', 'fontSize', '|', 'paragraphStyle'],
			[':Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', '|', 'removeFormat', 'copyFormat', 'textStyle', 'copy'],
			['outdent', 'indent'],
			[':Insert-default.more_plus', 'table', 'hr', 'link', 'anchor', 'math'],
			'|',
			[':Lists & Align-default.more_list', 'align', 'lineHeight', 'list_numbered', 'list_bulleted'],
			[':Media-default.more_media', 'image', 'drawing', 'video', 'audio', 'embed'],
			[':Galleries-default.more_gallery', 'imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
			[':File-default.more_file', 'fileUpload', 'template', 'layout'],
			'|',
			['-right', ':Pages-default.more_page', 'pageBreak', 'pageNavigator', 'pageUp', 'pageDown'],
			['-right', ':View-default.more_view', 'preview', 'print', 'exportPDF', 'fullScreen', 'showBlocks', 'codeView'],
		],
	],
	// (min-width: 525)
	[
		'%576',
		[
			['undo', 'redo'],
			'|',
			[':Docs-default.more_horizontal', 'dir', 'newDocument', 'selectAll', 'save'],
			[':Paragraph-default.more_paragraph', 'outdent', 'indent', '|', 'blockquote', '|', 'blockStyle', 'font', 'fontSize', '|', 'paragraphStyle'],
			[':Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', '|', 'removeFormat', 'copyFormat', 'textStyle', 'copy'],
			[':Insert-default.more_plus', 'table', 'hr', 'link', 'anchor', 'math'],
			[':Lists & Align-default.more_list', 'align', 'lineHeight', 'list_numbered', 'list_bulleted'],
			[':Media-default.more_media', 'image', 'drawing', 'video', 'audio', 'embed'],
			[':Galleries & File-default.more_gallery', 'imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser', '|', 'fileUpload', 'template', 'layout'],
			[':View & Pages-default.more_view', 'preview', 'print', 'exportPDF', 'fullScreen', 'showBlocks', 'codeView', '|', 'pageBreak', 'pageNavigator', 'pageUp', 'pageDown'],
		],
	],
];

const bb = [
	['anchor', 'newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak', 'dir'],
	['dir_ltr', 'dir_rtl'],
	['font', 'fontSize', 'blockStyle'],
	['paragraphStyle', 'blockquote'],
	['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
	['fontColor', 'backgroundColor', 'textStyle'],
	['copyFormat', 'removeFormat'],
	'/',
	['outdent', 'indent'],
	['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
	['table', 'link', 'image', 'video', 'embed', 'audio', 'math'],
	['imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
	['fullScreen', 'showBlocks', 'codeView', 'copy'],
	['preview', 'print', 'exportPDF'],
	['save', 'template', 'layout', 'fileUpload', 'mention'],
];

const begContent = `
<p><span class="__se__katex katex" data-se-value="\begin{Bmatrix}
a &amp;amp;amp; b \\
a &amp;amp;amp; b \\
c &amp;amp;amp; d
\end{Bmatrix}" data-se-type="1em" style="font-size: 1em;" contenteditable="false"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mo fence="true">{</mo><mtable rowspacing="0.16em" columnalign="center center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mi>a</mi></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>a</mi><mi>m</mi><mi>p</mi><mo separator="true">;</mo><mi>b</mi></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mi>a</mi></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>a</mi><mi>m</mi><mi>p</mi><mo separator="true">;</mo><mi>b</mi></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mi>c</mi></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>a</mi><mi>m</mi><mi>p</mi><mo separator="true">;</mo><mi>d</mi></mrow></mstyle></mtd></mtr></mtable><mo fence="true">}</mo></mrow><annotation encoding="application/x-tex">\begin{Bmatrix}
a &amp;amp; b \\
a &amp;amp; b \\
c &amp;amp; d
\end{Bmatrix}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:3.6em;vertical-align:-1.55em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-2.5em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎩</span></span></span><span style="top:-2.492em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.016em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.016em" style="width:0.8889em" viewBox="0 0 888.89 16" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V16 H384z M384 0 H504 V16 H384z"></path></svg></span></span><span style="top:-3.15em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎨</span></span></span><span style="top:-4.292em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.016em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.016em" style="width:0.8889em" viewBox="0 0 888.89 16" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V16 H384z M384 0 H504 V16 H384z"></path></svg></span></span><span style="top:-4.3em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎧</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-4.21em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">a</span></span></span><span style="top:-3.01em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">a</span></span></span><span style="top:-1.81em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:0.5em;"></span><span class="arraycolsep" style="width:0.5em;"></span><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-4.21em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">am</span><span class="mord mathnormal">p</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">b</span></span></span><span style="top:-3.01em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">am</span><span class="mord mathnormal">p</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">b</span></span></span><span style="top:-1.81em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">am</span><span class="mord mathnormal">p</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">d</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span></span></span><span class="mclose"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-2.5em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎭</span></span></span><span style="top:-2.492em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.016em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.016em" style="width:0.8889em" viewBox="0 0 888.89 16" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V16 H384z M384 0 H504 V16 H384z"></path></svg></span></span><span style="top:-3.15em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎬</span></span></span><span style="top:-4.292em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.016em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.016em" style="width:0.8889em" viewBox="0 0 888.89 16" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V16 H384z M384 0 H504 V16 H384z"></path></svg></span></span><span style="top:-4.3em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎫</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span></span></span></span></span></span></p>
`;

let dir = '';
// dir = 'rtl'
const mode = ['inline', 'balloon-always', 'balloon', 'classic'][1];

// suneditor.create('#scrolleditor', {
// 	// value: begContent,
// 	plugins: plugins,
// 	toolbar_sticky: 0,
// 	width: 450,
// 	height: 350,
// 	katex: {
// 		src: Katex
// 	},
// 	textDirection: dir,
// 	mode: mode,
// 	buttonList: bl
// });

// suneditor.create('#editor_classic', {
// 	// value: begContent,
// 	plugins: plugins,
// 	toolbar_sticky: 0,
// 	width: 450,
// 	height: 350,
// 	katex: {
// 		src: Katex
// 	},
// 	textDirection: dir,
// 	mode: mode,
// 	buttonList: bl
// });

// window.e = suneditor.create(['#editor1'], {
// 	placeholder: 'placeholder',
// 	toolbar_container: document.getElementById('ttt'),
// 	textDirection: dir,
// 	mode: mode,
// 	// toolbar_sticky: 50,
// 	// value: `<p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p>`,
// 	// value: '<h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2>',
// 	// iframe: true,
// 	// iframe_fullPage: true,
// 	elementBlacklist: 'p',
// 	// toolbar_sticky: 60,
// 	width: '350px',
// 	height: '345',
// 	minHeight: '',
// 	charCounter: true,
// 	// tableCellControllerPosition: 'top',
// 	statusbar: true,
// 	codeMirror: {
// 		EditorView: EditorView,
// 		extensions: [
// 			basicSetup,
// 			html({
// 				matchClosingTags: true,
// 				autoCloseTags: true
// 			}),
// 			javascript()
// 		],
// 		minimalSetup: minimalSetup
// 	},
// 	// codeMirror: {
// 	// 	src: Codemirror5
// 	// },
// 	// mode: "inline",
// 	// imageUploadUrl: 'http://localhost:3000/editor/upload',
// 	// videoUploadUrl: 'http://localhost:3000/editor/upload',
// 	// audioUploadUrl: 'http://localhost:3000/editor/upload',
// 	katex: {
// 		src: Katex
// 	},
// 	charCounter: true,
// 	font: ['Vazir', 'Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'],
// 	templates: [
// 		{
// 			name: 'Template-1',
// 			html: '<p>HTML source1</p>'
// 		},
// 		{
// 			name: 'Template-2',
// 			html: '<p>HTML source2</p>'
// 		}
// 	],
// 	layouts: [
// 		{
// 			name: 'Layout-1',
// 			html: '<div class="__se__block"><table><tr><td contenteditable="false">aaaa</td><td><br></td></tr></table></div>'
// 		}
// 	],
// 	linkRel: ['author', 'external', 'help', 'license', 'next', 'follow', 'nofollow', 'noreferrer', 'noopener', 'prev', 'search', 'tag'],
// 	linkRelDefault: 'noreferrer noopener',
// 	linkTargetNewWindow: true,
// 	defaultUrlProtocol: 'https://',
// 	imageMultipleFile: true,
// 	imageResizing: true,
// 	plugins: plugins,
// 	events: {
// 		// onBlur(a, b, c, d, e) {
// 		// 	console.log('blur', a);
// 		// },
// 		// onFocus() {
// 		// 	console.log('focus');
// 		// },
// 		// onload: () => {
// 		// 	console.log('onload');
// 		// }
// 	},
// 	// buttonList: [
// 	// 	['undo', 'redo'],
// 	// 	['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
// 	// 	['copyFormat', 'removeFormat'],
// 	// 	['outdent', 'indent'],
// 	// 	['fullScreen', 'showBlocks', 'codeView'],
// 	// 	['preview', 'print'],
// 	// 	['align', 'blockquote', 'font', 'fontColor', 'backgroundColor', 'fontSize', 'blockStyle', 'hr'],
// 	// 	['lineHeight', 'list', 'paragraphStyle', 'template', 'layout', 'textStyle', 'table'],
// 	// 	['math', 'link', 'audio', 'image', 'video']
// 	// ],
// 	buttonList: bl
// });

// shadowroot test
// const shadow = document.querySelector('#app').attachShadow({ mode: 'open', delegatesFocus: true });
// const appEl = document.createElement('textarea');
// const appStyle = document.createElement('style');
// appStyle.textContent = getPageStyle(document);

// shadow.appendChild(appStyle);
// shadow.appendChild(appEl);

/** @type {__se__EditorOptions} */
const options1 = {
	// mode: 'inline',
	// editorStyle: 'height:100px',
	// toolbar_width: 300,
	// textDirection: 'rtl',
	// value: 'Common value',
	// editorStyle: 'font-size:40px',
	allowedExtraTags: { script: true },
	// closeModalOutsideClick: true,
	events: {
		onChange() {},
	},
	image: {
		uploadSizeLimit: '1a',
	},
	previewTemplate: `
                <div style="width:auto; max-width:1136px; min-height:400px; margin:auto;">
                {{ contents }}
                </div>
            `,
	// tagStyles: { '.+': '.+' },
	strictMode: {
		// styleFilter: false
	},
	// strictMode: false,
	// strictMode: false,
	// lang: langs.ko,
	// value: `<figure class="se-flex-component se-scroll-figure-x"><table class="se-size-100 se-table-layout-auto" ><colgroup><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"></colgroup><tbody><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="2" rowspan="2"><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="1" rowspan="4"><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="2" rowspan="1"><div><br></div></td><td colspan="1" rowspan="2"><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="2" rowspan="1"><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure>`,
	// value: `<p>sadas1<span class="__se__katex katex" data-se-value="l;l;;l" data-se-type="1em" style="font-size: 1em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>l</mi><mo separator="true">;</mo><mi>l</mi><mo separator="true">;</mo><mo separator="true">;</mo><mi>l</mi></mrow><annotation encoding="application/x-tex">l;l;;l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span></span></span></span>​​<br></p><p>sadas2</p><figure class="se-flex-component"><table style=""><colgroup><col style="width: 33%;"><col style="width: 33%;"><col style="width: 33%;"></colgroup><tbody><tr><td><div>sdd<br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure><div class="se-component se-file-figure se-flex-component"><figure><a href="https://link.testfile.org/30MB" title="document.pdf" download="document.pdf" data-se-file-download="" data-se-non-link="true" data-se-file-name="document.pdf" data-se-file-size="124826" data-se-size="auto,auto" contenteditable="false">document.pdf</a></figure></div><p>sadas3<br></p><p>sadas4<br></p><p>sadas5<br></p><p>sadas6<br></p><p>dsads<a href="http://localhost:3000/public/files/d5d13802a01dd4dea399c912f7b31e5e.png" download="1571311368279.png" name="1571311368279.png">1571311368279.png</a>​<br></p><div class="se-component se-image-container __se__float-none"><figure><img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" data-se-file-name="welsh%20Corgi.jpg" data-se-file-size="0" data-se-size="auto,auto" style="" data-se-index="0"></figure></div><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p>`,
	// value: `<p>sadas1<span class="__se__katex katex" data-se-value="l;l;;l" data-se-type="1em" style="font-size: 1em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>l</mi><mo separator="true">;</mo><mi>l</mi><mo separator="true">;</mo><mo separator="true">;</mo><mi>l</mi></mrow><annotation encoding="application/x-tex">l;l;;l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span></span></span></span>​​<br></p><p>sadas2</p><figure class="se-flex-component"><table style=""><colgroup><col style="width: 33%;"><col style="width: 33%;"><col style="width: 33%;"></colgroup><tbody><tr><td><div>sdd<br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure><div class="se-component se-file-figure se-flex-component"><figure><a href="http://localhost:3000/editor/files/download/public/files/d31ed6f9e11d1661406efe5ed34328e5.pdf" title="document.pdf" download="document.pdf" data-se-file-download="" data-se-non-link="true" data-se-file-name="document.pdf" data-se-file-size="124826" data-se-index="0" data-se-size="auto,auto" contenteditable="false">document.pdf</a></figure></div><div class="se-component se-image-container __se__float-none"><figure><img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" data-se-file-name="welsh%20Corgi.jpg" data-se-file-size="0" data-se-size="auto,auto" style="" data-se-index="0"></figure></div>`,
	// 		value: `
	// <p>SunEditor</p>
	// <video controls="true" src="http://localhost:3000/public/files/d55bddf8d62910879ed9f605522149a8.mp4" width="100%" height="56.25%" data-se-size="100%,56.25%" data-se-file-name="SampleVideo_1280x720_1mb.mp4" data-se-file-size="1055736" data-se-index="1" style="width: 100%; height: 100%;"></video>
	// <iframe frameborder="0" allowfullscreen="" src="https://www.youtube.com/embed/zNPoScmAs3o" width="100%" height="56.25%" data-se-size="100%,56.25%" data-se-file-name="zNPoScmAs3o" data-se-file-size="0" data-se-index="0" style="width: 100%; height: 100%;"></iframe>
	// <p>sfds&nbsp;<a class="se-component se-inline-component" contenteditable="false" href="http://localhost:3000/editor/files/download/public/files/d31ed6f9e11d1661406efe5ed34328e5.pdf" download="document.pdf" data-se-file-download="" data-se-non-link="true" data-se-file-name="document.pdf" data-se-file-size="124826" data-se-size="auto,auto" name="document.pdf">document.pdf</a>&nbsp;fdsaf</p>
	// <div class="se-component se-file-figure se-flex-component"><figure><a href="http://localhost:3000/editor/files/download/public/files/d31ed6f9e11d1661406efe5ed34328e5.pdf" title="document.pdf" download="document.pdf" data-se-file-download="" data-se-non-link="true" contenteditable="false" data-se-non-focus="true" data-se-file-name="document.pdf" data-se-file-size="124826" data-se-index="0" data-se-size="auto,auto">document.pdf</a></figure></div>
	// <p>1234<div class="se-component se-image-container __se__float-center"><figure style="margin: auto;"><img src="http://suneditor.com/docs/cat.jpg" data-align="right" alt="Tabby" data-rotate="" data-proportion="false" data-rotatex="" data-rotatey="" origin-size="640,426" data-origin="640,426" style="transform: rotate(0deg);" data-index="0" data-file-name="cat.jpg" data-file-size="0" data-size="," data-percentage="auto,auto"><figcaption style="margin-top: 0px;"><p>Insert description</p></figcaption></figure></div>abcd</p>
	// <p>Here is an example of math -&gt; <span class="katex se-component se-inline-component" data-se-value="\\displaystyle\\sum_{i=1}^{k+1}i" data-se-type="1.5em" style="font-size: 1.5em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mstyle scriptlevel="0" displaystyle="true"><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mrow><mi>k</mi><mo>+</mo><mn>1</mn></mrow></munderover><mi>i</mi></mstyle></mrow><annotation encoding="application/x-tex">\displaystyle\sum_{i=1}^{k+1}i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:3.1137820000000005em;vertical-align:-1.277669em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361130000000003em;"><span style="top:-1.872331em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathdefault mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.050005em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.300005em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathdefault mtight" style="margin-right:0.03148em;">k</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.277669em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault">i</span></span></span></span> 123</p>
	// <p>123<span class="__se__katex katex se-component se-inline-component" contenteditable="false" data-se-value="\\displaystyle\\sum_{i=1}^{k+1}i" data-se-type="1em" style="font-size: 1em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mstyle scriptlevel="0" displaystyle="true"><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mrow><mi>k</mi><mo>+</mo><mn>1</mn></mrow></munderover><mi>i</mi></mstyle></mrow><annotation encoding="application/x-tex">\displaystyle\sum_{i=1}^{k+1}i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:3.1138em;vertical-align:-1.2777em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.03148em;">k</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">i</span></span></span></span>456</p>
	// <h3>The Suneditor is based on pure JavaScript, with no dependencies.</h3>
	// <pre>Suneditor is a lightweight, flexible, customizable WYSIWYG text editor for your web applications.</pre>
	// <blockquote><p>Supports Chrome, Safari, Opera, Firefox, Edge, IE11, Mobile web browser.</p></blockquote>
	// <p><strong><span style="color: rgb(255, 94, 0);">SunEditor</span></strong>&nbsp;<em><span style="background-color: rgb(250, 237, 125);">distributed under</span></em>&nbsp;the <a href="https://github.com/JiHong88/SunEditor/blob/master/LICENSE.txt" target="_blank">MIT</a> license.</p>
	// <div class="se-component se-flex-component"><figure><audio style="" controls="true" data-se-file-name="ssss.mp3" data-se-file-size="0" src="http://localhost:3000/editor/files/download/public/files/ssss.mp3" data-se-index="0"></audio></figure></div>
	// <p><hr class="dashed"></p>
	// <p><span style="font-size: 16px;"><span style="font-family: Impact;">Table</span></span></p>
	// <table class="se-table-size-auto"><thead><tr><th><div>Column_1</div></th><th><div>Column_2</div></th><th><div>Column_3</div></th><th><div>Column_4</div></th><th><div>Column_5</div></th></tr></thead><tbody><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table>
	// <p><br></p>
	// <ul>
	// 	<li>Pasting from Microsoft Word and Excel.</li>
	// 	<li>Custom table selection, merge and split.</li>
	// 	<li>Media embed, images upload.</li>
	// 	<li>Can use CodeMirror, KaTeX.<ul><li>And.. many other features :)</li></ul></li>
	// </ul>
	// <p><br></p>
	// 		`,
	// 		value: `<div class="se-component se-image-container __se__float-none"><figure style="margin: auto;"><img src="http://suneditor.com/docs/cat.jpg" data-align="right" alt="Tabby" data-rotate="" data-proportion="false" data-rotatex="" data-rotatey="" origin-size="640,426" data-origin="640,426" style="transform: rotate(0deg);" data-index="0" data-file-name="cat.jpg" data-file-size="0" data-size="," data-percentage="auto,auto"><figcaption style="margin-top: 0px;"><p>Insert description</p></figcaption></figure></div>`,
	// 		value: `<div class="se-component se-image-container __se__float-none"><figure style="margin: auto;"><img src="http://suneditor.com/docs/cat.jpg" data-align="right" alt="Tabby" data-rotate="" data-proportion="false" data-rotatex="" data-rotatey="" origin-size="640,426" data-origin="640,426" style="transform: rotate(0deg);" data-index="0" data-file-name="cat.jpg" data-file-size="0" data-size="," data-percentage="auto,auto"></figure></div>`,
	// 		value: `<p>dsa<strong>dsa</strong><u><strong>dsadsadsa</strong></u><span style="color: #ff0000;"><u><strong>dsadasdsa</strong></u></span><br></p><p>test abc  sss</p>`,
	// 		// value: `<p>ㅁㄴㅇ d</p>
	// 		// <div class="se-component se-file-figure se-flex-component">
	// 		//   <figure class="">
	// 		// 	<a href="http://local.apim.skcloud.io:3000/main/files/download/uploads/readme/adf2fe5a-c651-43ca-a4b8-1b8b274a082b.jpg" title="0eb2ea0060997f63dd4544419eec6980.jpg" download="0eb2ea0060997f63dd4544419eec6980.jpg" data-se-file-download="" data-se-non-focus="true" data-se-non-link="true" data-se-file-name="0eb2ea0060997f63dd4544419eec6980.jpg" data-se-file-size="74182" name="0eb2ea0060997f63dd4544419eec6980.jpg" data-se-index="0">0eb2ea0060997f63dd4544419eec6980.jpg</a>
	// 		//   </figure>
	// 		// </div>`,
	// 		value: `
	// 		<p>dsa<strong>d&nbsp;&nbsp;&nbsp;&nbsp;sa</strong><u><strong>dsadsadsa</strong></u><span style="color: #ff0000"><u><strong>dsadasdsa</strong></u></span><br>
	// </p>
	// closeModalOutsideClick: true,
	// placeholder: 'placeholder text',
	// textDirection: 'rtl',
	// defaultLineBreakFormat: 'br',
	value: `<h1>Header~1</h1><p>test fdste text</p><div class="se-component se-image-container __se__float-none"><figure><img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" data-se-size="auto,auto" data-se-file-name="Welsh Corgi" data-se-file-size="0" style="" data-se-index="0"></figure></div><h2>header 22222</h2><p>2222222</p><p>2222222aa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><h3>header33333</h3><p>33333</p><p>aafffff</p><h4>hdaedde444</h4><figure class="se-flex-component se-input-component se-scroll-figure-x" style="width: 100%;"><table class="se-table-layout-auto" style=""><colgroup><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"></colgroup><tbody><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><h5>header55555</h5><p>ndfjsjio;dfsaji;fads</p><p>dfs78oyfeaw</p><h6>header66666</h6><p>asfhjfds</p><p>fdsaa99999</p><h1>Header~1</h1><p>test fdste text</p><h2>header 22222</h2><p>2222222</p><p>2222222aa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><h3>header33333</h3><p>33333</p><p>aafffff</p><h4>hdaedde444</h4><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><h5>header55555</h5><p>ndfjsjio;dfsaji;fads</p><p>dfs78oyfeaw</p><h6>header66666</h6><p>asfhjfds</p><p>fdsaa99999</p><h1>Header~1</h1><p>test fdste text</p><h2>header 22222</h2><p>2222222</p><p>2222222aa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><h3>header33333</h3><p>33333</p><p>aafffff</p><h4>hdaedde444</h4><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><h5>header55555</h5><p>ndfjsjio;dfsaji;fads</p><p>dfs78oyfeaw</p><h6>header66666</h6><p>asfhjfds</p><p>fdsaa99999</p><h1>Header~1</h1><p>test fdste text</p><h2>header 22222</h2><p>2222222</p><p>2222222aa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><h3>header33333</h3><p>33333</p><p>aafffff</p><h4>hdaedde444</h4><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><h5>header55555</h5><p>ndfjsjio;dfsaji;fads</p><p>dfs78oyfeaw</p><h6>header66666</h6><p>asfhjfds</p><p>fdsaa99999</p>`,
	// 		value: `<div class="se-component se-video-container __se__float-none" style="width: 100%;">
	//   <figure style="width: 100%; height: 56.25%; padding-bottom: 56.25%;" class="">
	//     <video controls="true" src="http://localhost:3000/public/files/d55bddf8d62910879ed9f605522149a8.mp4" width="100%" height="56.25%" data-se-size="100%,56.25%" data-se-file-name="SampleVideo_1280x720_1mb.mp4" data-se-file-size="1055736" data-se-index="0" style="width: 100%; height: 100%;"></video>
	//   </figure>
	// </div>
	// <p><br>
	// </p>
	// `,
	// <p>test abc  sss</p>
	// 		`,
	// syncTabIndent: true,
	// iframe: true,
	// height: '600px',
	// maxWidth: '1000px',
	// value: `<div class="wrap_800 article_type_1"><br />
	// 	<div class="section section_01">
	// 		<div class="detail_cont_box">
	// 			<h3 class="first_h3">
	// 				<img class="emoji like_pin" alt="📍" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f4cd.svg" />

	// 				"상큼한 레몬수로 건강하고 활기찬 일상 시작하기!"
	// 			</h3>
	// 			<div class="img_box">
	// 				<img src="https://i.imgur.com/hfHHulc.png" alt="레몬수" title="컵에 담긴 레몬수 사진" />

	// 			</div>
	// 			<div class="text_box">
	// 				<span>
	// 					레몬수가 요즘 핫한 웰빙 트렌드로 자리 잡고 있습니다.
	// 					새콤달콤한 레몬으로 만든 시원한 음료 한 잔이 더위를 날려줄 뿐만 아니라, 건강까지 챙길 수 있다면?<br />
	// 					오늘은 레몬수의 놀라운 효능과 함께, 레몬을 다양하게 활용할 수 있는 레몬큐브 만드는 법을 소개합니다.<br />
	// 					또한, 모든 과정에서 최고의 성능을 자랑하는 테팔 블렌드포스 믹서기의 활용법까지! 건강과 맛을 모두 잡는 방법, 지금부터
	// 					만나보세요.
	// 				</span>
	// 			</div>

	// 		</div>
	// 		<hr />
	// 		<div class="detail_cont_box">
	// 			<h3>이 아티클은 이런 분들에게 유용합니다!</h3>
	// 			<div class="text_box">
	// 				<span class="contain_img"><img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" /> 새로운 주방용품 구입을 고민하는 분들</span>
	// 				<span class="contain_img"><img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" /> 품질 좋은 주방용품을 오랫동안 사용하고 싶은 분들</span>
	// 				<span class="contain_img"><img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" /> 환경보호를 생각하며 지속 가능한 소비를 추구하는 분들</span>

	// 			</div>

	// 		</div>
	// 		<hr />
	// 		<div class="detail_cont_box">
	// 			<h3>레몬수를 왜 먹을까요? 효능에 대한 모든 것!</h3>
	// 			<div class="text_box">
	// 				<span>레몬수는 단순히 상큼한 맛을 즐기기 위한 음료가 아닙니다.</span>
	// 				<span>하루 한 잔의 레몬수는 피부부터 신장까지 관리할 수 있는 '마법의 음료'라 불리는 이유가 따로 있죠.</span>
	// 				<span>그 안에 숨겨진 놀라운 건강 효능을 살펴보겠습니다. 레몬수를 마시면 어떤 효과를 기대할 수 있을까요?</span>
	// 			</div>

	// 		</div>
	// 	</div>
	// 	<div class="section section_02">
	// 		<div class="img_box">
	// 			<img src="https://i.imgur.com/Z4gQNYt.png" alt="레몬수" title="컵에 레몬수를 따르는 사진" />

	// 		</div>
	// 		<div class="text_box">
	// 			<span class="mini_title">1. 비타민 C 폭탄! 피부와 면역력을 동시에</span>
	// 			<span>레몬수 한 잔에 담긴 비타민 C는 피로 해소는 물론, 피부를 더욱 맑고 투명하게 가꿔줍니다.</span>
	// 			<span>하루 한 잔의 레몬수가 우리 몸의 항산화 작용을 촉진하고, 스트레스와 노화를 예방해 줍니다.</span>
	// 			<span>일상의 활력을 채워주는 비타민 C 폭탄을 경험해 보세요.</span>
	// 		</div>
	// 		<div class="text_box">
	// 			<span class="mini_title">2. 다이어트의 비밀, 체중 감소와 소화 개선</span>
	// 			<span>다이어트를 하고 있다면 레몬수를 절대 놓치지 마세요!</span>
	// 			<span>레몬수는 소화를 돕고 장운동을 촉진해 복부 팽만감을 해소해 줍니다.</span>
	// 			<span>또한, 칼륨이 나트륨을 조절해 부기를 완화해 주므로, 규칙적인 섭취로 체중 감소의 효과까지 기대할 수 있습니다..</span>
	// 		</div>
	// 		<div class="text_box">
	// 			<span class="mini_title">3. 심혈관 건강을 지키는 든든한 수호자</span>
	// 			<span>레몬에는 혈관을 강화해 주는 펙틴과 몸속 노폐물을 제거하는 구연산이 풍부합니다.</span>
	// 			<span>이러한 성분들은 혈압을 낮추고 심혈관 질환을 예방하는 데 탁월한 효과가 있어,</span>
	// 			<span>레몬수를 매일 마시는 것만으로도 심장 건강을 챙길 수 있습니다.</span>
	// 		</div>
	// 		<div class="text_box">
	// 			<span class="mini_title">4. 신장 결석 예방, 상큼한 디톡스 효과</span>
	// 			<span>신장 결석을 예방하고 싶은 분들에게도 레몬수는 훌륭한 해결책입니다.</span>
	// 			<span>레몬에 함유된 구연산이 체액을 증가시켜 소변을 중화하고, 요로에 노폐물이 쌓이지 않도록 도와줍니다.</span>
	// 			<span>간단하게 레몬수로 디톡스 하세요!</span>
	// 		</div>
	// 	</div>
	// 	<div class="section section_03">
	// 		<div class="img_box">
	// 			<img src="https://i.imgur.com/GKQEJZP.png" alt="대용량 레몬즙, 레몬즙 스틱, 직접 레몬즙 착즙하기" />

	// 		</div>
	// 		<hr />
	// 		<div class="text_box">
	// 			<h3>레몬수는 어떻게 음용할 수 있을까요? 간편하게 즐기는 레몬수 섭취 방법!</h3>
	// 			<div class="h3_des">
	// 				<span>레몬수는 상쾌한 맛과 함께 건강 효과를 제공하는 훌륭한 음료이지만, 매일 꾸준히 마시는 게 생각보다 어려울 수 있죠.</span>
	// 				<span>그렇다면 여러분의 라이프스타일에 맞는 섭취 방법을 찾아보세요!</span>
	// 				<span>오늘은 레몬수를 즐길 수 있는 세 가지 간편한 음용 방식을 소개해 드리겠습니다.</span>
	// 				<span>어떤 방법이 여러분에게 가장 잘 맞을까요?</span>
	// 			</div>
	// 		</div>
	// 		<div class="text_box">
	// 			<span class="mini_title">1. 레몬즙 스틱: 언제 어디서나 간편하게!</span>
	// 			<span>레몬즙 스틱은 바쁜 일상에서도 쉽게 레몬수를 섭취할 수 있는 최고의 방법입니다. 출근길이나 여행 중에도 물만 있으면 상쾌한 레몬수를 빠르게 만들 수 있어 휴대가 간편하고 위생적이죠. 언제 어디서나 빠르고 간편하게 레몬수를 즐길 수 있습니다.</span>
	// 		</div>
	// 		<div class="text_box">
	// 			<span class="mini_title">2. 대용량 레몬즙 통: 자유로운 양 조절과 경제성!</span>
	// 			<span>레몬수를 자주 마시거나 요리에도 활용하고 싶다면 대용량 레몬즙이 좋은 선택입니다. 자유롭게 양을 조절할 수 있어 다용도로 활용할 수 있으며, 경제적인 면에서도 유리합니다. 보관 시 신선도를 유지하기에 어려움이 있지만, 꾸준히 섭취하고자 하신다면 효율적인 선택입니다.</span>
	// 		</div>
	// 		<div class="text_box">
	// 			<span class="mini_title">3. 직접 레몬즙 착즙하기: 신선함은 그대로!</span>
	// 			<span>가장 신선하고 건강한 방법을 찾고 있다면, 직접 레몬을 착즙해 섭취하는 것이 답입니다. 방부제나 첨가물 없이 레몬 본연의 영양을 그대로 섭취할 수 있죠. 시간과 노력이 들어가지만, 최고의 신선함을 원한다면 직접 착즙이 가장 좋은 방법입니다.</span>
	// 		</div>
	// 	</div>
	// 	<div class="section section_04">
	// 		<div class="img_box">
	// 			<img src="https://i.imgur.com/IU0cWFV.png" alt="테팔 블렌드포스 믹서기" />

	// 		</div>
	// 		<hr />
	// 		<div class="detail_cont_box">
	// 			<h3>테팔 블렌드포스 믹서기로 일상을 더 편리하게 만드는 이유!”</h3>
	// 			<div class="text_box">
	// 				<span class="mini_title contain_img"><img class="emoji_rhombus" alt="🔸" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f538.svg" /> 강력한 성능과 간편한 사용성</span>
	// 				<span>테팔 블렌드포스 믹서기는 강력한 22000RPM 모터와 파워엘릭스 기술로 단단한 재료도 손쉽게 분쇄합니다.
	// 					편리하게 분리할 수 있는 칼날 덕분에 세척이 간편하며, 1.75L 대용량 내열 유리 용기로 많은 양을 한 번에 블렌딩할 수 있어
	// 					요리에 더욱 유용합니다.
	// 				</span>
	// 			</div>
	// 			<div class="text_box">
	// 				<span class="mini_title contain_img"><img class="emoji_rhombus" alt="🔸" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f538.svg" /> 이중 잠금으로 안전하게</span>
	// 				<span>스마트 잠금 방식으로 안전하게 사용할 수 있어, 언제나 안심하고 요리할 수 있습니다. 안전을 고려한 설계로, 블렌딩이 더욱 즐거워집니다.</span>

	// 			</div>

	// 		</div>
	// 		<hr />
	// 		<div class="text_box">
	// 			<h3>레몬수와 레몬큐브로 매일 상쾌하고 건강하게 살아가는 법!</h3>
	// 			<span>레몬수와 레몬큐브는 단순한 음료를 넘어, 상큼함과 건강을 동시에 잡을 수 있는 최고의 아이템입니다.</span>
	// 			<span>특히 테팔 블렌드포스 믹서기를 사용하면 간편하게 레몬큐브를 만들어 매일매일 신선한 맛과 영양을 즐길 수 있습니다.</span>
	// 			<span>이제부터는 매일 아침 상큼한 레몬수로 건강을 챙기고, 레몬큐브로 다양한 요리에 생기를 불어넣어 보세요.</span>
	// 			<span>이 작은 변화가 당신의 하루를 얼마나 상쾌하고 특별하게 만들지 기대해 보세요!</span>
	// 		</div>
	// 	</div>
	// </div>`,
	// type: 'document:header,page',
	iframe_cssFileName: ['*'],
	copyFormatKeepOn: true,
	// 		value: `<figure>
	//     <img src="https://blog.kakaocdn.net/dn/0QCnX/btqU7cMuFOZ/uVPVj1aIBNqINLQZGkuwa0/img.png" alt="">
	//     <figcaption>Home Edge Logo</figcaption>
	// </figure>`,
	// value: `<p><span style="color: #ff5e00;"><del><strong>fdsfdsafa</strong></del></span><br></p>`,
	plugins: plugins,
	allowedClassName: '.+',
	// toolbar_container: '#root_toolbar_container',
	attributeWhitelist: { '*': 'class', img: 'scee' },
	// statusbar_container: '#root_statusbar_container',
	// shortcutsHint: false,
	/** codemirror6 -- */
	// codeMirror: {
	// 	EditorView: EditorView,
	// 	extensions: [
	// 		basicSetup,
	// 		html({
	// 			matchClosingTags: true,
	// 			autoCloseTags: true
	// 		}),
	// 		javascript()
	// 	],
	// 	minimalSetup: minimalSetup
	// },
	/** -- codemirror6 */
	/** codemirror5 -- */
	// codeMirror: {
	// 	src: Codemirror5
	// },
	/** -- codemirror5 */
	// iframe: true,
	// iframe_attributes: 'abc',
	// defaultLine: 'p',
	// __defaultFormatLine: 'H[1-6]|LI|TH|TD|DETAILS',
	retainStyleMode: 'none', // repeat, always, none
	toolbar_sticky: 0,
	lineAttrReset: 'id',
	// __pluginRetainFilter: { table: false },
	// height: '600px',
	// charCounter_max: 1400,
	// buttonList: [['bold', 'newDocument', 'selectAll', 'undo', 'redo']],
	buttonList: bl,
	tableCellControllerPosition: 'cell',
	// buttonList: [
	// 	['newDocument', 'selectAll', 'undo', 'redo', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
	// 	'|',
	// 	[':문단&글꼴-default.more_paragraph', 'font', 'fontSize', 'blockStyle', '|', 'paragraphStyle', 'blockquote'],
	// 	'|',
	// 	[':글자 스타일-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle', 'copyFormat', 'removeFormat'],
	// 	'|',
	// 	[':리스트&라인-default.more_horizontal', 'outdent', 'indent', 'align', 'hr', 'list_numbered', 'list_bulleted', 'lineHeight'],
	// 	'|',
	// 	[':테이블&미디어-default.more_plus', 'table', 'link', 'image', 'video', 'embed', 'fileUpload', 'anchor'],
	// 	'|',
	// 	['save'],
	// 	'|',
	// 	[':기타-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'math', 'exportPDF', 'print'],
	// 	'|'
	// ],
	// iframe: true,

	video: null,
	subToolbar: {
		buttonList: [['bold', 'dir', 'dir_ltr', 'dir_rtl', 'save']],
		width: 'auto',
		mode: 'balloon', // balloon, balloon-always, balloon-block
	},
	shortcuts: {
		// bold: ['s75', 'K'],
		italic: [],
		image: ['c+73', 'I'],
		list: ['c+76', 'L'],
	},
	// theme: 'dark',
	math: {
		// katex: {
		// 	src: Katex
		// },
		fontSizeList: [
			{
				text: '1',
				value: '1em',
			},
			{
				text: '1.5',
				value: '1.5em',
			},
		],
	},
	// autoLinkify: false,
	// autoStyleify: [],
	componentInsertBehavior: 'auto', // auto, select, line, none
	// strictMode: false,
	// freeCodeViewMode: true,
	value: `
	<div class="se-component se-image-container __se__float-none">
  <figure class="" style="">
    <img class="emoji like_pin" alt="📍" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f4cd.svg" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="1f4cd.svg" data-se-file-size="0" data-se-index="0" style="">
  </figure>
</div>

<h3 class="first_h3">												&quot;상큼한 레몬수로 건강하</h3>

<div class="se-component se-video-container __se__float-none">
  <figure class="" style="width: 100%; height: 56.25%; padding-bottom: 56.25%;">
    <iframe frameborder="0" allowfullscreen="" src="https://www.youtube.com/embed/eb6b4d0Jo_g" width="100%" height="56.25%" data-se-size="100%,56.25%" data-se-file-name="eb6b4d0Jo_g" data-se-file-size="0" data-se-index="0" style="width: 100%; height: 100%;"></iframe>
  </figure>
</div>

<div class="se-component se-embed-container __se__float-none">
  <figure style="" class="">
    <div class="twitter-tweet twitter-tweet-rendered" style="display: flex; width: 100%; margin-top: 10px; margin-bottom: 10px;"><iframe id="twitter-widget-0" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" class="" style="position: static; visibility: visible; width: 322px; height: 708px; display: block; flex-grow: 1;" title="X Post" src="https://platform.twitter.com/embed/Tweet.html?dnt=false&amp;embedId=twitter-widget-0&amp;features=eyJ0ZndfdGltZWxpbmVfbGlzdCI6eyJidWNrZXQiOltdLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X2ZvbGxvd2VyX2NvdW50X3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9iYWNrZW5kIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19yZWZzcmNfc2Vzc2lvbiI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfZm9zbnJfc29mdF9pbnRlcnZlbnRpb25zX2VuYWJsZWQiOnsiYnVja2V0Ijoib24iLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X21peGVkX21lZGlhXzE1ODk3Ijp7ImJ1Y2tldCI6InRyZWF0bWVudCIsInZlcnNpb24iOm51bGx9LCJ0ZndfZXhwZXJpbWVudHNfY29va2llX2V4cGlyYXRpb24iOnsiYnVja2V0IjoxMjA5NjAwLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X3Nob3dfYmlyZHdhdGNoX3Bpdm90c19lbmFibGVkIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19kdXBsaWNhdGVfc2NyaWJlc190b19zZXR0aW5ncyI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdXNlX3Byb2ZpbGVfaW1hZ2Vfc2hhcGVfZW5hYmxlZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdmlkZW9faGxzX2R5bmFtaWNfbWFuaWZlc3RzXzE1MDgyIjp7ImJ1Y2tldCI6InRydWVfYml0cmF0ZSIsInZlcnNpb24iOm51bGx9LCJ0ZndfbGVnYWN5X3RpbWVsaW5lX3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9mcm9udGVuZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9fQ%3D%3D&amp;frame=false&amp;hideCard=false&amp;hideThread=false&amp;id=1945744030064935105&amp;lang=en&amp;origin=http%3A%2F%2Flocalhost%3A8088%2F&amp;sessionId=1695bd6044821f03842dcef35667609cc4be2694&amp;theme=light&amp;widgetsVersion=2615f7e52b7e0%3A1702314776716&amp;width=auto" data-tweet-id="1945744030064935105" data-se-index="1" data-se-file-name="Tweet.html?dnt=false&amp;embedId=twitter-widget-0&amp;features=eyJ0ZndfdGltZWxpbmVfbGlzdCI6eyJidWNrZXQiOltdLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X2ZvbGxvd2VyX2NvdW50X3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9iYWNrZW5kIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19yZWZzcmNfc2Vzc2lvbiI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfZm9zbnJfc29mdF9pbnRlcnZlbnRpb25zX2VuYWJsZWQiOnsiYnVja2V0Ijoib24iLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X21peGVkX21lZGlhXzE1ODk3Ijp7ImJ1Y2tldCI6InRyZWF0bWVudCIsInZlcnNpb24iOm51bGx9LCJ0ZndfZXhwZXJpbWVudHNfY29va2llX2V4cGlyYXRpb24iOnsiYnVja2V0IjoxMjA5NjAwLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X3Nob3dfYmlyZHdhdGNoX3Bpdm90c19lbmFibGVkIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19kdXBsaWNhdGVfc2NyaWJlc190b19zZXR0aW5ncyI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdXNlX3Byb2ZpbGVfaW1hZ2Vfc2hhcGVfZW5hYmxlZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdmlkZW9faGxzX2R5bmFtaWNfbWFuaWZlc3RzXzE1MDgyIjp7ImJ1Y2tldCI6InRydWVfYml0cmF0ZSIsInZlcnNpb24iOm51bGx9LCJ0ZndfbGVnYWN5X3RpbWVsaW5lX3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9mcm9udGVuZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9fQ%3D%3D&amp;frame=false&amp;hideCard=false&amp;hideThread=false&amp;id=1945744030064935105&amp;lang=en&amp;origin=http%3A%2F%2Flocalhost%3A8088%2F&amp;sessionId=1695bd6044821f03842dcef35667609cc4be2694&amp;theme=light&amp;widgetsVersion=2615f7e52b7e0%3A1702314776716&amp;width=auto" data-se-file-size="0"></iframe>
    </div>
  </figure>
</div>

<p><br>
</p>

<h3 class="first_h3">고 활기찬 일상 시작하기!&quot;					</h3>

<div class="se-component se-image-container __se__float-none">
  <figure class="" style="">
    <img src="https://i.imgur.com/hfHHulc.png" alt="레몬수" title="컵에 담긴 레몬수 사진" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="hfHHulc.png" data-se-file-size="0" data-se-index="1" style="">
  </figure>
</div>

<div class="text_box">							레몬수가 요즘 핫한 웰빙 트렌드로 자리 잡고 있습니다.							새콤달콤한 레몬으로 만든 시원한 음료 한 잔이 더위를 날려줄 뿐만 아니라, 건강까지 챙길 수 있다면?<br>
							오늘은 레몬수의 놀라운 효능과 함께, 레몬을 다양하게 활용할 수 있는 레몬큐브 만드는 법을 소개합니다.<br>
							또한, 모든 과정에서 최고의 성능을 자랑하는 테팔 블렌드포스 믹서기의 활용법까지! 건강과 맛을 모두 잡는 방법, 지금부터							만나보세요.						</div>

<h3>이 아티클은 이런 분들에게 유용합니다!</h3>

<div class="se-component se-image-container __se__float-none">
  <figure style="">
    <img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="2705.svg" data-se-file-size="0" data-se-index="2" style="">
  </figure>
</div>

<div class="text_box"><span class="contain_img"> 새로운 주방용품 구입을 고민하는 분들</span></div>

<div class="se-component se-image-container __se__float-none">
  <figure style="">
    <img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="2705.svg" data-se-file-size="0" data-se-index="3" style="">
  </figure>
</div>

<div class="text_box"><span class="contain_img"> 품질 좋은 주방용품을 오랫동안 사용하고 싶은 분들</span></div>

<div class="se-component se-image-container __se__float-none">
  <figure style="">
    <img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="2705.svg" data-se-file-size="0" data-se-index="4" style="">
  </figure>
</div>

<div class="text_box"><span class="contain_img"> 환경보호를 생각하며 지속 가능한 소비를 추구하는 분들</span></div>

<h3>레몬수를 왜 먹을까요? 효능에 대한 모든 것!</h3>

<div class="text_box">레몬수는 단순히 상큼한 맛을 즐기기 위한 음료가 아닙니다.하루 한 잔의 레몬수는 피부부터 신장까지 관리할 수 있는 &apos;마법의 음료&apos;라 불리는 이유가 따로 있죠.그 안에 숨겨진 놀라운 건강 효능을 살펴보겠습니다. 레몬수를 마시면 어떤 효과를 기대할 수 있을까요?</div>

<div class="se-component se-image-container __se__float-none">
  <figure style="">
    <img id="a" src="https://i.imgur.com/Z4gQNYt.png" alt="레몬수" title="컵에 레몬수를 따르는 사진" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="Z4gQNYt.png" data-se-file-size="0" data-se-index="5" style="">
  </figure>
</div>

<div class="text_box"><span class="mini_title">1. 비타민 C 폭탄! 피부와 면역력을 동시에</span>레몬수 한 잔에 담긴 비타민 C는 피로 해소는 물론, 피부를 더욱 맑고 투명하게 가꿔줍니다.하루 한 잔의 레몬수가 우리 몸의 항산화 작용을 촉진하고, 스트레스와 노화를 예방해 줍니다.일상의 활력을 채워주는 비타민 C 폭탄을 경험해 보세요.</div>

<div class="text_box"><span class="mini_title">2. 다이어트의 비밀, 체중 감소와 소화 개선</span>다이어트를 하고 있다면 레몬수를 절대 놓치지 마세요!레몬수는 소화를 돕고 장운동을 촉진해 복부 팽만감을 해소해 줍니다.또한, 칼륨이 나트륨을 조절해 부기를 완화해 주므로, 규칙적인 섭취로 체중 감소의 효과까지 기대할 수 있습니다..</div>

<div class="text_box"><span class="mini_title">3. 심혈관 건강을 지키는 든든한 수호자</span>레몬에는 혈관을 강화해 주는 펙틴과 몸속 노폐물을 제거하는 구연산이 풍부합니다.이러한 성분들은 혈압을 낮추고 심혈관 질환을 예방하는 데 탁월한 효과가 있어,레몬수를 매일 마시는 것만으로도 심장 건강을 챙길 수 있습니다.</div>

<div class="text_box"><span class="mini_title">4. 신장 결석 예방, 상큼한 디톡스 효과</span>신장 결석을 예방하고 싶은 분들에게도 레몬수는 훌륭한 해결책입니다.레몬에 함유된 구연산이 체액을 증가시켜 소변을 중화하고, 요로에 노폐물이 쌓이지 않도록 도와줍니다.간단하게 레몬수로 디톡스 하세요!</div>

<div class="se-component se-image-container __se__float-none">
  <figure style="">
    <img src="https://i.imgur.com/GKQEJZP.png" alt="대용량 레몬즙, 레몬즙 스틱, 직접 레몬즙 착즙하기" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="GKQEJZP.png" data-se-file-size="0" data-se-index="6" style="">
  </figure>
</div>

<h3>레몬수는 어떻게 음용할 수 있을까요? 간편하게 즐기는 레몬수 섭취 방법!</h3>

<div class="h3_des">레몬수는 상쾌한 맛과 함께 건강 효과를 제공하는 훌륭한 음료이지만, 매일 꾸준히 마시는 게 생각보다 어려울 수 있죠.그렇다면 여러분의 라이프스타일에 맞는 섭취 방법을 찾아보세요!오늘은 레몬수를 즐길 수 있는 세 가지 간편한 음용 방식을 소개해 드리겠습니다.어떤 방법이 여러분에게 가장 잘 맞을까요?</div>

<div class="text_box"><span class="mini_title">1. 레몬즙 스틱: 언제 어디서나 간편하게!</span>레몬즙 스틱은 바쁜 일상에서도 쉽게 레몬수를 섭취할 수 있는 최고의 방법입니다. 출근길이나 여행 중에도 물만 있으면 상쾌한 레몬수를 빠르게 만들 수 있어 휴대가 간편하고 위생적이죠. 언제 어디서나 빠르고 간편하게 레몬수를 즐길 수 있습니다.</div>

<div class="text_box"><span class="mini_title">2. 대용량 레몬즙 통: 자유로운 양 조절과 경제성!</span>레몬수를 자주 마시거나 요리에도 활용하고 싶다면 대용량 레몬즙이 좋은 선택입니다. 자유롭게 양을 조절할 수 있어 다용도로 활용할 수 있으며, 경제적인 면에서도 유리합니다. 보관 시 신선도를 유지하기에 어려움이 있지만, 꾸준히 섭취하고자 하신다면 효율적인 선택입니다.</div>

<div class="text_box"><span class="mini_title">3. 직접 레몬즙 착즙하기: 신선함은 그대로!</span>가장 신선하고 건강한 방법을 찾고 있다면, 직접 레몬을 착즙해 섭취하는 것이 답입니다. 방부제나 첨가물 없이 레몬 본연의 영양을 그대로 섭취할 수 있죠. 시간과 노력이 들어가지만, 최고의 신선함을 원한다면 직접 착즙이 가장 좋은 방법입니다.</div>

<div class="se-component se-image-container __se__float-none">
  <figure style="">
    <img src="https://i.imgur.com/IU0cWFV.png" alt="테팔 블렌드포스 믹서기" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="IU0cWFV.png" data-se-file-size="0" data-se-index="7" style="">
  </figure>
</div>

<h3>테팔 블렌드포스 믹서기로 일상을 더 편리하게 만드는 이유!”</h3>

<div class="se-component se-image-container __se__float-none">
  <figure style="">
    <img class="emoji_rhombus" alt="🔸" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f538.svg" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="1f538.svg" data-se-file-size="0" data-se-index="8" style="">
  </figure>
</div>

<div class="text_box"><span class="mini_title contain_img"> 강력한 성능과 간편한 사용성</span></div>

<div class="text_box">테팔 블렌드포스 믹서기는 강력한 22000RPM 모터와 파워엘릭스 기술로 단단한 재료도 손쉽게 분쇄합니다.							편리하게 분리할 수 있는 칼날 덕분에 세척이 간편하며, 1.75L 대용량 내열 유리 용기로 많은 양을 한 번에 블렌딩할 수 있어							요리에 더욱 유용합니다.						</div>

<div class="se-component se-image-container __se__float-none">
  <figure style="">
    <img class="emoji_rhombus" alt="🔸" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f538.svg" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="1f538.svg" data-se-file-size="0" data-se-index="9" style="">
  </figure>
</div>

<div class="text_box"><span class="mini_title contain_img"> 이중 잠금으로 안전하게</span></div>

<div class="text_box">스마트 잠금 방식으로 안전하게 사용할 수 있어, 언제나 안심하고 요리할 수 있습니다. 안전을 고려한 설계로, 블렌딩이 더욱 즐거워집니다.</div>

<h3>레몬수와 레몬큐브로 매일 상쾌하고 건강하게 살아가는 법!</h3>

<div class="text_box">레몬수와 레몬큐브는 단순한 음료를 넘어, 상큼함과 건강을 동시에 잡을 수 있는 최고의 아이템입니다.특히 테팔 블렌드포스 믹서기를 사용하면 간편하게 레몬큐브를 만들어 매일매일 신선한 맛과 영양을 즐길 수 있습니다.이제부터는 매일 아침 상큼한 레몬수로 건강을 챙기고, 레몬큐브로 다양한 요리에 생기를 불어넣어 보세요.이 작은 변화가 당신의 하루를 얼마나 상쾌하고 특별하게 만들지 기대해 보세요!</div>

	`,
	// theme: 'dark',
	// toolbar_container: document.getElementById('ttt'),
	// iframe: true,
	// height: 1500,
	// iframe_attributes: { aaa: true },
	type: 'document:header,page',

	link: {
		uploadUrl: 'http://localhost:3000/editor/files/upload',
		relList: ['alternate', 'author', 'external', 'help', 'license', 'next', 'follow', 'nofollow', 'noreferrer', 'noopener', 'prev', 'search', 'tag'],
		defaultRel: 'tag',
	},
	video: {
		allowMultiple: true,
		uploadUrl: 'http://localhost:3000/editor/upload',
		createFileInput: true,
		controls: [['resize_auto,75,50', 'align', 'rotate_l', 'rotate_r', 'mirror_h', 'mirror_v', 'edit', 'revert', 'copy', 'remove']],
	},
	videoGallery: {
		url: 'http://localhost:3000/editor/gallery/video',
	},
	embed: { controls: [['resize_auto,75,50', 'align', 'rotate_l', 'rotate_r', 'mirror_h', 'mirror_v', 'edit', 'revert', 'copy', 'remove']] },
	attributeWhitelist: { '*': 'id' },
	imageGallery: {
		// data: [
		// 	{
		// 		src: 'http://suneditor.com/docs/cat.jpg',
		// 		name: 'Tabby',
		// 		alt: 'Tabby',
		// 		tag: 'Cat'
		// 	},
		// 	{
		// 		src: 'http://suneditor.com/docs/cat1.jpg',
		// 		name: 'Cat paw',
		// 		alt: 'Cat paw',
		// 		tag: 'Cat'
		// 	},
		// 	{
		// 		src: 'http://suneditor.com/docs/cat2.jpg',
		// 		name: 'Cat',
		// 		alt: 'Cat',
		// 		tag: 'Cat'
		// 	}
		// ],
		url: 'https://etyswjpn79.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo',
	},
	image: {
		// canResize: false,
		// uploadUrl: 'http://localhost:3000/editor/upload',
		linkEnableFileUpload: true,
		allowMultiple: true,
		useFormatType: true,
		defaultFormatType: 'block',
		// percentageOnlySize: true
	},
	audio: {
		allowMultiple: true,
		uploadUrl: 'http://localhost:3000/editor/upload',
		createFileInput: true,
	},
	audioGallery: {
		url: 'http://localhost:3000/editor/gallery/audio',
	},
	fileGallery: {
		url: 'http://localhost:3000/editor/gallery/file',
	},
	fileBrowser: {
		url: 'http://localhost:3000/editor/filebrowser',
	},
	table: {
		scrollType: 'x',
		// cellControllerPosition: 'cell',
	},
	fontColor: {
		// disableHEXInput: true,
		items: [{ name: 'red', value: '#ff0000' }, '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd', '#000000'],
	},
	fileUpload: {
		uploadUrl: 'http://localhost:3000/editor/files/upload',
		as: 'link',
		allowMultiple: true,
	},
	exportPDF: {
		apiUrl: 'http://localhost:3000/editor/download-pdf',
	},
	fontSize: {
		// showIncDecControls: true
		// disableInput: true,
		// sizeUnit: 'text',
		// showDefaultSizeLabel:true
	},
	mention: {
		// data: [{"key":"rwhilnj","name":"Riley White (Product Manager)","url":"https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/rwhilnj/info"},{"key":"mwil298","name":"Morgan Wilson (Project Manager)","url":"https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/mwil298/info"},{"key":"eand3d1","name":"Elliott Anderson (UX Designer)","url":"https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/eand3d1/info"},{"key":"ztaya65","name":"Zane Taylor (Project Manager)","url":"https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/ztaya65/info"},{"key":"stho9wt","name":"Sawyer Thomas (Product Manager)","url":"https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/stho9wt/info"}],
		apiUrl: 'https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/{ key }?limit={limitSize}',
		useCachingFieldData: true,
	},
	drawing: {
		// size: 22,
		// outputFormat: 'svg'
		// lineReconnect: true,
		// lineCap: 'square',  // butt, round, square
		// modalSizeWidth: '750px',
		// modalSizeHeight: '50vh'
	},
	// externalLibs: {
	// 	// math
	// 	// katex: {
	// 	// 	src: Katex
	// 	// },
	// 	mathjax: {
	// 		src: mathjax,
	// 		TeX,
	// 		CHTML,
	// 		browserAdaptor,
	// 		RegisterHTMLHandler,
	// 	},
	// 	// perfectFreehand: PerfectFreehand,
	// 	// codemirror
	// 	codeMirror: {
	// 		EditorView: EditorView,
	// 		extensions: [
	// 			basicSetup,
	// 			html({
	// 				matchClosingTags: true,
	// 				autoCloseTags: true,
	// 			}),
	// 			javascript(),
	// 		],
	// 		minimalSetup: minimalSetup,
	// 		// src: Codemirror5
	// 	},
	// },
	value: `
    <div >
        <img
                src="https://edgio.clien.net/F01/15516734/7e018a72fd072b.jpg?scale=width:740\"
                alt="KakaoTalk_20250811_212213428.jpg"/>
    </div>
    <div >
        <iframe frameborder="0" allowfullscreen="" src="https://www.youtube.com/embed/kU-bKMAlh18" data-proportion="true" data-align="none" style="width: 100%; height: 100%;" data-index="0" data-file-name="kU-bKMAlh18" data-file-size="0" data-origin="100%,56.25%"></iframe>
    </div>
    <div >
	dsa
	dsad
	dsa
        <audio controls="true" origin-size="," src="custom://dsa" data-index="0" data-file-name="dsa" data-file-size="0" style=""></audio>
    </div>
	<div class="se-component se-embed-container __se__float-none">
  <figure style="" class="">
    <div class="twitter-tweet twitter-tweet-rendered" style="display: flex; width: 100%; margin-top: 10px; margin-bottom: 10px;"><iframe id="twitter-widget-0" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" class="" style="position: static; visibility: visible; width: 322px; height: 708px; display: block; flex-grow: 1;" title="X Post" src="https://platform.twitter.com/embed/Tweet.html?dnt=false&amp;embedId=twitter-widget-0&amp;features=eyJ0ZndfdGltZWxpbmVfbGlzdCI6eyJidWNrZXQiOltdLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X2ZvbGxvd2VyX2NvdW50X3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9iYWNrZW5kIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19yZWZzcmNfc2Vzc2lvbiI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfZm9zbnJfc29mdF9pbnRlcnZlbnRpb25zX2VuYWJsZWQiOnsiYnVja2V0Ijoib24iLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X21peGVkX21lZGlhXzE1ODk3Ijp7ImJ1Y2tldCI6InRyZWF0bWVudCIsInZlcnNpb24iOm51bGx9LCJ0ZndfZXhwZXJpbWVudHNfY29va2llX2V4cGlyYXRpb24iOnsiYnVja2V0IjoxMjA5NjAwLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X3Nob3dfYmlyZHdhdGNoX3Bpdm90c19lbmFibGVkIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19kdXBsaWNhdGVfc2NyaWJlc190b19zZXR0aW5ncyI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdXNlX3Byb2ZpbGVfaW1hZ2Vfc2hhcGVfZW5hYmxlZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdmlkZW9faGxzX2R5bmFtaWNfbWFuaWZlc3RzXzE1MDgyIjp7ImJ1Y2tldCI6InRydWVfYml0cmF0ZSIsInZlcnNpb24iOm51bGx9LCJ0ZndfbGVnYWN5X3RpbWVsaW5lX3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9mcm9udGVuZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9fQ%3D%3D&amp;frame=false&amp;hideCard=false&amp;hideThread=false&amp;id=1945744030064935105&amp;lang=en&amp;origin=http%3A%2F%2Flocalhost%3A8088%2F&amp;sessionId=1695bd6044821f03842dcef35667609cc4be2694&amp;theme=light&amp;widgetsVersion=2615f7e52b7e0%3A1702314776716&amp;width=auto" data-tweet-id="1945744030064935105" data-se-index="1" data-se-file-name="Tweet.html?dnt=false&amp;embedId=twitter-widget-0&amp;features=eyJ0ZndfdGltZWxpbmVfbGlzdCI6eyJidWNrZXQiOltdLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X2ZvbGxvd2VyX2NvdW50X3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9iYWNrZW5kIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19yZWZzcmNfc2Vzc2lvbiI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfZm9zbnJfc29mdF9pbnRlcnZlbnRpb25zX2VuYWJsZWQiOnsiYnVja2V0Ijoib24iLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X21peGVkX21lZGlhXzE1ODk3Ijp7ImJ1Y2tldCI6InRyZWF0bWVudCIsInZlcnNpb24iOm51bGx9LCJ0ZndfZXhwZXJpbWVudHNfY29va2llX2V4cGlyYXRpb24iOnsiYnVja2V0IjoxMjA5NjAwLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X3Nob3dfYmlyZHdhdGNoX3Bpdm90c19lbmFibGVkIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19kdXBsaWNhdGVfc2NyaWJlc190b19zZXR0aW5ncyI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdXNlX3Byb2ZpbGVfaW1hZ2Vfc2hhcGVfZW5hYmxlZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdmlkZW9faGxzX2R5bmFtaWNfbWFuaWZlc3RzXzE1MDgyIjp7ImJ1Y2tldCI6InRydWVfYml0cmF0ZSIsInZlcnNpb24iOm51bGx9LCJ0ZndfbGVnYWN5X3RpbWVsaW5lX3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9mcm9udGVuZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9fQ%3D%3D&amp;frame=false&amp;hideCard=false&amp;hideThread=false&amp;id=1945744030064935105&amp;lang=en&amp;origin=http%3A%2F%2Flocalhost%3A8088%2F&amp;sessionId=1695bd6044821f03842dcef35667609cc4be2694&amp;theme=light&amp;widgetsVersion=2615f7e52b7e0%3A1702314776716&amp;width=auto" data-se-file-size="0"></iframe>
    </div>
  </figure>
  </div>
  <div>
 fdsa
 fasf321312312 
  <div class="twitter-tweet twitter-tweet-rendered" style="display: flex; width: 100%; margin-top: 10px; margin-bottom: 10px;"><iframe id="twitter-widget-0" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" class="" style="position: static; visibility: visible; width: 322px; height: 708px; display: block; flex-grow: 1;" title="X Post" src="https://platform.twitter.com/embed/Tweet.html?dnt=false&amp;embedId=twitter-widget-0&amp;features=eyJ0ZndfdGltZWxpbmVfbGlzdCI6eyJidWNrZXQiOltdLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X2ZvbGxvd2VyX2NvdW50X3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9iYWNrZW5kIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19yZWZzcmNfc2Vzc2lvbiI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfZm9zbnJfc29mdF9pbnRlcnZlbnRpb25zX2VuYWJsZWQiOnsiYnVja2V0Ijoib24iLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X21peGVkX21lZGlhXzE1ODk3Ijp7ImJ1Y2tldCI6InRyZWF0bWVudCIsInZlcnNpb24iOm51bGx9LCJ0ZndfZXhwZXJpbWVudHNfY29va2llX2V4cGlyYXRpb24iOnsiYnVja2V0IjoxMjA5NjAwLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X3Nob3dfYmlyZHdhdGNoX3Bpdm90c19lbmFibGVkIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19kdXBsaWNhdGVfc2NyaWJlc190b19zZXR0aW5ncyI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdXNlX3Byb2ZpbGVfaW1hZ2Vfc2hhcGVfZW5hYmxlZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdmlkZW9faGxzX2R5bmFtaWNfbWFuaWZlc3RzXzE1MDgyIjp7ImJ1Y2tldCI6InRydWVfYml0cmF0ZSIsInZlcnNpb24iOm51bGx9LCJ0ZndfbGVnYWN5X3RpbWVsaW5lX3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9mcm9udGVuZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9fQ%3D%3D&amp;frame=false&amp;hideCard=false&amp;hideThread=false&amp;id=1945744030064935105&amp;lang=en&amp;origin=http%3A%2F%2Flocalhost%3A8088%2F&amp;sessionId=1695bd6044821f03842dcef35667609cc4be2694&amp;theme=light&amp;widgetsVersion=2615f7e52b7e0%3A1702314776716&amp;width=auto" data-tweet-id="1945744030064935105" data-se-index="1" data-se-file-name="Tweet.html?dnt=false&amp;embedId=twitter-widget-0&amp;features=eyJ0ZndfdGltZWxpbmVfbGlzdCI6eyJidWNrZXQiOltdLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X2ZvbGxvd2VyX2NvdW50X3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9iYWNrZW5kIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19yZWZzcmNfc2Vzc2lvbiI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfZm9zbnJfc29mdF9pbnRlcnZlbnRpb25zX2VuYWJsZWQiOnsiYnVja2V0Ijoib24iLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X21peGVkX21lZGlhXzE1ODk3Ijp7ImJ1Y2tldCI6InRyZWF0bWVudCIsInZlcnNpb24iOm51bGx9LCJ0ZndfZXhwZXJpbWVudHNfY29va2llX2V4cGlyYXRpb24iOnsiYnVja2V0IjoxMjA5NjAwLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X3Nob3dfYmlyZHdhdGNoX3Bpdm90c19lbmFibGVkIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH0sInRmd19kdXBsaWNhdGVfc2NyaWJlc190b19zZXR0aW5ncyI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdXNlX3Byb2ZpbGVfaW1hZ2Vfc2hhcGVfZW5hYmxlZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9LCJ0ZndfdmlkZW9faGxzX2R5bmFtaWNfbWFuaWZlc3RzXzE1MDgyIjp7ImJ1Y2tldCI6InRydWVfYml0cmF0ZSIsInZlcnNpb24iOm51bGx9LCJ0ZndfbGVnYWN5X3RpbWVsaW5lX3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9mcm9udGVuZCI6eyJidWNrZXQiOiJvbiIsInZlcnNpb24iOm51bGx9fQ%3D%3D&amp;frame=false&amp;hideCard=false&amp;hideThread=false&amp;id=1945744030064935105&amp;lang=en&amp;origin=http%3A%2F%2Flocalhost%3A8088%2F&amp;sessionId=1695bd6044821f03842dcef35667609cc4be2694&amp;theme=light&amp;widgetsVersion=2615f7e52b7e0%3A1702314776716&amp;width=auto" data-se-file-size="0"></iframe>
  </div>
    `,
	value: `dsadsa
	<figure class="se-flex-component se-input-component se-scroll-figure-x" style="width: 100%;">
  <table class="se-table-layout-auto" style="">
    <colgroup><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"></colgroup>
    <tbody>
      <tr>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td class="">
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div><br>
          </div>
        </td>
        <td class="">
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</figure>
`,
	value: `<ol style="list-style-type: ">
  <li>comp12insert<br>
<div class="se-component se-image-container __se__float-none">
      <figure class="" style="">
        <img src="http://suneditor.com/docs/retriever.jpg" alt="Retriever" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="Retriever" data-se-file-size="0" style="" data-se-index="3">
      </figure>
</div>
  </li>
  <li>bb</li>
</ol>

`,
	value: `<pre>​dsa1dsa</pre>

<figure class="se-flex-component se-input-component se-scroll-figure-x" style="width: 100%;">
  <table class="se-table-layout-auto" style="">
    <colgroup><col style="width: 20%;"><col style="width: 20%;"><col style="width: 20%;"><col style="width: 20%;"><col style="width: 20%;"></colgroup>
    <tbody>
      <tr>
        <td>
          <div><br>
          </div>
        </td>
        <td class="">
          <div>dsadsa</div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
      </tr>
      <tr>
        <td class="">
          <div><br>
          </div>
        </td>
        <td>
          <div>dsa</div>
        </td>
        <td class="">
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td class="">
          <div>dsadasdsa</div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
        <td>
          <div><br>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</figure>

<p>​dsadsa</p>
<div class="se-component se-image-container __se__float-none">
  <figure style="" class="">
    <img src="http://suneditor.com/docs/cat.jpg" alt="Tabby" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="Tabby" data-se-file-size="0" data-se-index="0" style="">
  </figure>
</div>
<ol style="list-style-type: ">
  <li>dsadsa</li>
  <li>bbdadas
    <ol>
      <li>dsadsadsa</li>
      <li>dsadsadas
        <ol>
          <li>dsadsa</li>
          <li>dsadsa</li>
          <li>dsadas</li>
        </ol>
      </li>
    </ol>
  </li>
</ol>
<ol style="list-style-type: ">
  <li>dsadsa
    <ol>
      <li>dsadas
        <ol>
          <li>dsa<br>
<br>
          </li>
        </ol>
      </li>
    </ol>
  </li>
</ol>
`,
	// value: `<p>​dsadsa</p>

	// <figure class="se-flex-component se-input-component se-scroll-figure-x se-figure-over-selected se-figure-selected se-component-selected" style="width: 100%;">
	//   <table class="se-table-layout-auto" style="">
	//     <colgroup><col style="width: 50%;"><col style="width: 50%;"></colgroup>
	//     <tbody>
	//       <tr>
	//         <td>
	//           <div><br>
	//           </div>
	//         </td>
	//         <td>
	//           <div><br>
	//           </div>
	//         </td>
	//       </tr>
	//       <tr>
	//         <td>
	//           <div><br>
	//           </div>
	//         </td>
	//         <td>
	//           <div><br>
	//           </div>
	//         </td>
	//       </tr>
	//     </tbody>
	//   </table>
	// </figure>

	// <p>​dsa</p>

	// <p>dsa1</p>

	// <p>dsa</p>

	// <div class="se-component se-image-container __se__float-none">
	//   <figure style="" class="">
	//     <img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" style="" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="Welsh Corgi" data-se-file-size="0" data-se-index="0">
	//   </figure>
	// </div>

	// <p>dsadsa</p>
	// `,
	// value: `<p><br>
	// </p>

	// <ol style="list-style-type: upper-latin">
	//   <li><br>

	//     <ol>
	//       <li>ds
	//         <figure class="se-flex-component se-input-component se-scroll-figure-x se-component-selected se-figure-selected" style="width: 100%;">
	//           <table class="se-table-layout-auto">
	//             <colgroup><col style="width: 50%"><col style="width: 50%"></colgroup>
	//             <tbody>
	//               <tr>
	//                 <td class="" colspan="1" rowspan="2">
	//                   <div>dsa</div>
	//                   <div>dsa</div>
	//                 </td>
	//                 <td>
	//                   <div><br>
	//                   </div>
	//                 </td>
	//               </tr>
	//               <tr>
	//                 <td>
	//                   <div>dsa</div>
	//                 </td>
	//               </tr>
	//             </tbody>
	//           </table>
	//         </figure>
	//       </li>
	//     </ol>
	//   </li>
	//   <li>​dsa</li>
	//   <li>dsa1</li>
	//   <li>dsa</li>
	//   <li><br>

	// <div class="se-component se-image-container __se__float-none">
	//       <figure class="" style="">
	//         <img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="Welsh Corgi" data-se-file-size="0" style="" data-se-index="0">
	//       </figure>
	// </div>
	//   </li>
	//   <li>dsadsa</li>
	// </ol>

	// `,
	// value: '<ol><li></li></ol>',
	// charCounter_max: 26,
	placeholder: 'Start typing here...',
	// defaultLineBreakFormat: 'br',
	events: {
		// onFileAction: (data) => {
		// 	// console.log('fileaa', data);
		// },
		onVideoUploadBefore: ({ handler, info, files, file, url }) => {
			console.log('urlurl', files);
			return true;
		},
		onBlur() {
			console.log('blur');
		},
		onNativeBlur() {
			console.log('blurNative');
		},
		onFocus() {
			console.log('focus');
		},
		onNativeFocus() {
			console.log('focusNative');
		},
		onExportPDFBefore(params) {
			console.log('pdfbefore', params);
		},
		onImageAction(data) {
			console.log('ima', data);
		},
		onFontActionBefore(data) {
			console.log('fontbefore', data);
		},
		onabc() {},
		// onPaste(params) {
		// 	console.log('paste', params);
		// 	return params.editor.html.filter(params.html, { validate: (el) => {
		// 		console.log('el-----------------------------', el);
		// 		if (el.nodeName === 'SPAN') {
		// 			if (el.className.includes('katex')) {
		// 				return;
		// 			}
		// 			return el.innerHTML;
		// 		}
		// 	} })
		// },
		// onFileDeleteBefore(arg) {
		// 	console.log('delete file', arg);
		// 	return false;
		// },
		// onImageDeleteBefore(arg) {
		// 	console.log('delete image', arg);
		// 	return false;
		// },
		// onAudioDeleteBefore(arg) {
		// 	console.log('delete audio', arg);
		// 	return false;
		// },
		// onVideoDeleteBefore(arg) {
		// 	console.log('delete video', arg);
		// 	return false;
		// },
	},
	// iframe: true,
	maxHeight: 600,
	toolbar_sticky: 50,
	iframe_attributes: { frameborder: '1' },
	value: `<pre style="line-height: 1.45;margin: 0px 0px 10px">​dsadsa</pre><figure class="se-flex-component se-input-component se-scroll-figure-x" style="padding: 0px 1px; width: 280px;"><table class="se-table-layout-auto" style="border-width: 1px; border-style: solid; border-color: rgb(225, 225, 225); background-color: rgb(255, 255, 255); border-collapse: collapse;"><colgroup><col style="width: 49.5547px"><col style="width: 55.3672px"><col style="width: 74.9609px"><col style="width: 49.5547px"><col style="width: 49.5625px"></colgroup><tbody><tr><td style="line-height: 19.5px"><br></td><td class="" style="line-height: 19.5px"><div style="line-height: 19.5px">dsadsa</div></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td></tr><tr><td class="" style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><div style="line-height: 19.5px">dsa</div></td><td class="" style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td></tr><tr><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td class="" style="line-height: 19.5px"><div style="line-height: 19.5px">dsadasdsa</div></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td></tr><tr><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td></tr></tbody></table></figure><p style="line-height: 19.5px;margin: 0px 0px 10px">​dsadsa</p><p style="line-height: 19.5px;margin: 0px 0px 10px">dsa</p><div class="se-component se-image-container __se__float-none">
  <figure style="" class="">
    <img src="http://suneditor.com/docs/cat.jpg" alt="Tabby" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="Tabby" data-se-file-size="0" data-se-index="0" style="">
  </figure>
</div><p style="line-height: 19.5px;margin: 0px 0px 10px">d</p><p style="line-height: 19.5px;margin: 0px 0px 10px">​d</p><p style="line-height: 19.5px;margin: 0px 0px 10px"><br></p><p style="line-height: 19.5px;margin: 0px 0px 10px">​sa</p><p style="line-height: 19.5px;margin: 0px 0px 10px">​s</p><p style="line-height: 19.5px;margin: 0px 0px 10px">ada</p><p style="line-height: 19.5px;margin: 0px 0px 10px">asd</p><p style="line-height: 19.5px;margin: 0px 0px 10px">d</p><p style="line-height: 19.5px;margin: 0px 0px 10px"><br></p><p style="line-height: 19.5px;margin: 0px 0px 10px"><br></p><p style="line-height: 19.5px;margin: 0px 0px 10px"><br></p><p style="line-height: 19.5px;margin: 0px 0px 10px"><br></p><p style="line-height: 19.5px;margin: 0px 0px 10px"><br></p><p style="line-height: 19.5px;margin: 0px 0px 10px">​d</p><p style="line-height: 19.5px;margin: 0px 0px 10px">asd</p><p style="line-height: 19.5px;margin: 0px 0px 10px">sad</p><p style="line-height: 19.5px;margin: 0px 0px 10px">sad</p><p style="line-height: 19.5px;margin: 0px 0px 10px">sad</p><p style="line-height: 19.5px;margin: 0px 0px 10px">sa</p><p style="line-height: 19.5px;margin: 0px 0px 10px"><br></p><p style="line-height: 19.5px;margin: 0px 0px 10px"><br></p><p style="line-height: 19.5px;margin: 0px 0px 10px">121</p><p style="line-height: 19.5px;margin: 0px 0px 10px"><br></p><p style="line-height: 19.5px;margin: 0px 0px 10px"><br></p><p style="line-height: 19.5px;margin: 0px 0px 10px"><br></p><p style="line-height: 19.5px;margin: 0px 0px 10px">qe</p><p style="line-height: 19.5px;margin: 0px 0px 10px">​2</p><p style="line-height: 19.5px;margin: 0px 0px 10px">​f</p><p style="line-height: 19.5px;margin: 0px 0px 10px">​f</p><p style="line-height: 19.5px;margin: 0px 0px 10px">​g</p><p style="line-height: 19.5px;margin: 0px 0px 10px">2g4</p><p style="line-height: 19.5px;margin: 0px 0px 10px">24</p><p style="line-height: 19.5px;margin: 0px 0px 10px">g2</p><p style="line-height: 19.5px;margin: 0px 0px 10px">h</p><p style="line-height: 19.5px;margin: 0px 0px 10px">h4</p><p style="line-height: 19.5px;margin: 0px 0px 10px">hh</p><p style="line-height: 19.5px;margin: 0px 0px 10px">2h</p><p style="line-height: 19.5px;margin: 0px 0px 10px">h2</p><p style="line-height: 19.5px;margin: 0px 0px 10px">42h</p><p style="line-height: 19.5px;margin: 0px 0px 10px">42</p><p style="line-height: 19.5px;margin: 0px 0px 10px">h42</p><p style="line-height: 19.5px;margin: 0px 0px 10px">2</p><p style="line-height: 19.5px;margin: 0px 0px 10px">h2</p><p style="line-height: 19.5px;margin: 0px 0px 10px">h2</p><p style="line-height: 19.5px;margin: 0px 0px 10px">​h4</p><p style="line-height: 19.5px;margin: 0px 0px 10px">4h</p><p style="line-height: 19.5px;margin: 0px 0px 10px">​h</p><p style="line-height: 19.5px;margin: 0px 0px 10px">​24</p><p style="line-height: 19.5px;margin: 0px 0px 10px">h<br></p><ol style="list-style-type: decimal"><li><br></li><li>dsadsa</li><li>bbdadas<ol style="list-style-type: lower-alpha"><li>dsadsadsa</li><li>dsa</li><li>dsa<br></li><li>dsadsadas<ol style="list-style-type: upper-roman"><li>dsadsa</li><li>dsadsa</li><li>dsadas</li></ol></li></ol></li></ol><ol style="list-style-type: decimal"><li>dsadsa<ol style="list-style-type: lower-alpha"><li>dsadas<ol style="list-style-type: upper-roman"><li>dsa<br>​</li><li>dsa</li><li>​dsadsa</li><li><figure class="se-flex-component se-input-component se-scroll-figure-x" style="padding: 0px 1px; width: 280px;"><table class="se-table-layout-auto" style="border-width: 1px; border-style: solid; border-color: rgb(225, 225, 225); background-color: rgb(255, 255, 255); border-collapse: collapse;"><colgroup><col style="width: 49.5547px"><col style="width: 55.3672px"><col style="width: 74.9609px"><col style="width: 49.5547px"><col style="width: 49.5625px"></colgroup><tbody><tr><td style="line-height: 19.5px"><br></td><td class="" style="line-height: 19.5px"><div style="line-height: 19.5px">dsadsa</div></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td></tr><tr><td class="" style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><div style="line-height: 19.5px">dsa</div></td><td class="" style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td></tr><tr><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td class="" style="line-height: 19.5px"><div style="line-height: 19.5px">dsadasdsa</div></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td></tr><tr><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td><td style="line-height: 19.5px"><br></td></tr></tbody></table></figure></li><li>​dsadsa</li><li>dsa</li><li>d</li><li>​d</li><li>​sa</li><li>​s</li><li>ada</li><li>asd</li><li>d</li><li><br></li><li>​d</li><li>asd</li><li>sad</li><li>sad</li><li>sad</li><li>sa</li><li>121</li><li><br></li><li>qe</li><li>​2</li><li>​f</li><li>​f</li><li>​g</li><li>2g4</li><li>24</li><li>g2</li><li>h</li><li>h4</li><li>hh</li><li>2h</li><li>h2</li><li>42h</li><li>42</li><li>h42</li><li>2</li><li>h2</li><li>h2</li><li>​h4</li><li>4h</li><li>​h</li><li>​24</li><li>h<br></li><li>dsadsa</li><li>bbdadas<ol style="list-style-type: lower-alpha"><li>dsadsadsa</li><li>dsa</li><li>dsa<br></li><li>dsadsadas<ol style="list-style-type: upper-roman"><li>dsadsa</li><li>dsadsa</li><li>dsadas</li></ol></li></ol></li><li>dsadsa<ol style="list-style-type: lower-alpha"><li>dsadas<ol style="list-style-type: upper-roman"><li>dsa<br>​</li><li>dsa</li></ol></li></ol></li></ol></li></ol></li></ol><p><br></p><p><br></p>`,
	// externalLibs: {
	// 	// katex: Katex,
	// 	// mathJax: {
	// 	// 	src: (() => {
	// 	// 		// Register HTML handler before creating document
	// 	// 		RegisterHTMLHandler(browserAdaptor());
	// 	// 		return mathjax.document(document, {
	// 	// 			InputJax: new TeX(),
	// 	// 			OutputJax: new CHTML(),
	// 	// 		});
	// 	// 	})(),
	// 	// 	tex: {},
	// 	// },
	// },
};

window.editor_root = suneditor.create('#editor_classic', options1);
// window.editor_root = suneditor.create('#scrolleditor', options1);

// suneditor.create(
// 	appEl,
// 	// document.querySelector('#multi_editor_1'),
// 	// {
// 	// 	editor1: {
// 	// 		target: document.querySelector('#multi_editor_1'),
// 	// 		options: {
// 	// 			// value: `
// 	// 			// <p><a href="http://localhost:8088/dsa">http://localhost:808</a></p>

// 	// 			// <p>ed1</p>

// 	// 			// <hr class="__se__solid">

// 	// 			// <p><br>
// 	// 			// </p>

// 	// 			// <p>ed2</p>

// 	// 			// <div class="se-component se-image-container __se__float-none">
// 	// 			// <figure>
// 	// 			// 	<img src="http://suneditor.com/docs/cat.jpg" alt="Tabby" data-se-size="auto,auto" data-se-file-name="cat.jpg" data-se-file-size="0" style="" data-se-index="0">
// 	// 			// </figure>
// 	// 			// </div>

// 	// 			// <p>ed3</p>

// 	// 			// <p>ed4</p>

// 	// 			// <p>edend--</p>

// 	// 			// <div>					</div>

// 	// 			// `,
// 	// 			placeholder: 'place1',
// 	// 			height: '400px',
// 	// 			width: '500px',
// 	// 			iframe: true,
// 	// 			// iframe_fullPage: true,
// 	// 			statusbar: true,
// 	// 			statusbar_resizeEnable: true
// 	// 		}
// 	// 	},
// 	// 	editor2: {
// 	// 		target: document.querySelector('#multi_editor_2'),
// 	// 		options: {
// 	// 			value: '<p>ed2</p>',
// 	// 			// placeholder: 'place21'
// 	// 		}
// 	// 	},
// 	// 	editor3: {
// 	// 		target: document.querySelector('#multi_editor_3'),
// 	// 		options: {
// 	// 			value: '<p>ed3</p>',
// 	// 			placeholder: 'place3'
// 	// 		}
// 	// 	},
// 	// 	editor4: {
// 	// 		target: document.querySelector('#multi_editor_4'),
// 	// 		options: {
// 	// 			// value: '<p>ed4</p>',
// 	// 			placeholder: 'place4'
// 	// 		}
// 	// 	}
// 	// },
// 	options1
// );

// window.countEventListeners = function () {
// 	const elements = document.querySelectorAll('*');
// 	let totalListeners = 0;

// 	elements.forEach((element) => {
// 		const listeners = getEventListeners(element);
// 		for (let type in listeners) {
// 			totalListeners += listeners[type].length;
// 		}
// 	});

// 	return totalListeners;
// };

// editor_root.onload = () => {
// 	// editor_root.events.onFileAction = () => {
// 	// 	console.log('arguems', arguments);
// 	// };
// };

// window.aaa = function () {
// 	editor_root.html.insert('<p>aaaaaaaaa</p>');
// };
// window.create = function () {
// 	window.editor_root = suneditor.create(document.querySelector('#multi_editor_1'));
// };
// window.destroy = function () {
// 	editor_root.destroy();
// };

// window.r = () => {
// 	window.editor_root.resetOptions({
// 		editor1: {
// 			statusbar_resizeEnable: false
// 		}
// 	});
// };

// window.d = () => {
// 	// window.editor_root = window.editor_root.destroy()
// };

// function delay(ms) {
// 	return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function delayedFunction() {
// 	console.log('Starting---');
// 	await delay(2000);
// 	console.log('Finished...');
// }

// function loadEvent() {
// 	// editor_root.events.onClick = async (rootKey) => {
// 	// 	await delayedFunction();
// 	// 	console.log('rootkeuy', rootKey);
// 	// };
// 	editor_root.events.onSave = async ({ frameContext, data }) => {
// 		await delayedFunction();
// 		console.log('rootkeuy', data);
// 	};

// 	window.editor_root.events.imageUploadHandler = async ({ xmlHttp, info }) => {
// 		await delayedFunction();
// 		console.log(xmlHttp);
// 		console.log(info);
// 		// editor_root.plugins.image._register(info, JSON.parse(xmlHttp.response));
// 	};
// 	window.editor_root.events.onImageUploadBefore = async (info) => {
// 		await delayedFunction();
// 		console.log('info', info);
// 		info.handler();
// 	};
// 	window.editor_root.events.onImageUpload = async ({ handler, info, files, file, url }) => {
// 		await delayedFunction();
// 		handler('http://suneditor.com/docs/cat.jpg');
// 	};
// 	window.editor_root.events.onImageUploadError = async (params) => {
// 		await delayedFunction();
// 		return 'aaa';
// 	};
// 	// window.editor_root.events.onBlur = async (e) => {
// 	// 	console.log('blurrrr', e.event);
// 	// };
// 	// window.editor_root.events.onFocus = async () => {
// 	// 	console.log('onFocusonFocusonFocus');
// 	// };
// }

// editor_root.events.onload = () => {
// 	// loadEvent();
// };

// // editor_root.events.onBlur = (rootKey, e, htmlFrame) => {
// // 	console.log('blur', editor_root.frameContext);
// // };

// // editor_root.events.onload = function () {
// // 	editor_root.html.set('fdjksl;afjds ...fdjksafl;d');
// // };
// // editor_root.events.onChange = function (c) {
// // 	console.log(c);
// // };

// ================================================================================================================================
// === COMPREHENSIVE OPTIONS TEST OBJECT (for type checking)
// ================================================================================================================================

/**
 * @type {SunEditor.InitOptions}
 */
const options_test = {
	// === Frame Options ===
	// Content & Editing
	value: '<p>Initial HTML content</p>',
	placeholder: 'Enter text here...',
	editableFrameAttributes: { spellcheck: 'true', 'data-test': 'value' },

	// Layout & Sizing
	width: '100%',
	minWidth: '300px',
	maxWidth: '1200px',
	height: 'auto',
	minHeight: '200px',
	maxHeight: '600px',
	editorStyle: 'border: 1px solid #ccc; border-radius: 4px;',

	// Iframe Mode
	iframe: false,
	iframe_fullPage: false,
	iframe_attributes: { scrolling: 'no', sandbox: 'allow-aa' },
	// Test wildcard and string patterns
	iframe_cssFileName: ['suneditor', 'custom-styles'], // Original
	// iframe_cssFileName: ['*'], // Wildcard: include all stylesheets

	// Statusbar & Character Counter
	statusbar: true,
	statusbar_showPathLabel: true,
	statusbar_resizeEnable: true,
	charCounter: true,
	charCounter_max: 5000,
	charCounter_label: 'Characters: {char}/{maxChar}',
	charCounter_type: 'char',

	// === Base Options ===
	// Plugins & Toolbar
	plugins: plugins,
	excludedPlugins: ['drawing'],
	buttonList: bl,

	// Modes & Themes
	v2Migration: false,
	mode: 'classic',
	type: 'document:header,page',
	theme: '',
	lang: langs.en,
	icons: {},
	textDirection: 'ltr',
	reverseButtons: ['indent-outdent'],

	// Strict Mode & Filtering
	strictMode: {
		tagFilter: true,
		formatFilter: true,
		classFilter: true,
		textStyleTagFilter: true,
		attrFilter: true,
		styleFilter: true,
	},
	scopeSelectionTags: ['td', 'table', 'li', 'ol', 'ul', 'pre'],

	// Content Filtering & Formatting
	elementWhitelist: 'mark|figure',
	elementBlacklist: 'script|style',
	allowedEmptyTags: '.custom-component',
	allowedClassName: 'custom-class',

	// Attribute Control
	attributeWhitelist: {
		a: 'href|target|rel',
		img: 'src|alt|title',
		'*': 'data-id',
	},
	attributeBlacklist: {
		'*': 'onclick|onload',
	},

	// Text & Inline Style Control
	textStyleTags: 'mark',
	convertTextTags: {
		bold: 'strong',
		underline: 'u',
		italic: 'em',
		strike: 'del',
		subscript: 'sub',
		superscript: 'sup',
	},
	allUsedStyles: 'text-shadow|letter-spacing',
	tagStyles: {
		table: 'border|border-collapse',
		th: 'background-color|font-weight',
		td: 'vertical-align',
	},
	spanStyles: 'font-family|font-size|color|background-color',
	lineStyles: 'text-align|margin|line-height',
	fontSizeUnits: ['px', 'pt', 'em', 'rem', '%'],
	retainStyleMode: 'repeat',

	// Line & Block Formatting
	defaultLine: 'p',
	defaultLineBreakFormat: 'line',
	lineAttrReset: 'id|data-temp',
	formatLine: 'section',
	formatBrLine: 'code',
	formatClosureBrLine: '',
	formatBlock: 'aside',
	formatClosureBlock: '',

	// UI & Interaction
	closeModalOutsideClick: false,
	syncTabIndent: true,
	tabDisable: false,
	toolbar_width: 'auto',
	toolbar_container: null,
	toolbar_sticky: 0,
	toolbar_hide: false,
	subToolbar: {
		buttonList: [['bold', 'italic', 'underline']],
		mode: 'balloon',
		width: 'auto',
	},
	statusbar_container: null,
	shortcutsHint: true,
	shortcutsDisable: false,
	shortcuts: {
		bold: ['ctrl+b', 'cmd+b'],
		save: ['ctrl+s', 'cmd+s'],
	},

	// Advanced Features
	copyFormatKeepOn: false,
	autoLinkify: true,
	autoStyleify: ['bold', 'underline', 'italic', 'strike'],
	historyStackDelayTime: 400,
	printClass: 'print-page',
	fullScreenOffset: 0,
	previewTemplate: '<div class="preview-wrapper">{contents}</div>',
	printTemplate: '<html><head><title>Print</title></head><body>{contents}</body></html>',
	componentInsertBehavior: 'auto',
	defaultUrlProtocol: 'https://',
	toastMessageTime: { copy: 1500 },
	freeCodeViewMode: false,

	// Dynamic Options
	externalLibs: {
		katex: Katex,
		mathJax: {
			src: (() => {
				// Register HTML handler before creating document
				RegisterHTMLHandler(browserAdaptor());
				return mathjax.document(document, {
					InputJax: new TeX(),
					OutputJax: new CHTML(),
				});
			})(),
			tex: {},
		},
	},
	allowedExtraTags: {
		script: false,
		style: false,
		meta: false,
	},

	// Advanced Internal Options (prefixed with __)
	__textStyleTags: 'mark|label',
	__tagStyles: {
		table: 'border-collapse',
	},
	__defaultElementWhitelist: 'p|div|span|a|img',
	__defaultAttributeWhitelist: 'href|src|alt|class',
	__defaultFormatLine: 'P|DIV',
	__defaultFormatBrLine: 'PRE',
	__defaultFormatClosureBrLine: '',
	__defaultFormatBlock: 'BLOCKQUOTE',
	__defaultFormatClosureBlock: 'TH|TD',
	__lineFormatFilter: true,
	__listCommonStyle: ['fontSize', 'color', 'fontFamily'],
	__pluginRetainFilter: true,
	__allowedScriptTag: false,

	// === Plugin-Specific Options ===
	align: {
		icons: {
			justify: '<svg>...</svg>',
		},
	},
	audio: {
		multiple: true,
		width: '100%',
		height: 'auto',
		sizeOnlyPercentage: false,
		videoFileInput: true,
		audioUrlInput: true,
		audioRotation: true,
		audioRatio: 0.5625,
		audioSizeOnlyPercentage: false,
	},
	audioGallery: {
		title: 'Audio Gallery',
		url: '/api/audio-gallery',
		header: {
			Authorization: 'Bearer token',
		},
	},
	backgroundColor: {
		colors: [
			['#ff0000', '#00ff00', '#0000ff'],
			['#ffff00', '#ff00ff', '#00ffff'],
		],
	},
	blockStyle: {
		_default: 'Default',
		spaced: 'Spaced',
		bordered: 'Bordered',
	},
	drawing: {
		width: 500,
		height: 300,
	},
	embed: {
		width: '100%',
		height: 'auto',
	},
	exportPDF: {
		options: {
			margin: 10,
			filename: 'document.pdf',
		},
	},
	fileBrowser: {
		title: 'File Browser',
		url: '/api/files',
	},
	fileGallery: {
		title: 'File Gallery',
		url: '/api/file-gallery',
	},
	fileUpload: {
		url: '/upload',
		header: {
			Authorization: 'Bearer token',
		},
	},
	font: {
		list: [
			{ text: 'Arial', value: 'Arial' },
			{ text: 'Georgia', value: 'Georgia' },
		],
		default: 'Arial',
	},
	fontColor: {
		colors: [
			['#000000', '#ffffff'],
			['#ff0000', '#00ff00'],
		],
	},
	fontSize: {
		list: [
			{ text: '8pt', value: '8pt' },
			{ text: '12pt', value: '12pt' },
			{ text: '16pt', value: '16pt' },
		],
		default: '12pt',
	},
	hr: {
		_default: 'solid',
		dashed: 'Dashed',
		dotted: 'Dotted',
	},
	image: {
		multiple: true,
		width: '100%',
		height: 'auto',
		sizeOnlyPercentage: false,
		imageFileInput: true,
		imageUrlInput: true,
		imageRotation: true,
		imageRatio: 0.5625,
		imageSizeOnlyPercentage: false,
	},
	imageGallery: {
		title: 'Image Gallery',
		url: '/api/image-gallery',
		header: {
			Authorization: 'Bearer token',
		},
	},
	layout: {
		layoutBlockWidth: '33.33%',
	},
	lineHeight: {
		list: [
			{ text: '1.0', value: 1.0 },
			{ text: '1.5', value: 1.5 },
			{ text: '2.0', value: 2.0 },
		],
		default: 1.5,
	},
	link: {
		linkProtocol: 'https://',
		linkNoPrefix: false,
		linkRel: ['nofollow', 'noopener'],
		linkRelDefault: {
			default: 'nofollow',
			check_new_window: 'noopener',
		},
	},
	math: {
		katexOptions: {
			throwOnError: false,
		},
		mathJaxOptions: {
			tex: {},
		},
	},
	mention: {
		list: [
			{ value: '@user1', label: 'User 1' },
			{ value: '@user2', label: 'User 2' },
		],
	},
	paragraphStyle: {
		_default: 'Default',
		spaced: 'Spaced paragraph',
	},
	table: {
		minSize: { row: 3, col: 3 },
		maxSize: { row: 20, col: 20 },
		editText: {
			columns: 'Columns',
			rows: 'Rows',
		},
	},
	template: {
		list: [
			{
				name: 'Template 1',
				html: '<div>Template content 1</div>',
			},
			{
				name: 'Template 2',
				html: '<div>Template content 2</div>',
			},
		],
	},
	textStyle: {
		_default: 'Default',
		code: 'Code',
		translucent: 'Translucent',
	},
	video: {
		multiple: true,
		width: '100%',
		height: 'auto',
		videoFileInput: true,
		videoUrlInput: true,
		videoRatio: 0.5625,
	},
	videoGallery: {
		title: 'Video Gallery',
		url: '/api/video-gallery',
		header: {
			Authorization: 'Bearer token',
		},
	},

	// === User Events ===
	events: {
		onload: (core) => {
			console.log('Editor loaded', core);
		},
		onChange: (contents) => {
			console.log('Content changed', contents);
		},
		onScroll: (e) => {
			console.log('Scroll event', e);
		},
		onClick: (e) => {
			console.log('Click event', e);
		},
		onMouseDown: (e) => {
			console.log('Mouse down', e);
		},
		onInput: (e) => {
			console.log('Input event', e);
		},
		onKeyDown: (e) => {
			console.log('Key down', e);
		},
		onKeyUp: (e) => {
			console.log('Key up', e);
		},
		onFocus: (e) => {
			console.log('Focus event', e);
		},
		onBlur: (e) => {
			console.log('Blur event', e);
		},
		onSave: (contents) => {
			console.log('Save event', contents);
		},
		imageUploadHandler: (xmlHttp, info, core) => {
			console.log('Image upload handler', xmlHttp, info, core);
		},
		onImageUploadBefore: (files, info, core, uploadHandler) => {
			console.log('Before image upload', files, info, core);
			uploadHandler();
		},
		onImageUpload: (targetElement, index, state, info, remainingFilesCount, core) => {
			console.log('Image upload', targetElement, index, state, info, remainingFilesCount, core);
		},
		onImageUploadError: (errorMessage, result, core) => {
			console.log('Image upload error', errorMessage, result, core);
		},
		onVideoUploadBefore: (files, info, core, uploadHandler) => {
			console.log('Before video upload', files);
			uploadHandler();
		},
		onVideoUpload: (targetElement, index, state, info, remainingFilesCount, core) => {
			console.log('Video upload', targetElement);
		},
		onVideoUploadError: (errorMessage, result, core) => {
			console.log('Video upload error', errorMessage);
		},
		onAudioUploadBefore: (files, info, core, uploadHandler) => {
			console.log('Before audio upload', files);
			uploadHandler();
		},
		onAudioUpload: (targetElement, index, state, info, remainingFilesCount, core) => {
			console.log('Audio upload', targetElement);
		},
		onAudioUploadError: (errorMessage, result, core) => {
			console.log('Audio upload error', errorMessage);
		},
		onResizeEditor: (height, prevHeight, core) => {
			console.log('Editor resized', height, prevHeight);
		},
		showController: (name, caller, core) => {
			console.log('Show controller', name, caller);
		},
		toggleCodeView: (isCodeView, core) => {
			console.log('Toggle code view', isCodeView);
		},
		toggleFullScreen: (isFullScreen, core) => {
			console.log('Toggle fullscreen', isFullScreen);
		},
		showInline: (toolbar, context, core) => {
			console.log('Show inline toolbar', toolbar, context);
		},
		onCopy: (e, clipboardData, core) => {
			console.log('Copy event', e, clipboardData);
		},
		onCut: (e, clipboardData, core) => {
			console.log('Cut event', e, clipboardData);
		},
		onPaste: (e, cleanData, maxCharCount, core) => {
			console.log('Paste event', e, cleanData, maxCharCount);
		},
		onDrop: (e, cleanData, maxCharCount, core) => {
			console.log('Drop event', e, cleanData);
		},
	},
};

console.log('Options test object created:', options_test);
