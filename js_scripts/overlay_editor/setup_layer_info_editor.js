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
			(layer.type == 'clip_path' ? featureGroupLayerClipPath(layer) : Create('div')) // UI for selecting clip path type and clip region
		]
	});

}