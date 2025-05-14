// accepts list of data sources that have been changed to determine what overlays to regenerate, send null to generate all and set source paths
function generateStreamOverlays(sources = null, callback = () => {}) {
	
	// if sources is null, set GLOBAL flag to regenerate sources
	if (sources == null) {
		GLOBAL.generate_sources = true;
	}
	
	// pre-initialize ajax loader for overlay generation (useVRAM may stall the loader)
	ajaxInitLoader('body');
	
	// define output canvas
	let canvas = Create('canvas', {
		width: 1920,
		height: 1080
	});
	
	// canvas context
	let ctx = canvas.getContext('2d');
	
	// use top-down baseline for easier reference during data output from .psd
	ctx.textBaseline = 'top';
	
	// overlay output, prepared as ready to send form object
	let output_overlays = {
		application: 'export_overlays',
		uid: GLOBAL.active_tournament.uid,
		changed: []
	};
	
	// loop currents overlays and detect which to update based on sources change
	GLOBAL.active_tournament.overlays.forEach((overlay, overlay_index) => {

		// if overlay contains an updated source, or sources is null
		if (sources == null || overlay.sources.some(x => sources.includes(x))) {
			
			// if global flag, reset overlay sources
			if (GLOBAL.generate_sources == true) {
				GLOBAL.active_tournament.overlays[overlay_index].sources = [];
				
				// also stash overlay index for when layer inserts new sources
				GLOBAL.active_overlay_index = overlay_index;
			}
		
			// log overlay slug for capture with PHP
			output_overlays.changed.push(overlay.slug);
			
			// generate overlay
			generateOverlay(ctx, output_overlays, overlay);
			
			// save generated overlay as base64 encoded string, referenced by its slug for lookup using $_POST[slug] and array log of changed slugs
			// !!ISSUE[1]: base 64 png is ~30% larger than a binary png ... find a way to convert and append as a file to form object to save on write time
			//		- worth problem solving if the host runs this application on a USB drive
			output_overlays[overlay.slug] = canvas.toDataURL('image/png');
			
		}
		
	});
	
	// reset generate sources global flag
	if (GLOBAL.generate_sources == true) {
		GLOBAL.generate_sources = false;
	}

	// if nothing to change, remove loader
	if (output_overlays.changed.length == 0) {
		
		ajaxRemoveLoader('body');
		
	} else {

		// pass output_overlays object to PHP for file write
		ajax('POST', '/requestor.php', output_overlays, callback, 'body');
		
	}
	
}

function generateOverlay(ctx, output_overlays, overlay, overlay_index) {
	
	// reset canvas
	ctx.clearRect(0, 0, 1920, 1080);
	
	// loop layers from back to front
	for (let i=overlay.layers.length-1; i>-1; i--) {
		
		// active layer
		let layer = overlay.layers[i];
		
		if (layer.type == 'image') {
			printImage(ctx, layer);
		} else if (layer.type == 'text') {
			printText(ctx, layer);
		} else if (layer.type == 'clip_path') {
			manageClipPath(ctx, layer);
		} else if (layer.type == 'rect') {
			printRect(ctx, layer);
		}
		
	}
	
}

function isPathVariable(value) {
	return typeof value === 'string' && value[0] == '$' && value.slice(-1) == '$';
}

function getRealValue(value, depth = null) {
	
	// detect if value is a path variable
	if (isPathVariable(value)) {
		
		// remove path delimiters
		let path = value.slice(1, -1);
		
		// if global flag, add variable path to overlay sources
		if (GLOBAL.generate_sources == true) {
			GLOBAL.active_tournament.overlays[GLOBAL.active_overlay_index].sources.push(value);
		}
		
		// split path
		path = path.split('/');
		
		// path base reference
		let reference_path = GLOBAL.active_tournament.data;
		
		// pull from use path
		while (path.length > 0) {
			
			// shift from use path into reference path
			reference_path = reference_path[path.shift()];
			
		}
		
		// if depth is not null, reduce depth until it is 0, then return the reference path rather than chaining to final real value
		if (depth != null) {
			depth -= 1;
			if (depth == 0) {
				return reference_path;
			}
		}
		
		// run final reference path value through getRealValue until a real value is spit out (variable chaining)
		return getRealValue(reference_path, depth);
	}
	
	// if not a variable, return value
	return value;
}

