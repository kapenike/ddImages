function eventWithinActiveSelection(translate_cursor, override_active_selection = null) {
	
	let temp_selection = override_active_selection ? override_active_selection : GLOBAL.overlay_editor.active_layer_selection;
	
	// if active selection
	if (temp_selection) {

		// if rotated layer, rotate cursor position in the opposite direction around the origin
		if (temp_selection.rotation) {
			let rotated = rotate(
				translate_cursor.x,
				translate_cursor.y,
				temp_selection.rotation_origin.x,
				temp_selection.rotation_origin.y,
				temp_selection.rotation
			);
			translate_cursor.x = rotated.x;
			translate_cursor.y = rotated.y;
		}
		
		if (
			(temp_selection.custom_clip_path && eventWithinPolygon(translate_cursor, temp_selection.points)) ||
			(typeof temp_selection.custom_clip_path == 'undefined' &&
			translate_cursor.x > temp_selection.x &&
			translate_cursor.y > temp_selection.y &&
			translate_cursor.x < temp_selection.x + temp_selection.width &&
			translate_cursor.y < temp_selection.y + temp_selection.height)
		) {
			return true;
		}
		
	}
	
	return false;
}