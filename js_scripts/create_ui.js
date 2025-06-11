function createUIFromData(container, data, submit_to_application, editor = false) {
	
	// save reference to current UI object for use during editing
	GLOBAL.ui.active_data = data;
	
	// save reference to container used
	GLOBAL.ui.container = container;

	// clear source changes
	clearSourceChanges();

	Select(container, {
		innerHTML: '',
		children: [
			Create('form', {
				id: 'form_capture',
				className: editor ? 'editable_ui' : '', // if rebuilding during drag and drop, still in edit mode
				data: submit_to_application,
				children: [
					Create('div', {
						style: {
							textAlign: 'right',
							marginBottom: '-43px'
						},
						children: [
							Create('label', {
								innerHTML: 'Toggle UI Editor ',
								style: {
									paddingRight: '20px'
								},
								children: [
									Create('input', {
										type: 'checkbox',
										id: 'ui_editor_toggle',
										style: {
											display: 'inline-block',
											width: 'auto',
											position: 'relative',
											top: '5px'
										},
										checked: editor, // if rebuilding during drag and drop, still in edit mode
										onclick: function () {
											toggleUIEditor(this.checked);
										}
									})
								]
							})
						]
					}),
					...data.map((upper_section, section_index) => {
						return Create('div', {
							className: 'row',
							children: upper_section.cols.map((section, col_index) => {
								return Create('div', {
									innerHTML: '<h3>'+trackSourceChange(section.section)+'</h3>',
									data: JSON.stringify({ section: section_index, column: col_index }),
									className: 'col block',
									style: {
										width: parseFloat((100/upper_section.cols.length).toFixed(2))+'%' // precision round off
									},
									children: [
										Create('div', {
											className: 'ui_field_above',
											data: JSON.stringify({ section: section_index, column: col_index, field: 0 }),
											children: [
												(section.reset
													?	Create('button', {
															type: 'button',
															className: 'small_button',
															innerHTML: 'Reset',
															onclick: () => { resetUISection(section); }
														})
													: Create('div')
											]
										}),
										...section.fields.map((field, field_index) => {
											let depth_value = getDepthComparisonValue(field);
											if (field.type == 'text' || field.type == 'number') {
												return Create('div', {
													className: 'ui_field',
													data: JSON.stringify({ section: section_index, column: col_index, field: field_index }),
													children: [
														Create('label', {
															innerHTML: trackSourceChange(field.title),
															children: [
																Create('input', {
																	type: field.type,
																	name: field.source,
																	onkeydown: function () { logSourceChange(this); },
																	value: depth_value
																})
															]
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
												
												return Create('div', {
													className: 'ui_field',
													data: JSON.stringify({ section: section_index, column: col_index, field: field_index }),
													children: [
														Create('label', {
															innerHTML: trackSourceChange(field.title),
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
														})
													]
												});
											} else if (field.type == 'radio') {
												return Create('div', {
													className: 'ui_field',
													data: JSON.stringify({ section: section_index, column: col_index, field: field_index }),
													children: [
														Create('div', {
															className: 'radio_group',
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
																			innerHTML: trackSourceChange(radio.display)+'&nbsp;'
																		})
																	]
																});
															})
														})
													]
												});
											} else if (field.type == 'checkbox') {
												return Create('div', {
													className: 'ui_field',
													data: JSON.stringify({ section: section_index, column: col_index, field: field_index }),
													children: [
														Create('label', {
															innerHTML: trackSourceChange(field.title),
															children: [
																Create('br'),
																Create('input', {
																	type: field.type,
																	name: field.source,
																	onkeydown: function () { logSourceChange(this); },
																	data: field.value,
																	checked: depth_value != ''
																}),
																Create('br')
															]
														})
													]
												});
											}
										})
									]
								});
							})
						});
					})
				]
			})
		]
	});
	
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
	trackChangeSource(field.name, field.value);
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
	
	// include non-checked boxes and set value to data value rather than boolean
	Array.from(MSelect('input[type="checkbox"]')).filter(v => v.name != '').forEach(checkbox => {
		form_details[checkbox.name] = checkbox.checked ? checkbox.data : '';
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
						logSourceChange({ name: sub_setter.path, value: form_details[sub_setter.path] });
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

// add window listeners for drag / drop / context menu editing of ui
function toggleUIEditor(flag) {
	let form = Select('#form_capture');
	if (flag) {
		form.className = 'editable_ui';
		window.addEventListener('mousedown', uiEditMouseDown);
		window.addEventListener('mousemove', uiEditMouseMove);
		window.addEventListener('mouseup', uiEditMouseUp);
		window.addEventListener('contextmenu', uiEditRightMouse);
		// on save converted to updating UI instead
		GLOBAL.navigation.on_save = updateUIChange;
	} else {
		resetDrag();
		form.className = '';
		window.removeEventListener('mousedown', uiEditMouseDown);
		window.removeEventListener('mousemove', uiEditMouseMove);
		window.removeEventListener('mouseup', uiEditMouseUp);
		window.removeEventListener('contextmenu', uiEditRightMouse);
		// return to data update on save
		GLOBAL.navigation.on_save = updateSourceChanges;
	}
}

// search for upper containers from target element that are cornerstones for drag and drop actions
function getUpperContainer(elem, class_name = null) {
	if (elem == null) {
		return elem;
	} else if ((class_name == null && (elem.className == 'ui_field' || elem.className == 'col block')) || (class_name != null && elem.className == class_name)) {
		return elem;
	} else if (elem.className == 'col block' && class_name == 'ui_field') {
		return Array.from(elem.children).filter(x => x.className == 'ui_field_above').pop();
	} else if (elem.id == 'form_capture') {
		return null;
	} else {
		return getUpperContainer(elem.parentNode, class_name);
	}
}

// on mouse down, define a draggable field or section and create a shadow clone to show user is dragging
function uiEditMouseDown(event) {
	if (GLOBAL.ui.drag_elem || event.buttons == '2') {
		event.preventDefault();
		return;
	}
	let parent = getUpperContainer(event.target);
	if (parent != null) {
		event.preventDefault();
		Select('#form_capture').className = 'editable_ui_dragging';
		GLOBAL.ui.drag_elem = parent;
		parent.style.backgroundColor = '#388ff980';
		parent.style.border = '2px solid #0469e2';
		Select('#body').appendChild(Create('div', {
			id: 'drag_clone',
			style: {
				width: parent.offsetWidth+'px',
				height: parent.offsetHeight+'px',
				left: event.clientX+'px',
				top: event.clientY+'px'
			}
		}));
		GLOBAL.ui.drag_clone = Select('#drag_clone');
	}
}

// set drag and drop border styles
function uiDragSetBorder(elem, side = null) {
	if (elem == null) {
		return;
	}
	elem.style.borderLeft = '';
	elem.style.borderTop = '';
	elem.style.borderBottom = '';
	elem.style.borderRight = '';
	if (side != null) {
		elem.style['border'+String(side).charAt(0).toUpperCase() + String(side).slice(1)] = '20px solid #388ff9';
	}
}

// on drag move, highlight possible drop locations and save for use on mouse up
function uiEditMouseMove(event) {
	event.preventDefault();
	if (GLOBAL.ui.drag_clone) {
		GLOBAL.ui.drag_clone.style.left = event.clientX+'px';
		GLOBAL.ui.drag_clone.style.top = event.clientY+'px';
		let hover = getUpperContainer(event.target, GLOBAL.ui.drag_elem.className);
		if (hover != null) {
			let hover_data = JSON.parse(hover.data);
			let original_data = JSON.parse(GLOBAL.ui.drag_elem.data);
			if (GLOBAL.ui.drag_hover == null) {
				GLOBAL.ui.drag_hover = hover;
			} else if (hover.data != GLOBAL.ui.drag_hover.data) {
				// reset old hover elements borders
				uiDragSetBorder(GLOBAL.ui.drag_hover);
				// set new hover element
				GLOBAL.ui.drag_hover = hover;
			}
			// if hover is ui field within an empty area of section, set to left of hover because classification index does not change and pinpoint is at the top of the section (ui_field_above)
			if (hover.className == 'ui_field_above') {
				uiDragSetBorder(hover, 'bottom');
				GLOBAL.ui.drop_side = 'bottom';
				return;
			}
			if (hover_data.section != original_data.section || hover_data.column != original_data.column || hover_data.field != original_data.field) {
				let width = hover.offsetWidth;
				let height = hover.offsetHeight/2;
				let brect = hover.getBoundingClientRect();
				let left = brect.left;
				let top = brect.top;
				// only allow creating column from section drag
				if (GLOBAL.ui.drag_elem.className == 'col block' && event.clientX < left+(width*.25)) {
					uiDragSetBorder(hover, 'left');
					GLOBAL.ui.drop_side = 'left';
				} else if (GLOBAL.ui.drag_elem.className == 'col block' && event.clientX > left+(width*.75)) {
					uiDragSetBorder(hover, 'right');
					GLOBAL.ui.drop_side = 'right';
				} else if (event.clientY < (top+height)) {
					uiDragSetBorder(hover, 'top');
					GLOBAL.ui.drop_side = 'top';
				} else if (event.clientY > (top+height)) {
					uiDragSetBorder(hover, 'bottom');
					GLOBAL.ui.drop_side = 'bottom';
				}
			}
		}
	}
}

function resetDrag() {
	if (GLOBAL.ui.drop_side != null) {
		uiDragSetBorder(GLOBAL.ui.drag_hover);
		GLOBAL.ui.drag_elem.style.backgroundColor = '';
		uiDragSetBorder(GLOBAL.ui.drag_elem);
		GLOBAL.ui.drag_elem = null;
		GLOBAL.ui.drag_clone.remove();
		GLOBAL.ui.drag_clone = null;
		GLOBAL.ui.drag_hover = null;
		GLOBAL.ui.drop_side = null;
		Select('#form_capture').className = 'editable_ui';
	}
}

function uiEditMouseUp(event) {
	event.preventDefault();
	if (GLOBAL.ui.drop_side != null) {
		let current_location = JSON.parse(GLOBAL.ui.drag_elem.data);
		let new_location = JSON.parse(GLOBAL.ui.drag_hover.data);
		let classification = (GLOBAL.ui.drag_hover.className == 'ui_field' || GLOBAL.ui.drag_hover.className == 'ui_field_above') ? 'field' : 'section';
		if (GLOBAL.ui.drop_side == 'left') {
			//new_location.column--;
		} else if (GLOBAL.ui.drop_side == 'right') {
			new_location.column++;
		} else if (GLOBAL.ui.drop_side == 'top' && classification == 'section') {
			new_location.column = null;
		} else if (GLOBAL.ui.drop_side == 'bottom') {
			new_location[classification]++;
			if (classification == 'section') {
				new_location.column = null;
			}
		}
		// if not self, save previous object and then splice into new location while removing last, if old location is further down the list, increment so the new insert increase to array size is accounted for
		if (current_location.section != new_location.section || current_location.column != new_location.column || current_location.field != new_location.field) {
			if (classification == 'field') {
				let data_insert = JSON.parse(JSON.stringify(GLOBAL.ui.active_data[current_location.section].cols[current_location.column].fields[current_location.field]));
				if (current_location.section == new_location.section && current_location.column == new_location.column && current_location.field >= new_location.field) {
					current_location.field++;
				}
				GLOBAL.ui.active_data[new_location.section].cols[new_location.column].fields.splice(new_location.field, 0, data_insert);
				GLOBAL.ui.active_data[current_location.section].cols[current_location.column].fields.splice(current_location.field, 1);
			} else {
				let data_insert = JSON.parse(JSON.stringify(GLOBAL.ui.active_data[current_location.section].cols[current_location.column]));
				if (new_location.column == null) {
					if (current_location.section >= new_location.section) {
						current_location.section++;
					}
					// moving sections rather than columns, must create new columns structure within new section
					GLOBAL.ui.active_data.splice(new_location.section, 0, { cols: [ data_insert ]});
					GLOBAL.ui.active_data[current_location.section].cols.splice(current_location.column, 1);
				} else {
					if (current_location.section == new_location.section && current_location.column >= new_location.column) {
						current_location.column++;
					}
					GLOBAL.ui.active_data[new_location.section].cols.splice(new_location.column, 0, data_insert);
					GLOBAL.ui.active_data[current_location.section].cols.splice(current_location.column, 1);
				}
				// cleanse data of any empty column sections
				for (let i=0; i<GLOBAL.ui.active_data.length; i++) {
					if (GLOBAL.ui.active_data[i].cols.length == 0) {
						GLOBAL.ui.active_data.splice(i, 1);
						i--;
					}
				}
			}
			// refresh current ui generation with new data
			refreshUIBuild();
		}
	}
	resetDrag();
}

function updateUIChange() {
	
	// capture current UI state
	let form_details = {
		data: JSON.stringify(GLOBAL.ui.active_data)
	}
	
	// append application and uid values to send object (append "_ui_edit" to application)
	form_details.application = Select('#form_capture').data+'_ui_edit';
	form_details.uid = GLOBAL.active_tournament.uid;
	
	// update server-side tournament details, then call back to same scope function to save changes locally and generate affected overlays
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		if (status) {
			// notifications soon
		}
	}, 'body');
	
}

