/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2023 JiHong Lee.
 *
 * Turkish translation by worm-codes at github.com/worm-codes
 *
 * MIT license.
 */
'use strict';

(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error('SUNEDITOR_LANG a window with a document');
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
	const lang = {
		code: "tr",
		toolbar: {
			default: "Varsayılan",
			save: "Kaydet",
			font: "Yazı Tipi",
			formats: "Biçimlendirmeler",
			fontSize: "Boyut",
			bold: "Kalın",
			underline: "Alt Çizili",
			italic: "İtalik",
			strike: "Üstü Çizili",
			subscript: "Alt Simge",
			superscript: "Üst Simge",
			removeFormat: "Biçimi Kaldır",
			fontColor: "Yazı Tipi Rengi",
			hiliteColor: "Vurgu Rengi",
			indent: "Girinti",
			outdent: "Girintiyi Azalt",
			align: "Hizala",
			alignLeft: "Sola Hizala",
			alignRight: "Sağa Hizala",
			alignCenter: "Ortaya Hizala",
			alignJustify: "İki Yana Yasla",
			list: "Liste",
			orderList: "Sıralı Liste",
			unorderList: "Sırasız Liste",
			horizontalRule: "Yatay Çizgi",
			hr_solid: "Düz",
			hr_dotted: "Noktalı",
			hr_dashed: "Kesikli",
			table: "Tablo",
			link: "Bağlantı",
			math: "Matematik",
			image: "Görsel",
			video: "Video",
			audio: "Ses",
			fullScreen: "Tam Ekran",
			showBlocks: "Blokları Göster",
			codeView: "Kod Görünümü",
			undo: "Geri Al",
			redo: "İleri Al",
			preview: "Önizleme",
			print: "Yazdır",
			tag_p: "Paragraf",
			tag_div: "Normal (DIV)",
			tag_h: "Başlık",
			tag_blockquote: "Alıntı",
			tag_pre: "Kod",
			template: "Şablon",
			lineHeight: "Satır Yüksekliği",
			paragraphStyle: "Paragraf Stili",
			textStyle: "Metin Stili",
			imageGallery: "Görüntü Galerisi",
			dir_ltr: "Soldan Sağa",
			dir_rtl: "Sağdan Sola",
			mention: "Belirtmek"
		},
		dialogBox: {
			linkBox: {
				title: "Bağlantı Ekle",
				url: "Bağlantı URL'si",
				text: "Görüntülenecek Metin",
				newWindowCheck: "Yeni Pencerede Aç",
				downloadLinkCheck: "Bağlantıyı İndir",
				bookmark: "Bağlantıyı Yer İmlerine Ekle"
			},
			mathBox: {
				title: "Matematik",
				inputLabel: "Matematiksel Simgeler",
				fontSizeLabel: "Yazı Tipi Boyutu",
				previewLabel: "Önizleme"
			},
			imageBox: {
				title: "Görüntü Ekle",
				file: "Dosya Seç",
				url: "Görüntü URL'si",
				altText: "Alternatif Metin"
			},
			videoBox: {
				title: "Video Ekle",
				file: "Dosya Seç",
				url: "Medya Ekleme URL'si (YouTube/Vimeo)"
			},
			audioBox: {
				title: "Ses Ekle",
				file: "Dosya Seç",
				url: "Ses URL'si"
			},
			browser: {
				tags: "Etiketler",
				search: "Ara"
			},
			caption: "Açıklama Giriniz",
			close: "Kapat",
			submitButton: "Gönder",
			revertButton: "Geri Dön",
			proportion: "Orantıları Koru",
			basic: "Temel",
			left: "Sola",
			right: "Sağa",
			center: "Ortaya",
			width: "Genişlik",
			height: "Yükseklik",
			size: "Boyut",
			ratio: "Oran"
		},
		controller: {
			edit: "Düzenle",
			unlink: "Bağlantıyı Kaldır",
			remove: "Kaldır",
			insertRowAbove: "Satır Yukarı Ekle",
			insertRowBelow: "Satır Aşağı Ekle",
			deleteRow: "Satırı Sil",
			insertColumnBefore: "Sütun Önce Ekle",
			insertColumnAfter: "Sütun Sonrası Ekle",
			deleteColumn: "Sütunu Sil",
			fixedColumnWidth: "Sabit Sütun Genişliği",
			resize100: "%100 Ölçeklendir",
			resize75: "%75 Ölçeklendir",
			resize50: "%50 Ölçeklendir",
			resize25: "%25 Ölçeklendir",
			autoSize: "Ölçeğe Otomatik Ayar",
			mirrorHorizontal: "Düzlemsel Aynalama (Yatay)",
			mirrorVertical: "Düzlemsel Aynalama (Dikey)",
			rotateLeft: "Saat Yönünde Döndür",
			rotateRight: "Saat Yönünün Tersine Döndür",
			maxSize: "En Büyük Boyut",
			minSize: "En Küçük Boyut",
			tableHeader: "Tablo Başlığı",
			mergeCells: "Hücreleri Birleştir",
			splitCells: "Hücreleri Ayır",
			HorizontalSplit: "Yatay Ayırma",
			VerticalSplit: "Dikey Ayırma"
		},
		menu: {
			spaced: "Aralıklı",
			bordered: "Çerçeveli",
			neon: "Neon",
			translucent: "Yarı Saydam",
			shadow: "Gölge",
			code: "Kod"
		}
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
}));
