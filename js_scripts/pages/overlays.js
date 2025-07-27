function setNavigationOverlays() {

	Select('#main', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'block',
				style: {
					height: '100%'
				},
				children: [
					Create('div', {
						className: 'row',
						children: [
							Create('div', {
								className: 'col',
								style: {
									width: '30%',
									height: '100%'
								},
								children: [
									Create('div', {
										className: 'row',
										children: [
											Create('div', {
												className: 'col',
												style: {
													width: '50%'
												},
												children: [
													Create('h3', {
														innerHTML: 'Overlay Manager'
													})
												]
											}),
											Create('div', {
												className: 'col',
												style: {
													width: '50%',
													textAlign: 'right'
												},
												children: [
													Create('button', {
														innerHTML: 'Create Overlay',
														onclick: () => { setupOverlayEditor(); },
														style: {
															position: 'relative',
															top: '10px'
														}
													})
												]
											})
										]
									}),
									Create('input', {
										type: 'text',
										placeholder: 'Search...'
									}),
									Create('div', {
										id: 'overlay_list',
										style: {
											height: 'calc(100% - 150px)',
											overflowY: 'scroll'
										}
									})
								]
							}),
							Create('div', {
								className: 'col',
								id: 'overlay_manager_form_block',
								style: {
									width: '70%',
									height: '100%',
									overflowY: 'scroll'
								}
							})
						]
					})
				]
			})
		]
	});
	
	// setup overlay editor, default to create
	setupOverlayEditor(null);
	
	// setup overlay selection list
	generateOverlaySelectionList();
		
}

function updateOverlayData() {
	
	// use form style capture to easily inherit form capture methods
	let form_details = formToObj('overlay_creation_form');
	
	// ensure no form errors
	if (!checkForOverlaySlug(form_details.overlay_slug) || !checkForOverlayName(form_details.overlay_name)) {
		return false;
	}
	
	// append application
	form_details.application = 'create_update_overlay';
	
	// append project uid
	form_details.project_id = GLOBAL.active_project.uid;
	
	// update server-side overlay details, then call back to same scope function to save changes locally
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		
		if (status) {

			// update local overlay list
			GLOBAL.active_project.overlays[form_details.overlay_slug] = data.msg;
			
			// if updated slug, remove old path
			if (form_details.overlay_registration_type != 'create' && form_details.overlay_registration_type != form_details.overlay_slug) {
				GLOBAL.active_project.overlays[form_details.overlay_registration_type] = null;
				delete GLOBAL.active_project.overlays[form_details.overlay_registration_type];
			}

			// load asset data into form
			setupOverlayEditor(form_details.overlay_slug);
			
			// re-create asset selection list
			generateOverlaySelectionList();
			
		}
		
	}, 'overlay_manager_form_block');
}

function checkForOverlaySlug(slug, live_update = true) {
	// ensure slug is not being used (unless it is the current slug of the active asset object)
	if (slug != '' && (typeof GLOBAL.active_project.overlays[slug] === 'undefined' || Select('[name="overlay_registration_type"]').value == slug)) {
		if (live_update) {
			Select('#valid_overlay_slug').innerHTML = '';
		}
		return true;
	} else {
		if (live_update) {
			Select('#valid_overlay_slug').innerHTML = 'Overlay slug is currently in use. Consider xXx'+slug+'xXx';
		}
		return false;
	}
}

function checkForOverlayName(name) {
	if (name != '') {
		Select('#valid_overlay_name').innerHTML = '';
		return true;
	} else {
		Select('#valid_overlay_name').innerHTML = 'Overlay name cannot be empty';
		return false;
	}
}

function autoGenerateOverlaySlug(v) {
	v = v.toLowerCase().replaceAll(' ', '_');
	let add = 1;
	while (!checkForOverlaySlug(v+(add == 1 ? '' : '_'+add), true)) {
		add++;
	}
	if (add > 1) {
		v = v+'_'+add;
	}
	Select('[name="overlay_slug"]').value = v;
}

