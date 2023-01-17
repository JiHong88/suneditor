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
		code: 'lv',
		default: 'Noklusējuma',
		save: 'Saglabāt',
		font: 'Fonts',
		formats: 'Formāti',
		fontSize: 'Fonta lielums',
		bold: 'Treknraksts',
		underline: 'Pasvītrot',
		italic: 'Slīpraksts',
		strike: 'Pārsvītrojums',
		subscript: 'Apakšraksts',
		superscript: 'Augšraksts',
		removeFormat: 'Noņemt formātu',
		fontColor: 'Fonta krāsa',
		backgroundColor: 'Teksta iezīmēšanas krāsa',
		indent: 'Palielināt atkāpi',
		outdent: 'Samazināt atkāpi',
		align: 'Izlīdzināt',
		alignLeft: 'Līdzināt pa kreisi',
		alignRight: 'Līdzināt pa labi',
		alignCenter: 'Centrēt',
		alignJustify: 'Taisnot',
		list: 'Saraksts',
		orderList: 'Numerācija',
		unorderList: 'Aizzimes',
		horizontalLine: 'Horizontāla līnija',
		hr_solid: 'Ciets',
		hr_dotted: 'Punktiņš',
		hr_dashed: 'Braša',
		table: 'Tabula',
		link: 'Saite',
		math: 'Matemātika',
		image: 'Attēls',
		video: 'Video',
		audio: 'Audio',
		fullScreen: 'Pilnekrāna režīms',
		showBlocks: 'Parādit blokus',
		codeView: 'Koda skats',
		undo: 'Atsaukt',
		redo: 'Atkārtot',
		preview: 'Priekšskatījums',
		print: 'Drukāt',
		tag_p: 'Paragrāfs',
		tag_div: 'Normāli (DIV)',
		tag_h: 'Galvene',
		tag_blockquote: 'Citāts',
		tag_pre: 'Kods',
		template: 'Veidne',
		lineHeight: 'Līnijas augstums',
		paragraphStyle: 'Paragrāfa stils',
		textStyle: 'Teksta stils',
		imageGallery: 'Attēlu galerija',
		dir_ltr: 'No kreisās uz labo',
		dir_rtl: 'No labās uz kreiso',
		mention: 'Pieminēt',
		tags: 'Tagi',
		search: 'Meklēt',
		caption: 'Ievietot aprakstu',
		close: 'Aizvērt',
		submitButton: 'Iesniegt',
		revertButton: 'Atjaunot',
		proportion: 'Ierobežo proporcijas',
		basic: 'Nav iesaiņojuma',
		left: 'Pa kreisi',
		right: 'Labajā pusē',
		center: 'Centrs',
		width: 'Platums',
		height: 'Augstums',
		size: 'Izmērs',
		ratio: 'Attiecība',
		edit: 'Rediģēt',
		unlink: 'Atsaistīt',
		remove: 'Noņemt',
		link_modal_title: 'Ievietot saiti',
		link_modal_url: 'Saites URL',
		link_modal_text: 'Parādāmais teksts',
		link_modal_newWindowCheck: 'Atvērt jaunā logā',
		link_modal_downloadLinkCheck: 'Lejupielādes saite',
		link_modal_bookmark: 'Grāmatzīme',
		math_modal_title: 'Matemātika',
		math_modal_inputLabel: 'Matemātiskā notācija',
		math_modal_fontSizeLabel: 'Fonta lielums',
		math_modal_previewLabel: 'Priekšskatījums',
		image_modal_title: 'Ievietot attēlu',
		image_modal_file: 'Izvēlieties no failiem',
		image_modal_url: 'Attēla URL',
		image_modal_altText: 'Alternatīvs teksts',
		video_modal_title: 'Ievietot video',
		video_modal_file: 'Izvēlieties no failiem',
		video_modal_url: 'Multivides iegulšanas URL, YouTube/Vimeo',
		audio_modal_title: 'Ievietot audio',
		audio_modal_file: 'Izvēlieties no failiem',
		audio_modal_url: 'Audio URL',
		insertRowAbove: 'Ievietot rindu virs',
		insertRowBelow: 'Ievietot rindu zemāk',
		deleteRow: 'Dzēst rindu',
		insertColumnBefore: 'Ievietot kolonnu pirms',
		insertColumnAfter: 'Ievietot kolonnu aiz',
		deleteColumn: 'Dzēst kolonnu',
		fixColumnWidth: 'Fiksēts kolonnas platums',
		resize100: 'Mainīt izmēru 100%',
		resize75: 'Mainīt izmēru 75%',
		resize50: 'Mainīt izmēru 50%',
		resize25: 'Mainīt izmēru 25%',
		autoSize: 'Automātiskais izmērs',
		mirrorHorizontal: 'Spogulis, horizontāls',
		mirrorVertical: 'Spogulis, vertikāls',
		rotateLeft: 'Pagriezt pa kreisi',
		rotateRight: 'Pagriezt pa labi',
		maxSize: 'Maksimālais izmērs',
		minSize: 'Minimālais izmērs',
		tableHeader: 'Tabulas galvene',
		mergeCells: 'Apvienot šūnas',
		splitCells: 'Sadalīt šūnas',
		horizontalSplit: 'Horizontāls sadalījums',
		verticalSplit: 'Vertikāls sadalījums',
		menu_spaced: 'Ar atstarpi',
		menu_bordered: 'Robežojās',
		menu_neon: 'Neona',
		menu_translucent: 'Caurspīdīgs',
		menu_shadow: 'Ēna',
		menu_code: 'Kods'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'lv', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
