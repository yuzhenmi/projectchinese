function ViewingCanvas(canvas, changeword, changepage) {
	this.canvas = document.getElementById(canvas);
	this.context = this.canvas.getContext("2d");
	this.changeword = changeword;		//called when word is changed, to allow response from WritingCanvas
	this.changepage = changepage;
	this.touchIndex = -1;
	this.readyState = 0;
	this.svgids = null;
	this.page = 0;
	this.innerpage = 0;
	this.selected = -1;
	this.innerselected = -1;
	this.pos = {x:0, y:0};
	this.lastPos = {x:0, y:0};
	this.drawBackground();
}

ViewingCanvas.prototype.drawBackground = function() {
	this.context.save();
	this.context.globalAlpha = 0.1;
	this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.restore();
};

ViewingCanvas.prototype.initialize = function(svgids) {
	this.svgids = svgids;
	this.touchIndex = -1;
	this.readyState = 1;
	this.page = 0;
	this.innerpage = 0;
	this.selected = -1;
	this.innerselected = -1;
	this.pos = {x:0, y:0};
	this.lastPos = {x:0, y:0};
	if (Utility.isTouchDevice()) {
		this.canvas.addEventListener("touchstart", $.proxy(this.touchstart, this), false);
		this.canvas.addEventListener("touchmove", $.proxy(this.touchmove, this), false);
		this.canvas.addEventListener("touchend", $.proxy(this.touchend, this), false);
	}
	else {
		this.canvas.addEventListener("mousedown", $.proxy(this.mousedown, this), false);
		this.canvas.addEventListener("mousemove", $.proxy(this.mousemove, this), false);
		this.canvas.addEventListener("mouseup", $.proxy(this.mouseup, this), false);
	}
	this.update();
};

ViewingCanvas.prototype.update = function() {
	this.clear();
	if (this.selected < 0) {	//no set selected
		this.changepage(this.page, Math.ceil(this.svgids.length / 16), false);
		for (var n = this.page * 16; n < this.svgids.length && n < this.page * 16 + 16; n++) {
			var m = n - this.page * 16;
			if (this.svgids[n].length == 1) {
				Utility.loadSVGFont(this.svgids[n][0], this.canvas, this.context, 0.25, 0.25, m % 4 / 4, Math.floor(m / 4) / 4, 1);
			}
			else if (this.svgids[n].length == 2) {
				Utility.loadSVGFont(this.svgids[n][0], this.canvas, this.context, 0.125, 0.125, m % 4 / 4, Math.floor(m / 4) / 4 + 0.0625, 1)
				Utility.loadSVGFont(this.svgids[n][1], this.canvas, this.context, 0.125, 0.125, m % 4 / 4 + 0.125, Math.floor(m / 4) / 4 + 0.0625, 1)
			}
			else if (this.svgids[n].length == 3) {
				Utility.loadSVGFont(this.svgids[n][0], this.canvas, this.context, 0.125, 0.125, m % 4 / 4, Math.floor(m / 4) / 4, 1)
				Utility.loadSVGFont(this.svgids[n][1], this.canvas, this.context, 0.125, 0.125, m % 4 / 4 + 0.125, Math.floor(m / 4) / 4, 1)
				Utility.loadSVGFont(this.svgids[n][2], this.canvas, this.context, 0.125, 0.125, m % 4 / 4, Math.floor(m / 4) / 4 + 0.125, 1)
			}
			else if (this.svgids[n].length >= 4) {
				Utility.loadSVGFont(this.svgids[n][0], this.canvas, this.context, 0.125, 0.125, m % 4 / 4, Math.floor(m / 4) / 4, 1)
				Utility.loadSVGFont(this.svgids[n][1], this.canvas, this.context, 0.125, 0.125, m % 4 / 4 + 0.125, Math.floor(m / 4) / 4, 1)
				Utility.loadSVGFont(this.svgids[n][2], this.canvas, this.context, 0.125, 0.125, m % 4 / 4, Math.floor(m / 4) / 4 + 0.125, 1)
				Utility.loadSVGFont(this.svgids[n][3], this.canvas, this.context, 0.125, 0.125, m % 4 / 4 + 0.125, Math.floor(m / 4) / 4 + 0.125, 1)
			}
		}
	}
	else {		//set selected, draw inner level
		this.changepage(this.innerpage, Math.ceil(this.svgids[this.selected].length / 16), true);
		for (var n = this.innerpage * 16; n < this.svgids[this.selected].length && n < this.innerpage * 16 + 16; n++) {
			var m = n - this.innerpage * 16;
			Utility.loadSVGFont(this.svgids[this.selected][n], this.canvas, this.context, 0.25, 0.25, m % 4 / 4, Math.floor(m / 4) / 4, 1);
		}
	}
};

