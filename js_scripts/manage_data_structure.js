function manageDataStructure(data, submit_to_application) {

	GLOBAL.data_structure.new_key_inc = 0;
	GLOBAL.data_structure.active_data_path = data;

	return Create('form', {
		id: 'form_capture',
		data: submit_to_application,
		children: [
			Create('div', {
				className: 'block',
				children: [
					Create('div', {
						className: 'create_data_key',
						innerHTML: '+ Add Key',
						onclick: () => { createDataKey(null); }
					})
				]
			}),
			recurseSetKeyInputs(data, [])
		]
	});
	
}

function isObject(v) {
	return v != null && v.constructor.name === 'Object';
}

function recurseSetKeyInputs(data, path) {
	if (isObject(data)) {
		return Create('div', {
			children: [
				...Object.keys(data).map(key => {
					
					// edge case, prevent structure editing of root ignored keys
					if (path.length == 0 && GLOBAL.data_structure.ignored.includes(key)) {
						return Create('div');
					}
					
					let curr_path = [...path, key];
					let curr_name_path = curr_path.join('/');
					return Create('div', {
						className: 'data_key_block',
						children: [
							Create('input', {
								type: 'text',
								name: curr_name_path,
								value: key
							}),
							Create('div', {
								className: 'remove_data_key',
								innerHTML: '&times',
								onclick: () => { removeDataKey(curr_name_path); }
							}),
							Create('div', {
								className: 'create_data_key',
								innerHTML: '+ Add Key',
								onclick: () => { createDataKey(curr_name_path); }
							}),
							recurseSetKeyInputs(data[key], curr_path)
						]
					});
				})
			]
		});
	} else {
		return Create('div');
	}
}

function removeDataKey(path) {
	Select('[name="'+path+'"').parentNode.remove();
}

function generateNewDataKey() {
	return 'new_key_'+(++GLOBAL.data_structure.new_key_inc);
}

function createDataKey(path) {
	let new_key = generateNewDataKey();
	(
		path == null
			? Select('#form_capture')
			: Select('[name="'+path+'"]').parentNode
	).lastChild.prepend(recurseSetKeyInputs({ [new_key]: '' }, (path == null ? [] : path.split('/'))));
}

function createDataStructureFromForm(data, form_fields) {
	
	let return_data = {};
	
	Object.keys(form_fields).forEach(key_path => {
		let path = key_path.split('/');
		let data_origin_ref_path = data;
		let return_data_ref_path = return_data;
		let final_value = '';
		let last_key = 'error';
		path.forEach((path_pointer, index) => {
			// during new object creation, check for valid value path in old object
			if (typeof data_origin_ref_path !== 'undefined' && typeof data_origin_ref_path[path_pointer] !== 'undefined') {
				data_origin_ref_path = data_origin_ref_path[path_pointer];
			}
			// convert path pointer based on value in form for use in new object creation
			path_pointer = form_fields[path.slice(0, index+1).join('/')];
			// prevent final key assignment
			if (index < path.length-1) {
				// if previously defined as end of path empty string or has not been defined yet, set as empty object
				if (!isObject(return_data_ref_path[path_pointer]) || typeof return_data_ref_path[path_pointer] === 'undefined') {
					return_data_ref_path[path_pointer] = {};
				}
				// continue new object reference path
				return_data_ref_path = return_data_ref_path[path_pointer];
			}
			// save for later final key assignment
			last_key = path_pointer;
		});
		// if old path contains an output value
		if (typeof data_origin_ref_path !== 'undefined' && !isObject(data_origin_ref_path)) {
			final_value = data_origin_ref_path;
		}
		// set final value
		return_data_ref_path[last_key] = final_value;
	});

	return return_data;
}

function updateDataStructure() {
	
	// get data structure key values
	let full_form = formToObj('form_capture');
	
	// create data structure from UI form elements
	let local_data = createDataStructureFromForm(GLOBAL.data_structure.active_data_path, full_form);
	
	// append application and uid values to send object
	let form_details = {};
	form_details.application = Select('#form_capture').data;
	form_details.uid = GLOBAL.active_tournament.uid;
	form_details.data_structure = JSON.stringify(local_data);
	
	// update server-side data structure, then call back to same scope function to save changes locally
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		
		if (status) {
			
			// loop original data structure and update non-ignored keys, remove unfound root keys
			Object.keys(GLOBAL.data_structure.active_data_path).forEach(root_key => {
				if (!GLOBAL.data_structure.ignored.includes(root_key)) {
					if (typeof local_data[root_key] === 'undefined') {
						delete GLOBAL.data_structure.active_data_path[root_key];
					} else {
						GLOBAL.data_structure.active_data_path[root_key] = local_data[root_key];
					}
				}
			});
		
		}
		
	}, 'body');
	
}
