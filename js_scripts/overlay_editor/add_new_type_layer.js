// new layer structure
function requestNewLayer(type = 'text') {
	
	// default x and y will not be defined during application legacy check init
	let x = 0;
	let y = 0;
	if (GLOBAL.overlay_editor.current) {
		x = GLOBAL.overlay_editor.current.dimensions.width/2;
		y = GLOBAL.overlay_editor.current.dimensions.height/2;
	}
	
	if (type == 'text') {

		// new TEXT layer
		return {
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
				x: x,
				y: y
			},
			dimensions: {
				width: 300
			}
		};
		
	} else if (type == 'image') {
		
		// new IMAGE layer
		return {
			type: 'image',
			toggle: '',
			title: 'Untitled Image Layer',
			value: '',
			effects: {
				grayscale: false
			},
			offset: {
				x: x,
				y: y
			},
			dimensions: {
				width: '',
				height: ''
			}
		};
		
	} else if (type == 'clip_path') {
		
		// new GROUP layer (clip_path)
		return {
			type: 'clip_path',
			toggle: '',
			title: 'Untitled Group',
			clip_path: {
				type: 'none',
				color: '',
				offset: {
					x: x,
					y: y
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
}



// create a new layer of the given type, index passed from addNewLayer will determine its insert location
// boolian determines if the new layer will be duplcated from the layer at the specified index
function addNewTypeLayer(type, index, duplicate = false) {
	
	// new layer object container
	let new_layer = null;
	
	// if not a duplicate, generate a new layer object
	if (duplicate == false) {
	
		new_layer = requestNewLayer(type);
		
	} else {
		
		// if duplicate layer, detach reference from original and duplicate as current new layer, append duplicate to layer title
		new_layer = JSON.parse(JSON.stringify(getLayerById(index)));
		new_layer.title += ' (duplicate)';
		
	}
	
	// insert location
	if (index == null) {
		
		// if no index is specified, insert at the start of the layer list
		GLOBAL.overlay_editor.current.layers.unshift(new_layer);
		
		// scroll to new insert
		Select('#lower_editor').scrollTop = 0;
		
		// set first layer (this) to be active
		setActiveLayer(0);
		
	} else {

		// get ids
		let ids = index.toString().split('_').filter(x => x != 'layer');
		
		// loop nested ids and splice after last
		let insert_layer = GLOBAL.overlay_editor.current.layers;
		for (let i=0; i<ids.length-1; i++) {
			insert_layer = insert_layer[ids[i]].layers;
		}
		insert_layer.splice(ids.pop(), 0, new_layer);
		
		// set layer at specified index as active (splice has pushed the new layer to the current insert index)
		setActiveLayer(index);
		
	}
	
	// remove new layer creation menu
	removeUIEditMenu();
	
}