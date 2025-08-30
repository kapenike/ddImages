// params: layer object, new position object
// moves sub layers of a clip path
function moveGroupLayer(layer, obj) {
	if (layer.type == 'clip_path') {
		let x_diff = 0;
		let y_diff = 0;
		if (layer.clip_path.type != 'none') {
			x_diff = typeof obj.x !== 'undefined' ? obj.x - layer.clip_path.offset.x : 0;
			y_diff = typeof obj.y !== 'undefined' ? obj.y - layer.clip_path.offset.y : 0;
		} else {
			let layer_dim = getLayerOutputDimensions(layer);
			x_diff = typeof obj.x !== 'undefined' ? obj.x - layer_dim.x : 0;
			y_diff = typeof obj.y !== 'undefined' ? obj.y - layer_dim.y : 0;
		}
		layer.layers.forEach(sub_layer => {
			sub_layer.offset.x += x_diff;
			sub_layer.offset.y += y_diff;
		});
		// if contains clip path, move clip path origin coords too
		if (layer.clip_path.type != 'none') {
			layer.clip_path.offset.x += x_diff;
			layer.clip_path.offset.y += y_diff;
		}
	}
}