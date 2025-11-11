function openPathEditor(elem, open_path = null, base_path = null) {
	/*if (use_anchor) {
		use anchor to determine which variable has been selected and use it to modify
		window.getSelection()
	}*/
	
	if (open_path == '') {
		open_path = null;
	}
	if (base_path == '') {
		base_path = null;
	}
	
	// save access to current input id
	GLOBAL.ui.active_path_field_id = elem.data;
	
	closePathEditor(elem.data, elem.contentEditable == 'true');
	
	// open path selection dialog, change class name if path only or not
	elem.parentNode.appendChild(Create('div', {
		id: 'path_selection_dialog',
		className: elem.contentEditable == 'true' ? '' : 'path_selection_dialog_path_only',
		data: elem.data,
		children: createPathListForEditor(open_path, base_path)
	}));
	toggleSelectionEditorButton(true, elem.data);
}

function closePathEditor(id, init = false) {
	if (Select('#path_selection_dialog')) {
		Select('#path_selection_dialog').remove();
	}
	if (!init) {
		toggleSelectionEditorButton(false, id);
		// ensure proper text nodes between variable nodes
		variableFieldProperSpacing(Select('#var_set_input_'+id));
	}
}

function variableFieldProperSpacing(elem) {
	let nodes = Array.from(elem.childNodes);
	for (let i=0; i<nodes.length; i++) {
		if (nodes[i].nodeName === '#text') {
			nodes.splice(i, 1, Create('span', { className: 'path_real_entry', innerHTML: nodes[i].nodeValue }));
			continue;
		}
		if (i == 0 && nodes[0].className != 'path_real_entry') {
			nodes.unshift(Create('span', { className: 'path_real_entry', innerHTML: '&nbsp;' }));
			continue;
		}
		if (nodes[i].className != 'path_real_entry') {
			if (nodes[i-1].className != 'path_real_entry') {
				nodes.splice(i-1, 0, Create('span', { className: 'path_real_entry', innerHTML: '&nbsp;' }));
				continue;
			}
			if ((i+1) >= nodes.length || nodes[i+1].className != 'path_real_entry') {
				nodes.splice(i+1, 0, Create('span', { className: 'path_real_entry', innerHTML: '&nbsp;' }));
				if ((i+1) >= nodes.length) {
					i++;
				}
				continue;
			}
		}
	}
	Create(elem, { innerHTML: '', children: nodes }, true);
	return nodes;
}

function updatePathEditor(path, base_path) {
	Select('#path_selection_dialog', {
		innerHTML: '',
		children: createPathListForEditor(path, base_path)
	})
}

function setPathEditorValue(path) {
	let id = Select('#path_selection_dialog').data;
	let is_path_only = Select('#input_is_path_only_'+id).value == 'true' && Select('#depth_value_'+id);
	let input_field = Select('#var_set_input_'+id);
	if (input_field.contentEditable == 'false') {
		input_field.innerHTML = '';	
		if (is_path_only) {
			// clear depth value so that the new field generation will default to depth value 1
			Select('#depth_value_'+id, {
				innerHTML: '',
				style: {
					display: 'none'
				},
				children: [
					Create('option', {
						innerHTML: '',
						value: ''
					})
				]
			});
		}
	}
	input_field.appendChild(createPathVariableEntry(path));
	Select('#var_set_input_form_value_'+id).value = getFormValueOfPathSelection(id, input_field.innerHTML);
	Select('#var_set_input_form_value_'+id).onedit();
	
	// if path only, also update depth value list
	if (is_path_only) {
		Select('#depth_value_'+id, {
			innerHTML: '',
			style: {
				display: 'inline-block'
			},
			children: generateDepthValueList(Select('#var_set_input_form_value_'+id).value)
		});
	}
	
	closePathEditor(id);
}

function createPathRealEntry(entry) {
	return Create('span', {
		className: 'path_real_entry',
		innerHTML: entry
	});
}

