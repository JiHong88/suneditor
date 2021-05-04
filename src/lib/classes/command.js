/**
 * @fileoverview Command class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";

const Command = function(editor) {
	CoreInterface.call(this, editor);
};

Command.prototype = {
	constructor: Command
};

export default Command;
