function imageEditorMouseUp(event) {
	if (GLOBAL.overlay_editor.image_editor_drag != null) {
		if (GLOBAL.overlay_editor.image_editor_drag.dragging == true) {
			if (GLOBAL.overlay_editor.image_editor_drag.id != GLOBAL.overlay_editor.image_editor_drag.active_hover) {
				
				let drag_layer = getLayerById(GLOBAL.overlay_editor.image_editor_drag.id);
				let hover_layer = getLayerById(GLOBAL.overlay_editor.image_editor_drag.active_hover);
				
				// ensure drag is not a drop into a group
				if (
					drag_layer.type == 'clip_path' &&
					(
						(hover_layer.type == 'clip_path' && event.target.className.split(' ').includes('editor_layer_group')) ||
						GLOBAL.overlay_editor.image_editor_drag.active_hover.split('_').filter(v => v != 'layer').length > 1
					)
				) {
					
					// not allowed
					
				} else {
					
					// if hover target is an empty layer group area, append sub layer id to mock an insert
					if (event.target.className.split(' ').includes('editor_layer_group')) {
						GLOBAL.overlay_editor.image_editor_drag.active_hover += '_0';
					}
					
					// insert into group and pull from group flags
					let insert_to_group = false;
					let pull_from_group = false;
					
					// set insert to group flag and prepare ids
					let insert_ids = GLOBAL.overlay_editor.image_editor_drag.active_hover.split('_');
					insert_ids.shift();
					if (insert_ids.length == 2) {
						insert_ids.map(v => parseInt(v));
						insert_to_group = true;
					}
					
					// set pull from group flag and prepare ids
					let pull_ids = GLOBAL.overlay_editor.image_editor_drag.id.split('_');
					pull_ids.shift();
					if (pull_ids.length == 2) {
						pull_ids.map(v => parseInt(v));
						pull_from_group = true;
					}
					
					let insert_index = insert_ids.length > 1 ? insert_ids[1] : insert_ids[0];
					let pull_index = pull_ids.length > 1 ? pull_ids[1] : pull_ids[0];
					
					let pull_base = GLOBAL.overlay_editor.current;
					if (pull_from_group) {
						pull_base = pull_base.layers[pull_ids[0]];
					}

					// if pull from index is less than insert index, and not in groups or within the same group, decrement insert index because of splice index change to array
					if (
						(!insert_to_group && !pull_from_group && pull_ids[0] < insert_ids[0]) ||
						(insert_to_group && pull_from_group && pull_ids[0] == insert_ids[0] && pull_ids[1] < insert_ids[1])
					) {
						insert_index--;
					} else if (insert_to_group && !pull_from_group && pull_ids[0] < insert_ids[0]) {
						// if pulling from non group into insert group after, group index needs decremented
						insert_ids[0]--;
					}
					
					if (insert_to_group) {
						let pulled = pull_base.layers.splice(pull_index, 1);
						GLOBAL.overlay_editor.current.layers[insert_ids[0]].layers.splice(insert_index, 0, ...pulled);
					} else {
						GLOBAL.overlay_editor.current.layers.splice(insert_index, 0, ...pull_base.layers.splice(pull_index, 1));
					}
					
					// set new active layer
					setActiveLayer(insert_ids.join('_'));
					
				}
			}
			
			// remove drag clone
			Select('#drag_clone').remove();
			
		}
		
		// reset drag state
		GLOBAL.overlay_editor.image_editor_drag = null;
		
	} else if (GLOBAL.overlay_editor.layer_selection_drag) {
		
		// end cursor drag
		GLOBAL.overlay_editor.layer_selection_drag = null;
		setupLayerInfoEditor();
		
	} else if (GLOBAL.overlay_editor.canvas_window.origins != null) {
		
		// reset project drag
		GLOBAL.overlay_editor.canvas_window.origins = null;
		
	} else if (GLOBAL.overlay_editor.custom_clip_path.drag_point != null) {
		
		// reset custom clip path point drag
		GLOBAL.overlay_editor.custom_clip_path.drag_point = null;
		
	}
}