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
		code: 'ja',
		default: 'デフォルト',
		save: '保存',
		font: 'フォント',
		formats: '段落形式',
		fontSize: 'サイズ',
		bold: '太字',
		underline: '下線',
		italic: 'イタリック',
		strike: '取り消し線',
		subscript: '下付き',
		superscript: '上付き',
		removeFormat: '形式を削除',
		fontColor: '文字色',
		backgroundColor: '文字の背景色',
		indent: 'インデント',
		outdent: 'インデント',
		align: 'ソート',
		alignLeft: '左揃え',
		alignRight: '右揃え',
		alignCenter: '中央揃え',
		alignJustify: '両端揃え',
		list: 'リスト',
		orderList: '数値ブリット',
		unorderList: '円形ブリット',
		horizontalLine: '水平線を挿入',
		hr_solid: '実線',
		hr_dotted: '点線',
		hr_dashed: 'ダッシュ',
		table: 'テーブル',
		link: 'リンク',
		math: '数学',
		image: '画像',
		video: '動画',
		audio: 'オーディオ',
		fullScreen: 'フルスクリーン',
		showBlocks: 'ブロック表示',
		codeView: 'HTMLの編集',
		undo: '元に戻す',
		redo: '再実行',
		preview: 'プレビュー',
		print: '印刷',
		tag_p: '本文',
		tag_div: '基本（DIV）',
		tag_h: 'タイトル',
		tag_blockquote: '引用',
		tag_pre: 'コード',
		template: 'テンプレート',
		lineHeight: '行の高さ',
		paragraphStyle: '段落スタイル',
		textStyle: 'テキストスタイル',
		imageGallery: 'イメージギャラリー',
		dir_ltr: '左から右へ',
		dir_rtl: '右から左に',
		mention: '言及する',
		tags: 'タグ',
		search: '探す',
		caption: '説明付け',
		close: '閉じる',
		submitButton: '確認',
		revertButton: '元に戻す',
		proportion: 'の割合カスタマイズ',
		basic: '基本',
		left: '左',
		right: '右',
		center: '中央',
		width: '横',
		height: '縦',
		size: 'サイズ',
		ratio: '比率',
		edit: '編集',
		unlink: 'リンク解除',
		remove: '削除',
		link_modal_title: 'リンクの挿入',
		link_modal_url: 'インターネットアドレス',
		link_modal_text: '画面のテキスト',
		link_modal_newWindowCheck: '別ウィンドウで開く',
		link_modal_downloadLinkCheck: 'ダウンロードリンク',
		link_modal_bookmark: 'ブックマーク',
		math_modal_title: '数学',
		math_modal_inputLabel: '数学表記',
		math_modal_fontSizeLabel: 'サイズ',
		math_modal_previewLabel: 'プレビュー',
		image_modal_title: '画像の挿入',
		image_modal_file: 'ファイルの選択',
		image_modal_url: 'イメージアドレス',
		image_modal_altText: '置換文字列',
		video_modal_title: '動画を挿入',
		video_modal_file: 'ファイルの選択',
		video_modal_url: 'メディア埋め込みアドレス, YouTube/Vimeo',
		audio_modal_title: 'オーディオを挿入',
		audio_modal_file: 'ファイルの選択',
		audio_modal_url: 'オーディオアドレス',
		insertRowAbove: '上に行を挿入',
		insertRowBelow: '下に行を挿入',
		deleteRow: '行の削除',
		insertColumnBefore: '左に列を挿入',
		insertColumnAfter: '右に列を挿入',
		deleteColumn: '列を削除する',
		fixedColumnWidth: '固定列幅',
		resize100: '100％ サイズ',
		resize75: '75％ サイズ',
		resize50: '50％ サイズ',
		resize25: '25％ サイズ',
		autoSize: '自動サイズ',
		mirrorHorizontal: '左右反転',
		mirrorVertical: '上下反転',
		rotateLeft: '左に回転',
		rotateRight: '右に回転',
		maxSize: '最大サイズ',
		minSize: '最小サイズ',
		tableHeader: '表のヘッダー',
		mergeCells: 'セルの結合',
		splitCells: 'セルを分割',
		horizontalSplit: '横分割',
		verticalSplit: '垂直分割',
		menu_spaced: '文字間隔',
		menu_bordered: '境界線',
		menu_neon: 'ネオン',
		menu_translucent: '半透明',
		menu_shadow: '影',
		menu_code: 'コード'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'ja', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
