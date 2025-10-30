function featureImageEffects(layer) {
	return Create('div', {
		className: 'editor_section_block',
		children: [
			Create('div', {
				className: 'editor_section_title',
				innerHTML: 'Image Effects'
			}),
			Create('div', {
				children: [
					Create('label', {
						innerHTML: 'Grayscale',
						children: [
							Create('br'),
							Create('input', {
								type: 'checkbox',
								checked: layer.effects.grayscale ? true : false,
								value: true,
								onchange: function () {
									getLayerById(GLOBAL.overlay_editor.active_layer).effects.grayscale = this.checked;
									printCurrentCanvas();
								}
							})
						]
					})
				]
			})
		]
	});
}