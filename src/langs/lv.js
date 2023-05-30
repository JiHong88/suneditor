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
		align: 'Izlīdzināt',
		alignCenter: 'Centrēt',
		alignJustify: 'Taisnot',
		alignLeft: 'Līdzināt pa kreisi',
		alignRight: 'Līdzināt pa labi',
		audio: 'Audio',
		audio_modal_file: 'Izvēlieties no failiem',
		audio_modal_title: 'Ievietot audio',
		audio_modal_url: 'Audio URL',
		autoSize: 'Automātiskais izmērs',
		backgroundColor: 'Teksta iezīmēšanas krāsa',
		basic: 'Nav iesaiņojuma',
		bold: 'Treknraksts',
		caption: 'Ievietot aprakstu',
		center: 'Centrs',
		close: 'Aizvērt',
		codeView: 'Koda skats',
		default: 'Noklusējuma',
		deleteColumn: 'Dzēst kolonnu',
		deleteRow: 'Dzēst rindu',
		dir_ltr: 'No kreisās uz labo',
		dir_rtl: 'No labās uz kreiso',
		edit: 'Rediģēt',
		fixColumnWidth: 'Fiksēts kolonnas platums',
		font: 'Fonts',
		fontColor: 'Fonta krāsa',
		fontSize: 'Fonta lielums',
		formats: 'Formāti',
		fullScreen: 'Pilnekrāna režīms',
		height: 'Augstums',
		horizontalLine: 'Horizontāla līnija',
		horizontalSplit: 'Horizontāls sadalījums',
		hr_dashed: 'Braša',
		hr_dotted: 'Punktiņš',
		hr_solid: 'Ciets',
		image: 'Attēls',
		imageGallery: 'Attēlu galerija',
		image_modal_altText: 'Alternatīvs teksts',
		image_modal_file: 'Izvēlieties no failiem',
		image_modal_title: 'Ievietot attēlu',
		image_modal_url: 'Attēla URL',
		indent: 'Palielināt atkāpi',
		insertColumnAfter: 'Ievietot kolonnu aiz',
		insertColumnBefore: 'Ievietot kolonnu pirms',
		insertRowAbove: 'Ievietot rindu virs',
		insertRowBelow: 'Ievietot rindu zemāk',
		italic: 'Slīpraksts',
		layout: 'Layout',
		left: 'Pa kreisi',
		lineHeight: 'Līnijas augstums',
		link: 'Saite',
		link_modal_bookmark: 'Grāmatzīme',
		link_modal_downloadLinkCheck: 'Lejupielādes saite',
		link_modal_newWindowCheck: 'Atvērt jaunā logā',
		link_modal_text: 'Parādāmais teksts',
		link_modal_title: 'Ievietot saiti',
		link_modal_url: 'Saites URL',
		list: 'Saraksts',
		math: 'Matemātika',
		math_modal_fontSizeLabel: 'Fonta lielums',
		math_modal_inputLabel: 'Matemātiskā notācija',
		math_modal_previewLabel: 'Priekšskatījums',
		math_modal_title: 'Matemātika',
		maxSize: 'Maksimālais izmērs',
		mention: 'Pieminēt',
		menu_bordered: 'Robežojās',
		menu_code: 'Kods'
		menu_neon: 'Neona',
		menu_shadow: 'Ēna',
		menu_spaced: 'Ar atstarpi',
		menu_translucent: 'Caurspīdīgs',
		mergeCells: 'Apvienot šūnas',
		minSize: 'Minimālais izmērs',
		mirrorHorizontal: 'Spogulis, horizontāls',
		mirrorVertical: 'Spogulis, vertikāls',
		orderList: 'Numerācija',
		outdent: 'Samazināt atkāpi',
		paragraphStyle: 'Paragrāfa stils',
		preview: 'Priekšskatījums',
		print: 'Drukāt',
		proportion: 'Ierobežo proporcijas',
		ratio: 'Attiecība',
		redo: 'Atkārtot',
		remove: 'Noņemt',
		removeFormat: 'Noņemt formātu',
		resize100: 'Mainīt izmēru 100%',
		resize25: 'Mainīt izmēru 25%',
		resize50: 'Mainīt izmēru 50%',
		resize75: 'Mainīt izmēru 75%',
		resize: 'Resize',
		revertButton: 'Atjaunot',
		right: 'Labajā pusē',
		rotateLeft: 'Pagriezt pa kreisi',
		rotateRight: 'Pagriezt pa labi',
		save: 'Saglabāt',
		search: 'Meklēt',
		showBlocks: 'Parādit blokus',
		size: 'Izmērs',
		splitCells: 'Sadalīt šūnas',
		strike: 'Pārsvītrojums',
		submitButton: 'Iesniegt',
		subscript: 'Apakšraksts',
		superscript: 'Augšraksts',
		table: 'Tabula',
		tableHeader: 'Tabulas galvene',
		tags: 'Tagi',
		tag_blockquote: 'Citāts',
		tag_div: 'Normāli (DIV)',
		tag_h: 'Galvene',
		tag_p: 'Paragrāfs',
		tag_pre: 'Kods',
		template: 'Veidne',
		textStyle: 'Teksta stils',
		title: 'Title',
		underline: 'Pasvītrot',
		undo: 'Atsaukt',
		unlink: 'Atsaistīt',
		unorderList: 'Aizzimes',
		verticalSplit: 'Vertikāls sadalījums',
		video: 'Video',
		video_modal_file: 'Izvēlieties no failiem',
		video_modal_title: 'Ievietot video',
		video_modal_url: 'Multivides iegulšanas URL, YouTube/Vimeo',
		width: 'Platums',
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
