// command
import { CommandPlugin } from "./CommandPlugin";
import blockquote from "./command/blockquote";

// submenu
import { SubmenuPlugin } from "./SubmenuPlugin";
import align from "./submenu/align";
import font from "./submenu/font";
import fontSize from "./submenu/fontSize";
import fontColor from "./submenu/fontColor";
import hiliteColor from "./submenu/hiliteColor";
import horizontalRule from "./submenu/horizontalRule";
import list from "./submenu/list";
import table from "./submenu/table";
import formatBlock from "./submenu/formatBlock";
import lineHeight from "./submenu/lineHeight";
import template from "./submenu/template";
import paragraphStyle from "./submenu/paragraphStyle";
import textStyle from "./submenu/textStyle";

// dialog
import { DialogPlugin } from "./DialogPlugin";
import link from "./dialog/link";
import image from "./dialog/image";
import video from "./dialog/video";
import audio from "./dialog/audio";
import math from "./dialog/math";

// file browser
import { FileBrowserPlugin } from "./FileBrowserPlugin";
import imageGallery from "./fileBrowser/imageGallery";

declare const _default: {
  blockquote: CommandPlugin;
  align: SubmenuPlugin;
  font: SubmenuPlugin;
  fontSize: SubmenuPlugin;
  fontColor: SubmenuPlugin;
  hiliteColor: SubmenuPlugin;
  horizontalRule: SubmenuPlugin;
  list: SubmenuPlugin;
  table: SubmenuPlugin;
  formatBlock: SubmenuPlugin;
  lineHeight: SubmenuPlugin;
  template: SubmenuPlugin;
  paragraphStyle: SubmenuPlugin;
  textStyle: SubmenuPlugin;
  link: DialogPlugin;
  image: DialogPlugin;
  video: DialogPlugin;
  audio: DialogPlugin;
  math: DialogPlugin;
  imageGallery: FileBrowserPlugin;
};

export {
  blockquote,
  align,
  font,
  fontSize,
  fontColor,
  hiliteColor,
  horizontalRule,
  list,
  table,
  formatBlock,
  lineHeight,
  template,
  paragraphStyle,
  textStyle,
  link,
  image,
  video,
  audio,
  math,
  imageGallery,
};

export default _default;
