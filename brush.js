function Brush(type, thickness, density, canvas, context) {
	this.type = type;
	this.thickness = thickness;
	this.density = density;
	this.canvas = canvas;
	this.context = context;
	this.fiberPoints = [];
	this.lastPos = {
		x: 0,
		y: 0
	};
	this.pos = {
		x: 0,
		y: 0
	};
	this.drawTimer = -1;
	this.touchIndex = -1;
	
	switch(type) {
		case "standard":
		default:
			var numOfFibers = Math.ceil(thickness * thickness * 0.8);
			for (var n = 0; n < numOfFibers; n++) {
				var angle = Math.random() * Math.PI * 2;
				var r = Math.random() * thickness;
				this.fiberPoints.push({
					dx: Math.cos(angle) * r,
					dy: Math.sin(angle) * r
				});
			}
	}
}

Brush.prototype.touchstart = function(event) {
	if (this.touchIndex < 0) {		//first touch
		this.touchIndex = event.touches[event.touches.length - 1].identifier;
		this.pos = Utility.getTouchPos(event.touches[event.touches.length - 1], this.canvas);
		this.lastPos = this.pos;
		this.drawTimer = setInterval($.proxy(this.drawTimerHandler, this), 20);
	}
};
Brush.prototype.mousedown = function(event) {
	this.pos = Utility.getMousePos(event, this.canvas);
	this.lastPos = this.pos;
	this.drawTimer = setInterval($.proxy(this.drawTimerHandler, this), 20);
};

Brush.prototype.touchend = function(event) {
	if (this.touchIndex >= 0) {		//was touching
		var isTouched = false;
		for (var n = 0; n < event.touches.length; n++) {
			if (this.touchIndex == event.touches[n].identifier) {	//still touching
				isTouched = true;
				break;
			}
		}
		if (!isTouched) {		//first touch lifted
			this.touchIndex = -1;
			clearInterval(this.drawTimer);
			this.drawTimer = -1;
		}
	}
};
Brush.prototype.mouseup = function(event) {
	clearInterval(this.drawTimer);
	this.drawTimer = -1;
};

Brush.prototype.touchmove = function(event) {
	event.preventDefault();
	if (this.touchIndex >= 0) {		//touching
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
Brush.prototype.mousemove = function(event) {
	this.pos = Utility.getMousePos(event, this.canvas);
}

Brush.prototype.drawTimerHandler = function() {
	this.context.save();
	this.context.globalAlpha = 0.5;
	var length = this.fiberPoints.length;
	for (var n = 0; n < length; n++) {
		var d = this.fiberPoints[n];
		this.context.beginPath();
		this.context.moveTo(this.lastPos.x + d.dx, this.lastPos.y + d.dy);
		this.context.lineTo(this.pos.x + d.dx, this.pos.y + d.dy);
		this.context.closePath();
		this.context.stroke();
	}
	this.context.restore();
	this.lastPos = this.pos;
};
