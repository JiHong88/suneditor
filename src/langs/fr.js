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
		code: 'fr',
		default: 'Défaut',
		save: 'Sauvegarder',
		font: 'Police',
		formats: 'Formats',
		fontSize: 'Taille',
		bold: 'Gras',
		underline: 'Souligné',
		italic: 'Italique',
		strike: 'Barré',
		subscript: 'Indice',
		superscript: 'Exposant',
		removeFormat: 'Effacer le formatage',
		fontColor: 'Couleur du texte',
		backgroundColor: 'Couleur en arrière plan',
		indent: 'Indenter',
		outdent: 'Désindenter',
		align: 'Alignement',
		alignLeft: 'À gauche',
		alignRight: 'À droite',
		alignCenter: 'Centré',
		alignJustify: 'Justifié',
		list: 'Liste',
		orderList: 'Ordonnée',
		unorderList: 'Non-ordonnée',
		horizontalLine: 'Ligne horizontale',
		hr_solid: 'Solide',
		hr_dotted: 'Points',
		hr_dashed: 'Tirets',
		table: 'Table',
		link: 'Lien',
		math: 'Math',
		image: 'Image',
		video: 'Video',
		audio: 'Audio',
		fullScreen: 'Plein écran',
		showBlocks: 'Voir les blocs',
		codeView: 'Voir le code',
		undo: 'Annuler',
		redo: 'Rétablir',
		preview: 'Prévisualiser',
		print: 'Imprimer',
		tag_p: 'Paragraphe',
		tag_div: 'Normal (DIV)',
		tag_h: 'Titre',
		tag_blockquote: 'Citation',
		tag_pre: 'Code',
		template: 'Template',
		lineHeight: 'Hauteur de la ligne',
		paragraphStyle: 'Style de paragraphe',
		textStyle: 'Style de texte',
		imageGallery: "Galerie d'images",
		dir_ltr: 'De gauche à droite',
		dir_rtl: 'De droite à gauche',
		mention: 'Mention',
		tags: 'Mots clés',
		search: 'Chercher',
		caption: 'Insérer une description',
		close: 'Fermer',
		submitButton: 'Appliquer',
		revertButton: 'Revenir en arrière',
		proportion: 'Maintenir le rapport hauteur/largeur',
		basic: 'Basique',
		left: 'Gauche',
		right: 'Droite',
		center: 'Centré',
		width: 'Largeur',
		height: 'Hauteur',
		size: 'Taille',
		ratio: 'Rapport',
		edit: 'Modifier',
		unlink: 'Supprimer un lien',
		remove: 'Effacer',
        link_modal_title: 'Insérer un lien',
		link_modal_url: 'Adresse URL du lien',
		link_modal_text: 'Texte à afficher',
		link_modal_newWindowCheck: 'Ouvrir dans une nouvelle fenêtre',
		link_modal_downloadLinkCheck: 'Lien de téléchargement',
		link_modal_bookmark: 'Signet',
		math_modal_title: 'Math',
		math_modal_inputLabel: 'Notation mathématique',
		math_modal_fontSizeLabel: 'Taille',
		math_modal_previewLabel: 'Prévisualiser',
		image_modal_title: 'Insérer une image',
		image_modal_file: 'Sélectionner le fichier',
		image_modal_url: 'Adresse URL du fichier',
		image_modal_altText: 'Texte Alternatif',
		video_modal_title: 'Insérer une vidéo',
		video_modal_file: 'Sélectionner le fichier',
		video_modal_url: 'URL d’intégration du média, YouTube/Vimeo',
		audio_modal_title: 'Insérer un fichier audio',
		audio_modal_file: 'Sélectionner le fichier',
		audio_modal_url: 'Adresse URL du fichier',
		insertRowAbove: 'Insérer une ligne en dessous',
		insertRowBelow: 'Insérer une ligne au dessus',
		deleteRow: 'Effacer la ligne',
		insertColumnBefore: 'Insérer une colonne avant',
		insertColumnAfter: 'Insérer une colonne après',
		deleteColumn: 'Effacer la colonne',
		fixedColumnWidth: 'Largeur de colonne fixe',
		resize100: 'Redimensionner à 100%',
		resize75: 'Redimensionner à 75%',
		resize50: 'Redimensionner à 50%',
		resize25: 'Redimensionner à 25%',
		autoSize: 'Taille automatique',
		mirrorHorizontal: 'Mirroir, Horizontal',
		mirrorVertical: 'Mirroir, Vertical',
		rotateLeft: 'Rotation à gauche',
		rotateRight: 'Rotation à droite',
		maxSize: 'Taille max',
		minSize: 'Taille min',
		tableHeader: 'En-tête de table',
		mergeCells: 'Fusionner les cellules',
		splitCells: 'Diviser les Cellules',
		horizontalSplit: 'Scission horizontale',
		verticalSplit: 'Scission verticale',
		menu_spaced: 'Espacement',
		menu_bordered: 'Ligne de démarcation',
		menu_neon: 'Néon',
		menu_translucent: 'Translucide',
		menu_shadow: 'Ombre',
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'fr', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
