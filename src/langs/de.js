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
		code: 'de',
		default: 'Standard',
		save: 'Speichern',
		font: 'Schriftart',
		formats: 'Format',
		fontSize: 'Schriftgröße',
		bold: 'Fett',
		underline: 'Unterstrichen',
		italic: 'Kursiv',
		strike: 'Durchgestrichen',
		subscript: 'Tiefgestellt',
		superscript: 'Hochgestellt',
		removeFormat: 'Format entfernen',
		fontColor: 'Schriftfarbe',
		backgroundColor: 'Farbe für Hervorhebungen',
		indent: 'Einzug vergrößern',
		outdent: 'Einzug verkleinern',
		align: 'Ausrichtung',
		alignLeft: 'Links ausrichten',
		alignRight: 'Rechts ausrichten',
		alignCenter: 'Zentriert ausrichten',
		alignJustify: 'Blocksatz',
		list: 'Liste',
		orderList: 'Nummerierte Liste',
		unorderList: 'Aufzählung',
		horizontalLine: 'Horizontale Linie',
		hr_solid: 'Strich',
		hr_dotted: 'Gepunktet',
		hr_dashed: 'Gestrichelt',
		table: 'Tabelle',
		link: 'Link',
		math: 'Mathematik',
		image: 'Bild',
		video: 'Video',
		audio: 'Audio',
		fullScreen: 'Vollbild',
		showBlocks: 'Blockformatierungen anzeigen',
		codeView: 'Quelltext anzeigen',
		undo: 'Rückgängig',
		redo: 'Wiederholen',
		preview: 'Vorschau',
		print: 'Drucken',
		tag_p: 'Absatz',
		tag_div: 'Normal (DIV)',
		tag_h: 'Header',
		tag_blockquote: 'Zitat',
		tag_pre: 'Quellcode',
		template: 'Vorlage',
		lineHeight: 'Zeilenhöhe',
		paragraphStyle: 'Absatzstil',
		textStyle: 'Textstil',
		imageGallery: 'Bildergalerie',
		dir_ltr: 'Links nach rechts',
		dir_rtl: 'Rechts nach links',
		mention: 'Erwähnen',
		tags: 'Stichworte',
		search: 'Suche',
		caption: 'Beschreibung eingeben',
		close: 'Schließen',
		submitButton: 'Übernehmen',
		revertButton: 'Rückgängig',
		proportion: 'Seitenverhältnis beibehalten',
		basic: 'Standard',
		left: 'Links',
		right: 'Rechts',
		center: 'Zentriert',
		width: 'Breite',
		height: 'Höhe',
		size: 'Größe',
		ratio: 'Verhältnis',
		edit: 'Bearbeiten',
		unlink: 'Link entfernen',
		remove: 'Löschen',
		link_modal_title: 'Link einfügen',
		link_modal_url: 'Link-URL',
		link_modal_text: 'Link-Text',
		link_modal_newWindowCheck: 'In neuem Fenster anzeigen',
		link_modal_downloadLinkCheck: 'Download-Link',
		link_modal_bookmark: 'Lesezeichen',
		math_modal_title: 'Mathematik',
		math_modal_inputLabel: 'Mathematische Notation',
		math_modal_fontSizeLabel: 'Schriftgröße',
		math_modal_previewLabel: 'Vorschau',
		image_modal_title: 'Bild einfügen',
		image_modal_file: 'Datei auswählen',
		image_modal_url: 'Bild-URL',
		image_modal_altText: 'Alternativer Text',
		video_modal_title: 'Video enfügen',
		video_modal_file: 'Datei auswählen',
		video_modal_url: 'Video-URL, YouTube/Vimeo',
		audio_modal_title: 'Audio enfügen',
		audio_modal_file: 'Datei auswählen',
		audio_modal_url: 'Audio-URL',
		insertRowAbove: 'Zeile oberhalb einfügen',
		insertRowBelow: 'Zeile unterhalb einfügen',
		deleteRow: 'Zeile löschen',
		insertColumnBefore: 'Spalte links einfügen',
		insertColumnAfter: 'Spalte rechts einfügen',
		deleteColumn: 'Spalte löschen',
		fixedColumnWidth: 'Feste Spaltenbreite',
		resize100: 'Zoom 100%',
		resize75: 'Zoom 75%',
		resize50: 'Zoom 50%',
		resize25: 'Zoom 25%',
		autoSize: 'Automatische Größenanpassung',
		mirrorHorizontal: 'Horizontal spiegeln',
		mirrorVertical: 'Vertikal spiegeln',
		rotateLeft: 'Nach links drehen',
		rotateRight: 'Nach rechts drehen',
		maxSize: 'Maximale Größe',
		minSize: 'Mindestgröße',
		tableHeader: 'Tabellenüberschrift',
		mergeCells: 'Zellen verbinden',
		splitCells: 'Zellen teilen',
		horizontalSplit: 'Horizontal teilen',
		verticalSplit: 'Vertikal teilen',
		menu_spaced: 'Buchstabenabstand',
		menu_bordered: 'Umrandet',
		menu_neon: 'Neon',
		menu_translucent: 'Durchscheinend',
		menu_shadow: 'Schatten',
		menu_code: 'Quellcode'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'de', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
