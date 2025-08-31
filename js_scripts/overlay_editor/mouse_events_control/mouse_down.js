function imageEditorMouseDown(event) {
	
	// translate window cursor position to canvas position
	let translate_cursor = translateWindowToCanvas(event.clientX, event.clientY);
	
	// check if point drag on custom clip path layer
	if (GLOBAL.overlay_editor.active_layer != null) {
		let layer = getLayerById(GLOBAL.overlay_editor.active_layer);
		if (layer.type == 'clip_path' && layer.clip_path.type == 'custom') {
			
			// check if event within point radius
			for (let i=0; i<layer.clip_path.clip_points.length; i++) {
				if (distance(translate_cursor.x, translate_cursor.y, layer.clip_path.clip_points[i].x, layer.clip_path.clip_points[i].y) <= 10) {
					GLOBAL.overlay_editor.custom_clip_path.drag_point = {
						index: i,
						origin: {
							x: layer.clip_path.clip_points[i].x,
							y: layer.clip_path.clip_points[i].y
						},
						cursor_origin: {
							x: translate_cursor.x,
							y: translate_cursor.y
						}							
					};
					
					// return and exit from remaining mouse down logic
					return;
				}
			}
			
		}
	}
	
	// init layer drag
	if (GLOBAL.overlay_editor.image_editor_drag == null && targetIsLayerElem(event.target)) {
		GLOBAL.overlay_editor.image_editor_drag = {
			id: event.target.id,
			elem: event.target,
			active_hover: event.target.id,
			dragging: false
		};
		return;
	} 

	// init canvas drags
	if (event.target.id == 'workspace') {
		
		// if active selection
		if (GLOBAL.overlay_editor.active_layer_selection) {

			// if rotated layer, rotate cursor position in the opposite direction around the origin
			if (GLOBAL.overlay_editor.active_layer_selection.rotation) {
				let rotated = rotate(
					translate_cursor.x,
					translate_cursor.y,
					GLOBAL.overlay_editor.active_layer_selection.rotation_origin.x,
					GLOBAL.overlay_editor.active_layer_selection.rotation_origin.y,
					GLOBAL.overlay_editor.active_layer_selection.rotation
				);
				translate_cursor.x = rotated.x;
				translate_cursor.y = rotated.y;
			}
			
			if (
				(GLOBAL.overlay_editor.active_layer_selection.custom_clip_path && eventWithinPolygon(translate_cursor, GLOBAL.overlay_editor.active_layer_selection.points)) ||
				(typeof GLOBAL.overlay_editor.active_layer_selection.custom_clip_path == 'undefined' &&
				translate_cursor.x > GLOBAL.overlay_editor.active_layer_selection.x &&
				translate_cursor.y > GLOBAL.overlay_editor.active_layer_selection.y &&
				translate_cursor.x < GLOBAL.overlay_editor.active_layer_selection.x + GLOBAL.overlay_editor.active_layer_selection.width &&
				translate_cursor.y < GLOBAL.overlay_editor.active_layer_selection.y + GLOBAL.overlay_editor.active_layer_selection.height)
			) {
				GLOBAL.overlay_editor.layer_selection_drag = {
					origin: {
						x: event.clientX,
						y: event.clientY
					},
					layer_origin: {
						x: GLOBAL.overlay_editor.active_layer_selection.layer_x,
						y: GLOBAL.overlay_editor.active_layer_selection.layer_y
					},
					sub_layer_origins: null
				}
				
				// if custom clip path, stash point origins
				if (GLOBAL.overlay_editor.active_layer_selection.custom_clip_path) {
					GLOBAL.overlay_editor.layer_selection_drag.custom_clip_path_origins = GLOBAL.overlay_editor.active_layer_selection.points;
				}
				
				// stash group layer children origins
				let layer = getLayerById(GLOBAL.overlay_editor.active_layer);
				if (typeof layer.clip_path !== 'undefined') {
					GLOBAL.overlay_editor.layer_selection_drag.sub_layer_origins = layer.layers.map(v => {
						return {
							x: v.offset.x,
							y: v.offset.y
						};
					});
				}
				
				// prevent canvas drag is selection drag true
				return;
			}
		}
		
		// init project drag
		GLOBAL.overlay_editor.canvas_window.origins = {
			x: GLOBAL.overlay_editor.canvas_window.x + event.clientX,
			y: GLOBAL.overlay_editor.canvas_window.y + event.clientY
		};
	
	}
	
}