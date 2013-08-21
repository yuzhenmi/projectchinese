function WritingCanvas(canvas) {
	this.canvas = document.getElementById(canvas);
	this.context = this.canvas.getContext("2d");
	this.brush = null;
	this.drawBackground();
}

WritingCanvas.prototype.drawBackground = function() {
	this.context.save();
	this.context.globalAlpha = 0.1;
	this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.beginPath();
	this.context.moveTo(0, 0);
	this.context.lineTo(this.canvas.width, this.canvas.height);
	this.context.stroke();
	this.context.beginPath();
	this.context.moveTo(0, 0);
	this.context.lineTo(this.canvas.width, this.canvas.height);
	this.context.stroke();
	this.context.beginPath();
	this.context.moveTo(this.canvas.width, 0);
	this.context.lineTo(0, this.canvas.height);
	this.context.stroke();
	this.context.beginPath();
	this.context.moveTo(0, this.canvas.height / 2);
	this.context.lineTo(this.canvas.width, this.canvas.height / 2);
	this.context.stroke();
	this.context.beginPath();
	this.context.moveTo(this.canvas.width / 2, 0);
	this.context.lineTo(this.canvas.width / 2, this.canvas.height);
	this.context.stroke();
	this.context.restore();
};

WritingCanvas.prototype.initialize = function() {
	this.brush = new Brush("standard", 10, 0.3, this.canvas, this.context);
	if (Utility.isTouchDevice()) {
		this.canvas.addEventListener("touchstart", $.proxy(this.brush.touchstart, this.brush), false);
		this.canvas.addEventListener("touchmove", $.proxy(this.brush.touchmove, this.brush), false);
		document.addEventListener("touchend", $.proxy(this.brush.touchend, this.brush), false);
	}
	else {
		this.canvas.addEventListener("mousedown", $.proxy(this.brush.mousedown, this.brush), false);
		this.canvas.addEventListener("mousemove", $.proxy(this.brush.mousemove, this.brush), false);
		document.addEventListener("mouseup", $.proxy(this.brush.mouseup, this.brush), false);
	}
};

WritingCanvas.prototype.update = function(fontid) {
	this.clear();
	Utility.loadSVGFont(fontid, this.canvas, this.context, 1, 1, 0, 0, 0.2);
};

WritingCanvas.prototype.clear = function() {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.drawBackground();
};