function createPathVariableEntry(path) {
	return Create('span', {
		className: 'path_variable_entry',
		contentEditable: false,
		innerHTML: path
	});
}

function getOpenPath(id) {
	// determine if whether to return an open path or not
	if (Select('#input_is_path_only_'+id).value == 'true') {
		let variable_parts = getRealVariableParts(Select('#var_set_input_form_value_'+id).value);
		if (variable_parts.length > 0 && variable_parts[0].variable) {
			// split and pop last element of path
			variable_parts[0].variable = variable_parts[0].variable.split('/');
			variable_parts[0].variable.pop();
			// return open path
			return variable_parts[0].variable.join('/');
		}
	}
	return '';
}

function toggleSelectionEditorButton(is_remove, id) {
	let elem = Select('#path_insert_button_'+id);
	let is_path_only = Select('#input_is_path_only_'+id).value == 'true';
	elem.innerHTML = is_remove ? '&times;' : '&#8594;';
	elem.className = is_remove ? 'path_insert_button close_path_selection_editor' : 'path_insert_button'+(is_path_only ? ' path_insert_button_is_reference_path' : '');
	elem.onclick = (
		is_remove
			? function () {
					closePathEditor(this.data);
				}
			: function () {
					openPathEditor(Select('#var_set_input_'+this.data), getOpenPath(this.data), Select('#input_base_path_'+this.data).data);
				}
	);
}

// drop down path selection list generator
function createPathListForEditor(path = null, base_path = null) {
	let curr_path = GLOBAL.active_project.data;
	let is_path_only = Select('#input_is_path_only_'+GLOBAL.ui.active_path_field_id).value == 'true';
	let is_image_search = Select('#input_is_image_search_'+GLOBAL.ui.active_path_field_id).value == 'true';
	let is_data_set = false;
	let is_asset = false;
	if (path == '') {
		path = null;
	}
	let is_base_path = (path == base_path);
	if (path != null) {
		let nest = path.split('/');
		for (let i=0; i<nest.length; i++) {
			if (i == 0) {
				if (nest[i] == 'sets') {
					is_data_set = true;
				} else if (nest[i] == 'assets') {
					is_asset = true;
				}
			}
			if ((!is_path_only || is_image_search) && typeof curr_path[nest[i]] === 'string') {
				curr_path = getRealValue(curr_path[nest[i]]);
				continue;
			}
			curr_path = curr_path[nest[i]];
		}
	}
	let list = Object.keys(curr_path).sort((a,b) => {
		let a_string = typeof curr_path[a] === 'string';
		let b_string = typeof curr_path[b] === 'string';
		if (a_string && b_string) {
			return a > b;
		} else if (!a_string && !b_string) {
			return a > b;
		} else if (a_string && !b_string) {
			return 1;
		} else if (b_string && !a_string) {
			return -1;
		}
	});
	
	// if at root and input is a source setter, filter ignored paths
	if (path == null && Select('#input_is_source_setter_'+GLOBAL.ui.active_path_field_id).value == 'true') {
		list = list.filter(x => !GLOBAL.data_structure.ignored.includes(x));
	}
	
	// filter out any direct image elements
	list.filter(x => {
		return (x instanceof ImageBitmap || x instanceof HTMLImageElement ? false : true);
	})
	return [
		(!is_base_path
			? Create('div', {
					className: 'go_back_path_selection_editor',
					innerHTML: '&larr; <span style="font-weight:600;">return to parent</span>',
					onclick: () => {
						let path_split = path.split('/');
						path_split.pop();
						updatePathEditor(path_split.join('/'), base_path);
					}
				})
			: Create('div')
		),
		(
			list.length > 10
				?	Create('div', {
					children: [
						Create('input', {
							type: 'text',
							style: {
								padding: '6px 16px',
								margin: '0'
							},
							placeholder: 'Search...',
							onkeyup: function () {
								MSelect('.path_selection_element_search').forEach(search_elem => {
									search_elem.style.display = search_elem.innerHTML.toLowerCase().indexOf(this.value.toLowerCase()) > -1 ? 'block' : 'none'
								});
							}
						})
					]
				})
				: Create('div')
		),
		...list.map(key => {
			let is_value = typeof curr_path[key] === 'string';
			let print_key = key;
			if ((is_data_set || is_asset) && curr_path[key] && typeof curr_path[key].display !== 'undefined') {
				print_key = curr_path[key].display;
			}
			// edge case, if is_asset, check if active path selection input is path only, if so, set as `is_value`
			if (is_asset && is_path_only) {
				is_value = true;
			} else if (is_value && !is_path_only && typeof getRealValue('$var$'+(path == null ? key : path+'/'+key)+'$/var$') !== 'string') {
				// edge case, if value and not a path only selection, and value is a path variable that points towards an object rather than string, set as a path value
				is_value = false;
			} else if (is_value == true && is_path_only && is_image_search) {
				// override default logic of preventing dataset expansion for path only if looking for an image object
				let upcoming_dir = getRealValue(curr_path[key]);
				if (isObject(upcoming_dir)) {
					// if object allow expansion
					is_value = false;
					// unless the object contains a direct image reference
					if (Object.keys(upcoming_dir).find(x => {
						let ref = upcoming_dir[x];
						return ref instanceof ImageBitmap || ref instanceof HTMLImageElement;
					})) {
						is_value = true;
					}
				}
			}

			return Create('div', {
				className: 'path_selection_element_search path_selection_element_'+(is_value ? 'set' : 'extend'),
				innerHTML: (is_value ? '&nbsp;&nbsp;&#9900;' : '&#8594; ')+print_key,
				onclick: (
					is_value
						? () => {
								setPathEditorValue(path == null ? key : path+'/'+key)
							}
						:	() => {
								updatePathEditor(path == null ? key : path+'/'+key, base_path);
							}
				)
			})
		})
	]
}

