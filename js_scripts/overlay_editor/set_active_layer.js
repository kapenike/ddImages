function setActiveLayer(index) {
	
	// set active layer index
	GLOBAL.overlay_editor.active_layer = index;
	
	// print new canvas to use selection region on the new active layer
	printCurrentCanvas();
	
	// setup new layer info UI for active layer (edit layer details)
	setupLayerInfoEditor();
	
	// generate new layers UI with active layer selected
	setupLayersUI();
	
}