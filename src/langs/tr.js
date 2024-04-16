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
		code: 'tr',
		align: 'Hizala',
		alignCenter: 'Ortaya Hizala',
		alignJustify: 'İki Yana Yasla',
		alignLeft: 'Sola Hizala',
		alignRight: 'Sağa Hizala',
		audio: 'Ses',
		audio_modal_file: 'Dosya Seç',
		audio_modal_title: 'Ses Ekle',
		audio_modal_url: "Ses URL'si",
		autoSize: 'Ölçeğe Otomatik Ayar',
		backgroundColor: 'Vurgu Rengi',
		basic: 'Temel',
		bold: 'Kalın',
		bulletedList: 'Sırasız Liste',
		caption: 'Açıklama Giriniz',
		center: 'Ortaya',
		close: 'Kapat',
		codeView: 'Kod Görünümü',
		default: 'Varsayılan',
		deleteColumn: 'Sütunu Sil',
		deleteRow: 'Satırı Sil',
		dir_ltr: 'Soldan Sağa',
		dir_rtl: 'Sağdan Sola',
		edit: 'Düzenle',
		fixedColumnWidth: 'Sabit Sütun Genişliği',
		font: 'Yazı Tipi',
		fontColor: 'Yazı Tipi Rengi',
		fontSize: 'Boyut',
		formats: 'Biçimlendirmeler',
		fullScreen: 'Tam Ekran',
		height: 'Yükseklik',
		horizontalLine: 'Yatay Çizgi',
		horizontalSplit: 'Yatay Ayırma',
		hr_dashed: 'Kesikli',
		hr_dotted: 'Noktalı',
		hr_solid: 'Düz',
		image: 'Görsel',
		imageGallery: 'Görüntü Galerisi',
		image_modal_altText: 'Alternatif Metin',
		image_modal_file: 'Dosya Seç',
		image_modal_title: 'Görüntü Ekle',
		image_modal_url: "Görüntü URL'si",
		indent: 'Girinti',
		insertColumnAfter: 'Sütun Sonrası Ekle',
		insertColumnBefore: 'Sütun Önce Ekle',
		insertRowAbove: 'Satır Yukarı Ekle',
		insertRowBelow: 'Satır Aşağı Ekle',
		italic: 'İtalik',
		left: 'Sola',
		lineHeight: 'Satır Yüksekliği',
		link: 'Bağlantı',
		link_modal_bookmark: 'Bağlantıyı Yer İmlerine Ekle',
		link_modal_downloadLinkCheck: 'Bağlantıyı İndir',
		link_modal_newWindowCheck: 'Yeni Pencerede Aç',
		link_modal_text: 'Görüntülenecek Metin',
		link_modal_title: 'Bağlantı Ekle',
		link_modal_url: "Bağlantı URL'si",
		list: 'Liste',
		math: 'Matematik',
		math_modal_fontSizeLabel: 'Yazı Tipi Boyutu',
		math_modal_inputLabel: 'Matematiksel Simgeler',
		math_modal_previewLabel: 'Önizleme',
		math_modal_title: 'Matematik',
		maxSize: 'En Büyük Boyut',
		mention: 'Belirtmek',
		menu_bordered: 'Çerçeveli',
		menu_code: 'Kod',
		menu_neon: 'Neon',
		menu_shadow: 'Gölge',
		menu_spaced: 'Aralıklı',
		menu_translucent: 'Yarı Saydam',
		mergeCells: 'Hücreleri Birleştir',
		minSize: 'En Küçük Boyut',
		mirrorHorizontal: 'Düzlemsel Aynalama (Yatay)',
		mirrorVertical: 'Düzlemsel Aynalama (Dikey)',
		numberedList: 'Sıralı Liste',
		outdent: 'Girintiyi Azalt',
		paragraphStyle: 'Paragraf Stili',
		preview: 'Önizleme',
		print: 'Yazdır',
		proportion: 'Orantıları Koru',
		ratio: 'Oran',
		redo: 'İleri Al',
		remove: 'Kaldır',
		removeFormat: 'Biçimi Kaldır',
		resize100: '%100 Ölçeklendir',
		resize25: '%25 Ölçeklendir',
		resize50: '%50 Ölçeklendir',
		resize75: '%75 Ölçeklendir',
		revert: 'Geri Dön',
		right: 'Sağa',
		rotateLeft: 'Saat Yönünde Döndür',
		rotateRight: 'Saat Yönünün Tersine Döndür',
		save: 'Kaydet',
		search: 'Ara',
		showBlocks: 'Blokları Göster',
		size: 'Boyut',
		splitCells: 'Hücreleri Ayır',
		strike: 'Üstü Çizili',
		submitButton: 'Gönder',
		subscript: 'Alt Simge',
		superscript: 'Üst Simge',
		table: 'Tablo',
		tableHeader: 'Tablo Başlığı',
		tags: 'Etiketler',
		tag_blockquote: 'Alıntı',
		tag_div: 'Normal (DIV)',
		tag_h: 'Başlık',
		tag_p: 'Paragraf',
		tag_pre: 'Kod',
		template: 'Şablon',
		textStyle: 'Metin Stili',
		underline: 'Alt Çizili',
		undo: 'Geri Al',
		unlink: 'Bağlantıyı Kaldır',
		verticalSplit: 'Dikey Ayırma',
		video: 'Video',
		video_modal_file: 'Dosya Seç',
		video_modal_title: 'Video Ekle',
		video_modal_url: "Medya Ekleme URL'si (YouTube/Vimeo)",
		width: 'Genişlik'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'tr', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
