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
		if (sources == null || overlay.sources.filter(x => sources.includes(x)).length > 0) {
			
			// if global flag, reset overlay sources
			if (GLOBAL.generate_sources == true) {
				GLOBAL.active_tournament.overlays[overlay_index].sources = [];
			}
		
			// log overlay slug for capture with PHP
			output_overlays.changed.push(overlay.slug);
			
			// generate overlay
			generateOverlay(ctx, output_overlays, overlay, overlay_index);
			
			// save generated overlay as base64 encoded string, referenced by its slug for lookup using $_POST[slug] and array log of changed slugs
			// !!ISSUE[1]: base 64 png is ~30% larger than a binary png ... find a way to convert and append as a file to form object to save on write time
			//		- worth problem solving if the host runs this application on a USB drive
			output_overlays[overlay.slug] = canvas.toDataURL('image/png');
			
		}
		
	});

	// pass output_overlays object to PHP for file write
	ajax('POST', '/requestor.php', output_overlays, callback, 'body');
	
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
			printText(ctx, layer, overlay_index);
		}
		
	}
	
}

function printImage(ctx, layer) {
	ctx.drawImage(
		layer.source,
		layer.offset.x,
		layer.offset.y
	);
}

function printText(ctx, layer, parent_index) {
	ctx.font = layer.style.font;
	ctx.fillStyle = layer.style.color;
	
	// default align left
	let align_type = layer.style.align ?? 'left';
	ctx.textAlign = align_type;
	
	// text value output
	let value = layer.value;
	
	// detect if path variable
	if (value[0] == '$' && value.slice(-1) == '$') {
		
		// remove path delimiters
		let path = value.slice(1, -1);
		
		// if global flag, add path to overlay sources
		if (GLOBAL.generate_sources == true) {
			GLOBAL.active_tournament.overlays[parent_index].sources.push(path);
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
		
		// set value from final reference path
		value = reference_path;
	}
	
	// draw text
  ctx.fillText(
		value,
		layer.offset.x,
		layer.offset.y,
		layer.dimensions.width
	);
}