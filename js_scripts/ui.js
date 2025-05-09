function generateUI() {
	
	// boil the water we makin pasta
	Select('#body', {
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
								value: GLOBAL.active_tournament.cwd+'/'+overlay.slug+'.png'
							})
						})
					})
				]
			}),
			Create('form', {
				id: 'form_capture',
				children: [
					...GLOBAL.active_tournament.ui.map(section => {
						return Create('div', {
							innerHTML: '<h3>'+section.section+'</h3>',
							className: 'block',
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
														selected: option.value == depth_value
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
														checked: radio.value == depth_value
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
					}),
					Create('div', {
						className: 'block',
						style: {
							textAlign: 'right'
						},
						children: [
							Create('button', {
								innerHTML: 'Save',
								onclick: updateSourceChanges
							})
						]
					})
				]
			})
		]
	});
	
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