function getLayerById(id) {
	
	// strip layer pre-text from id and split by depth on _ char
	ids = id.toString().split('_').filter(v => v != 'layer');
	let layer = GLOBAL.overlay_editor.current;
	ids.forEach(id => {
		layer = layer.layers[id];
	});
	return layer;
}
