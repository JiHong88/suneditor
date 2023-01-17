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
		code: 'pl',
		default: 'Domyślne',
		save: 'Zapisz',
		font: 'Czcionka',
		formats: 'Formaty',
		fontSize: 'Rozmiar',
		bold: 'Pogrubienie',
		underline: 'Podkreślenie',
		italic: 'Kursywa',
		strike: 'Przekreślenie',
		subscript: 'Indeks dolny',
		superscript: 'Indeks górny',
		removeFormat: 'Wyczyść formatowanie',
		fontColor: 'Kolor tekstu',
		backgroundColor: 'Kolor tła tekstu',
		indent: 'Zwiększ wcięcie',
		outdent: 'Zmniejsz wcięcie',
		align: 'Wyrównaj',
		alignLeft: 'Do lewej',
		alignRight: 'Do prawej',
		alignCenter: 'Do środka',
		alignJustify: 'Wyjustuj',
		list: 'Lista',
		orderList: 'Lista numerowana',
		unorderList: 'Lista wypunktowana',
		horizontalLine: 'Pozioma linia',
		hr_solid: 'Ciągła',
		hr_dotted: 'Kropkowana',
		hr_dashed: 'Przerywana',
		table: 'Tabela',
		link: 'Odnośnik',
		math: 'Matematyczne',
		image: 'Obraz',
		video: 'Wideo',
		audio: 'Audio',
		fullScreen: 'Pełny ekran',
		showBlocks: 'Pokaż bloki',
		codeView: 'Widok kodu',
		undo: 'Cofnij',
		redo: 'Ponów',
		preview: 'Podgląd',
		print: 'Drukuj',
		tag_p: 'Akapit',
		tag_div: 'Blok (DIV)',
		tag_h: 'Nagłówek H',
		tag_blockquote: 'Cytat',
		tag_pre: 'Kod',
		template: 'Szablon',
		lineHeight: 'Odstęp między wierszami',
		paragraphStyle: 'Styl akapitu',
		textStyle: 'Styl tekstu',
		imageGallery: 'Galeria obrazów',
		dir_ltr: 'Od lewej do prawej',
		dir_rtl: 'Od prawej do lewej',
		mention: 'Wzmianka',
		tags: 'Tagi',
		search: 'Szukaj',
		caption: 'Wstaw opis',
		close: 'Zamknij',
		submitButton: 'Zatwierdź',
		revertButton: 'Cofnij zmiany',
		proportion: 'Ogranicz proporcje',
		basic: 'Bez wyrównania',
		left: 'Do lewej',
		right: 'Do prawej',
		center: 'Do środka',
		width: 'Szerokość',
		height: 'Wysokość',
		size: 'Rozmiar',
		ratio: 'Proporcje',
		edit: 'Edycja',
		unlink: 'Usuń odnośnik',
		remove: 'Usuń',
		link_modal_title: 'Wstaw odnośnik',
		link_modal_url: 'Adres URL',
		link_modal_text: 'Tekst do wyświetlenia',
		link_modal_newWindowCheck: 'Otwórz w nowym oknie',
		link_modal_downloadLinkCheck: 'Link do pobrania',
		link_modal_bookmark: 'Zakładka',
		math_modal_title: 'Matematyczne',
		math_modal_inputLabel: 'Zapis matematyczny',
		math_modal_fontSizeLabel: 'Rozmiar czcionki',
		math_modal_previewLabel: 'Podgląd',
		image_modal_title: 'Wstaw obraz',
		image_modal_file: 'Wybierz plik',
		image_modal_url: 'Adres URL obrazka',
		image_modal_altText: 'Tekst alternatywny',
		video_modal_title: 'Wstaw wideo',
		video_modal_file: 'Wybierz plik',
		video_modal_url: 'Adres URL video, np. YouTube/Vimeo',
		audio_modal_title: 'Wstaw audio',
		audio_modal_file: 'Wybierz plik',
		audio_modal_url: 'Adres URL audio',
		insertRowAbove: 'Wstaw wiersz powyżej',
		insertRowBelow: 'Wstaw wiersz poniżej',
		deleteRow: 'Usuń wiersz',
		insertColumnBefore: 'Wstaw kolumnę z lewej',
		insertColumnAfter: 'Wstaw kolumnę z prawej',
		deleteColumn: 'Usuń kolumnę',
		fixedColumnWidth: 'Stała szerokość kolumny',
		resize100: 'Zmień rozmiar - 100%',
		resize75: 'Zmień rozmiar - 75%',
		resize50: 'Zmień rozmiar - 50%',
		resize25: 'Zmień rozmiar - 25%',
		autoSize: 'Rozmiar automatyczny',
		mirrorHorizontal: 'Odbicie lustrzane w poziomie',
		mirrorVertical: 'Odbicie lustrzane w pionie',
		rotateLeft: 'Obróć w lewo',
		rotateRight: 'Obróć w prawo',
		maxSize: 'Maksymalny rozmiar',
		minSize: 'Minimalny rozmiar',
		tableHeader: 'Nagłówek tabeli',
		mergeCells: 'Scal komórki',
		splitCells: 'Podziel komórki',
		horizontalSplit: 'Podział poziomy',
		verticalSplit: 'Podział pionowy',
		menu_spaced: 'Rozstawiony',
		menu_bordered: 'Z obwódką',
		menu_neon: 'Neon',
		menu_translucent: 'Półprzezroczysty',
		menu_shadow: 'Cień',
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'pl', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
