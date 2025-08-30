function setupScalingFactor() {
	if (GLOBAL.overlay_editor.current.dimensions.width > GLOBAL.overlay_editor.dimensions.width) {
		GLOBAL.overlay_editor.scale = GLOBAL.overlay_editor.dimensions.width / GLOBAL.overlay_editor.current.dimensions.width;
	} else if (GLOBAL.overlay_editor.current.dimensions.height > GLOBAL.overlay_editor.dimensions.height) {
		GLOBAL.overlay_editor.scale = GLOBAL.overlay_editor.dimensions.height / GLOBAL.overlay_editor.current.dimensions.width;
	}
}