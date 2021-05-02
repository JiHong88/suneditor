/**
 * @fileoverview Format class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";

const Format = function(editor) {
	CoreInterface.call(this, editor);

	this.range = null;
	this.selectionNode = null;
};
