function setupLayerInfoEditor() {
	
	// if no active layer, remove info instead
	if (GLOBAL.overlay_editor.active_layer == null) {
		Select('#upper_editor', {
			innerHTML: ''
		});
		return;
	}
	
	// get active layer as object
	let layer = getLayerById(GLOBAL.overlay_editor.active_layer);
	
	// generate UI for layer info edit
	Select('#upper_editor', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'editor_section_block',
				style: {
					marginTop: '6px',
					paddingTop: '6px'
				},
				children: [
					Create('div', {
						className: 'editor_section_title',
						innerHTML: 'Layer Title'
					}),
					Create('input', {
						type: 'text',
						value: layer.title,
						onkeyup: function () {
							getLayerById(GLOBAL.overlay_editor.active_layer).title = this.value;
							Select('#layer_'+GLOBAL.overlay_editor.active_layer+'_title').innerHTML = this.value;
							printCurrentCanvas();
						}
					})
				]
			}),
			Create('div', {
				className: 'editor_section_block',
				children: [
					Create('div', {
						className: 'editor_section_title',
						innerHTML: (layer.type != 'clip_path' ? 'Source and ' : '') + 'Toggle' // source setting only available for non clip_path types
					}),
					(layer.type == 'text'
						?	featureTextSource(layer) // source UI input for text layers
						: (layer.type == 'image'
								? featureImageSource(layer) // source UI input for images
								: Create('div')
							)
					),
					Create('span', {
						innerHTML: 'Toggle',
						className: 'editor_spanlabel',
						children: [
							Create('div', {
								id: 'toggle_condition',
								children: [handleToggleCondition(layer.toggle, true)]
							})
						]
					})
				]
			}),
			(layer.type == 'text' ? featureTextStyle(layer) : Create('div')), // text styling UI
			(layer.type == 'text' ? featureTextRotation(layer) : Create('div')), // text rotation UI
			(layer.type != 'clip_path' ? featureDimensionsAndPosition(layer) : Create('div')), // dimensions and position UI for non group layers
			(layer.type == 'clip_path' ? featureGroupLayerClipPath(layer) : Create('div')), // UI for selecting clip path type and clip region
			(layer.type == 'image' ? featureImageOrigins(layer) : Create('div')), // UI for changing position origins of image
			(layer.type == 'image' ? featureImageEffects(layer) : Create('div')), // UI for grayscaling an image
			Create('div', {
				className: 'editor_section_block',
				children: [
					Create('div', {
						className: 'editor_section_title',
						innerHTML: 'Flip Layer'
					}),
					Create('div', {
						style: {
							height: '4px'
						}
					}),
					Create('button', {
						type: 'button',
						innerHTML: 'Horizontally',
						onclick: function () {
							let layer = getLayerById(GLOBAL.overlay_editor.active_layer);
							layer = flipLayer(layer, 'horizontal');
							printCurrentCanvas();
						}
					}),
					Create('button', {
						type: 'button',
						innerHTML: 'Vertically',
						onclick: function () {
							let layer = getLayerById(GLOBAL.overlay_editor.active_layer);
							layer = flipLayer(layer, 'vertical');
							printCurrentCanvas();
						}
					})
				]
			})
		]
	});

}

// invert layer or layers across x or y axis
function flipLayer(layer, direction) {
	
	let d = direction == 'horizontal';
	
	if (layer.type == 'clip_path') {
		if (layer.clip_path.type == 'square') {
			if (d) {
				layer.clip_path.offset.x = (GLOBAL.overlay_editor.current.dimensions.width - layer.clip_path.dimensions.width) - layer.clip_path.offset.x;
			} else {
				layer.clip_path.offset.y = (GLOBAL.overlay_editor.current.dimensions.height - layer.clip_path.dimensions.height) - layer.clip_path.offset.y;
			}
		} else if (layer.clip_path.type == 'custom') {
			if (d) {
				layer.clip_path.clip_points.forEach((point, index) => {
					layer.clip_path.clip_points[index].x = GLOBAL.overlay_editor.current.dimensions.width - layer.clip_path.clip_points[index].x;
				});
			} else {
				layer.clip_path.clip_points.forEach((point, index) => {
					layer.clip_path.clip_points[index].y = GLOBAL.overlay_editor.current.dimensions.height - layer.clip_path.clip_points[index].y;
				});
			}
		}
	} else if (layer.type == 'image') {
		// image can have null dimensions for aspect scaling, determine output dimensions then flip
		let output_dimensions = getLayerOutputDimensions(layer);
		if (d) {
			if (layer.origins.horizontal == 'left') {
				layer.offset.x = (GLOBAL.overlay_editor.current.dimensions.width - output_dimensions.width) - layer.offset.x;
			} else if (layer.origins.horizontal == 'right') {
				layer.offset.x = (GLOBAL.overlay_editor.current.dimensions.width + output_dimensions.width) - layer.offset.x;
			} else if (layer.origins.horizontal == 'center') {
				layer.offset.x = GLOBAL.overlay_editor.current.dimensions.width - layer.offset.x;
			}
		} else {
			if (layer.origins.vertical == 'top') {
				layer.offset.y = (GLOBAL.overlay_editor.current.dimensions.height - output_dimensions.height) - layer.offset.y;
			} else if (layer.origins.vertical == 'bottom') {
				layer.offset.y = (GLOBAL.overlay_editor.current.dimensions.height + output_dimensions.height) - layer.offset.y;
			} else if (layer.origins.vertical == 'center') {
				layer.offset.y = (GLOBAL.overlay_editor.current.dimensions.height) - layer.offset.y;
			}
		}
	} else if (layer.type == 'text') {
		if (layer.style.rotation != 0) {
			if (d) {
				layer.style.rotation = 0-layer.style.rotation;
			}
		}
		if (d) {
			if (layer.style.align == 'left') {
				layer.offset.x = (GLOBAL.overlay_editor.current.dimensions.width - layer.dimensions.width) - layer.offset.x;
			} else if (layer.style.align == 'center') {
				layer.offset.x = GLOBAL.overlay_editor.current.dimensions.width - layer.offset.x;
			} else if (layer.style.align == 'right') {
				layer.offset.x = (GLOBAL.overlay_editor.current.dimensions.width + layer.dimensions.width) - layer.offset.x;
			}
		} else {
			layer.offset.y = (GLOBAL.overlay_editor.current.dimensions.height - layer.style.fontSize) - layer.offset.y;
		}
	}
	
	if (layer.layers) {
		layer.layers.forEach((inner_layer, index) => {
			inner_layer = flipLayer(inner_layer, direction);
		});
	}
	
	return layer;
	
}