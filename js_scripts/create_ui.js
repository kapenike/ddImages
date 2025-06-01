function createUIFromData(data, submit_to_application) {

	return Create('form', {
		id: 'form_capture',
		data: submit_to_application,
		children: [
			...data.map(upper_section => {
				let active_section = upper_section.cols ? upper_section.cols : [upper_section];
				return Create('div', {
					className: 'row',
					children: active_section.map(section => {
						return Create('div', {
							innerHTML: '<h3>'+section.section+'</h3>',
							className: 'col block',
							style: {
								width: parseFloat((100/active_section.length).toFixed(2))+'%' // precision round off
							},
							children: [(
								section.reset
									?	Create('div', {
											children: [
												Create('button', {
													type: 'button',
													className: 'small_button',
													innerHTML: 'Reset',
													onclick: () => { resetUISection(section); }
												})
											]
										})
									: Create('div')
							), ...section.fields.map(field => {
								let depth_value = getDepthComparisonValue(field);
								if (field.type == 'text' || field.type == 'number') {
									return Create('label', {
										innerHTML: field.title,
										children: [
											Create('input', {
												type: field.type,
												name: field.source,
												onkeydown: function () { logSourceChange(this); },
												value: depth_value
											})
										]
									});
								} else if (field.type == 'select') {
									
									// edge case for handling dataset select
									let dataset_values = null;
									if (typeof field.values === 'string') {
										// get associated object
										let dataset = getRealValue(field.values);
										// generate values and subsetters list from object
										dataset_values = [null, ...Object.keys(dataset)].map(key => {
											return {
												display: key == null ? '-Empty-' : getRealValue(field.display, null, dataset[key]),
												value: key == null ? '' : key,
												sub_setters: field.sub_setters.map(sub_setter => {
													return {
														path: sub_setter.path,
														source: (key == null ? '' : getRealValue(sub_setter.source, null, dataset[key]))
													}
												})
											};
										});
									}
									
									return Create('label', {
										innerHTML: field.title,
										children: [
											Create('select', {
												name: field.source,
												onchange: function () { logSourceChange(this); },
												children: (dataset_values == null ? field.values : dataset_values).map(option => {
													return Create('option', {
														innerHTML: option.display,
														value: option.value,
														selected: option.value == depth_value,
														sub_setters: JSON.stringify(option.sub_setters ?? null)
													});
												})
											})
										]
									});
								} else if (field.type == 'radio') {
									return Create('div', {
										children: field.values.map(radio => {
											return Create('label', {
												children: [
													Create('input', {
														type: 'radio',
														onclick: function () { logSourceChange(this); },
														name: field.source,
														value: radio.value,
														checked: radio.value == depth_value,
														sub_setters: JSON.stringify(radio.sub_setters ?? null)
													}),
													Create('span', {
														innerHTML: radio.display+'&nbsp;'
													})
												]
											});
										})
									});
								} else {
									return Create('div');
								}
							})]
						});
					})
				});
			})
		]
	})
	
}

function resetUISection(section) {
	section.fields.forEach(field => {
		let elem = Select('[name="'+field.source+'"]');
		switch (field.type) {
			case 'select':
				Array.from(elem.children).forEach(child => {
					child.selected = false;
				});
				elem.children[0].selected = true;
				break;
			case 'radio':
				elem.checked = true;
				break;
			default:
				elem.value = '';
				break;
		}
		logSourceChange(elem);
	});
}

function logSourceChange(field) {
	if (!GLOBAL.source_changes.includes(field.name)) {
		GLOBAL.source_changes.push(field.name);
	}
}

// not all comparisons are similar, allow ui setup to determine value depth to compare
function getDepthComparisonValue(field) {
	return getRealValue(field.source, (typeof field.value_depth === 'undefined' ? null : field.value_depth));
}

function updateSourceChanges() {
	
	// use form style capture to easily inherit form capture methods
	let full_form = formToObj('form_capture');
	
	// filter form object by values logged in GLOBAL.source_changes
	let form_details = {};
	Object.keys(full_form).forEach(field_name => {
		if (GLOBAL.source_changes.includes(field_name)) {
			form_details[field_name] = full_form[field_name];
		}
	});
	
	// use filtered form objects to search for potential sub setters
	Object.keys(form_details).forEach(field_name => {
		
		// get list of named elements
		let named_fields = Array.from(MSelect('[name="'+field_name+'"]'));
		
		// if select, use children instead
		if (named_fields[0].tagName.toLowerCase() == 'select') {
			named_fields = Array.from(named_fields[0].children);
		}

		// itterate named fields, find active value node and check for sub setters
		for (let i=0; i<named_fields.length; i++) {
			let field = named_fields[i];
			if (field.value == form_details[field_name] && field.sub_setters) {
				let sub_setters = JSON.parse(field.sub_setters);
				if (sub_setters) {
					// set sub setters in form details
					sub_setters.forEach(sub_setter => {
						// allow depth value setting here as well
						form_details[sub_setter.path] = getDepthComparisonValue(sub_setter);
						// add sub setters to global changed sources list
						logSourceChange({ name: sub_setter.path });
					});
				}
				break;
			}
		}
		
	});
	
	// append application and uid values to send object
	form_details.application = Select('#form_capture').data;
	form_details.uid = GLOBAL.active_tournament.uid;
	
	// update server-side tournament details, then call back to same scope function to save changes locally and generate affected overlays
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		
		if (status) {
			
			// using instanced 'form_details', update local tournament data
			Object.keys(form_details).forEach(path => {
				if (isPathVariable(path)) {
					setRealValue(path, form_details[path]);
				}
			});
			
			// generate new overlays with updated sources, once complete, reset updated sources
			generateStreamOverlays(GLOBAL.source_changes, () => {
				GLOBAL.source_changes = [];
			});
		
		}
		
	}, 'body');
	
}