// edit menu
function uiEditRightMouse(event) {
	event.preventDefault();
	
	// if dragging, cancel drag
	if (GLOBAL.ui.drag_elem) {
		resetDrag();
		return;
	}
	
	// get nearest editable object
	let elem = getUpperContainer(event.target);
	if (elem != null) {
		createUIEditMenu(event.clientX, event.clientY, elem);
	}
	
}

function removeUIEditMenu() {
	if (Select('#ui_edit_menu')) {
		Select('#ui_edit_menu').remove();
	}
}

function createUIEditMenu(x, y, elem) {
	
	// if menu already exists, close it
	removeUIEditMenu();
		
	Select('#body', {
		children: [
			Create('div', {
				className: 'ui_edit_menu',
				id: 'ui_edit_menu',
				style: {
					left: x,
					top: y,
					transform: 'translate('+(x < (screen.width/2) ? '0' : '-100%')+', '+(y > (screen.height/2) ? '-100%' : '0')+')'
				},
				children: elem.className == 'ui_field'
					? [
						Create('div', {
							innerHTML: 'Edit Field',
							onclick: () => { editUIField(elem); }
						}),
						Create('div', {
							innerHTML: 'Remove Field',
							onclick: () => { removeUIField(elem); },
							className: 'ui_edit_menu_remove'
						}),
						Create('div', {
							innerHTML: 'cancel',
							className: 'ui_edit_menu_cancel',
							onclick: () => { removeUIEditMenu(); }
						})
					]
					: [
						Create('div', {
							innerHTML: 'Create New Field',
							onclick: () => { createNewUIField(elem); }
						}),
						Create('div', {
							innerHTML: 'Create New Section',
							onclick: () => { editUISection(elem, true); }
						}),
						Create('div', {
							innerHTML: 'Edit Section',
							onclick: () => { editUISection(elem); }
						}),
						Create('div', {
							innerHTML: 'Remove Section',
							className: 'ui_edit_menu_remove',
							onclick: () => { removeUISection(elem); }
						}),
						Create('div', {
							innerHTML: 'cancel',
							className: 'ui_edit_menu_cancel',
							onclick: () => { removeUIEditMenu(); }
						})
					]
			})
		]
	});
	
}

