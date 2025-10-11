function featureImageSource(layer) {
	return Create('span', {
		innerHTML: 'Source',
		className: 'editor_spanlabel',
		children: [
			createPathVariableField({
				name: 'editor_value',
				override_source_setter: true,
				value: {
					value: layer.value,
					image_search: true
				},
				force_path_only: true,
				on_edit: function () {
					getLayerById(GLOBAL.overlay_editor.active_layer).value = this.value;
					printCurrentCanvas();
				}
			}),
			Create('button', {
				type: 'button',
				style: {
					padding: '4px 8px'
				},
				innerHTML: 'quick upload new asset',
				onclick: function () {
					createPopUp(
						'Quick Upload New Asset',
						Create('div', { id: 'popup_create_asset' }),
						() => {
							updateAssetData(true);
							let form_field = Select('[name="editor_value"]');
							let id = form_field.id.split('_').pop();
							form_field.value = '$var$$pointer$1$/pointer$assets/'+Select('[name="asset_slug"]').value+'$/var$';
							Select('#var_set_input_'+id, { innerHTML: '', children: getPathSelectionValueFromFormValue(form_field.value) });
							form_field.onedit();
						}
					);

					// setup asset editor within popup window
					setupAssetEditor(null, '#popup_create_asset');
				}
			}),
			Create('br')
		]
	});
}