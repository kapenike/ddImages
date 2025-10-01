function legacyLayerCheck() {
	
	// get default layer object for all types
	let default_layers = {
		text: requestNewLayer('text'),
		image: requestNewLayer('image'),
		clip_path: requestNewLayer('clip_path')
	};
	
	// loop all overlay layers and update any missing structure keys
	Object.keys(GLOBAL.active_project.overlays).forEach(overlay => {
		loopLayerUpdate(GLOBAL.active_project.overlays[overlay].layers, default_layers);
	});
	
}

function loopLayerUpdate(layers, default_layers) {
	
	layers.forEach((layer, index) => {
		
		if (layer.type == 'clip_path') {
			
			loopLayerUpdate(layer.layers, default_layers);
			
		}
		
		checkAndUpdateLegacyObject(layer, default_layers[layer.type]);
		
	});
	
}

function checkAndUpdateLegacyObject(obj, def) {
	
	Object.keys(def).forEach(key => {
		
		if (typeof obj[key] === 'undefined') {
			
			obj[key] = def[key];
			
		} else if (isObject(def[key])) {
			
			checkAndUpdateLegacyObject(obj[key], def[key]);
			
		}
		
	});
	
}