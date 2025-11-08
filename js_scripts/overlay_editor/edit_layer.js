// on context menu of a layer element, open dialog for edit layer actions
function editLayer(elem) {
	event.preventDefault();
	setImageEditorDialog(event, {
		title: 'Edit Layer',
		items: [
			{
				title: 'Duplicate',
				click: () => { addNewTypeLayer('text', elem.id, false, true); }
			},
			{
				title: 'Remove',
				click: () => { removeLayer(elem.id); },
				remove: true
			}
		]
	});
}