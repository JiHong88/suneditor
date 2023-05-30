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
		align: 'ソート',
		alignCenter: '中央揃え',
		alignJustify: '両端揃え',
		alignLeft: '左揃え',
		alignRight: '右揃え',
		audio: 'オーディオ',
		audio_modal_file: 'ファイルの選択',
		audio_modal_title: 'オーディオを挿入',
		audio_modal_url: 'オーディオアドレス',
		autoSize: '自動サイズ',
		backgroundColor: '文字の背景色',
		basic: '基本',
		bold: '太字',
		caption: '説明付け',
		center: '中央',
		close: '閉じる',
		codeView: 'HTMLの編集',
		default: 'デフォルト',
		deleteColumn: '列を削除する',
		deleteRow: '行の削除',
		dir_ltr: '左から右へ',
		dir_rtl: '右から左に',
		edit: '編集',
		fixedColumnWidth: '固定列幅',
		font: 'フォント',
		fontColor: '文字色',
		fontSize: 'サイズ',
		formats: '段落形式',
		fullScreen: 'フルスクリーン',
		height: '縦',
		horizontalLine: '水平線を挿入',
		horizontalSplit: '横分割',
		hr_dashed: 'ダッシュ',
		hr_dotted: '点線',
		hr_solid: '実線',
		image: '画像',
		imageGallery: 'イメージギャラリー',
		image_modal_altText: '置換文字列',
		image_modal_file: 'ファイルの選択',
		image_modal_title: '画像の挿入',
		image_modal_url: 'イメージアドレス',
		indent: 'インデント',
		insertColumnAfter: '右に列を挿入',
		insertColumnBefore: '左に列を挿入',
		insertRowAbove: '上に行を挿入',
		insertRowBelow: '下に行を挿入',
		italic: 'イタリック',
		layout: 'Layout',
		left: '左',
		lineHeight: '行の高さ',
		link: 'リンク',
		link_modal_bookmark: 'ブックマーク',
		link_modal_downloadLinkCheck: 'ダウンロードリンク',
		link_modal_newWindowCheck: '別ウィンドウで開く',
		link_modal_text: '画面のテキスト',
		link_modal_title: 'リンクの挿入',
		link_modal_url: 'インターネットアドレス',
		list: 'リスト',
		math: '数学',
		math_modal_fontSizeLabel: 'サイズ',
		math_modal_inputLabel: '数学表記',
		math_modal_previewLabel: 'プレビュー',
		math_modal_title: '数学',
		maxSize: '最大サイズ',
		mention: '言及する',
		menu_bordered: '境界線',
		menu_code: 'コード'
		menu_neon: 'ネオン',
		menu_shadow: '影',
		menu_spaced: '文字間隔',
		menu_translucent: '半透明',
		mergeCells: 'セルの結合',
		minSize: '最小サイズ',
		mirrorHorizontal: '左右反転',
		mirrorVertical: '上下反転',
		orderList: '数値ブリット',
		outdent: 'インデント',
		paragraphStyle: '段落スタイル',
		preview: 'プレビュー',
		print: '印刷',
		proportion: 'の割合カスタマイズ',
		ratio: '比率',
		redo: '再実行',
		remove: '削除',
		removeFormat: '形式を削除',
		resize100: '100％ サイズ',
		resize25: '25％ サイズ',
		resize50: '50％ サイズ',
		resize75: '75％ サイズ',
		resize: 'Resize',
		revertButton: '元に戻す',
		right: '右',
		rotateLeft: '左に回転',
		rotateRight: '右に回転',
		save: '保存',
		search: '探す',
		showBlocks: 'ブロック表示',
		size: 'サイズ',
		splitCells: 'セルを分割',
		strike: '取り消し線',
		submitButton: '確認',
		subscript: '下付き',
		superscript: '上付き',
		table: 'テーブル',
		tableHeader: '表のヘッダー',
		tags: 'タグ',
		tag_blockquote: '引用',
		tag_div: '基本（DIV）',
		tag_h: 'タイトル',
		tag_p: '本文',
		tag_pre: 'コード',
		template: 'テンプレート',
		textStyle: 'テキストスタイル',
		title: 'Title',
		underline: '下線',
		undo: '元に戻す',
		unlink: 'リンク解除',
		unorderList: '円形ブリット',
		verticalSplit: '垂直分割',
		video: '動画',
		video_modal_file: 'ファイルの選択',
		video_modal_title: '動画を挿入',
		video_modal_url: 'メディア埋め込みアドレス, YouTube/Vimeo',
		width: '横',
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
