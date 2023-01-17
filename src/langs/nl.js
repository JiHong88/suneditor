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
		code: 'nl',
		default: 'Standaard',
		save: 'Opslaan',
		font: 'Lettertype',
		formats: 'Formaten',
		fontSize: 'Lettergrootte',
		bold: 'Vetgedrukt',
		underline: 'Onderstrepen',
		italic: 'Cursief',
		strike: 'Doorstrepen',
		subscript: 'Subscript',
		superscript: 'Superscript',
		removeFormat: 'Opmaak verwijderen',
		fontColor: 'Tekstkleur',
		backgroundColor: 'Tekst markeren',
		indent: 'Inspringen',
		outdent: 'Inspringen ongedaan maken',
		align: 'Uitlijnen',
		alignLeft: 'Links uitlijnen',
		alignRight: 'Rechts uitlijnen',
		alignCenter: 'In het midden uitlijnen',
		alignJustify: 'Uitvullen',
		list: 'Lijst',
		orderList: 'Geordende lijst',
		unorderList: 'Ongeordende lijst',
		horizontalLine: 'Horizontale regel',
		hr_solid: 'Standaard',
		hr_dotted: 'Gestippeld',
		hr_dashed: 'Gestreept',
		table: 'Tabel',
		link: 'Link',
		math: 'Wiskunde',
		image: 'Afbeelding',
		video: 'Video',
		audio: 'Audio',
		fullScreen: 'Volledig scherm',
		showBlocks: 'Blokken tonen',
		codeView: 'Broncode weergeven',
		undo: 'Ongedaan maken',
		redo: 'Ongedaan maken herstellen',
		preview: 'Voorbeeldweergave',
		print: 'Printen',
		tag_p: 'Alinea',
		tag_div: 'Normaal (div)',
		tag_h: 'Kop',
		tag_blockquote: 'Citaat',
		tag_pre: 'Code',
		template: 'Sjabloon',
		lineHeight: 'Lijnhoogte',
		paragraphStyle: 'Alineastijl',
		textStyle: 'Tekststijl',
		imageGallery: 'Galerij',
		dir_ltr: 'Van links naar rechts',
		dir_rtl: 'Rechts naar links',
		mention: 'Vermelding',
		tags: 'Tags',
		search: 'Zoeken',
		caption: 'Omschrijving toevoegen',
		close: 'Sluiten',
		submitButton: 'Toepassen',
		revertButton: 'Standaardwaarden herstellen',
		proportion: 'Verhouding behouden',
		basic: 'Standaard',
		left: 'Links',
		right: 'Rechts',
		center: 'Midden',
		width: 'Breedte',
		height: 'Hoogte',
		size: 'Grootte',
		ratio: 'Verhouding',
		edit: 'Bewerken',
		unlink: 'Ontkoppelen',
		remove: 'Verwijderen',
		link_modal_title: 'Link invoegen',
		link_modal_url: 'URL',
		link_modal_text: 'Tekst van de link',
		link_modal_newWindowCheck: 'In een nieuw tabblad openen',
		link_modal_downloadLinkCheck: 'Downloadlink',
		link_modal_bookmark: 'Bladwijzer',
		math_modal_title: 'Wiskunde',
		math_modal_inputLabel: 'Wiskundige notatie',
		math_modal_fontSizeLabel: 'Lettergrootte',
		math_modal_previewLabel: 'Voorbeeld',
		image_modal_title: 'Afbeelding invoegen',
		image_modal_file: 'Selecteer een bestand van uw apparaat',
		image_modal_url: 'URL',
		image_modal_altText: 'Alt-tekst',
		video_modal_title: 'Video invoegen',
		video_modal_file: 'Selecteer een bestand van uw apparaat',
		video_modal_url: 'Embedded URL (YouTube/Vimeo)',
		audio_modal_title: 'Audio invoegen',
		audio_modal_file: 'Selecteer een bestand van uw apparaat',
		audio_modal_url: 'URL',
		insertRowAbove: 'Rij hierboven invoegen',
		insertRowBelow: 'Rij hieronder invoegen',
		deleteRow: 'Rij verwijderen',
		insertColumnBefore: 'Kolom links invoegen',
		insertColumnAfter: 'Kolom rechts invoegen',
		deleteColumn: 'Kolom verwijderen',
		fixedColumnWidth: 'Vaste kolombreedte',
		resize100: 'Formaat wijzigen: 100%',
		resize75: 'Formaat wijzigen: 75%',
		resize50: 'Formaat wijzigen: 50%',
		resize25: 'Formaat wijzigen: 25%',
		autoSize: 'Automatische grootte',
		mirrorHorizontal: 'Horizontaal spiegelen',
		mirrorVertical: 'Verticaal spiegelen',
		rotateLeft: 'Naar links draaien',
		rotateRight: 'Naar rechts draaien',
		maxSize: 'Maximale grootte',
		minSize: 'Minimale grootte',
		tableHeader: 'Tabelkoppen',
		mergeCells: 'Cellen samenvoegen',
		splitCells: 'Cellen splitsen',
		horizontalSplit: 'Horizontaal splitsen',
		verticalSplit: 'Verticaal splitsen',
		menu_spaced: 'Uit elkaar',
		menu_bordered: 'Omlijnd',
		menu_neon: 'Neon',
		menu_translucent: 'Doorschijnend',
		menu_shadow: 'Schaduw',
		menu_code: 'Code'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'nl', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
