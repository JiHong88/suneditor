/**
 * @fileoverview Event class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";

const Events = function (editor) {
	CoreInterface.call(this, editor);
	this.selection = editor.selection;
};

Events.prototype = {
	

	constructor: Events
};

export default Events;
