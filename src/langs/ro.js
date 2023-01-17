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
		default: 'Default',
		save: 'Salvează',
		font: 'Font',
		formats: 'Format',
		fontSize: 'Dimensiune',
		bold: 'Îngroșat',
		underline: 'Subliniat',
		italic: 'Înclinat',
		strike: 'Tăiat',
		subscript: 'Subscript',
		superscript: 'Superscript',
		removeFormat: 'Șterge formatare',
		fontColor: 'Culoare font',
		backgroundColor: 'Culoare de evidențiere',
		indent: 'Indentează',
		outdent: 'Fără indentare',
		align: 'Aliniere',
		alignLeft: 'Aliniere la stânga',
		alignRight: 'Aliniere la dreapta',
		alignCenter: 'Aliniere la centru',
		alignJustify: 'Aliniere stânga - dreapta',
		list: 'Listă',
		orderList: 'Listă ordonată',
		unorderList: 'Listă neordonată',
		horizontalLine: 'Linie orizontală',
		hr_solid: 'Solid',
		hr_dotted: 'Punctat',
		hr_dashed: 'Punctate',
		table: 'Tabel',
		link: 'Link',
		math: 'Matematică',
		image: 'Imagine',
		video: 'Video',
		audio: 'Audio',
		fullScreen: 'Tot ecranul',
		showBlocks: 'Arată blocuri',
		codeView: 'Vizualizare cod',
		undo: 'Anulează',
		redo: 'Refă',
		preview: 'Previzualizare',
		print: 'printează',
		tag_p: 'Paragraf',
		tag_div: 'Normal (DIV)',
		tag_h: 'Antet',
		tag_blockquote: 'Quote',
		tag_pre: 'Citat',
		template: 'Template',
		lineHeight: 'Înălțime linie',
		paragraphStyle: 'Stil paragraf',
		textStyle: 'Stil text',
		imageGallery: 'Galerie de imagini',
		dir_ltr: 'De la stânga la dreapta',
		dir_rtl: 'De la dreapta la stanga',
		mention: 'Mentiune',
		tags: 'Etichete',
		search: 'Căutareim',
		caption: 'Inserează descriere',
		close: 'Închide',
		submitButton: 'Salvează',
		revertButton: 'Revenire',
		proportion: 'Constrânge proporțiile',
		basic: 'De bază',
		left: 'Stânga',
		right: 'Dreapta',
		center: 'Centru',
		width: 'Lățime',
		height: 'Înălțime',
		size: 'Dimensiune',
		ratio: 'Ratie',
		edit: 'Editează',
		unlink: 'Scoate link',
		remove: 'Elimină',
		link_modal_title: 'Inserează Link',
		link_modal_url: 'Adresă link',
		link_modal_text: 'Text de afișat',
		link_modal_newWindowCheck: 'Deschide în fereastră nouă',
		link_modal_downloadLinkCheck: 'Link de descărcare',
		link_modal_bookmark: 'Marcaj',
		math_modal_title: 'Matematică',
		math_modal_inputLabel: 'Notație matematică',
		math_modal_fontSizeLabel: 'Dimensiune font',
		math_modal_previewLabel: 'Previzualizare',
		image_modal_title: 'Inserează imagine',
		image_modal_file: 'Selectează',
		image_modal_url: 'URL imagine',
		image_modal_altText: 'text alternativ',
		video_modal_title: 'Inserează video',
		video_modal_file: 'Selectează',
		video_modal_url: 'Include URL, youtube/vimeo',
		audio_modal_title: 'Inserează Audio',
		audio_modal_file: 'Selectează',
		audio_modal_url: 'URL Audio',
		insertRowAbove: 'Inserează rând deasupra',
		insertRowBelow: 'Inserează rând dedesupt',
		deleteRow: 'Șterge linie',
		insertColumnBefore: 'Inserează coloană înainte',
		insertColumnAfter: 'Inserează coloană după',
		deleteColumn: 'Șterge coloană',
		fixedColumnWidth: 'Lățime fixă coloană',
		resize100: 'Redimensionare 100%',
		resize75: 'Redimensionare 75%',
		resize50: 'Redimensionare 50%',
		resize25: 'Redimensionare 25%',
		autoSize: 'Dimensiune automată',
		mirrorHorizontal: 'Oglindă, orizontal',
		mirrorVertical: 'Oglindă, vertical',
		rotateLeft: 'Rotește la stânga',
		rotateRight: 'Rotește la dreapta',
		maxSize: 'Dimensiune maximă',
		minSize: 'Dimensiune minimă',
		tableHeader: 'Antet tabel',
		mergeCells: 'Îmbină celule',
		splitCells: 'Divizează celule',
		horizontalSplit: 'Despicare orizontală',
		verticalSplit: 'Despicare verticală',
		menu_spaced: 'Spațiat',
		menu_bordered: 'Mărginit',
		menu_neon: 'Neon',
		menu_translucent: 'Translucent',
		menu_shadow: 'Umbră',
		menu_code: 'Citat'
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
