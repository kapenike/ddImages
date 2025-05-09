function generateUI() {
	
	// boil the water we makin pasta
	Select('#body', {
		innerHTML: '',
		children: [
			Create('form', {
				id: 'form_capture',
				children: [
					...GLOBAL.active_tournament.ui.map(section => {
						return Create('div', {
							innerHTML: '<h3>'+section.section+'</h3>',
							className: 'block',
							children: section.fields.map(field => {
								if (field.type == 'text') {
									return Create('label', {
										innerHTML: field.title,
										children: [
											Create('input', {
												type: 'text',
												name: field.source,
												onkeydown: function () { logSourceChange(this); },
												value: getRealValue(field.source)
											})
										]
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