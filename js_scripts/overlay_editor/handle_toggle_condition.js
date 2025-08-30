// toggle = stored comparitor value, is_init = boolean where false appends the element and true returns the element
function handleToggleCondition(toggle, is_init = false) {
	
	let return_elem = Create('div');
	
	// get comparator if it exists
	let is_comparator = isComparator(toggle);
	
	if (is_comparator) {
		
		let toggle_values = toggle.split('$comp$'+is_comparator+'$/comp$');
		
		Create(return_elem, {
			children: [
				createPathVariableField({
					name: 'editor_toggle_left',
					value: {
						value: toggle_values[0]
					},
					allow_path_only: false,
					on_edit: function () {
						getLayerById(GLOBAL.overlay_editor.active_layer).toggle = this.value+'$comp$'+Select('[name="editor_toggle_comparator"]').value+'$/comp$'+Select('[name="editor_toggle_right"]').value;
						printCurrentCanvas();
					}
				}),
				Create('select', {
					name: 'editor_toggle_comparator',
					onchange: function (){
						getLayerById(GLOBAL.overlay_editor.active_layer).toggle = Select('[name="editor_toggle_left"]').value+'$comp$'+this.value+'$/comp$'+Select('[name="editor_toggle_right"]').value;
						printCurrentCanvas();
					},
					chidren: ['equal', 'not equal', 'less than', 'more than', 'less than or equal', 'more than or equal'].map(comparator => {
						return Create('option', {
							innerHTML: comparator,
							value: comparator,
							selected: (is_comparator == comparator)
						});
					})
				}),
				createPathVariableField({
					name: 'editor_toggle_right',
					value: {
						value: toggle_values[1]
					},
					allow_path_only: false,
					on_edit: function () {
						getLayerById(GLOBAL.overlay_editor.active_layer).toggle = Select('[name="editor_toggle_left"]').value+'$comp$'+Select('[name="editor_toggle_comparator"]').value+'$/comp$'+this.value;
						printCurrentCanvas();
					}
				}),
				Create('label', {
					innerHTML: 'Use Comparator',
					children: [
						Create('input', {
							type: 'checkbox',
							style: {
								height: '14px'
							},
							checked: true,
							onclick: function () {
								getLayerById(GLOBAL.overlay_editor.active_layer).toggle = '';
								handleToggleCondition('');
							}
						})
					]
				})
			]
		}, true);
		
	} else {
		
		// no comparator toggle
		Create(return_elem, {
			children: [
				createPathVariableField({
					name: 'editor_toggle',
					value: {
						value: toggle
					},
					allow_path_only: true,
					on_edit: function () {
						getLayerById(GLOBAL.overlay_editor.active_layer).toggle = this.value;
						printCurrentCanvas();
					}
				}),
				Create('label', {
					innerHTML: 'Use Comparator',
					children: [
						Create('input', {
							type: 'checkbox',
							style: {
								height: '14px'
							},
							checked: false,
							onclick: function () {
								getLayerById(GLOBAL.overlay_editor.active_layer).toggle = '$comp$equal$/comp$';
								handleToggleCondition('$comp$equal$/comp$');
							}
						})
					]
				})
			]
		}, true);
		
	}
	
	// if init, return, otherwise append
	if (is_init) {
		return return_elem;
	} else {
		Select('#toggle_condition', {
			innerHTML: '',
			children: [
				return_elem
			]
		});
	}
	
}