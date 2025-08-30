function printCurrentCanvas() {
	
	let ctx = GLOBAL.overlay_editor.ctx;
	let overlay = GLOBAL.overlay_editor.current;
	ctx.textBaseline = 'top';
	
	// reset canvas
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, GLOBAL.overlay_editor.dimensions.width, GLOBAL.overlay_editor.dimensions.height);
	
	// set print from location to scaled down area start
	ctx.translate(
		(GLOBAL.overlay_editor.dimensions.width/2) - ((GLOBAL.overlay_editor.current.dimensions.width/2)*GLOBAL.overlay_editor.scale) - GLOBAL.overlay_editor.canvas_window.x,
		(GLOBAL.overlay_editor.dimensions.height/2) - ((GLOBAL.overlay_editor.current.dimensions.height/2)*GLOBAL.overlay_editor.scale) - GLOBAL.overlay_editor.canvas_window.y
	);
	
	// scale canvas
	ctx.scale(GLOBAL.overlay_editor.scale, GLOBAL.overlay_editor.scale);
	
	// print backdrop over current overlay size
	ctx.fillStyle = '#555555';
	ctx.fillRect(0, 0, GLOBAL.overlay_editor.current.dimensions.width, GLOBAL.overlay_editor.current.dimensions.height);
	
	let selection_layer = null;
	
	// loop layers from back to front
	for (let i=overlay.layers.length-1; i>-1; i--) {
		
		// active layer
		let layer = overlay.layers[i];
		
		// current selection layer
		if (i == GLOBAL.overlay_editor.active_layer) {
			selection_layer = layer;
		}
		
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
					
					// current selection layer
					if (i+'_'+i2 == GLOBAL.overlay_editor.active_layer) {
						selection_layer = sub_layer;
					}
					
					if (sub_layer.type == 'image') {
						printImage(ctx, sub_layer);
					} else if (sub_layer.type == 'text') {
						printText(ctx, sub_layer);
					}
				} 
				
				// if clipping path, restore
				if (layer.clip_path.type != 'none') {
					ctx.restore();
				}
				
			}
			
		}
		
	}
	
	// active layer indicator
	if (selection_layer != null) {
		
		let out_dim = getLayerOutputDimensions(selection_layer);

		if (out_dim != null) {
			ctx.lineWidth = 2;
			ctx.setLineDash([6, 8]);
			ctx.strokeStyle = '#0051ff';
			
			if (selection_layer.type == 'text' && selection_layer.style.rotation && selection_layer.style.rotation != 0) {
				ctx.save();
				let alignment_offset = (
					selection_layer.style.align == 'center' 
						? out_dim.width/2
						: (selection_layer.style.align == 'right'
							? out_dim.width
							: 0
							)
				);
				ctx.translate(out_dim.x + alignment_offset, out_dim.y);
				ctx.rotate(degToRad(selection_layer.style.rotation));
				ctx.strokeRect(0 - alignment_offset, 0, out_dim.width, out_dim.height);
				ctx.restore();
				out_dim.rotation = selection_layer.style.rotation;
				out_dim.rotation_origin = {
					x: out_dim.x + alignment_offset,
					y: out_dim.y
				};
			} else {
				ctx.strokeRect(out_dim.x, out_dim.y, out_dim.width, out_dim.height);
			}
			
			// save selection area for dragging logic
			GLOBAL.overlay_editor.active_layer_selection = out_dim;
		} else {
			GLOBAL.overlay_editor.active_layer_selection = null;
		}
	}
	
}