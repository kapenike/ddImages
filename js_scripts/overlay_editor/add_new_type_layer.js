// create a new layer of the given type, index passed from addNewLayer will determine its insert location
// boolian determines if the new layer will be duplcated from the layer at the specified index
function addNewTypeLayer(type, index, duplicate = false) {
	
	// new layer object container
	let new_layer = null;
	
	// if not a duplicate, generate a new layer object
	if (duplicate == false) {
	
		if (type == 'text') {
			
			// new TEXT layer
			new_layer = {
				type: 'text',
				toggle: '',
				title: 'Untitled Text Layer',
				value: '',
				style: {
					font: 'Arial',
					fontStyle: 'normal',
					fontWeight: '400',
					fontSize: '22',
					fontMeasure: 'px',
					color: '#000000',
					align: 'left',
					caps: false
				},
				offset: {
					x: GLOBAL.overlay_editor.current.dimensions.width/2,
					y: GLOBAL.overlay_editor.current.dimensions.height/2
				},
				dimensions: {
					width: 300
				}
			};
			
		} else if (type == 'image') {
			
			// new IMAGE layer
			new_layer = {
				type: 'image',
				toggle: '',
				title: 'Untitled Image Layer',
				value: '',
				offset: {
					x: GLOBAL.overlay_editor.current.dimensions.width/2,
					y: GLOBAL.overlay_editor.current.dimensions.height/2
				},
				dimensions: {
					width: '',
					height: ''
				}
			};
			
		} else if (type == 'clip_path') {
			
			// new GROUP layer (clip_path)
			new_layer = {
				type: 'clip_path',
				toggle: '',
				title: 'Untitled Group',
				clip_path: {
					type: 'none',
					color: '',
					offset: {
						x: GLOBAL.overlay_editor.current.dimensions.width/2,
						y: GLOBAL.overlay_editor.current.dimensions.height/2
					},
					dimensions: {
						width: 100,
						height: 100
					},
					border: {
						use: false,
						color: '',
						width: '2'
					},
					clip_points: []
				},
				layers: []
			};
		}
		
	} else {
		
		// if duplicate layer, detach reference from original and duplicate as current new layer, append duplicate to layer title
		new_layer = JSON.parse(JSON.stringify(getLayerById(index)));
		new_layer.title += ' (duplicate)';
		
	}
	
	// insert location
	if (index == null) {
		
		// if no index is specified, insert at the start of the layer list
		GLOBAL.overlay_editor.current.layers.unshift(new_layer);
		
		// set first layer (this) to be active
		setActiveLayer(0);
		
	} else {
		
		// if index insert specified
		
		// if index is a layer identifier
		if (index.toString().indexOf('_') > -1) {
			
			// get ids
			let ids = index.split('_').filter(x => x != 'layer');
			
			if (ids.length > 1) {
				
				// if sub layer, insert in sub group layers list
				GLOBAL.overlay_editor.current.layers[ids[0]].layers.splice(ids[1], 0, new_layer);
				
			} else {
				
				// insert in top layer list
				GLOBAL.overlay_editor.current.layers.splice(ids[0], 0, new_layer);
				
			}
			
		} else {
			
			// if not, just splice into list at index
			GLOBAL.overlay_editor.current.layers.splice(index, 0, new_layer);
			
		}
		
		// set layer at specified index as active (splice has pushed the new layer to the current insert index)
		setActiveLayer(index);
		
	}
	
	// remove new layer creation menu
	removeUIEditMenu();
	
}