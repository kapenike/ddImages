function openPathEditor(elem, use_anchor = true) {
	if (use_anchor) {
		//window.getSelection()
	}
	
	// save access to current input id
	GLOBAL.ui.active_path_field_id = elem.data;
	
	closePathEditor(elem.data, elem.contentEditable == 'true');
	elem.parentNode.appendChild(Create('div', {
		id: 'path_selection_dialog',
		data: elem.data,
		children: createPathListForEditor(null)
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
		let input_field = Select('#var_set_input_'+id);
		let nodes = Array.from(input_field.childNodes);
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
		Create(input_field, { innerHTML: '', children: nodes }, true);
	}
}

function updatePathEditor(path) {
	Select('#path_selection_dialog', {
		innerHTML: '',
		children: createPathListForEditor(path)
	})
}

function setPathEditorValue(path) {
	let id = Select('#path_selection_dialog').data;
	let input_field = Select('#var_set_input_'+id);
	if (input_field.contentEditable == 'false') {
		input_field.innerHTML = '';
	}
	input_field.appendChild(createPathVariableEntry(path));
	Select('#var_set_input_form_value_'+id).value = getFormValueOfPathSelection(id, input_field.innerHTML);
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

function toggleSelectionEditorButton(is_remove, id) {
	let elem = Select('#path_insert_button_'+id);
	elem.innerHTML = is_remove ? '&times;' : '&#8594;';
	elem.className = is_remove ? 'path_insert_button close_path_selection_editor' : 'path_insert_button';
	elem.onclick = (
		is_remove
			? function () {
					closePathEditor(this.data);
				}
			: function () {
					openPathEditor(Select('#var_set_input_'+this.data));
				}
	);
}

function createPathListForEditor(path = null) {
	let curr_path = GLOBAL.active_tournament.data;
	let is_data_set = false;
	let is_asset = false;
	if (path == '') {
		path = null;
	}
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
		(path != null
			? Create('div', {
					className: 'go_back_path_selection_editor',
					innerHTML: '&larr; <span style="font-weight:600;">return to parent</span>',
					onclick: () => {
						let path_split = path.split('/');
						path_split.pop();
						updatePathEditor(path_split.join('/'));
					}
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
			if (is_asset) {
				if (Select('#input_is_path_only_'+GLOBAL.ui.active_path_field_id).value == 'true') {
					is_value = true;
				}
			}
			return Create('div', {
				className: 'path_selection_element_'+(is_value ? 'set' : 'extend'),
				innerHTML: (is_value ? '&nbsp;&nbsp;&#9900;' : '&#8594; ')+print_key,
				onclick: (
					is_value
						? () => {
								setPathEditorValue(path == null ? key : path+'/'+key)
							}
						:	() => {
								updatePathEditor(path == null ? key : path+'/'+key);
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
}

function getFormValueOfPathSelection(id, value) {
	let input_field = Select('#var_set_input_'+id);
	let output = '';
	input_field.childNodes.forEach(node => {
		if (node.nodeName === '#text') {
			output += node.nodeValue;
		} else if (node.className == 'path_real_entry') {
			output += node.innerHTML;
		} else if (node.className == 'path_variable_entry') {
			output += '$var$'+node.innerHTML+'$/var$';
		}
	});
	return output;
}

// created with appended string because the document element doesnt exist yet
function getPathSelectionValueFromFormValue(value) {
	let output = ''
	getRealVariableParts(value).forEach(entry => {
		output += (
			entry.variable
				? '<span class="path_variable_entry" contenteditable="false">'+entry.variable+'</span>'
				: '<span class="path_real_entry">'+entry.real+'</span>'
		);
	});
	return output;
}

function createPathVariableField(settings = {}) {

	// ensure defaults exists
	if (typeof settings.name === 'undefined') {
		// no run without a name
		return false;
	}
	
	// increment global unique naming id
	GLOBAL.unique_id++;
	
	if (typeof settings.allow_path_only === 'undefined') {
		settings.allow_path_only = true;
	}
	if (typeof settings.force_path_only === 'undefined') {
		settings.force_path_only = false;
	} else if (settings.force_path_only) {
		settings.allow_path_only = false;
	}
	if (typeof settings.value === 'undefined') {
		settings.value = {
			path_only: false,
			value: ''
		};
	}
	if (typeof settings.show_setters === 'undefined') {
		settings.show_setters = false;
	}
	
	let is_content_editable = !settings.force_path_only && !settings.value.path_only;
	let is_path_only_name = settings.name;
	if (is_path_only_name.slice(-2) == '[]') {
		is_path_only_name = is_path_only_name.slice(0, -2)+'_is_path_only[]';
	} else {
		is_path_only_name += '_is_path_only'; 
	}
	
	return Create('div', {
		className: 'variable_set_input',
		children: [
			Create('div', {
				children: [
					Create('input', {
						type: 'hidden',
						id: 'var_set_input_form_value_'+GLOBAL.unique_id,
						name: settings.name,
						value: settings.value.value
					}),
					Create('input', {
						type: 'hidden',
						id: 'input_is_path_only_'+GLOBAL.unique_id,
						name: is_path_only_name,
						value: settings.value.path_only ? 'true' : 'false'
					}),
					Create('input', {
						type: 'hidden',
						id: 'input_is_source_setter_'+GLOBAL.unique_id,
						value: settings.force_path_only ? 'true' : 'false'
					}),
					Create('div', {
						id: 'var_set_input_'+GLOBAL.unique_id,
						data: GLOBAL.unique_id,
						className: 'variable_set_input_field has_path_insert',
						contentEditable: is_content_editable,
						onclick: function () {
							if (this.contentEditable == 'false') {
								openPathEditor(this, false);
							}
						},
						oninput: function () {
							Select('#var_set_input_form_value_'+this.data, { value: getFormValueOfPathSelection(this.data, this.innerHTML) });
						},
						innerHTML: getPathSelectionValueFromFormValue(settings.value.value)
					}),
					Create('div', {
						id: 'path_insert_button_'+GLOBAL.unique_id,
						data: GLOBAL.unique_id,
						className: 'path_insert_button',
						innerHTML: '&#8594;',
						onclick: function () {
							openPathEditor(Select('#var_set_input_'+this.data));
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
								innerHTML: 'Save as Path Variable ',
								children: [
									Create('input', {
										type: 'checkbox',
										data: GLOBAL.unique_id,
										checked: !is_content_editable,
										onchange: function () {
											let input_field = Select('#var_set_input_'+this.data);
											let is_now_content_editable = !this.checked;
											input_field.contentEditable = is_now_content_editable;
											if (!is_now_content_editable) {
												Select('#input_is_path_only_'+this.data).value = 'true';
												stripAndEnsureSinglePath(this.data);
											} else {
												Select('#input_is_path_only_'+this.data).value = 'false';
												input_field.focus();
											}
										}
									})
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