function createColorPicker(value, on_save) {

	let original_real_value = getRealValue(value);

	return Create('div', {
		className: 'color_picker',
		id: 'active_color_picker',
		dataset: {
			value: original_real_value,
			path_value: value
		},
		style: {
			backgroundColor: original_real_value
		},
		onclick: () => {
			let color = Select('#active_color_picker').dataset.value;
			color = color.length == 9 ? color : color+'FF';
			
			// init color on a timer because some devs are lazy about script integration possibilities
			setTimeout(() => {
				var color_picker = new JSColor('#color');
				color_picker.option({
					format: 'hex',
					width: 200,
					height: 180,
					alpha: true,
					alphaChannel: true
				});
				color_picker.show();
			}, 1);
			
			createPopUp(
				'Color Picker',
				Create('div', {
					children: [
						Create('span', {
							innerHTML: 'Variable Color Override',
							className: 'spanlabel',
							children: [
								createPathVariableField({
									name: 'variable_color',
									value: {
										path_only: false,
										value: isPathVariable(Select('#active_color_picker').dataset.path_value) ? Select('#active_color_picker').dataset.path_value : ''
									},
									allow_path_only: false
								})
							]
						}),
						Create('label', {
							innerHTML: 'Hex Code Color Pick',
							children: [
								Create('input', {
									type: 'text',
									id: 'color',
									name: 'color',
									value: color
								})
							]
						})
					]
				}),
				(form_data) => {
					// if variable input, use instead
					let use_color = '';
					let form_value = '';
					if (form_data.variable_color != '') {
						use_color = getRealValue(form_data.variable_color);
						Select('#active_color_picker').dataset.path_value = form_data.variable_color;
						form_value = form_data.variable_color;
					} else {
						use_color = form_data.color;
						Select('#active_color_picker').dataset.path_value = '';
						form_value = use_color;
					}

					Select('#active_color_picker').style.backgroundColor = use_color;
					Select('#active_color_picker').dataset.value = use_color;
					on_save(form_value);
					closePopup();
				}
			)
		}
	});
	
	
}