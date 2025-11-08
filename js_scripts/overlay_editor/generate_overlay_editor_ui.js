function generateOverlayEditorUI() {
	
	// create containing body for overlay editor app, includes tool bar feature creation as well since these are static to the UI
	Select('#body').appendChild(
		Create('div', {
			id: 'image_editor',
			children: [
				Create('div', {
					className: 'editor_info_bar',
					children: [
						Create('span', {
							className: 'editor_info_bar_title',
							innerHTML: GLOBAL.overlay_editor.current.title
						}),
						Create('div', {
							className: 'editor_close',
							innerHTML: '&times;',
							onclick: closeOverlayEditor
						}),
						Create('div', {
							className: 'editor_save',
							innerHTML: 'save',
							onclick: saveOverlay
						}),
						featureEditCanvasDimensions(), // create UI element for changing canvas overall dimensions
						featureCreateGridPlacement() // create UI element for aligning layers on a grid
					]
				}),
				Create('div', {
					className: 'image_editor_workspace',
					children: [
						Create('canvas', {
							id: 'workspace'
						})
					]
				}),
				Create('div', {
					className: 'layer_editor',
					children: [
						Create('div', {
							id: 'upper_editor'
						}),
						Create('div', {
							className: 'layer_manager',
							children: [
								Create('div', {
									className: 'layer_manager_title',
									innerHTML: 'Layers'
								}),
								Create('div', {
									className: 'layer_manager_add',
									innerHTML: '+ New Layer',
									onclick: function () {
										addNewLayer(event, GLOBAL.overlay_editor.active_layer);
									}
								})
							]
						}),
						Create('div', {
							id: 'lower_editor'
						})
					]
				})
			]
		})
	);
	
}