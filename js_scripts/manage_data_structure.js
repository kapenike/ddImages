function manageDataStructure(data, submit_to_application) {

	GLOBAL.data_structure.removed = [];
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
	// ensure reference exists within global state before logging as removed
	let ref = GLOBAL.data_structure.active_data_path;
	let path_parts = path.split('/');
	while (path_parts.length > 0) {
		let curr_path_part = path_parts.pop();
		if (typeof ref[curr_path_part] === 'undefined') {
			// exit
			return false;
		} else {
			ref = ref[curr_path_part];
		}
	}
	GLOBAL.data_structure.removed.push(path);
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

function updateDataStructureKeys(data, form_fields) {
	
	// bottom up so that form_field name reference is not broken
	// this may cause undefined paths within the data structure, auto gen
	let paths = Object.keys(form_fields);
	for (let i=paths.length-1; i>=0; i--) {
		let path = paths[i].split('/');
		let ref_path = data;
		while (path.length > 1) {
			let path_point = path.shift();
			if (typeof ref_path[path_point] === 'undefined') {
				ref_path[path_point] = {};
			}
			ref_path = ref_path[path_point];
		}
		let final_point = path.shift();
		if (typeof ref_path[final_point] === 'undefined') {
			ref_path[final_point] = '';
		}
		if (final_point != form_fields[paths[i]]) {
			ref_path[form_fields[paths[i]]] = ref_path[final_point] == '' ? '' : JSON.parse(JSON.stringify(ref_path[final_point]));
			delete ref_path[final_point];
		}
	}

	return data;
}

function updateDataStructure() {
	
	// get data structure key values
	let full_form = formToObj('form_capture');
	
	// create copy of data structure
	let local_data = JSON.parse(JSON.stringify(GLOBAL.data_structure.active_data_path));
	
	// list of ignored root paths and user removed data
	let remove_list = [...GLOBAL.data_structure.ignored, ...GLOBAL.data_structure.removed];
	
	// loop path as reference to local_data and delete keys
	for (let i=0; i<remove_list.length; i++) {
		let ref_path = local_data;
		let path_parts = remove_list[i].split('/');
		for (let i2=0; i2<path_parts.length-1; i2++) {
			ref_path = ref_path[path_parts[i2]];
		}
		// object reference changes require an object -> key assignment
		delete ref_path[path_parts[path_parts.length-1]];
	}
	
	// loop remaining data structure keys and detect changes
	local_data = updateDataStructureKeys(local_data, full_form);
	
	// append application and uid values to send object
	let form_details = {};
	form_details.application = Select('#form_capture').data;
	form_details.uid = GLOBAL.active_tournament.uid;
	form_details.data_structure = JSON.stringify(local_data);
	
	// update server-side data structure, then call back to same scope function to save changes locally
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		
		if (status) {
			
			// recurse update active local data structure
			updateDataStructureKeys(GLOBAL.data_structure.active_data_path, full_form);
		
		}
		
	}, 'body');
	
}
