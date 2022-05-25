// command
import { CommandPlugin } from "./CommandPlugin";
import blockquote from "./command/blockquote";

// dropdown
import { DropdownPlugin } from "./DropdownPlugin";
import align from "./dropdown/align";
import font from "./dropdown/font";
import fontSize from "./dropdown/fontSize";
import fontColor from "./dropdown/fontColor";
import backgroundColor from "./dropdown/backgroundColor";
import horizontalLine from "./dropdown/horizontalLine";
import list from "./dropdown/list";
import table from "./dropdown/table";
import formatBlock from "./dropdown/formatBlock";
import lineHeight from "./dropdown/lineHeight";
import template from "./dropdown/template";
import paragraphStyle from "./dropdown/paragraphStyle";
import textStyle from "./dropdown/textStyle";

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
  align: DropdownPlugin;
  font: DropdownPlugin;
  fontSize: DropdownPlugin;
  fontColor: DropdownPlugin;
  backgroundColor: DropdownPlugin;
  horizontalLine: DropdownPlugin;
  list: DropdownPlugin;
  table: DropdownPlugin;
  formatBlock: DropdownPlugin;
  lineHeight: DropdownPlugin;
  template: DropdownPlugin;
  paragraphStyle: DropdownPlugin;
  textStyle: DropdownPlugin;
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
  backgroundColor,
  horizontalLine,
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
