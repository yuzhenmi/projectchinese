function Utility() {}

Utility.getURLParams = function() {
	var url = document.URL.toString(),
		params = [];
	if (url.indexOf("?") > 0) {
		var rawParams = url.split("?")[1].split("&");
		for (var n = 0; n < rawParams.length; n++) {
			var param = rawParams[n].split("=");
			params[param[0]] = param[1];
		}
	}
	return params;
};

Utility.query = function(link, callback) {
	//make xmlhttp request
	var xmlhttp = null; 
	if (window.XMLHttpRequest) {	//modern browsers
		xmlhttp = new XMLHttpRequest();
	}
	else {		//IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	if (xmlhttp != null) {
		//callback
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				callback(xmlhttp.responseText);
			}
		}
		
		//send
		xmlhttp.open("GET", link, true);
		xmlhttp.send();
	}
}

Utility.loadSVGFont = function(id, canvas, context, scalex, scaley, offsetx, offsety, alpha) {
	var drawSVGFont = function(svg) {
		var lastPos = {x:0, y:0},
		instructions = svg.match(/[A-Z][0-9\s\-]*/g);
		//draw
		context.save();
		context.translate(offsetx * canvas.width, offsety * canvas.height + 220 / 256 * canvas.height * scaley);
		context.scale(canvas.width / 256 * scalex, -canvas.height / 256 * scaley);
		context.globalAlpha = alpha;
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
	
	if (svgcache[id] == undefined) {
		//get svg from database
		Utility.query("http://writechinese.co.nf/getfont.php?id=" + id, $.proxy(function(responseText) {
			var results = JSON.parse(responseText);
			svgcache[id] = results.svg;
			drawSVGFont(svgcache[id]);
		}, this));
	}
	else {
		drawSVGFont(svgcache[id]);
	}
};

Utility.getTouchPos = function(touch, canvas) {
	var rect = canvas.getBoundingClientRect();
	var windowhandle = $(window);
	return {
		x: touch.clientX - rect.left,
		y: touch.clientY - rect.top
	};
};
Utility.getMousePos = function(event, canvas) {
	var rect = canvas.getBoundingClientRect();
	var windowhandle = $(window);
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
};

Utility.isTouchDevice = function() {
	return ('ontouchstart' in document.documentElement);
}
