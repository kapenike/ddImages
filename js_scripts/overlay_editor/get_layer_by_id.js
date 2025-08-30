function getLayerById(id) {
	
	// strip layer pre-text from id and split by depth on _ char
	ids = id.toString().split('_').filter(v => v != 'layer');
	if (ids.length > 1) {
		// if multiple ids, access sub layer
		return GLOBAL.overlay_editor.current.layers[ids[0]].layers[ids[1]];
	} else {
		// top level layer access
		return GLOBAL.overlay_editor.current.layers[ids[0]];
	}
}