function stripAndEnsureSinglePath(id) {
	let input_field = Select('#var_set_input_'+id);
	let children = input_field.childNodes;
	let stay = false;
	for (let i = children.length-1; i>=0; i--) {
		if (stay == false && children[i].className && children[i].className == 'path_variable_entry') {
			stay = true;
			continue;
		}
		children[i].remove();
	}
	Select('#var_set_input_form_value_'+id).value = getFormValueOfPathSelection(id, input_field.innerHTML);
	Select('#var_set_input_form_value_'+id).onedit();
}

function getFormValueOfPathSelection(id, value) {
	let input_field = Select('#var_set_input_'+id);
	let allow_html_input = Select('#input_allows_html_input_'+id).value == 'true';
	let output = '';
	input_field.childNodes.forEach(node => {
		if (node.nodeName === '#text') {
			output += node.nodeValue.replaceAll('&nbsp;','');
		} else if (node.className == 'path_real_entry') {
			output += node.innerHTML.replaceAll('&nbsp;','');
		} else if (node.className == 'path_variable_entry') {
			let pointer_value = 1;
			if (Select('#depth_value_'+id)) {
				pointer_value = Select('#depth_value_'+id).value;
				if (pointer_value == '') {
					pointer_value = 1;
				}
			}
			output += '$var$'+(Select('#input_is_path_only_'+id).value == 'true' ? '$pointer$'+pointer_value+'$/pointer$' : '')+node.innerHTML+'$/var$';
		} else {
			// allow html input
			if (allow_html_input) {
				output += node.outerHTML;
			} else {
				output += node.textContent || node.innerText || ''
			}
		}
	});
	return output;
}

function generateDepthValueList(value) {
	let current_depth = isPointer(value);
	if (current_depth) {
		let pointer_list = getRealValueHeadList(value);
		while (pointer_list.length < current_depth) {
			pointer_list.push('currently undefined');
		}
		return pointer_list.map((v, index) => {
			return Create('option', {
				innerHTML: (index+1)+': '+v,
				value: index+1,
				selected: (current_depth == (index+1))
			})
		});
	} else {
		return [
			Create('option', {
				innerHTML: '',
				value: ''
			})
		];
	}
}

