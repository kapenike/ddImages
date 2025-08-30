function removeLayer(index) {
	
	// detect sub layer / layer removal and splice from correct list
	let ids = index.split('_').filter(x => x != 'layer');
	if (ids.length > 1) {
		GLOBAL.overlay_editor.current.layers[ids[0]].layers.splice(ids[1], 1);
	} else {
		GLOBAL.overlay_editor.current.layers.splice(ids[0], 1);
	}
	
	// set to no active layer
	setActiveLayer(null);
	
	// remove edit layer dialog
	removeUIEditMenu();
}