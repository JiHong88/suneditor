import { Core, status } from "../lib/core.d";
import { Lang } from "../langs/Lang.d";
import { Plugin } from "../plugins/Plugin.d";
import { SunEditorOptions } from "../options.d";
import { Context } from "../lib/context.d";
import { History } from "../lib/history.d";
import Helper from "../helper/index.d";

class CoreInterface {
	editor: Core;

	/**
	 * @description window object.
	 */
	_w: Window;

	/**
	 * @description document object.
	 */
	_d: Document;

	/**
	 * @description window obejct.(If in iframe mode, the window object of the iframe )
	 */
	_ww: Document;

	/**
	 * @description document object.(If in iframe mode, the document object of the iframe )
	 */
	_wd: Window;

	/**
	 * @description Closest ShadowRoot to editor if found
	 */
	shadowRoot: Document;

	/**
	 * @description Loaded plugins
	 */
	plugins: Record<string, Plugin>;

	/**
	 * @description Default icons object
	 */
	icons: Record<string, string>;

	status: status;
	options: SunEditorOptions;
	context: Context;
	history: History;
	lang: Lang;
	helper: Helper;
}

export default CoreInterface;
