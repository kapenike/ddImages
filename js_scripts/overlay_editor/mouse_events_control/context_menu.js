function imageEditorMouseCTX(event) {
	
	// if active layer is a custom clip path and target is the editor window
	/*if (GLOBAL.overlay_editor.active_layer != null && getLayerById(GLOBAL.overlay_editor.active_layer).clip_path.type == 'custom' && event.target.id == 'workspace') {
		console.log('here');
		event.preventDefault();
	}*/
	
	// if not a layer element, prevent context menu click
	if (!targetIsLayerElem(event.target)) {
		event.preventDefault();
	}
	
}