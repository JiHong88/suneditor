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
		align: 'Uitlijnen',
		alignCenter: 'In het midden uitlijnen',
		alignJustify: 'Uitvullen',
		alignLeft: 'Links uitlijnen',
		alignRight: 'Rechts uitlijnen',
		audio: 'Audio',
		audio_modal_file: 'Selecteer een bestand van uw apparaat',
		audio_modal_title: 'Audio invoegen',
		audio_modal_url: 'URL',
		autoSize: 'Automatische grootte',
		backgroundColor: 'Tekst markeren',
		basic: 'Standaard',
		bold: 'Vetgedrukt',
		caption: 'Omschrijving toevoegen',
		center: 'Midden',
		close: 'Sluiten',
		codeView: 'Broncode weergeven',
		default: 'Standaard',
		deleteColumn: 'Kolom verwijderen',
		deleteRow: 'Rij verwijderen',
		dir_ltr: 'Van links naar rechts',
		dir_rtl: 'Rechts naar links',
		edit: 'Bewerken',
		fixedColumnWidth: 'Vaste kolombreedte',
		font: 'Lettertype',
		fontColor: 'Tekstkleur',
		fontSize: 'Lettergrootte',
		formats: 'Formaten',
		fullScreen: 'Volledig scherm',
		height: 'Hoogte',
		horizontalLine: 'Horizontale regel',
		horizontalSplit: 'Horizontaal splitsen',
		hr_dashed: 'Gestreept',
		hr_dotted: 'Gestippeld',
		hr_solid: 'Standaard',
		image: 'Afbeelding',
		imageGallery: 'Galerij',
		image_modal_altText: 'Alt-tekst',
		image_modal_file: 'Selecteer een bestand van uw apparaat',
		image_modal_title: 'Afbeelding invoegen',
		image_modal_url: 'URL',
		indent: 'Inspringen',
		insertColumnAfter: 'Kolom rechts invoegen',
		insertColumnBefore: 'Kolom links invoegen',
		insertRowAbove: 'Rij hierboven invoegen',
		insertRowBelow: 'Rij hieronder invoegen',
		italic: 'Cursief',
		layout: 'Layout',
		left: 'Links',
		lineHeight: 'Lijnhoogte',
		link: 'Link',
		link_modal_bookmark: 'Bladwijzer',
		link_modal_downloadLinkCheck: 'Downloadlink',
		link_modal_newWindowCheck: 'In een nieuw tabblad openen',
		link_modal_text: 'Tekst van de link',
		link_modal_title: 'Link invoegen',
		link_modal_url: 'URL',
		list: 'Lijst',
		math: 'Wiskunde',
		math_modal_fontSizeLabel: 'Lettergrootte',
		math_modal_inputLabel: 'Wiskundige notatie',
		math_modal_previewLabel: 'Voorbeeld',
		math_modal_title: 'Wiskunde',
		maxSize: 'Maximale grootte',
		mention: 'Vermelding',
		menu_bordered: 'Omlijnd',
		menu_code: 'Code'
		menu_neon: 'Neon',
		menu_shadow: 'Schaduw',
		menu_spaced: 'Uit elkaar',
		menu_translucent: 'Doorschijnend',
		mergeCells: 'Cellen samenvoegen',
		minSize: 'Minimale grootte',
		mirrorHorizontal: 'Horizontaal spiegelen',
		mirrorVertical: 'Verticaal spiegelen',
		orderList: 'Geordende lijst',
		outdent: 'Inspringen ongedaan maken',
		paragraphStyle: 'Alineastijl',
		preview: 'Voorbeeldweergave',
		print: 'Printen',
		proportion: 'Verhouding behouden',
		ratio: 'Verhouding',
		redo: 'Ongedaan maken herstellen',
		remove: 'Verwijderen',
		removeFormat: 'Opmaak verwijderen',
		resize100: 'Formaat wijzigen: 100%',
		resize25: 'Formaat wijzigen: 25%',
		resize50: 'Formaat wijzigen: 50%',
		resize75: 'Formaat wijzigen: 75%',
		resize: 'Resize',
		revertButton: 'Standaardwaarden herstellen',
		right: 'Rechts',
		rotateLeft: 'Naar links draaien',
		rotateRight: 'Naar rechts draaien',
		save: 'Opslaan',
		search: 'Zoeken',
		showBlocks: 'Blokken tonen',
		size: 'Grootte',
		splitCells: 'Cellen splitsen',
		strike: 'Doorstrepen',
		submitButton: 'Toepassen',
		subscript: 'Subscript',
		superscript: 'Superscript',
		table: 'Tabel',
		tableHeader: 'Tabelkoppen',
		tags: 'Tags',
		tag_blockquote: 'Citaat',
		tag_div: 'Normaal (div)',
		tag_h: 'Kop',
		tag_p: 'Alinea',
		tag_pre: 'Code',
		template: 'Sjabloon',
		textStyle: 'Tekststijl',
		title: 'Title',
		underline: 'Onderstrepen',
		undo: 'Ongedaan maken',
		unlink: 'Ontkoppelen',
		unorderList: 'Ongeordende lijst',
		verticalSplit: 'Verticaal splitsen',
		video: 'Video',
		video_modal_file: 'Selecteer een bestand van uw apparaat',
		video_modal_title: 'Video invoegen',
		video_modal_url: 'Embedded URL (YouTube/Vimeo)',
		width: 'Breedte',
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
