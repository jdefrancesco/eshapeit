

// MainGame is a singleton used to control the game
var MainGame = (function(){
	var CANVAS_ID = 'gameCanvas';
	var canvas;
	var ctx;
	
	// SHAPE ADDING FUNCTION
	var addShapesFunctions = {
	
		oneShape: function() {
			if( entities.shapes.length === 0 ) {
				addShape();
			}
		},
		
		fiveShapes: function() {
			while( entities.shapes.length < 5 ) {
				addShape();
			}
		}
	
	}
	
	// SHAPE GENERATION FUNCTIONS
	var shapeGenerationFunctions = {
	
		generateCircle: function() {
			var type = 'circle';
			//radius is a percentage of the edge length, divided by two so that it does not cover the canvas
			var radius = Math.randomRange(0.0,0.5,true) * canvas.width;
			var color = [Math.randomRange(0,255),Math.randomRange(0,255),Math.randomRange(0,255)];
			var speed = Math.randomRange(0.001,0.02,true);
			var pos = currentPositioningFunc(radius);
			
			return {pos:pos,radius:radius,color:color,speed:speed,type:type};
		}
		
	};
	
	// SHAPE POSITIONING FUNCTIONS
	// These all must return an edge (0,1,2,3) and a position 0.0 to 1.0
	var shapePositioningFunctions = {
	
		randomEdge: function(radius) {
			return {edge:Math.randomRange(0,3),pos:Math.random(),distance:-radius};
		}
		
	};
	
	// TODO: remove settings
	var currentAddShapesFunc = addShapesFunctions.fiveShapes;
	var currentShapeFunc = shapeGenerationFunctions.generateCircle;
	var currentPositioningFunc = shapePositioningFunctions.randomEdge;
	
	var gLoopTimeout;
	var started = false;
	var paused = false;
	
	var entities;
	
	var gameLoop = function(){  
		clear();  
		moveShapes();  
		drawShapes(); 
		if( started  && !paused ) {
			gLoopTimeout = setTimeout(gameLoop, 1000 / 50);  
		}
	}  
	
	function reset() {
		entities = {shapes:[]};
	}
	
	function init() {
		reset();
		
		canvas = document.getElementById(CANVAS_ID);
		ctx = canvas.getContext('2d');
		ctx.globalCompositeOperation = 'lighter';
		
		currentAddShapesFunc();
	}
	
	function start() {
		if( started ) {
			if( !gLoopTimeout ) {
				gameLoop();
			}
		} else {
			started = true;
			paused = false;
			init();
			gameLoop();
		}
	}

	function pause() {
		paused = true;
		clearTimeout(gLoopTimeout);
	}
	
	function stop() {
		pause();
	}
	
	function clear() {
		 ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	
	function addShape() {
		entities.shapes.push(currentShapeFunc());
	}
	
	function removeShape(index) {
		entities.shapes.splice(index,1);
	}
	
	function moveShapes() {
		var shapes = entities.shapes;
		for( var s = 0; s < shapes.length; ++s ) {
			var shape = shapes[s];
			shape.pos.distance += shape.speed * canvas.width;
			if( shape.pos.distance - shape.radius > (shape.pos.edge == 1 || shape.pos.edge == 3 ? canvas.width : canvas.height) ) {
				removeShape(s);
			}
		}
		
		currentAddShapesFunc();
	} 
	
	function drawShapes() {
		var shapes = entities.shapes;
		for( var s = 0; s < shapes.length; ++s ) {
			var shape = shapes[s];
			
			//find the shapes center in canvas coordinates
			var center = {};
			switch(shape.pos.edge) {
				case 0:
					center.x = canvas.width * shape.pos.pos;
					center.y = shape.pos.distance;
					break;
				case 1:
					center.y = canvas.height * shape.pos.pos;
					center.x = canvas.width - shape.pos.distance;
					break;
				case 2:
					center.x = canvas.width * shape.pos.pos;
					center.y = canvas.height - shape.pos.distance;
					break;
				case 3:
					center.y = canvas.height * shape.pos.pos;
					center.x = shape.pos.distance;
					break;
				default:
					gameObject.stop();
					alert('GAME ERROR: an invalid edge was supplied');
					return;
					break;
			}
			
			//set fill color
			var fillColor = 'rgb(' + shape.color.join(',') + ')';
			ctx.fillStyle = fillColor;
			
			switch( shape.type ) {
				case 'circle':
					ctx.beginPath();
					ctx.arc(center.x,center.y,shape.radius,0,2*Math.PI,true);
					ctx.fill();
					ctx.closePath();
					break;
				default:
					gameObject.stop();
					alert('GAME ERROR: an invalid shape type was supplied');
					return;
					break;
			}
			
		}
	}
	
	// gameObject is the exposed API for the game
	var gameObject = {
		start:start,
		pause:pause,
		stop: stop
	}
	
	// start the game loop automatically
	$(document).ready(function(){
		gameObject.start();
	});
	
	return gameObject;
}());	

// Add the randRange function to Math
Math.randomRange = function(from, to, isFloat){
    return isFloat ? Math.random() * (to - from) + from : Math.floor(Math.random() * (to - from + 1) + from);
}