function removeUIField(elem) {
	// remove UI field from data and document
	let current_location = JSON.parse(elem.data);
	GLOBAL.ui.active_data[current_location.section].cols[current_location.column].fields.splice(current_location.field, 1);
	elem.remove();
	removeUIEditMenu();
}

function editUISection(elem, is_create = false) {
	
	removeUIEditMenu();
	
	// locate and grab section data (if is create, dont use data as new data will be pushed as an adjacent column section)
	let current_location = JSON.parse(elem.data);
	let current_data = GLOBAL.ui.active_data[current_location.section].cols[current_location.column];
	
	createPopUp(
		(is_create ? 'Create New Section' : 'Edit Section'),
		Create('div', {
			children: [
				Create('input', {
					type: 'hidden',
					name: 'is_create',
					value: is_create ? 'true' : 'false'
				}),
				Create('input', {
					type: 'hidden',
					name: 'current_location',
					value: elem.data
				}),
				Create('span', {
					innerHTML: 'Section Title',
					children: [
						createPathVariableField({
							name: 'section_title',
							value: {
								path_only: false,
								value: is_create ? '' : current_data.section
							},
							allow_path_only: false
						})
					]
				}),
				Create('label', {
					innerHTML: 'Contains Reset Button<br />',
					children: [
						Create('input', {
							type: 'checkbox',
							name: 'section_has_reset',
							checked: is_create ? false : current_data.reset
						})
					]
				})
			]
		}),
		function (form_data) {
			// set new section data or create a new section adjacent to the one created from
			let current_location = JSON.parse(form_data.current_location);
			if (form_data.is_create == 'true') {
				GLOBAL.ui.active_data[current_location.section].cols.splice(current_location.column, 0, {
					section: form_data.section_title,
					reset: form_data.section_has_reset ? true : false,
					fields: []
				});
			} else {
				let current_data = GLOBAL.ui.active_data[current_location.section].cols[current_location.column];
				current_data.section = form_data.section_title;
				current_data.reset = form_data.section_has_reset ? true : false;
			}
			// refresh current ui generation with new data
			refreshUIBuild();
			// close popup
			closePopup();
		}
	);
}

