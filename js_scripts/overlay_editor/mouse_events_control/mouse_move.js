function imageEditorMouseMove(event) {
	if (GLOBAL.overlay_editor.image_editor_drag != null) {
		
		if (GLOBAL.overlay_editor.image_editor_drag.dragging == false) {
			
			// create draggable ui indicator element
			Select('#body', {
				children: [
					Create('div', {
						id: 'drag_clone',
						style: {
							width: event.target.offsetWidth+'px',
							height: event.target.offsetHeight+'px'
						}
					})
				]
			});
			GLOBAL.overlay_editor.image_editor_drag.dragging = true;
		}
		
		// update drag clone location
		Select('#drag_clone', {
			style: {
				top: event.clientY+'px',
				left: event.clientX+'px'
			}
		});
		
		// layer drag border indicator
		if (targetIsLayerElem(event.target)) {
			// reset past drop element border
			Select('#'+GLOBAL.overlay_editor.image_editor_drag.active_hover).style.borderTop = '';
			// set new drop element
			event.target.style.borderTop = '4px solid #0469e2';
			GLOBAL.overlay_editor.image_editor_drag.active_hover = event.target.id;
		}
		
	} else if (GLOBAL.overlay_editor.layer_selection_drag) {
		
		// cursor move layer and reprint
		let x_diff = (GLOBAL.overlay_editor.layer_selection_drag.origin.x - event.clientX)/GLOBAL.overlay_editor.scale;
		let y_diff = (GLOBAL.overlay_editor.layer_selection_drag.origin.y - event.clientY)/GLOBAL.overlay_editor.scale;
		
		// drag hotkeys
		// ctrl - allow vertical only
		// shift - allow horizontal only
		if (GLOBAL.held_keys.ctrl) {
			x_diff = 0;
		}
		if (GLOBAL.held_keys.shift) {
			y_diff = 0;
		}
		
		// set reference incase of sub layer movement
		let selection_layer_reference = getLayerById(GLOBAL.overlay_editor.active_layer);
		
		// group movement
		if (selection_layer_reference.type == 'clip_path') {
			for (let i=0; i<selection_layer_reference.layers.length; i++) {
				let group_move_layer = selection_layer_reference.layers[i];
				let assoc_origin = GLOBAL.overlay_editor.layer_selection_drag.sub_layer_origins[i];
				group_move_layer.offset = {
					x: preciseAndTrim(assoc_origin.x - x_diff),
					y: preciseAndTrim(assoc_origin.y - y_diff)
				}
			}
		}

		// if custom clip path, move all points
		if (selection_layer_reference.type == 'clip_path' && selection_layer_reference.clip_path.type == 'custom') {
			for (let i=0; i<selection_layer_reference.clip_path.clip_points.length; i++) {
				let origin = GLOBAL.overlay_editor.layer_selection_drag.custom_clip_path_origins[i];
				selection_layer_reference.clip_path.clip_points[i] = {
					x: preciseAndTrim(origin.x - x_diff),
					y: preciseAndTrim(origin.y - y_diff)
				}
			}
		}
		
		// if group container, change reference for container movement
		if (selection_layer_reference.type == 'clip_path' && selection_layer_reference.clip_path.type == 'square') {
			selection_layer_reference = selection_layer_reference.clip_path;
		}
		
		// if a moveable layer
		if (GLOBAL.overlay_editor.layer_selection_drag.layer_origin.x != null) {
			selection_layer_reference.offset = {
				x: preciseAndTrim(GLOBAL.overlay_editor.layer_selection_drag.layer_origin.x - x_diff),
				y: preciseAndTrim(GLOBAL.overlay_editor.layer_selection_drag.layer_origin.y - y_diff)
			}
		}
		
		printCurrentCanvas();
		
	} else if (GLOBAL.overlay_editor.canvas_window.origins) {
		
		// project drag
		GLOBAL.overlay_editor.canvas_window.x = GLOBAL.overlay_editor.canvas_window.origins.x - event.clientX;
		GLOBAL.overlay_editor.canvas_window.y = GLOBAL.overlay_editor.canvas_window.origins.y - event.clientY;
		printCurrentCanvas();
		
	} else if (GLOBAL.overlay_editor.custom_clip_path.drag_point) {
		
		// translate window cursor position to canvas position
		let translate_cursor = translateWindowToCanvas(event.clientX, event.clientY);
		
		// custom clip path point drag
		let layer = getLayerById(GLOBAL.overlay_editor.active_layer);
		layer.clip_path.clip_points[GLOBAL.overlay_editor.custom_clip_path.drag_point.index] = {
			x: GLOBAL.overlay_editor.custom_clip_path.drag_point.origin.x - (GLOBAL.overlay_editor.custom_clip_path.drag_point.cursor_origin.x - translate_cursor.x),
			y: GLOBAL.overlay_editor.custom_clip_path.drag_point.origin.y - (GLOBAL.overlay_editor.custom_clip_path.drag_point.cursor_origin.y - translate_cursor.y)
		}
		printCurrentCanvas();
		
	}
	
}