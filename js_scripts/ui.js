function generateUI() {
	
	// boil the water we makin pasta
	Select('#main', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'block',
				children: [
					Create('h3', {
						innerHTML: 'Overlay Output Image Sources'
					}),
					Create('button', {
						innerHTML: 'Show Sources',
						onclick: function() {
							if (this.innerHTML == 'Show Sources') {
								this.innerHTML = 'Hide Sources';
								Select('#overlay_output_sources').style.display = 'block';
							} else {
								this.innerHTML = 'Show Sources';
								Select('#overlay_output_sources').style.display = 'none';
							}
						}
					}),
					Create('div', {
						id: 'overlay_output_sources',
						style: {
							display: 'none'
						},
						children: GLOBAL.active_tournament.overlays.map(overlay => {
							return Create('input', {
								disabled: true,
								type: 'text',
								value: GLOBAL.active_tournament.cwd+'/overlay_output/'+GLOBAL.active_tournament.uid+'/'+overlay.slug+'.png'
							})
						})
					})
				]
			}),
			Create('form', {
				id: 'form_capture',
				children: [
					...GLOBAL.active_tournament.ui.map(upper_section => {
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
									children: section.fields.map(field => {
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
											return Create('label', {
												innerHTML: field.title,
												children: [
													Create('select', {
														name: field.source,
														onchange: function () { logSourceChange(this); },
														children: field.values.map(option => {
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
									})
								});
							})
						});
					})
				]
			})
		]
	});
	
	// set active navigation save state
	GLOBAL.navigation.on_save = updateSourceChanges;
	
}

function onSaveAction() {
	GLOBAL.navigation.on_save();
}

// not all comparisons are similar, allow ui setup to determine value depth to compare
function getDepthComparisonValue(field) {
	return getRealValue(field.source, (typeof field.value_depth === 'undefined' ? null : field.value_depth));
}

function logSourceChange(field) {
	if (!GLOBAL.source_changes.includes(field.name)) {
		GLOBAL.source_changes.push(field.name);
	}
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
			if (field.value == form_details[field_name]) {
				let sub_setters = JSON.parse(field.sub_setters);
				if (sub_setters) {
					// set sub setters in form details
					sub_setters.forEach(sub_setter => {
						// allow depth value setting here as well
						form_details[sub_setter.path] = getDepthComparisonValue(sub_setter);
					});
				}
				break;
			}
		}
		
	});
	
	// append application and uid values to send object
	form_details.application = 'update_tournament_details';
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