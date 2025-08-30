// convert window mouse position to canvas position with offsets and scaling
function translateWindowToCanvas(x, y) {
	
	// get canvas dimensions and offset
	let canvas_elem = Select('#workspace');
	let canvas_dimensions = {
		offset_y: canvas_elem.getBoundingClientRect().top,
		width: canvas_elem.width,
		height: canvas_elem.height
	}
	
	// relate y to canvas origin
	y -= canvas_dimensions.offset_y;
	// relate y to translated origins within drawn canvas
	y -= (GLOBAL.overlay_editor.dimensions.height/2) - ((GLOBAL.overlay_editor.current.dimensions.height/2)*GLOBAL.overlay_editor.scale) - GLOBAL.overlay_editor.canvas_window.y;
	// scale y up for 1 to 1 in overlay comparison
	y = y/GLOBAL.overlay_editor.scale;
	
	// x already at canvas origin
	// relate x to translate origins within drawn canvas
	x -= (GLOBAL.overlay_editor.dimensions.width/2) - ((GLOBAL.overlay_editor.current.dimensions.width/2)*GLOBAL.overlay_editor.scale) - GLOBAL.overlay_editor.canvas_window.x;
	// scale x up for 1 to 1 in overlay comparison
	x = x/GLOBAL.overlay_editor.scale;
	
	return {
		x: x,
		y: y
	}
}