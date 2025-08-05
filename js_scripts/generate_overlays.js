// accepts list of data sources that have been changed to determine what overlays to regenerate, send null to generate all and set source paths
function generateStreamOverlays(sources = null, callback = () => {}) {

	// stash overlay keys for itteration use
	let overlay_keys = Object.keys(GLOBAL.active_project.overlays);

	// if no overlays, straight to callback
	if (overlay_keys.length == 0) {
		callback();
		return;
	}
	
	// if sources is null, or an object, set GLOBAL flag to regenerate sources
	if (sources == null || isObject(sources)) {
		GLOBAL.generate_sources = true;
	}
	
	// pre-initialize ajax loader for overlay generation (useVRAM may stall the loader)
	ajaxInitLoader('body');
	
	// overlay output, prepared as ready to send form object
	let output_overlays = {
		application: 'export_overlays',
		uid: GLOBAL.active_project.uid,
		changed: []
	};
	
	// loop currents overlay keys and detect which to update based on sources change
	overlay_keys.forEach(slug => {
		
		// current overlay
		let overlay = GLOBAL.active_project.overlays[slug];

		// if overlay contains an updated source, or sources is null, or is set to generate specific overlay
		if (sources == null || (isObject(sources) && sources.slug == slug) || (overlay.sources.length > 0 && sources.length > 0 && overlay.sources.some(x => sources.includes(x)))) {
			
			// define output canvas
			let canvas = Create('canvas', {
				width: overlay.dimensions.width,
				height: overlay.dimensions.height
			});
			
			// canvas context
			let ctx = canvas.getContext('2d');
			
			// use top-down baseline for easier reference during data output from .psd
			ctx.textBaseline = 'top';
			
			// if global flag, reset overlay sources
			if (GLOBAL.generate_sources == true) {
				GLOBAL.active_project.overlays[slug].sources = [];
				
				// also stash overlay slug for when layer inserts new sources
				GLOBAL.active_overlay_slug = slug;
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

function generateOverlay(ctx, output_overlays, overlay) {
	
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
			
			if (toggleTrue(layer)) {
				
				// square clipping path
				if (layer.clip_path.type == 'square') {
					ctx.beginPath();
					ctx.moveTo(layer.clip_path.offset.x, layer.clip_path.offset.y);
					ctx.lineTo(layer.clip_path.offset.x, layer.clip_path.offset.y + layer.clip_path.dimensions.height);
					ctx.lineTo(layer.clip_path.offset.x + layer.clip_path.dimensions.width, layer.clip_path.offset.y + layer.clip_path.dimensions.height);
					ctx.lineTo(layer.clip_path.offset.x + layer.clip_path.dimensions.width, layer.clip_path.offset.y);
					ctx.lineTo(layer.clip_path.offset.x, layer.clip_path.offset.y);
					ctx.closePath();
					if (layer.clip_path.color) {
						let clip_color = getRealValue(layer.clip_path.color);
						if (clip_color.length == 7 || clip_color.length == 9) {
							ctx.fillStyle = clip_color;
							ctx.fill();
						}
					}
					if (layer.clip_path.border.use) {
						ctx.setLineDash([]);
						ctx.strokeStyle = layer.clip_path.border.color;
						ctx.lineWidth = layer.clip_path.border.width;
						ctx.stroke();
					}
					ctx.save();
					ctx.clip();
				}
				
				// print sub layers
				for (let i2=layer.layers.length-1; i2>-1; i2--) {
					let sub_layer = layer.layers[i2];
					if (sub_layer.type == 'image') {
						printImage(ctx, sub_layer);
					} else if (sub_layer.type == 'text') {
						printText(ctx, sub_layer);
					} else if (sub_layer.type == 'rect') {
						printRect(ctx, sub_layer);
					}
				} 
				
				// if clipping path, restore
				if (layer.clip_path.type != 'none') {
					ctx.restore();
				}
				
			}
			
		} else if (layer.type == 'rect') {
			printRect(ctx, layer);
		}
		
	}
	
}

function toggleTrue(layer) {
	
	// if toggle undefined, toggle is true
	if (typeof layer.toggle === 'undefined') {
		return true;
	} else {
		
		// check for comparison
		let comparitor_index = layer.toggle.indexOf('$/var$=$var$');
		if (comparitor_index > -1) {
			
			// split and compare real values of comparison
			let comp_split = layer.toggle.split('$/var$=$var$');
			if (getRealValue(comp_split[0]+'$/var$') == getRealValue('$var$'+comp_split[1])) {
				return true;
			}
			
		} else {
			
			let value = getRealValue(layer.toggle);
			// check truthfulness of toggle value
			if (value || value === '0' || value === 0 || layer.toggle == '') {
				return true;
			}
			
		}
		
	}
	
	return false;
	
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
			ctx.fillStyle = getRealValue(layer.style.fill);
			ctx.fill();
		}
		
		// border
		if (layer.style.border) {
			ctx.strokeStyle = getRealValue(layer.style.border);
			ctx.lineWidth = layer.style.border_width ?? 1;
			ctx.stroke();
		}
		
	}
	
}

function printImage(ctx, layer) {

	// get real source
	let value = getRealValue(layer.value);
	
	// if layer toggle and value not falsey and is an actual image, draw image
	if (toggleTrue(layer) && value && value.source && (value.source instanceof ImageBitmap || value.source instanceof HTMLImageElement)) {
		
		let output_width = value.width;
		let output_height = value.height;
		
		// determine if scaling of original image based on layer is needed
		let width_scale = layer.dimensions.width != '' && layer.dimensions.width != null;
		let height_scale = layer.dimensions.height != '' && layer.dimensions.height != null;
		if (width_scale || height_scale) {
			if (width_scale && height_scale) {
				// if both scaling
				output_width = layer.dimensions.width;
				output_height = layer.dimensions.height;
			} else if (width_scale) {
				// if only scaling width
				output_width = layer.dimensions.width;
				output_height = (layer.dimensions.width / value.width) * output_height;
			} else if (height_scale) {
				// if only scaling height
				output_height = layer.dimensions.height;
				output_width = (layer.dimensions.height / value.height) * output_width;
			}
		}
		
		ctx.drawImage(
			value.source,
			layer.offset.x + parseInt(value.offset_x),
			layer.offset.y + parseInt(value.offset_y),
			output_width,
			output_height
		);
	}
}

function printText(ctx, layer) {
	ctx.font = layer.style.fontStyle+' '+layer.style.fontWeight+' '+layer.style.fontSize+layer.style.fontMeasure+' '+layer.style.font;
	ctx.fillStyle = getRealValue(layer.style.color);
	
	// default align left
	let align_type = layer.style.align ?? 'left';
	ctx.textAlign = align_type;
	
	// get real value
	let value = getRealValue(layer.value);
	
	// if not a string, exit
	if (typeof value !== 'string') {
		return;
	}
	
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