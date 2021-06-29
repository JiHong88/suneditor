import { Core, status } from "../lib/core.d";
import { Plugin } from "../plugins/Plugin.d";
import { SunEditorOptions } from "../options.d";
import { Context } from "../lib/context.d";
import { History } from "../lib/history.d";
import Helpers from "../helpers/index.d";

class CoreInterface {
	editor: Core;
	_w: Window;
	_d: Document;
	plugins: Record<string, Plugin>;
	status: status;
	options: SunEditorOptions;
	context: Context;
	history: History;
	helpers: Helpers;
}

export default CoreInterface;