ViewingCanvas.prototype.clear = function() {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.drawBackground();
};

ViewingCanvas.prototype.touchstart = function(event) {
	if (this.touchIndex < 0 && this.readyState > 0) {		//first touch
		this.touchIndex = event.touches[event.touches.length - 1].identifier;
		this.pos = Utility.getTouchPos(event.touches[event.touches.length - 1], this.canvas);
		this.lastPos = this.pos;
	}
};
ViewingCanvas.prototype.mousedown = function(event) {
	this.pos = Utility.getMousePos(event, this.canvas);
	this.lastPos = this.pos;
};

ViewingCanvas.prototype.touchmove = function(event) {
	event.preventDefault();
	if (this.touchIndex >= 0 && this.readyState > 0) {		//touching
		var touch = null;
		for (var n = 0; n < event.touches.length; n++) {
			if (this.touchIndex == event.touches[n].identifier) {
				touch = event.touches[n];
				break;
			}
		}
		if (touch == null) {	//no longer touching
			this.lift(event);
		}
		else {
			this.pos = Utility.getTouchPos(touch, this.canvas);
		}
	}
};
ViewingCanvas.prototype.mousemove = function(event) {
	this.pos = Utility.getMousePos(event, this.canvas);
};

ViewingCanvas.prototype.touchend = function(event) {
	if (this.touchIndex >= 0 && this.readyState > 0) {		//was touching
		var isTouched = false;
		for (var n = 0; n < event.touches.length; n++) {
			if (this.touchIndex == event.touches[n].identifier) {	//still touching
				isTouched = true;
				break;
			}
		}
		if (!isTouched) {		//first touch lifted
			this.touchIndex = -1;
			if (Math.sqrt(Math.pow(this.pos.x - this.lastPos.x, 2) + Math.pow(this.pos.y - this.lastPos.y, 2)) < 20) {	//tap
				if (this.selected < 0) {
					var temp = this.page * 16 + Math.floor(this.lastPos.y / this.canvas.height * 4) * 4 + Math.floor(this.lastPos.x / this.canvas.width * 4);
					if (temp < this.svgids.length) {
						this.selected = temp;
						this.update();
					}
				}
				else {
					var temp = this.innerpage * 16 + Math.floor(this.lastPos.y / this.canvas.height * 4) * 4 + Math.floor(this.lastPos.x / this.canvas.width * 4);
					if (temp < this.svgids[this.selected].length) {
						this.innerselected = temp;
						this.changeword(this.svgids[this.selected][this.innerselected]);
					}
				}
			}
		}
	}
};
ViewingCanvas.prototype.mouseup = function(event) {
	if (Math.sqrt(Math.pow(this.pos.x - this.lastPos.x, 2) + Math.pow(this.pos.y - this.lastPos.y, 2)) < 20) {
		if (this.selected < 0) {
			var temp = this.page * 16 + Math.floor(this.lastPos.y / this.canvas.height * 4) * 4 + Math.floor(this.lastPos.x / this.canvas.width * 4);
			if (temp < this.svgids.length) {
				this.selected = temp;
				this.update();
			}
		}
		else {
			var temp = this.innerpage * 16 + Math.floor(this.lastPos.y / this.canvas.height * 4) * 4 + Math.floor(this.lastPos.x / this.canvas.width * 4);
			if (temp < this.svgids[this.selected].length) {
				this.innerselected = temp;
				this.changeword(this.svgids[this.selected][this.innerselected]);
			}
		}
	}
}

ViewingCanvas.prototype.setPage = function(page) {
	if (this.selected < 0) {
		this.page = page;
	}
	else {
		this.innerpage = page;
	}
	this.update();
};

ViewingCanvas.prototype.back = function() {
	this.selected = -1;
	this.innerpage = 0;
	this.update();
}
