(function (global, factory) {
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = global.document
			? factory(global, true)
			: function (w) {
					if (!w.document) {
						throw new Error('SUNEDITOR_LANG a window with a document');
					}
					return factory(w);
			  };
	} else {
		factory(global);
	}
})(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
	const lang = {
		code: 'en',
		align: 'Align',
		alignBottom: 'Align bottom',
		alignCenter: 'Align center',
		alignJustify: 'Align justify',
		alignLeft: 'Align left',
		alignMiddle: 'Align middle',
		alignRight: 'Align right',
		alignTop: 'Align top',
		anchor: 'Anchor',
		asBlock: 'As a block',
		asInline: 'As a inline',
		asLink: 'As a link',
		audio: 'Audio',
		audioGallery: 'Audio gallery',
		audio_modal_file: 'Select from files',
		audio_modal_title: 'Insert Audio',
		audio_modal_url: 'Audio URL',
		autoSize: 'Auto size',
		backgroundColor: 'Background color',
		basic: 'Basic',
		blockStyle: 'Block style',
		bold: 'Bold',
		border: 'Border',
		border_all: 'Border all',
		border_inside: 'Border inside',
		border_horizontal: 'Border horizontal',
		border_vertical: 'Border vertical',
		border_outside: 'Border outside',
		border_left: 'Border left',
		border_top: 'Border top',
		border_right: 'Border right',
		border_bottom: 'Border bottom',
		border_none: 'Border none',
		bulletedList: 'Bulleted list',
		cancel: 'Cancel',
		caption: 'Insert description',
		cellProperties: 'Cell properties',
		center: 'Center',
		close: 'Close',
		codeView: 'Code view',
		color: 'Color',
		colorPicker: 'Color picker',
		column: 'Column',
		comment: 'Comments',
		commentAdd: 'Add comment',
		commentShow: 'Show comments',
		copy: 'Copy',
		copyFormat: 'Paint Formatting',
		cut: 'Cut',
		default: 'Default',
		deleteColumn: 'Delete column',
		deleteRow: 'Delete row',
		dir_ltr: 'Left to right',
		dir_rtl: 'Right to left',
		download: 'Download',
		drag: 'Drag',
		drawing: 'Drawing',
		drawing_modal_title: 'Drawing',
		edit: 'Edit',
		embed: 'Embed',
		embed_modal_title: 'Embed',
		embed_modal_source: 'Embed Source / URL',
		exportPDF: 'Export to PDF',
		exportWord: 'Export to Word',
		find: 'Find',
		decrease: 'Decrease',
		increase: 'Increase',
		fileUpload: 'File upload',
		fixedColumnWidth: 'Fixed column width',
		font: 'Font',
		fontColor: 'Font color',
		fontSize: 'Size',
		formats: 'Formats',
		fullScreen: 'Full screen',
		height: 'Height',
		horizontalLine: 'Horizontal line',
		horizontalSplit: 'Horizontal split',
		hr_dashed: 'Dashed',
		hr_dotted: 'Dotted',
		hr_solid: 'Solid',
		id: 'ID',
		image: 'Image',
		imageGallery: 'Image gallery',
		image_modal_altText: 'Alternative text',
		image_modal_file: 'Select from files',
		image_modal_title: 'Insert image',
		image_modal_url: 'Image URL',
		importWord: 'Import from Word',
		indent: 'Indent',
		inlineStyle: 'Inline style',
		insertColumnAfter: 'Insert column after',
		insertColumnBefore: 'Insert column before',
		insertRowAbove: 'Insert row above',
		insertRowBelow: 'Insert row below',
		insertLine: 'Insert line',
		italic: 'Italic',
		layout: 'Layout',
		left: 'Left',
		lineHeight: 'Line height',
		link: 'Link',
		link_modal_bookmark: 'Bookmark',
		link_modal_downloadLinkCheck: 'Download link',
		link_modal_newWindowCheck: 'Open in new window',
		link_modal_text: 'Text to display',
		link_modal_title: 'Insert Link',
		link_modal_url: 'URL to link',
		link_modal_relAttribute: 'Rel attribute',
		list: 'List',
		math: 'Math',
		math_modal_fontSizeLabel: 'Font Size',
		math_modal_inputLabel: 'Mathematical Notation',
		math_modal_previewLabel: 'Preview',
		math_modal_title: 'Math',
		maxSize: 'Max size',
		mediaGallery: 'Media gallery',
		mention: 'Mention',
		menu_bordered: 'Bordered',
		menu_code: 'Code',
		menu_neon: 'Neon',
		menu_shadow: 'Shadow',
		menu_spaced: 'Spaced',
		menu_translucent: 'Translucent',
		mergeCells: 'Merge cells',
		minSize: 'Min size',
		mirrorHorizontal: 'Mirror, Horizontal',
		mirrorVertical: 'Mirror, Vertical',
		newDocument: 'New document',
		numberedList: 'Numbered list',
		outdent: 'Outdent',
		pageBreak: 'Page break',
		pageDown: 'Page down',
		pageNumber: 'Page number',
		pageUp: 'Page up',
		paragraphStyle: 'Paragraph style',
		preview: 'Preview',
		print: 'print',
		proportion: 'Constrain proportions',
		ratio: 'Ratio',
		redo: 'Redo',
		remove: 'Remove',
		removeFormat: 'Remove Format',
		replace: 'Replace',
		replaceAll: 'Replace all',
		resize100: 'Zoom 100%',
		resize25: 'Zoom 25%',
		resize50: 'Zoom 50%',
		resize75: 'Zoom 75%',
		resize: 'Resize',
		revert: 'Revert',
		revisionHistory: 'Revision History',
		right: 'Right',
		rotateLeft: 'Rotate left',
		rotateRight: 'Rotate right',
		row: 'Row',
		save: 'Save',
		search: 'Search',
		selectAll: 'Select All',
		showBlocks: 'Show blocks',
		size: 'Size',
		splitCells: 'Split Cells',
		strike: 'Strike',
		submitButton: 'Submit',
		subscript: 'Subscript',
		superscript: 'Superscript',
		table: 'Table',
		tableHeader: 'Table header',
		tableProperties: 'Table properties',
		tags: 'Tags',
		tag_blockquote: 'Quote',
		tag_div: 'Normal (DIV)',
		tag_h: 'Header',
		tag_p: 'Paragraph',
		tag_pre: 'Code',
		template: 'Template',
		textStyle: 'Text style',
		title: 'Title',
		underline: 'Underline',
		undo: 'Undo',
		unlink: 'Unlink',
		verticalSplit: 'Vertical split',
		video: 'Video',
		videoGallery: 'Video gallery',
		video_modal_file: 'Select from files',
		video_modal_title: 'Insert Video',
		video_modal_url: 'Media embed URL, YouTube/Vimeo',
		width: 'Width'
	};

	if (typeof noGlobal === typeof undefined) {
		if (!window.SUNEDITOR_LANG) {
			Object.defineProperty(window, 'SUNEDITOR_LANG', {
				enumerable: true,
				writable: false,
				configurable: false,
				value: {}
			});
		}

		Object.defineProperty(window.SUNEDITOR_LANG, 'en', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
