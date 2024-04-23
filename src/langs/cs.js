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
		code: 'cs',
		align: 'Zarovnat',
		alignCenter: 'Zarovnat na střed',
		alignJustify: 'Zarovnat do bloku',
		alignLeft: 'Zarovnat vlevo',
		alignRight: 'Zarovnat vpravo',
		audio: 'Zvuk',
		audio_modal_file: 'Vybrat ze souborů',
		audio_modal_title: 'Vložit zvuk',
		audio_modal_url: 'Adresa URL zvuku',
		autoSize: 'Automatická velikost',
		backgroundColor: 'Barva zvýraznění',
		basic: 'Základní',
		bold: 'Tučné',
		bulletedList: 'Neřazený seznam',
		caption: 'Vložit popis',
		center: 'Střed',
		close: 'Zavřít',
		codeView: 'Zobrazení kódu',
		default: 'Výchozí',
		deleteColumn: 'Smazat sloupec',
		deleteRow: 'Smazat řádek',
		dir_ltr: 'Zleva doprava',
		dir_rtl: 'Zprava doleva',
		edit: 'Upravit',
		fixedColumnWidth: 'Pevná šířka sloupce',
		font: 'Písmo',
		fontColor: 'Barva písma',
		fontSize: 'Velikost',
		formats: 'Formáty',
		fullScreen: 'Celá obrazovka',
		height: 'Výška',
		horizontalLine: 'Vodorovná čára',
		horizontalSplit: 'Vodorovné rozdělení',
		hr_dashed: 'Čárkovaná',
		hr_dotted: 'Tečkovaná',
		hr_solid: 'Nepřerušovaná',
		image: 'Obrázek',
		imageGallery: 'Obrázková galerie',
		image_modal_altText: 'Alternativní text',
		image_modal_file: 'Vybrat ze souborů',
		image_modal_title: 'Vložit obrázek',
		image_modal_url: 'URL obrázku',
		indent: 'Odsadit',
		insertColumnAfter: 'Vložit sloupec za',
		insertColumnBefore: 'Vložit sloupec před',
		insertRowAbove: 'Vložit řádek výše',
		insertRowBelow: 'Vložit řádek níže',
		italic: 'Kurzíva',
		layout: '',
		left: 'Vlevo',
		lineHeight: 'Výška řádku',
		link: 'Odkaz',
		link_modal_bookmark: 'Záložka',
		link_modal_downloadLinkCheck: 'Odkaz ke stažení',
		link_modal_newWindowCheck: 'Otevřít v novém okně',
		link_modal_text: 'Text k zobrazení',
		link_modal_title: 'Vložit odkaz',
		link_modal_url: 'URL pro odkaz',
		list: 'Seznam',
		math: 'Matematika',
		math_modal_fontSizeLabel: 'Velikost písma',
		math_modal_inputLabel: 'Matematická notace',
		math_modal_previewLabel: 'Náhled',
		math_modal_title: 'Matematika',
		maxSize: 'Max. velikost',
		mention: 'Zmínka',
		menu_bordered: 'Ohraničené',
		menu_code: 'Kód',
		menu_neon: 'Neon',
		menu_shadow: 'Stín',
		menu_spaced: 'Rozložené',
		menu_translucent: 'Průsvitné',
		mergeCells: 'Spojit buňky',
		minSize: 'Min. velikost',
		mirrorHorizontal: 'Zrcadlo, horizontální',
		mirrorVertical: 'Zrcadlo, vertikální',
		numberedList: 'Seřazený seznam',
		outdent: 'Předsadit',
		paragraphStyle: 'Styl odstavce',
		preview: 'Náhled',
		print: 'tisk',
		proportion: 'Omezení proporcí',
		ratio: 'Poměr',
		redo: 'Opakovat',
		remove: 'Odebrat',
		removeFormat: 'Odebrat formát',
		resize100: 'Změnit velikost 100%',
		resize25: 'Změnit velikost 25%',
		resize50: 'Změnit velikost 50%',
		resize75: 'Změnit velikost 75%',
		resize: 'Změnit velikost',
		revert: 'Vrátit zpět',
		right: 'Vpravo',
		rotateLeft: 'Otočit doleva',
		rotateRight: 'Otočit doprava',
		save: 'Uložit',
		search: 'Hledat',
		showBlocks: 'Zobrazit bloky',
		size: 'Velikost',
		splitCells: 'Rozdělit buňky',
		strike: 'Přeškrtnutí',
		submitButton: 'Odeslat',
		subscript: 'Dolní index',
		superscript: 'Horní index',
		table: 'Tabulka',
		tableHeader: 'Záhlaví tabulky',
		tags: 'Štítky',
		tag_blockquote: 'Citovat',
		tag_div: 'Normální (DIV)',
		tag_h: 'Záhlaví',
		tag_p: 'Odstavec',
		tag_pre: 'Kód',
		template: 'Šablona',
		textStyle: 'Styl textu',
		underline: 'Podtržení',
		undo: 'Zpět',
		unlink: 'Odpojit',
		verticalSplit: 'Svislé rozdělení',
		video: 'Video',
		video_modal_file: 'Vybrat ze souborů',
		video_modal_title: 'Vložit video',
		video_modal_url: 'URL pro vložení médií, YouTube/Vimeo',
		width: 'Šířka'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'cs', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
