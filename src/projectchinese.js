var PI = Math.PI;

var canvas,
	context;
	
var brush;

$(document).ready(function() {
	initialize();
});

function initialize() {
	canvas = document.getElementById("myCanvas");
	context = canvas.getContext("2d");
	context.save();
	context.globalAlpha = 0.1;
	context.fillRect(0, 0, 512, 512);
	context.restore();
	
	loadSVGFont("M103 125T93 110T94 96T126 101Q127 121 123 128T126 134T141 129T145 122T140 103Q161 105 170 106T189 102T184 94T140 91V62Q175 65 193 67T221 60T211 52T140 52Q139 9 137 -8T131 -25T127 -8T126 50Q104 47 86 44T57 40T36 45T40 53T75 55T126 61V89Q82 85 75 82T66 81T61 88T69 99T98 140Q82 138 76 138T62 142T66 147T103 152Q121 187 119 197T126 202T140 192T139 183T119 154Q150 158 164 160T188 158T184 150T154 146T112 141Q103 125 93 110Z");
	
	brush = new Brush("standard", 10, 0.3, 0.8, 0.02, 0.02);
	
	canvas.addEventListener("touchstart", $.proxy(brush.press, brush), false);
	canvas.addEventListener("mousedown", $.proxy(brush.press, brush), false);
	canvas.addEventListener("touchmove", $.proxy(brush.move, brush), false);
	canvas.addEventListener("mousemove", $.proxy(brush.move, brush), false);
	document.addEventListener("touchend", $.proxy(brush.lift, brush), false);
	document.addEventListener("mouseup", $.proxy(brush.lift, brush), false);
}

function getMousePos(event) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

function loadSVGFont(svgText) {
	var lastPos = {
		x: 0,
		y: 0
	};
	var instructions = svgText.match(/[A-Z][0-9\s\-]*/g);
	context.save();
	context.translate(0, 440);
	context.scale(2, -2);
	context.globalAlpha = 0.2;
	context.beginPath();
	for (var n = 0; n < instructions.length; n++) {
		var command = instructions[n][0],
			params = instructions[n].substring(1).split(" ");
		switch (command) {
			case "M":		//moveto
				context.moveTo(params[0], params[1]);
				lastPos.x = params[0];
				lastPos.y = params[1];
				break;
			case "Z":		//closepath
				context.closePath();
				break;
			case "L":		//lineto
				context.lineTo(params[0], params[1]);
				lastPos.x = params[0];
				lastPos.y = params[1];
				break;
			case "H":		//horizontal lineto
				context.lineTo(params[0], lastPos.y);
				lastPos.x = params[0];
				break;
			case "V":		//vertical lineto
				context.lineTo(lastPos.x, params[0]);
				lastPos.y = params[0];
				break;
			case "C":		//cubic curveto
				break;		//unsupported
			case "S":		//shorthand cubic curveto
				break;		//unsupported
			case "Q":		//quadratic curveto
				context.quadraticCurveTo(params[0], params[1], params[2], params[3]);
				lastPos.x = params[2];
				lastPos.y = params[3];
				break;		
			case "T":		//shorthand quadratic curveto
				context.quadraticCurveTo(lastPos.x, lastPos.y, params[0], params[1]);
				lastPos.x = params[0];
				lastPos.y = params[1];
				break;
			case "A":		//elliptical arc
				break;		//unsupported
		}
	}
	context.fill();
	context.stroke();
	context.restore();
}

function Brush(type, thickness, minThickness, density, pressRate, liftRate) {
	this.type = type;
	this.thickness = thickness;
	this.minThickness = minThickness;
	this.density = density;
	this.pressRate = pressRate;
	this.liftRate = liftRate;
	this.fiberPoints = [];
	this.pressStrength = this.minThickness;		//0 - not pressed ; 1 - fully pressed
	this.lastPressStrength = this.minThickness;
	this.pos = {
		x: 0,
		y: 0
	};
	this.lastPos = {
		x: 0,
		y: 0
	};
	this.velocity = {
		x: 0,
		y: 0
	};
	this.pressTimer = -1
	this.liftTimer = -1;
	this.drawTimer = -1;
	this.lastDrawTime = -1;
	
	switch(type) {
		case "standard":
		default:
			var numOfFibers = Math.ceil(thickness * thickness * 0.8);
			for (var n = 0; n < numOfFibers; n++) {
				var angle = Math.random() * PI * 2;
				var r = Math.random() * thickness;
				this.fiberPoints.push({
					dx: Math.cos(angle) * r,
					dy: Math.sin(angle) * r
				});
			}
	}
}

Brush.prototype.press = function(event) {
	this.lastDrawTime = new Date().getTime();
	this.lastPos = getMousePos(event);
	this.pos = getMousePos(event);
	this.pressTimer = setInterval($.proxy(this.pressTimerHandler, this), 20);
	this.drawTimer = setInterval($.proxy(this.drawTimerHandler, this), 20);
};

Brush.prototype.lift = function(event) {
	if (this.pressTimer >= 0) {
		clearInterval(this.pressTimer);
		this.pressTimer = -1;
	}
	this.liftTimer = setInterval($.proxy(this.liftTimerHandler, this), 20);
};

Brush.prototype.move = function(event) {
	this.pos = getMousePos(event);
}

Brush.prototype.pressTimerHandler = function() {
	if (this.pressStrength < 1) {
		this.pressStrength += 20 * this.pressRate;
		if (this.pressStrength >= 1) {
			this.pressStrength = 1;
			clearInterval(this.pressTimer);
			this.pressTimer = -1;
		}
	}
};

Brush.prototype.liftTimerHandler = function() {
	if (this.pressStrength > this.minThickness) {
		this.pressStrength -= 20 * this.liftRate;
		this.pos = {
			x: this.pos.x + this.velocity.x * 20,
			y: this.pos.y + this.velocity.y * 20
		};
		if (this.pressStrength <= this.minThickness) {
			this.pressStrength = this.minThickness;
			this.lastPressStrength = this.minThickness;
			clearInterval(this.liftTimer);
			this.liftTimer = -1;
			clearInterval(this.drawTimer);
			this.moveTimer = -1;
		}
	}
};

Brush.prototype.drawTimerHandler = function() {
	var time = new Date().getTime();
	var dtime = time - this.lastDrawTime	//elapsed time
	
	if (this.liftTimer == -1) {
		this.velocity.x = (this.pos.x - this.lastPos.x) / dtime;
		this.velocity.y = (this.pos.y - this.lastPos.y) / dtime;
	}
	
	context.save();
	context.globalAlpha = 0.5;
	var length = this.fiberPoints.length;
	for (var n = 0; n < length; n++) {
		var d = this.fiberPoints[n];
		context.beginPath();
		//context.moveTo(this.lastPos.x + d.dx * this.lastPressStrength, this.lastPos.y + d.dy * this.lastPressStrength);
		//context.lineTo(this.pos.x + d.dx * this.pressStrength, this.pos.y + d.dy * this.pressStrength);
		context.quadraticCurveTo(this.lastPos.x + d.dx * this.lastPressStrength, this.lastPos.y + d.dy * this.lastPressStrength,
									this.pos.x + d.dx * this.pressStrength, this.pos.y + d.dy * this.pressStrength);
		context.closePath();
		context.stroke();
	}
	context.restore();
	this.lastPos = this.pos;
	this.lastDrawTime = time;
	this.lastPressStrength = this.pressStrength;
};
