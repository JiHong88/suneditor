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
		code: 'se',
		default: 'Default',
		save: 'Spara',
		font: 'Typsnitt',
		formats: 'Format',
		fontSize: 'Textstorlek',
		bold: 'Fet',
		underline: 'Understruket',
		italic: 'Kursiv',
		strike: 'Överstruket',
		subscript: 'Sänkt skrift',
		superscript: 'Höjd skrift',
		removeFormat: 'Ta bort formattering',
		fontColor: 'Textfärg',
		backgroundColor: 'Bakgrundsfärg',
		indent: 'Minska indrag',
		outdent: 'Öka indrag',
		align: 'Justering',
		alignLeft: 'Vänsterjustering',
		alignRight: 'Högerjustering',
		alignCenter: 'Mittenjusteirng',
		alignJustify: 'Justera indrag',
		list: 'Listor',
		orderList: 'Numrerad lista',
		unorderList: 'Oordnad lista',
		horizontalLine: 'Horisontell linje',
		hr_solid: 'Solid',
		hr_dotted: 'Punkter',
		hr_dashed: 'Prickad',
		table: 'Tabell',
		link: 'Länk',
		math: 'Math',
		image: 'Bild',
		video: 'Video',
		audio: 'Ljud',
		fullScreen: 'Helskärm',
		showBlocks: 'Visa block',
		codeView: 'Visa koder',
		undo: 'Ångra',
		redo: 'Gör om',
		preview: 'Preview',
		print: 'Print',
		tag_p: 'Paragraf',
		tag_div: 'Normal (DIV)',
		tag_h: 'Rubrik',
		tag_blockquote: 'Citer',
		tag_pre: 'Kod',
		template: 'Mall',
		lineHeight: 'Linjehöjd',
		paragraphStyle: 'Stil på stycke',
		textStyle: 'Textstil',
		imageGallery: 'Bildgalleri',
		dir_ltr: 'Vänster till höger',
		dir_rtl: 'Höger till vänster',
		mention: 'Namn',
		tags: 'Tags',
		search: 'Sök',
		caption: 'Lägg till beskrivning',
		close: 'Stäng',
		submitButton: 'Skicka',
		revertButton: 'Återgå',
		proportion: 'Spara proportioner',
		basic: 'Basic',
		left: 'Vänster',
		right: 'Höger',
		center: 'Center',
		width: 'Bredd',
		height: 'Höjd',
		size: 'Storlek',
		ratio: 'Förhållande',
		edit: 'Redigera',
		unlink: 'Ta bort länk',
		remove: 'Ta bort',
		link_modal_title: 'Lägg till länk',
		link_modal_url: 'URL till länk',
		link_modal_text: 'Länktext',
		link_modal_newWindowCheck: 'Öppna i nytt fönster',
		link_modal_downloadLinkCheck: 'Nedladdningslänk',
		link_modal_bookmark: 'Bokmärke',
		math_modal_title: 'Math',
		math_modal_inputLabel: 'Matematisk notation',
		math_modal_fontSizeLabel: 'Textstorlek',
		math_modal_previewLabel: 'Preview',
		image_modal_title: 'Lägg till bild',
		image_modal_file: 'Lägg till från fil',
		image_modal_url: 'Lägg till från URL',
		image_modal_altText: 'Alternativ text',
		video_modal_title: 'Lägg till video',
		video_modal_file: 'Lägg till från fil',
		video_modal_url: 'Bädda in video / YouTube,Vimeo',
		audio_modal_title: 'Lägg till ljud',
		audio_modal_file: 'Lägg till från fil',
		audio_modal_url: 'Lägg till från URL',
		insertRowAbove: 'Lägg till rad över',
		insertRowBelow: 'Lägg till rad under',
		deleteRow: 'Ta bort rad',
		insertColumnBefore: 'Lägg till kolumn före',
		insertColumnAfter: 'Lägg till kolumn efter',
		deleteColumn: 'Ta bort kolumner',
		fixedColumnWidth: 'Fast kolumnbredd',
		resize100: 'Förstora 100%',
		resize75: 'Förstora 75%',
		resize50: 'Förstora 50%',
		resize25: 'Förstora 25%',
		autoSize: 'Autostorlek',
		mirrorHorizontal: 'Spegling, horisontell',
		mirrorVertical: 'Spegling, vertikal',
		rotateLeft: 'Rotera till vänster',
		rotateRight: 'Rotera till höger',
		maxSize: 'Maxstorlek',
		minSize: 'Minsta storlek',
		tableHeader: 'Rubrik tabell',
		mergeCells: 'Sammanfoga celler (merge)',
		splitCells: 'Separera celler',
		horizontalSplit: 'Separera horisontalt',
		verticalSplit: 'Separera vertikalt',
		menu_spaced: 'Avstånd',
		menu_bordered: 'Avgränsningslinje',
		menu_neon: 'Neon',
		menu_translucent: 'Genomskinlig',
		menu_shadow: 'Skugga',
		menu_code: 'Kod'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'se', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
