function setNavigationFontManager() {

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
														innerHTML: 'Font Manager'
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
														innerHTML: 'Create Font Face',
														onclick: () => { setupFontEditor(); },
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
										id: 'font_face_list',
										style: {
											height: 'calc(100% - 150px)',
											overflowY: 'scroll'
										}
									})
								]
							}),
							Create('div', {
								className: 'col',
								id: 'font_manager_form_block',
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
	
	// setup font editor, default to create
	setupFontEditor(null);
	
	// setup font selection list
	generateFontSelectionList();
		
}

function updateFonts() {
	
	if (!detectValidFontFaceName(Select('#font_face_name'))) {
		return;
	}
	
	// use form style capture to easily inherit form capture methods
	let form_details = formToObj('font_creation_form');
	
	if (form_details.font_registration_type != 'create') {
		
		// detect if any new entries are missing an associated file
		let break_found = false;
		form_details['fonts_ref_id[]'].forEach(id => {
			if (Select('[name="previous_file_name_'+id+'"]').value == '' && Select('[name="font_file_'+id+'"]').files.length == 0) {
				Select('[name="font_file_'+id+'"]').style.color = 'red';
				break_found = true;
			}
		});
		if (break_found) {
			return true;
		}
		
	}
	
	
	// append application
	form_details.application = 'update_font_face';
	
	// update server-side font details, local changes require a browser refresh
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		
		if (status && data.status) {
			
			// local change
			FONTS[data.name] = data.font_face;
			
			// if name change, remove old
			if (data.name_change) {
				delete FONTS[data.name_change];
			}
			
			// load font data into form
			setupFontEditor(data.name);
			
			// re-create font selection list
			generateFontSelectionList();
			
			// notify of browser refresh requirement
			notify({
				text: 'Updated Fonts require a browser refresh to be used. Refresh now?',
				confirm: 'Refresh Now',
				cancel: 'Later'
			}, function () {
				location.reload();
			});
			
		}
		
	}, 'body');
}

function setupFontEditor(fontface) {
	
	let font_face = (fontface == null ? null : FONTS[fontface]);
	
	Select('#font_manager_form_block', {
		innerHTML: '',
		children: [
			Create('h3', {
				innerHTML: (font_face == null ? 'Create Font Face' : 'Update Font Face')
			}),
			Create('form', {
				id: 'font_creation_form',
				children: [
					Create('input', {
						type: 'hidden',
						name: 'font_registration_type',
						value: font_face == null ? 'create' : fontface
					}),
					Create('div', {
						id: 'valid_font_name',
						style: {
							fontSize: '12px',
							color: 'red'
						}
					}),
					Create('label', {
						innerHTML: 'Font Face Name',
						children: [
							Create('input', {
								type: 'text',
								id: 'font_face_name',
								data: fontface == null ? '' : fontface,
								name: 'font_face_name',
								value: font_face == null ? '' : fontface,
								onkeyup: function () {
									detectValidFontFaceName(this)
								}
							})
						]
					}),
					...(font_face != null
						?	[
								Create('div', {
									style: {
										textAlign: 'right'
									},
									children: [
										Create('button', {
											type: 'button',
											className: 'remove_button',
											innerHTML: 'Remove Font Face',
											onclick: () => {
												notify({
													text: 'Removing a Font Face will permanently remove the font styles in use. Proceed?',
													confirm: 'Remove Font Face',
													cancel: 'Nevermind'
												}, () => {
													ajax('POST', '/requestor.php', { 
														application: 'remove_font',
														font_face: fontface
													}, (status, data) => {
														if (status && data.status) {
															
															// delete local font
															delete FONTS[fontface];
															
															// bring up create font form
															setupFontEditor(null);
															
															// re-create font selection list
															generateFontSelectionList();
															
														}
													}, 'body');
												})
											}
										})
									]
								}),
								Create('div', {
									className: 'create_data_key',
									innerHTML: '+ Add New Font Style',
									onclick: function () {
										Select('#font_styles_container').prepend(createFontEntry());
									}
								}),
								Create('div', {
									id: 'font_styles_container',
									children: font_face.fonts.map(font => {
										return createFontEntry(font)
									})
								})
							]
						: [Create('div')]
					)
				]
			})
		]
	});
}

function detectValidFontFaceName(elem) {
	if (elem.value == '') {
		Select('#valid_font_name').innerHTML = 'Font Face name cannot be empty';
		return false;
	} else if (elem.data != elem.value && typeof FONTS[elem.value] != 'undefined') {
		Select('#valid_font_name').innerHTML = 'This Font Face name is currently in use.';
		return false;
	} else {
		Select('#valid_font_name').innerHTML = '';
		return true;
	}
}

function createFontEntry(font = null) {
	
	if (font == null) {
		font = {
			filename: '',
			style: 'normal',
			weight: '400'
		}
	}
	
	GLOBAL.unique_id++;
	
	return Create('div', {
		className: 'row',
		children: [
			Create('input', {
				type: 'hidden',
				name: 'fonts_ref_id[]',
				value: GLOBAL.unique_id
			}),
			Create('input', {
				type: 'hidden',
				name: 'previous_file_name_'+GLOBAL.unique_id,
				value: font.filename
			}),
			Create('div', {
				className: 'col',
				style: {
					width: '33.3%'
				},
				children: [
					Create('label', {
						innerHTML: 'Font File ('+font.filename+')',
						children: [
							Create('input', {
								type: 'file',
								name: 'font_file_'+GLOBAL.unique_id
							})
						]
					})
				]
			}),
			Create('div', {
				className: 'col',
				style: {
					width: '33.3%'
				},
				children: [
					Create('label', {
						innerHTML: 'Font Style',
						children: [
							Create('select', {
								name: 'font_style_'+GLOBAL.unique_id,
								children: ['normal', 'italic'].map(style => {
									return Create('option', {
										innerHTML: style,
										value: style,
										selected: font.style == style
									})
								})
							})
						]
					})
				]
			}),
			Create('div', {
				className: 'col',
				style: {
					width: '33.3%'
				},
				children: [
					Create('div', {
						className: 'remove_data_key',
						style: {
							float: 'right'
						},
						innerHTML: '&times;',
						onclick: function () {
							this.parentNode.parentNode.remove();
						}
					}),
					Create('label', {
						innerHTML: 'Font Weight',
						children: [
							Create('select', {
								name: 'font_weight_'+GLOBAL.unique_id,
								children: ['100', '200', '300', '400', '500', '600', '700', '800'].map(weight => {
									return Create('option', {
										style: {
											fontWeight: weight
										},
										innerHTML: weight,
										value: weight,
										selected: font.weight == weight
									})
								})
							})
						]
					})
				]
			})
		]
	});
}

function generateFontSelectionList() {
	
	Select('#font_face_list', {
		innerHTML: '',
		children: Object.keys(FONTS).map(font => {
			if (FONTS[font].is_default) {
				return Create('div');
			}
			return Create('div', {
				innerHTML: font,
				className: 'selection_list_block',
				onclick: () => { setupFontEditor(font); }
			});
		})
	});
	
}