function setRealValue(string_path, value) {
	
	// remove path delimiters
	let path = string_path.slice(1, -1);
	
	// split path
	path = path.split('/');
	
	// path base reference
	let reference_path = GLOBAL.active_tournament.data;
	
	// pull from use path until only one path directory is left
	while (path.length > 1) {
		
		// shift from use path into reference path
		reference_path = reference_path[path.shift()];
		
	}

	// set passed value as reference path value using last available parent (js reference things)
	reference_path[path.shift()] = value;

}

function toggleTrue(layer) {
	
	// if toggle undefined, toggle is true
	if (typeof layer.toggle === 'undefined') {
		return true;
	} else {
		
		// check for comparison
		let comparitor_index = layer.toggle.indexOf('$=$');
		if (comparitor_index > -1) {
			
			// split and compare real values of comparison
			let comp_split = layer.toggle.split('$=$');
			if (getRealValue(comp_split[0]+'$') == getRealValue('$'+comp_split[1])) {
				return true;
			}
			
		} else {
			
			let value = getRealValue(layer.toggle);
			// check truthfulness of toggle value
			if (value || value === '0' || value === 0) {
				return true;
			}
			
		}
		
	}
	
	return false;
	
}

function manageClipPath(ctx, layer) {
	
	// set or remove a clip path
	if (layer.action == 'end') {
		ctx.restore();
	} else if (layer.action == 'start') {
		ctx.beginPath();
		let next = 0;
		for (let i=0; i<layer.path.length; i++) {
			next = i+1;
			if (next == layer.path.length) {
				next = 0;
			}
			if (i == 0) {
				ctx.moveTo(layer.path[i].x, layer.path[i].y);
			}
			ctx.lineTo(layer.path[next].x, layer.path[next].y);
		}
		ctx.closePath();		
		ctx.save();
		ctx.clip();
	}
	
}

function printRect(ctx, layer) {
	
	if (toggleTrue(layer)) {
		
		// use path for fillRect so a border can be applied
		ctx.beginPath();
		ctx.moveTo(layer.offset.x, layer.offset.y);
		ctx.lineTo(layer.offset.x, layer.offset.y + layer.dimensions.height);
		ctx.lineTo(layer.offset.x + layer.dimensions.width, layer.offset.y + layer.dimensions.height);
		ctx.lineTo(layer.offset.x + layer.dimensions.width, layer.offset.y);
		ctx.lineTo(layer.offset.x, layer.offset.y);
		ctx.closePath();
		
		// fill
		if (layer.style.fill) {
			ctx.fillStyle = layer.style.fill;
			ctx.fill();
		}
		
		// border
		if (layer.style.border) {
			ctx.strokeStyle = layer.style.border;
			ctx.lineWidth = layer.style.border_width ?? 1;
			ctx.stroke();
		}
		
	}
	
}

function printImage(ctx, layer) {
	// get real source
	let value = getRealValue(layer.source);
	
	// if source not falsey, draw image
	if (value) {
		ctx.drawImage(
			value,
			layer.offset.x,
			layer.offset.y
		);
	}
}

function printText(ctx, layer) {
	ctx.font = layer.style.font;
	ctx.fillStyle = layer.style.color;
	
	// default align left
	let align_type = layer.style.align ?? 'left';
	ctx.textAlign = align_type;
	
	// get real value
	let value = getRealValue(layer.value);
	
	// caps
	if (layer.style.caps) {
		value = value.toUpperCase();
	}
	
	// if value not falsey (exluding 0), draw text
	if (toggleTrue(layer) && (value || value === 0 || value === '0')) {
		ctx.fillText(
			value,
			layer.offset.x,
			layer.offset.y,
			layer.dimensions.width
		);
	}
}