function refreshUIBuild() {
	createUIFromData(GLOBAL.ui.container, GLOBAL.ui.active_data, Select('#form_capture').data, true);
}

function removeUISection(elem) {
	// remove UI section from data and document
	let current_location = JSON.parse(elem.data);
	GLOBAL.ui.active_data[current_location.section].cols.splice(current_location.column, 1);
	elem.remove();
	removeUIEditMenu();
	refreshUIBuild();
}

function closePopup() {
	if (Select('#popup')) {
		Select('#popup').remove();
	}
}

function createPopUp(title, content, on_save) {
	Select('#body').appendChild(Create('div', {
		id: 'popup',
		children: [
			Create('div', {
				className: 'popup_inner',
				children: [
					Create('div', {
						className: 'popup_title_bar',
						children: [
							Create('div', {
								className: 'popup_title',
								innerHTML: title
							}),
							Create('div', {
								className: 'popup_close',
								innerHTML: '&times;',
								onclick: function () {
									closePopup();
								}
							}),
							Create('br', { style: { clear: 'both' }})
						]
					}),
					Create('form', {
						id: 'popup_form_data',
						children: [
							content
						]
					}),
					Create('div', {
						className: 'popup_save_bar',
						children: [
							Create('button', {
								type: 'button',
								innerHTML: 'Save',
								onclick: () => {
									on_save(formToObj('popup_form_data'))
								}
							})
						]
					})
				]
			})
		]
	}));
}