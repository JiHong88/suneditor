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
		code: 'ro',
		align: 'Aliniere',
		alignCenter: 'Aliniere la centru',
		alignJustify: 'Aliniere stânga - dreapta',
		alignLeft: 'Aliniere la stânga',
		alignRight: 'Aliniere la dreapta',
		audio: 'Audio',
		audio_modal_file: 'Selectează',
		audio_modal_title: 'Inserează Audio',
		audio_modal_url: 'URL Audio',
		autoSize: 'Dimensiune automată',
		backgroundColor: 'Culoare de evidențiere',
		basic: 'De bază',
		bold: 'Îngroșat',
		bulletedList: 'Listă neordonată',
		caption: 'Inserează descriere',
		center: 'Centru',
		close: 'Închide',
		codeView: 'Vizualizare cod',
		default: 'Default',
		deleteColumn: 'Șterge coloană',
		deleteRow: 'Șterge linie',
		dir_ltr: 'De la stânga la dreapta',
		dir_rtl: 'De la dreapta la stanga',
		edit: 'Editează',
		fixedColumnWidth: 'Lățime fixă coloană',
		font: 'Font',
		fontColor: 'Culoare font',
		fontSize: 'Dimensiune',
		formats: 'Format',
		fullScreen: 'Tot ecranul',
		height: 'Înălțime',
		horizontalLine: 'Linie orizontală',
		horizontalSplit: 'Despicare orizontală',
		hr_dashed: 'Punctate',
		hr_dotted: 'Punctat',
		hr_solid: 'Solid',
		image: 'Imagine',
		imageGallery: 'Galerie de imagini',
		image_modal_altText: 'text alternativ',
		image_modal_file: 'Selectează',
		image_modal_title: 'Inserează imagine',
		image_modal_url: 'URL imagine',
		indent: 'Indentează',
		insertColumnAfter: 'Inserează coloană după',
		insertColumnBefore: 'Inserează coloană înainte',
		insertRowAbove: 'Inserează rând deasupra',
		insertRowBelow: 'Inserează rând dedesupt',
		italic: 'Înclinat',
		layout: 'Layout',
		left: 'Stânga',
		lineHeight: 'Înălțime linie',
		link: 'Link',
		link_modal_bookmark: 'Marcaj',
		link_modal_downloadLinkCheck: 'Link de descărcare',
		link_modal_newWindowCheck: 'Deschide în fereastră nouă',
		link_modal_text: 'Text de afișat',
		link_modal_title: 'Inserează Link',
		link_modal_url: 'Adresă link',
		list: 'Listă',
		math: 'Matematică',
		math_modal_fontSizeLabel: 'Dimensiune font',
		math_modal_inputLabel: 'Notație matematică',
		math_modal_previewLabel: 'Previzualizare',
		math_modal_title: 'Matematică',
		maxSize: 'Dimensiune maximă',
		mention: 'Mentiune',
		menu_bordered: 'Mărginit',
		menu_code: 'Citat',
		menu_neon: 'Neon',
		menu_shadow: 'Umbră',
		menu_spaced: 'Spațiat',
		menu_translucent: 'Translucent',
		mergeCells: 'Îmbină celule',
		minSize: 'Dimensiune minimă',
		mirrorHorizontal: 'Oglindă, orizontal',
		mirrorVertical: 'Oglindă, vertical',
		numberedList: 'Listă ordonată',
		outdent: 'Fără indentare',
		paragraphStyle: 'Stil paragraf',
		preview: 'Previzualizare',
		print: 'printează',
		proportion: 'Constrânge proporțiile',
		ratio: 'Ratie',
		redo: 'Refă',
		remove: 'Elimină',
		removeFormat: 'Șterge formatare',
		resize100: 'Redimensionare 100%',
		resize25: 'Redimensionare 25%',
		resize50: 'Redimensionare 50%',
		resize75: 'Redimensionare 75%',
		resize: 'Resize',
		revert: 'Revenire',
		right: 'Dreapta',
		rotateLeft: 'Rotește la stânga',
		rotateRight: 'Rotește la dreapta',
		save: 'Salvează',
		search: 'Căutareim',
		showBlocks: 'Arată blocuri',
		size: 'Dimensiune',
		splitCells: 'Divizează celule',
		strike: 'Tăiat',
		submitButton: 'Salvează',
		subscript: 'Subscript',
		superscript: 'Superscript',
		table: 'Tabel',
		tableHeader: 'Antet tabel',
		tags: 'Etichete',
		tag_blockquote: 'Quote',
		tag_div: 'Normal (DIV)',
		tag_h: 'Antet',
		tag_p: 'Paragraf',
		tag_pre: 'Citat',
		template: 'Template',
		textStyle: 'Stil text',
		title: 'Title',
		underline: 'Subliniat',
		undo: 'Anulează',
		unlink: 'Scoate link',
		verticalSplit: 'Despicare verticală',
		video: 'Video',
		video_modal_file: 'Selectează',
		video_modal_title: 'Inserează video',
		video_modal_url: 'Include URL, youtube/vimeo',
		width: 'Lățime'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'ro', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
