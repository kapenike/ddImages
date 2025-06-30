function editOverlay(slug) {
	
	GLOBAL.overlay_editor.slug = slug;
	GLOBAL.overlay_editor.current = JSON.parse(JSON.stringify(GLOBAL.active_tournament.overlays[slug]));
	
	// create image editor for current overlay
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
						})
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
					className: 'layer_editor'
				})
			]
		})
	);
	
	// set fixed canvas size
	let canvas = Select('#workspace');
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
	
	printCurrentCanvas();
}

function closeOverlayEditor() {
	Select('#image_editor').remove();
}