function setupOverlayEditor(slug = null) {
	let overlay_data = (slug == null ? null : GLOBAL.active_project.overlays[slug]);
	
	Select('#overlay_manager_form_block', {
		innerHTML: '',
		children: [
			Create('h3', {
				innerHTML: (overlay_data == null ? 'Create New Overlay' : 'Update Overlay')
			}),
			Create('form', {
				id: 'overlay_creation_form',
				children: [
					Create('input', {
						type: 'hidden',
						name: 'overlay_registration_type',
						value: overlay_data == null ? 'create' : slug
					}),
					(overlay_data != null
						?	Create('div', {
								style: {
									textAlign: 'right'
								},
								children: [
									Create('button', {
										type: 'button',
										className: 'main_button',
										innerHTML: 'Edit Overlay Layers',
										onclick: () => {
											editOverlay(slug);
										}
									})
								]
							})
						: Create('div')
					),
					(overlay_data != null
						?	Create('label', {
								innerHTML: 'Overlay Location',
								children: [
									Create('input', {
										type: 'text',
										readOnly: 'true',
										onclick: function () { this.focus(); this.select() },
										type: 'text',
										value: GLOBAL.active_project.cwd+'/overlay_output/'+GLOBAL.active_project.uid+'/'+slug+'.png'
									})
								]
							})
						: Create('div')
					),
					Create('div', {
						id: 'valid_overlay_name',
						style: {
							fontSize: '12px',
							color: 'red'
						}
					}),
					Create('label', {
						innerHTML: 'Overlay Name',
						children: [
							Create('input', {
								type: 'text',
								name: 'overlay_name',
								value: overlay_data == null ? '' : overlay_data.title,
								onkeyup: function () {
									autoGenerateOverlaySlug(this.value);
								}
							})
						]
					}),
					Create('div', {
						id: 'valid_overlay_slug',
						style: {
							fontSize: '12px',
							color: 'red'
						}
					}),
					Create('label', {
						innerHTML: 'Overlay Slug',
						children: [
							Create('input', {
								type: 'text',
								name: 'overlay_slug',
								onkeyup: function () { checkForOverlaySlug(this.value); },
								value: overlay_data == null ? '' : slug
							})
						]
					}),
					(overlay_data != null
						?	Create('div', {
								style: {
									textAlign: 'right'
								},
								children: [
									Create('button', {
										type: 'button',
										className: 'remove_button',
										innerHTML: 'Delete Overlay',
										onclick: () => { removeOverlay(slug) }
									})
								]
							})
						: Create('div')
					),
					(overlay_data == null || overlay_data.layers.length == 0
						? Create('div')
						:	Create('div', {
								className: 'asset_preview',
								children: [
									Create('img', {
										src: '/overlay_output/'+GLOBAL.active_project.uid+'/'+slug+'.png?'+new Date().getTime()
									})
								]
							})
					)
				]
			})
		]
	});
}

function generateOverlaySelectionList() {
	
	Select('#overlay_list', {
		innerHTML: '',
		children: Object.keys(GLOBAL.active_project.overlays).map(slug => {
			return Create('div', {
				innerHTML: GLOBAL.active_project.overlays[slug].title,
				className: 'selection_list_block',
				onclick: () => { setupOverlayEditor(slug); }
			});
		})
	});
	
}

function removeOverlay(slug) {
	
	let form_details = {
		project_uid: GLOBAL.active_project.uid,
		overlay_slug: slug,
		application: 'remove_overlay'
	};

	// remove overlay server side
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		
		if (status) {
			
			// delete local overlay
			delete GLOBAL.active_project.overlays[slug];
			
			// bring up create overlay form
			setupOverlayEditor(null);
			
			// re-create overlay selection list
			generateOverlaySelectionList();
			
		}
		
	}, 'overlay_manager_form_block');
}
