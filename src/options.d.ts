import { Lang } from './lang/Lang';
import { Plugin } from './plugins/Plugin';

export interface SunEditorOptions {
    plugins: Plugin[] | Record<string, Plugin>;
    /**
     * Add tags to the default tags whitelist of editor.
     */
    addTagsWhitelist?: string;
    /**
     * Whitelist of tags when pasting.
     */
    pasteTagsWhitelist?: string;
    /**
     * Add attributes whitelist of tags that should be kept undeleted from the editor.
     */
    attributesWhitelist?: Record<string, string>;
    /**
     * Layout
     * ======
     */
    /**
     * language object
     */
    lang?: Lang;
    /**
     * The mode of the editor (classic, inline, balloon, balloon-always)
     */
    mode?: 'classic' | 'inline' | 'balloon' | 'balloon-always';
    /**
     * Button List
     */
    buttonList?: ButtonListItem[];
    /**
     * The width of the toolbar.
     Applies only when the editor mode is 'inline' or 'balloon' mode.
     */
    toolbarWidth?: string;
    /**
     * Reference height value that should be changed to sticky toolbar mode
     */
    stickyToolbar?: number;
    /**
     * Content will be placed in an iframe and isolated from the rest of the page
     */
    iframe?: boolean;
    /**
     * Allows the usage of HTML, HEAD, BODY tags and DOCTYPE declaration
     */
    fullPage?: boolean;
    /**
     * Name of the CSS file(s) to apply inside the iframe.
     */
    iframeCSSFileName?: string | string[];
    /**
     * CodeMirror core object
     */
    codeMirror?: any | { src: any; options: object };
    /**
     * Use "math" plugin
     */
    katex?: any | { src: any; options: object };
    /**
     * Display
     * =======
     */
    /**
     * The position property of editor
     */
    position?: string;
    /**
     * The display property of editor
     */
    display?: string;
    /**
     * Size of background area when activating dialog window ('full'||'local')
     */
    popupDisplay?: 'full' | 'local';
    /**
     * Bottom resizing bar
     * ===================
     */
    /**
     * Show the bottom resizing bar
     */
    resizingBar?: boolean;
    /**
     * Displays the current node structure to resizingBar
     */
    showPathLabel?: boolean;
    /**
     * Character count
     * ===============
     */
    /**
     * Shows the number of characters in the editor
     */
    charCounter?: boolean;
    /**
     * Defines the calculation method of the "charCounter" option
     */
    charCounterType?: 'char' | 'byte' | 'byte-html';
    /**
     * Text to be displayed in the "charCounter" area of the bottom bar.
     */
    charCounterLabel?: string;
    /**
     * The maximum number of characters allowed to be inserted into the editor
     */
    maxCharCount?: number;
    /**
     * Size
     * ====
     */
    /**
     * The width size of the editor
     */
    width?: string;
    /**
     * The min-width size of the editor
     */
    minWidth?: string;
    /**
     * The max-width size of the editor
     */
    maxWidth?: string;
    /**
     * The height size of the editor
     */
    height?: string;
    /**
     * The min-height size of the editor
     */
    minHeight?: string;
    /**
     * The max-height size of the editor
     */
    maxHeight?: string;
    /** 
     * Editing area default style 
    */
    defaultStyle?: string;
    /**
     * Defining menu items
     * ===================
     */
    /**
     * Change default font-family array
     */
    font?: string[];
    /**
     * Change default font-size array
     */
    fontSize?: number[];
    /**
     *
     */
    fontSizeUnit?: string;
    /**
     * Change default formatBlock array
     */
    formats?: FormatTagName[];
    /**
     * Change default color array of color picker
     */
    colorList?: string[];
    /**
     * Line Heights
     */
    lineHeights?: LineHeightsItem[];
    /**
     * Paragraph Styles
     */
    paragraphStyles?: ParagraphStyles;
    /**
     * Text Styles
     */
    textStyles?: TextStyles;
    /**
     * Image
     * =====
     */
    /**
     * Can resize the image
     */
    imageResizing?: boolean;
    /**
     * Choose whether the image height input is visible.
     */
    imageHeightShow?: boolean;
    /**
     * The default width size of the image frame
     */
    imageWidth?: string;
    /**
     * The default height size of the image frame
     */
    imageHeight?: string;
    /**
     * If true, image size can only be scaled by percentage.
     */
    imageSizeOnlyPercentage?: boolean;
    /**
     * It is determined by "imageSizeOnlyPercentage".
     * @pivate
     */
    _videoSizeUnit?: '%' | 'px';
    /**
     * Choose whether to image rotation buttons display.
     * When "imageSizeOnlyPercentage" is "true" or  or "imageHeightShow" is "false" the default value is false.
     * If you want the button to be visible, put it a true.
     */
    imageRotation?: boolean;
    /**
     * Choose whether to create a file input tag in the image upload window
     */
    imageFileInput?: boolean;
    /**
     * Choose whether to create a image url input tag in the image upload window
     */
    imageUrlInput?: boolean;
    /**
     * Http Header when uploading images.
     */
    imageUploadHeader?: Record<string, string>;
    /**
     * The image upload to server mapping address
     */
    imageUploadUrl?: string;
    /**
     * The size of the total uploadable images (in bytes)
     */
    imageUploadSizeLimit?: number;
    /**
     * Video
     * =====
     */
    /**
     * Can resize the video iframe
     */
    videoResizing?: boolean;
    /**
     * Choose whether the video height input is visible.
     */
    videoHeightShow?: boolean;
    /**
     * Choose whether the video ratio options is visible.
     */
    videoRatioShow?: boolean;
    /**
     * The default width size of the video frame
     */
    videoWidth?: string;
    /**
     * The default height size of the video frame
     */
    videoHeight?: string;
    /**
     * If true, video size can only be scaled by percentage.
     */
    videoSizeOnlyPercentage?: boolean;
    /**
     * Choose whether to video rotation buttons display.
     * When "videoSizeOnlyPercentage" is "true" or "videoHeightShow" is "false" the default value is false.
     * If you want the button to be visible, put it a true.
     */
    videoRotation?: boolean;
    /**
     * The default aspect ratio of the video.
     * Up to four decimal places are allowed.
     */
    videoRatio?: number;
    /**
     * Video ratio selection options.
     */
    videoRatioList?: { name: string; value: number }[];
    /**
     * The query string of a YouTube embedded URL
     */
    youtubeQuery?: string;
    /**
     * Choose whether to create a file input tag in the video upload window
     */
    videoFileInput?: boolean;
    /**
     * Choose whether to create a video url input tag in the video upload window
     */
    videoUrlInput?: boolean;
    /**
     * Http Header when uploading videos.
     */
    videoUploadHeader?: Record<string, string>;
    /**
     * The video upload to server mapping address
     */
    videoUploadUrl?: string;
    /**
     * The size of the total uploadable videos (in bytes)
     */
    videoUploadSizeLimit?: number;
    /**
     * Audio
     * =====
     */
    /**
     * The default width size of the audio frame
     */
    audioWidth?: string;
    /**
     * The default height size of the audio frame
     */
    audioHeight?: string;
    /**
     * Choose whether to create a file input tag in the audio upload window
     */
    audioFileInput?: boolean;
    /**
     * Choose whether to create a audio url input tag in the audio upload window
     */
    audioUrlInput?: boolean;
    /**
     * Http Header when uploading audios.
     */
    audioUploadHeader?: Record<string, string>;
    /**
     * The audio upload to server mapping address
     */
    audioUploadUrl?: string;
    /**
     * The size of the total uploadable audios (in bytes)
     */
    audioUploadSizeLimit?: number;
    /**
     * Table
     * =====
     */
    /**
     * Define position to the table cell controller. ('cell', 'top')
     */
    tableCellControllerPosition?: string;
    /**
     * Key actions
     * =====
     */
    /**
     * If true, disables the interaction of the editor and tab key
     */
    tabDisable?: boolean;
    /**
     * Defining save button
     * ====================
     */
    /**
     * Callback functions that is called when the Save button is clicked
     */
    callBackSave?: (contents: string) => void;
    /**
     * Templates Array
     * ===============
     */
    /**
     * Templates array
     */
    templates?: TemplatesItem[];
    /**
     * ETC
     * ===
     */
    /**
     * The placeholder text
     */
    placeholder?: string;
    /**
     * You can redefine icons.
     */
    icons?: Record<string, string>;
  }
  export type FormatTagName =
  'p'
  | 'div'
  | 'blockquote'
  | 'pre'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | { tag: string; name?: string; command: 'replace' | 'range' | 'free'; class: string };
export type TemplatesItem = { name: string; html: string };
export type LineHeightsItem = { text: string; value: number };
export type ParagraphStyles = (string | { name: string; class: string; _class?: string })[];
export type TextStyles = (string | { name: string; style: string; tag: string; _class?: string })[];
export type ButtonListDefaults =
  | '/' // Line Break
  | 'bold'
  | 'underline'
  | 'italic'
  | 'strike'
  | 'subscript'
  | 'superscript'
  | 'removeFormat'
  | 'indent'
  | 'outdent'
  | 'fullScreen'
  | 'showBlocks'
  | 'codeView'
  | 'undo'
  | 'redo'
  | 'preview'
  | 'print'
  | 'save'
  | 'font'
  | 'formatBlock'
  | 'fontSize'
  | 'fontColor'
  | 'hiliteColor'
  | 'align'
  | 'list'
  | 'horizontalRule'
  | 'table'
  | 'lineHeight'
  | 'template'
  | 'paragraphStyle'
  | 'textStyle'
  | 'link'
  | 'image'
  | 'video'
  | 'math';
export type ButtonListItem = ButtonListDefaults | ButtonListDefaults[];