function updateDepthValue(value, id) {
	let field = Select('#var_set_input_form_value_'+id);
	field.value = field.value.split('$pointer$')[0]+'$pointer$'+value+'$/pointer$'+field.value.split('$/pointer$')[1];
}

// created with appended string because the document element doesnt exist yet
function getPathSelectionValueFromFormValue(value) {
	let output = Create('div');
	getRealVariableParts(value).forEach(entry => {
		output.appendChild(
			entry.variable
				? Create('span', {
						className: 'path_variable_entry',
						contentEditable: false,
						innerHTML: entry.variable
					})
				: Create('span', {
						className: 'path_real_entry',
						innerHTML: entry.real
					})
		);
	});
	return variableFieldProperSpacing(output);
}

// clear input field
function clearVariableInput(id) {
	Select('#var_set_input_'+id).innerHTML = '';
	Select('#var_set_input_form_value_'+id).value = '';
	Select('#var_set_input_form_value_'+id).onedit();
}


/*
	!!Important!!
	pointer / depth value selection will by default be used on setters although only used for getters. this keeps logic simple
	a method within data_pathing.js->setRealValue strips this value
	:explanation: when getting a value to be set, a pointer depth determines what value in the chain to set, the setter value when saved and then requested will result in the full path end result, thus pointer depth is useless
*/
function createPathVariableField(settings = {}) {

	// ensure defaults exists
	if (typeof settings.name === 'undefined') {
		// no run without a name
		return false;
	}
	
	// increment global unique naming id
	GLOBAL.unique_id++;
	
	// allow path only
	if (typeof settings.allow_path_only === 'undefined') {
		settings.allow_path_only = true;
	}
	
	// init a data structure if none given
	if (typeof settings.value === 'undefined') {
		settings.value = {
			path_only: false,
			value: ''
		};
	}
	
	// init placeholder for if path only logic
	settings.value.path_only = false;
	
	// force path only input, if true it by default sets value to path only
	if (typeof settings.force_path_only === 'undefined') {
		settings.force_path_only = false;
	} else if (settings.force_path_only) {
		settings.allow_path_only = false;
		settings.value.path_only = true;
	}
	
	// default allow depth value
	if (typeof settings.allow_depth_value === 'undefined') {
		settings.allow_depth_value = false;
	}
	
	// default on edit value
	if (typeof settings.on_edit === 'undefined') {
		settings.on_edit = function(){};
	}
	
	// default allow html input value
	if (typeof settings.allow_html_input === 'undefined') {
		settings.allow_html_input = false;
	}
	
	// base path of variable input directory tree
	if (typeof settings.base_path === 'undefined') {
		settings.base_path = '';
	}
	
	// determine if value contains pointer to init with path only
	if (isPointer(settings.value.value)) {
		settings.value.path_only = true;
	}
	
	// default value is content editable
	let is_content_editable = !settings.force_path_only && !settings.value.path_only;
	
	return Create('div', {
		className: 'variable_set_input',
		children: [
			Create('div', {
				children: [
					Create('input', {
						type: 'hidden',
						id: 'var_set_input_form_value_'+GLOBAL.unique_id,
						name: settings.name,
						value: settings.value.value,
						onedit: settings.on_edit
					}),
					Create('input', {
						type: 'hidden',
						id: 'input_is_image_search_'+GLOBAL.unique_id,
						value: settings.value.image_search ? 'true' : 'false'
					}),
					Create('input', {
						type: 'hidden',
						id: 'input_is_path_only_'+GLOBAL.unique_id,
						value: settings.value.path_only ? 'true' : 'false'
					}),
					Create('input', {
						type: 'hidden',
						id: 'input_allows_html_input_'+GLOBAL.unique_id,
						value: settings.allow_html_input ? 'true' : 'false'
					}),
					Create('input', {
						type: 'hidden',
						id: 'input_base_path_'+GLOBAL.unique_id,
						data: settings.base_path
					}),
					Create('input', {
						type: 'hidden',
						id: 'input_is_source_setter_'+GLOBAL.unique_id,
						value: settings.force_path_only && typeof settings.override_source_setter === 'undefined' ? 'true' : 'false'
					}),
					Create('div', {
						className: 'variable_input_clear',
						innerHTML: '&times;',
						data: GLOBAL.unique_id,
						onclick: function () {
							clearVariableInput(this.data);
						}
					}),
					Create('div', {
						id: 'var_set_input_'+GLOBAL.unique_id,
						data: GLOBAL.unique_id,
						className: 'variable_set_input_field has_path_insert',
						contentEditable: is_content_editable,
						onclick: function () {
							if (this.contentEditable == 'false') {
								openPathEditor(this, getOpenPath(this.data), Select('#input_base_path_'+this.data).data);
							}
						},
						oninput: function () {
							Select('#var_set_input_form_value_'+this.data, { value: getFormValueOfPathSelection(this.data, this.innerHTML) });
							Select('#var_set_input_form_value_'+this.data).onedit();
						},
						children: getPathSelectionValueFromFormValue(settings.value.value)
					}),
					Create('div', {
						id: 'path_insert_button_'+GLOBAL.unique_id,
						data: GLOBAL.unique_id,
						className: 'path_insert_button'+(settings.value.path_only ? ' path_insert_button_is_reference_path' : ''),
						innerHTML: '&#8594;',
						onclick: function () {
							openPathEditor(Select('#var_set_input_'+this.data), getOpenPath(this.data), Select('#input_base_path_'+this.data).data);
						}
					})
				]
			}),
			Create('br', { style: { clear: 'both' }}),
			(settings.allow_path_only == true
				?	Create('div', {
						className: 'path_var_container',
						children: [
							Create('label', {
								innerHTML: 'Reference Path ',
								children: [
									Create('input', {
										type: 'checkbox',
										data: GLOBAL.unique_id,
										checked: !is_content_editable,
										onchange: function () {
											
											let input_field = Select('#var_set_input_'+this.data);
											let is_now_content_editable = !this.checked;
											input_field.contentEditable = is_now_content_editable;
											
											// if depth value editing allowed
											if (Select('#depth_value_'+this.data)) {
												// empty depth value list
												Select('#depth_value_'+this.data, {
													innerHTML: '',
													children: [
														Create('option', {
															innerHTML: '',
															value: ''
														})
													]
												});
												
												// toggle its display
												Select('#depth_value_'+this.data).style.display = is_now_content_editable ? 'none' : 'inline-block';
											}
											
											// clear input field
											clearVariableInput(this.data);

											if (!is_now_content_editable) {

												Select('#input_is_path_only_'+this.data).value = 'true';
												Select('#path_insert_button_'+this.data).className = 'path_insert_button path_insert_button_is_reference_path';
												
											} else {

												Select('#input_is_path_only_'+this.data).value = 'false';
												Select('#path_insert_button_'+this.data).className = 'path_insert_button';
												input_field.focus();
												
											}

										}
									}),
									(settings.allow_depth_value
										? Create('select', {
												id: 'depth_value_'+GLOBAL.unique_id,
												data: GLOBAL.unique_id,
												className: 'variable_input_path_only_depth_value',
												style: {
													display: is_content_editable ? 'none' : 'inline-block',
												},
												onchange: function () {
													updateDepthValue(this.value, this.data);
												},
												children: generateDepthValueList(settings.value.value)
											})
										: Create('div')
									)
								]
							})
						]
					})
				: Create('div', {
						className: 'path_var_container'+(settings.force_path_only == true ? ' forcing_path_indicator' : '')
					})
			)
		]
	});
}