// on layer menu select of add a new layer, open dialog for new layer type
// if an index is passed, the new layer will be inserted adjacent to the layer at the specified index
function addNewLayer(event, index = null, pass_starting_location = false) {
	setImageEditorDialog(event, {
		title: 'New Layer Type',
		items: [
			{
				title: 'Text',
				click: () => { addNewTypeLayer('text', index, pass_starting_location); }
			},
			{
				title: 'Image',
				click: () => { addNewTypeLayer('image', index, pass_starting_location); }
			},
			{
				title: 'Clipping Group',
				click: () => { addNewTypeLayer('clip_path', index, pass_starting_location); }
			}
		]
	});
}