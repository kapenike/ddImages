function setupLayersUI() {
	Select('#lower_editor', {
		innerHTML: '',
		children: GLOBAL.overlay_editor.current.layers.map((layer, index) => {
			return Create('div', {
				id: 'layer_'+index,
				className: 'editor_layer'+(index == GLOBAL.overlay_editor.active_layer ? ' active_editor_layer' : ''),
				innerHTML: '<span id="layer_'+index+'_title">'+layer.title+'</span>',
				children: (layer.type == 'clip_path'
					?	[
							Create('div', {
								className: 'editor_layer_group',
								children: layer.layers.map((group_layer, sub_index) => {
									return Create('div', {
										id: 'layer_'+index+'_'+sub_index,
										className: 'editor_layer'+(index+'_'+sub_index == GLOBAL.overlay_editor.active_layer ? ' active_editor_layer' : ''),
										innerHTML: '<span id="layer_'+index+'_'+sub_index+'_title">'+group_layer.title+'</span>',
										onclick: () => { setActiveLayer(index+'_'+sub_index); event.stopPropagation(); },
										oncontextmenu: function () { editLayer(this); event.stopPropagation(); }
									})
								})
							})
						]
					: []
				),
				onclick: () => { setActiveLayer(index); },
				oncontextmenu: function () { editLayer(this); }
			})
		})
	});
}