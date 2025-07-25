function editOverlay(slug) {
	
	GLOBAL.overlay_editor.slug = slug;
	GLOBAL.overlay_editor.current = JSON.parse(JSON.stringify(GLOBAL.active_tournament.overlays[slug]));
	
	// create image editor for current overlay
	Select('#body').appendChild(
		Create('div', {
			id: 'image_editor',
			children: [
				Create('div', {
					className: 'editor_info_bar',
					children: [
						Create('span', {
							className: 'editor_info_bar_title',
							innerHTML: GLOBAL.overlay_editor.current.title
						}),
						Create('div', {
							className: 'editor_close',
							innerHTML: '&times;',
							onclick: closeOverlayEditor
						}),
						Create('div', {
							className: 'editor_save',
							innerHTML: 'save',
							onclick: saveOverlay
						}),
						Create('div', {
							className: 'editor_tab',
							innerHTML: 'Image Dimensions',
							onclick: function () {
								setImageEditorDialog(event, {
									title: 'Image Dimensions',
									items: [
										{
											title: 'Width <input type="text" id="canvas_width" value="'+GLOBAL.overlay_editor.current.dimensions.width+'"/>',
											click: () => {}
										},
										{
											title: 'Height <input type="text" id="canvas_height" value="'+GLOBAL.overlay_editor.current.dimensions.height+'"/>',
											click: () => {}
										},
										{
											title: 'Update',
											click: function () {
												GLOBAL.overlay_editor.current.dimensions.width = parseInt(Select('#canvas_width').value);
												GLOBAL.overlay_editor.current.dimensions.height = parseInt(Select('#canvas_height').value);
												removeUIEditMenu();
												setupScalingFactor();
												printCurrentCanvas();
											},
											action: true
										}
									]
								});
							}
						})
					]
				}),
				Create('div', {
					className: 'image_editor_workspace',
					children: [
						Create('canvas', {
							id: 'workspace'
						})
					]
				}),
				Create('div', {
					className: 'layer_editor',
					children: [
						Create('div', {
							id: 'upper_editor'
						}),
						Create('div', {
							className: 'layer_manager',
							children: [
								Create('div', {
									className: 'layer_manager_title',
									innerHTML: 'Layers'
								}),
								Create('div', {
									className: 'layer_manager_add',
									innerHTML: '+ New Layer',
									onclick: function () {
										addNewLayer();
									}
								})
							]
						}),
						Create('div', {
							id: 'lower_editor'
						})
					]
				})
			]
		})
	);
	
	// set fixed canvas size
	let canvas = Select('#workspace');
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
	
	GLOBAL.overlay_editor.ctx = canvas.getContext('2d');
	
	// stash canvas dimensions
	GLOBAL.overlay_editor.dimensions = {
		width: canvas.width,
		height: canvas.height
	};
	
	// offset for project drag window
	GLOBAL.overlay_editor.canvas_window = {
		x: 0,
		y: 0,
		origins: null
	};
	
	// setup active layer index
	GLOBAL.overlay_editor.active_layer = null;
	
	// setup scaling factor
	GLOBAL.overlay_editor.scale = 1;
	
	setupScalingFactor();
	
	setupLayersUI();
	
	printCurrentCanvas();
	
	createImageEditorListeners();
	
	// override global save and stash old
	GLOBAL.overlay_editor.old_save = GLOBAL.navigation.on_save;
	GLOBAL.navigation.on_save = saveOverlay;
}

function closeOverlayEditor() {
	GLOBAL.overlay_editor.active_layer = null;
	GLOBAL.navigation.on_save = GLOBAL.overlay_editor.old_save;
	removeImageEditorListeners();
	Select('#image_editor').remove();
}

function saveOverlay() {
	
	let form_details = {
		uid: GLOBAL.active_tournament.uid,
		application: 'update_overlay_layers',
		slug: GLOBAL.overlay_editor.slug,
		overlay: JSON.stringify(GLOBAL.overlay_editor.current)
	}
	
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		if (status) {
			
			// update local overlay
			GLOBAL.active_tournament.overlays[GLOBAL.overlay_editor.slug] = GLOBAL.overlay_editor.current;
			
			// update overlay output
			generateStreamOverlays({ slug: GLOBAL.overlay_editor.slug });
			
			// refresh overlay image on previous editor screen
			let img = Select('.asset_preview').children[0];
			img.src = img.src+'?'+new Date().getTime();
			
		}
	}, 'body');
	
}

function setupScalingFactor() {
	if (GLOBAL.overlay_editor.current.dimensions.width > GLOBAL.overlay_editor.dimensions.width) {
		GLOBAL.overlay_editor.scale = GLOBAL.overlay_editor.dimensions.width / GLOBAL.overlay_editor.current.dimensions.width;
	} else if (GLOBAL.overlay_editor.current.dimensions.height > GLOBAL.overlay_editor.dimensions.height) {
		GLOBAL.overlay_editor.scale = GLOBAL.overlay_editor.dimensions.height / GLOBAL.overlay_editor.current.dimensions.width;
	}
}

function setupLayersUI() {
	Select('#lower_editor', {
		innerHTML: '',
		children: GLOBAL.overlay_editor.current.layers.map((layer, index) => {
			return Create('div', {
				id: 'layer_'+index,
				className: 'editor_layer'+(index == GLOBAL.overlay_editor.active_layer ? ' active_editor_layer' : ''),
				innerHTML: '<span id="layer_'+index+'_title">'+layer.title+'</span>',
				children: (layer.type == 'clip_path'
					?	[
							Create('div', {
								className: 'editor_layer_group',
								children: layer.layers.map((group_layer, sub_index) => {
									return Create('div', {
										id: 'layer_'+index+'_'+sub_index,
										className: 'editor_layer'+(index+'_'+sub_index == GLOBAL.overlay_editor.active_layer ? ' active_editor_layer' : ''),
										innerHTML: '<span id="layer_'+index+'_'+sub_index+'_title">'+group_layer.title+'</span>',
										onclick: () => { setActiveLayer(index+'_'+sub_index); event.stopPropagation(); },
										oncontextmenu: function () { editLayer(this); event.stopPropagation(); }
									})
								})
							})
						]
					: []
				),
				onclick: () => { setActiveLayer(index); },
				oncontextmenu: function () { editLayer(this); }
			})
		})
	});
}

function setActiveLayer(index) {
	GLOBAL.overlay_editor.active_layer = index;
	printCurrentCanvas();
	setupLayerInfo();
	setupLayersUI();
}

function getLayerById(id) {
	ids = id.toString().split('_').filter(v => v != 'layer');
	if (ids.length > 1) {
		return GLOBAL.overlay_editor.current.layers[ids[0]].layers[ids[1]];
	} else {
		return GLOBAL.overlay_editor.current.layers[ids[0]];
	}
}

function setupLayerInfo() {
	
	// if no active layer, remove info instead
	if (GLOBAL.overlay_editor.active_layer == null) {
		Select('#upper_editor', {
			innerHTML: ''
		});
		return;
	}
	
	let layer = getLayerById(GLOBAL.overlay_editor.active_layer);
	
	Select('#upper_editor', {
		innerHTML: '',
		children: [
			Create('div', {
				className: 'editor_section_block',
				style: {
					marginTop: '6px',
					paddingTop: '6px'
				},
				children: [
					Create('div', {
						className: 'editor_section_title',
						innerHTML: 'Layer Title'
					}),
					Create('input', {
						type: 'text',
						value: layer.title,
						onkeyup: function () {
							getLayerById(GLOBAL.overlay_editor.active_layer).title = this.value;
							Select('#layer_'+GLOBAL.overlay_editor.active_layer+'_title').innerHTML = this.value;
							printCurrentCanvas();
						}
					})
				]
			}),
			Create('div', {
				className: 'editor_section_block',
				children: [
					Create('div', {
						className: 'editor_section_title',
						innerHTML: 'Source and Toggle'
					}),
					(layer.type == 'text'
						?	Create('span', {
								innerHTML: 'Value',
								className: 'editor_spanlabel',
								children: [
									createPathVariableField({
										name: 'editor_value',
										value: {
											path_only: false,
											value: layer.value
										},
										allow_path_only: false,
										on_edit: function () {
											getLayerById(GLOBAL.overlay_editor.active_layer).value = this.value;
											printCurrentCanvas();
										}
									})
								]
							})
						: (layer.type == 'image'
								? Create('span', {
										innerHTML: 'Source',
										className: 'editor_spanlabel',
										children: [
											createPathVariableField({
												name: 'editor_value',
												override_source_setter: true,
												value: {
													path_only: false,
													value: layer.value,
													image_search: true
												},
												force_path_only: true,
												on_edit: function () {
													getLayerById(GLOBAL.overlay_editor.active_layer).value = this.value;
													printCurrentCanvas();
												}
											})
										]
									})
								: Create('div')
							)
					),
					Create('span', {
						innerHTML: 'Toggle',
						className: 'editor_spanlabel',
						children: [
							createPathVariableField({
								name: 'editor_toggle',
								value: {
									path_only: false,
									value: layer.toggle ?? '' //temp
								},
								force_path_only: true,
								on_edit: function () {
									getLayerById(GLOBAL.overlay_editor.active_layer).toggle = this.value;
									printCurrentCanvas();
								}
							})
						]
					})
				]
			}),
			( layer.type == 'text'
				? Create('div', {
						className: 'editor_section_block',
						children: [
							Create('div', {
								className: 'editor_section_title',
								innerHTML: 'Text Style'
							}),
							Create('div', {
								className: 'row',
								children: [
									Create('div', {
										className: 'col',
										style: {
											width: '44%'
										},
										children: [
											Create('label', {
												innerHTML: 'Font',
												children: [
													Create('select', {
														children: [...custom_font_list, 'Arial','Verdana','Tahoma','Trebuchet MS','Times New Roman','Georgia', 'Garamond', 'Courier New', 'Brush Script MT'].sort().map(font => {
															return Create('option', {
																innerHTML: font,
																value: "'"+font+"'",
																selected: layer.style.font == "'"+font+"'"
															})
														}),
														onchange: function () {
															getLayerById(GLOBAL.overlay_editor.active_layer).style.font = this.value;
															printCurrentCanvas();
														}
													})
												]
											})
										]
									}),
									Create('div', {
										className: 'col',
										style: {
											width: '30%'
										},
										children: [
											Create('label', {
												innerHTML: 'Size',
												children: [
													Create('input', {
														type: 'number',
														min: 1,
														step: 0.5,
														value: layer.style.fontSize,
														onchange: function () {
															getLayerById(GLOBAL.overlay_editor.active_layer).style.fontSize = precise(this.value);
															this.value = preciseAndTrim(this.value);
															printCurrentCanvas();
														}
													})
												]
											})
										]
									}),
									Create('div', {
										className: 'col',
										style: {
											width: '26%'
										},
										children: [
											Create('label', {
												innerHTML: 'Unit',
												children: [
													Create('select', {
														children: ['px','%','pt','in','cm','mm','pc','em'].map(unit => {
															return Create('option', {
																innerHTML: unit,
																value: unit,
																selected: unit == layer.style.unitMeasure
															})
														}),
														onchange: function () {
															getLayerById(GLOBAL.overlay_editor.active_layer).style.fontMeasure = this.value;
															printCurrentCanvas();
														}
													})
												]
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'row',
								children: [
									Create('div', {
										className: 'col',
										style: {
											width: '35%'
										},
										children: [
											Create('label', {
												innerHTML: 'Style',
												children: [
													Create('select', {
														children: ['normal','italic'].map(style => {
															return Create('option', {
																innerHTML: style,
																value: style,
																selected: style == layer.style.fontStyle
															})
														}),
														onchange: function () {
															getLayerById(GLOBAL.overlay_editor.active_layer).style.fontStyle = this.value;
															printCurrentCanvas();
														}
													})
												]
											})
										]
									}),
									Create('div', {
										className: 'col',
										style: {
											width: '30%'
										},
										children: [
											Create('label', {
												innerHTML: 'Weight',
												children: [
													Create('select', {
														children: ['100','200','300','400','500','600','700','800'].map(weight => {
															return Create('option', {
																innerHTML: weight,
																value: weight,
																selected: weight == layer.style.fontWeight
															})
														}),
														onchange: function () {
															getLayerById(GLOBAL.overlay_editor.active_layer).style.fontWeight = this.value;
															printCurrentCanvas();
														}
													})
												]
											})
										]
									}),
									Create('div', {
										className: 'col',
										style: {
											width: '35%'
										},
										children: [
											Create('label', {
												innerHTML: 'Color',
												children: [
													Create('input', {
														style: {
															backgroundColor: layer.style.color,
															height: '41px'
														},
														type: 'color',
														value: layer.style.color,
														onchange: function () {
															getLayerById(GLOBAL.overlay_editor.active_layer).style.color = this.value;
															this.style.backgroundColor = this.value;
															printCurrentCanvas();
														}
													})
												]
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'row',
								children: [
									Create('div', {
										className: 'col',
										style: {
											width: '40%'
										},
										children: [
											Create('label', {
												innerHTML: 'Align',
												children: [
													Create('select', {
														children: ['Left','Center','Right'].map(alignment => {
															let lower_case_align = alignment.toLowerCase();
															return Create('option', {
																innerHTML: alignment,
																value: lower_case_align,
																selected: lower_case_align == layer.style.align
															})
														}),
														onchange: function () {
															getLayerById(GLOBAL.overlay_editor.active_layer).style.align = this.value;
															printCurrentCanvas();
														}
													})
												]
											})
										]
									}),
									Create('div', {
										className: 'col',
										style: {
											width: '40%'
										},
										children: [
											Create('label', {
												innerHTML: 'CAPS<br />',
												children: [
													Create('input', {
														type: 'checkbox',
														checked: layer.style.caps == true,
														onchange: function () {
															getLayerById(GLOBAL.overlay_editor.active_layer).style.caps = this.checked;
															printCurrentCanvas();
														}
													})
												]
											})
										]
									})
								]
							})
						]
					})
				: Create('div')
			),
			(layer.type != 'clip_path'
				? Create('div', {
						className: 'editor_section_block',
						children: [
							Create('div', {
								className: 'editor_section_title',
								innerHTML: 'Dimensions and Position'
							}),
							Create('div', {
								className: 'row',
								children: [
									Create('div', {
										className: 'col',
										style: {
											width: '50%'
										},
										children: [
											Create('label', {
												innerHTML: 'x',
												children: [
													Create('input', {
														type: 'number',
														value: layer.offset.x,
														onchange: function () {
															getLayerById(GLOBAL.overlay_editor.active_layer).offset.x = precise(this.value);
															this.value = preciseAndTrim(this.value);
															printCurrentCanvas();
														}
													})
												]
											})
										]
									}),
									Create('div', {
										className: 'col',
										style: {
											width: '50%'
										},
										children: [
											Create('label', {
												innerHTML: 'y',
												children: [
													Create('input', {
														type: 'number',
														value: layer.offset.y,
														onchange: function () {
															getLayerById(GLOBAL.overlay_editor.active_layer).offset.y = precise(this.value);
															this.value = preciseAndTrim(this.value);
															printCurrentCanvas();
														}
													})
												]
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'row',
								children: [
									Create('div', {
										className: 'col',
										style: {
											width: '50%'
										},
										children: [
											Create('label', {
												innerHTML: 'Width',
												children: [
													Create('input', {
														id: 'layer_width',
														type: 'number',
														value: layer.dimensions.width,
														onchange: function () {
															getLayerById(GLOBAL.overlay_editor.active_layer).dimensions.width = precise(this.value);
															this.value = preciseAndTrim(this.value);
															printCurrentCanvas();
														}
													})
												]
											})
										]
									}),
									(layer.type != 'text'
										? Create('div', {
												className: 'col',
												style: {
													width: '50%'
												},
												children: [
													Create('label', {
														innerHTML: 'Height',
														children: [
															Create('input', {
																type: 'number',
																id: 'layer_height',
																value: layer.dimensions.height,
																onchange: function () {
																	getLayerById(GLOBAL.overlay_editor.active_layer).dimensions.height = precise(this.value);
																	this.value = preciseAndTrim(this.value);
																	printCurrentCanvas();
																}
															})
														]
													})
												]
											})
										: Create('div')
									)
								]
							})
						]
					})
				: Create('div')
			),
			(layer.type == 'clip_path'
				? Create('div', {
						children: [
							Create('div', {
								className: 'editor_section_block',
								children: [
									Create('div', {
										className: 'editor_section_title',
										innerHTML: 'Clipping Path Type'
									}),
									Create('select', {
										children: [
											Create('option', {
												innerHTML: '- None -',
												value: 'none',
												selected: layer.clip_path.type == 'none'
											}),
											Create('option', {
												innerHTML: 'Square',
												value: 'square',
												selected: layer.clip_path.type == 'square'
											}),
											Create('option', {
												innerHTML: 'Custom',
												disabled: true,
												value: 'custom',
												selected: layer.clip_path.type == 'custom'
											}),
										],
										onchange: function () {
											getLayerById(GLOBAL.overlay_editor.active_layer).clip_path.type = this.value;
											Select('#square_clip_editor_section').style.display = (this.value == 'none' || this.value == 'custom' ? 'none' : 'block');
											Select('#clip_editor_background_color').style.display = (this.value == 'none' ? 'none' : 'block');
											printCurrentCanvas();
										}
									})
								]
							}),
							Create('div', {
								className: 'editor_section_block',
								id: 'clip_editor_background_color',
								style: {
									display: (layer.clip_path.type == 'none' ? 'none' : 'block')
								},
								children: [
									Create('div', {
										className: 'editor_section_title',
										innerHTML: 'Clip Path Background Color'
									}),
									Create('span', {
										innerHTML: 'Color',
										className: 'editor_spanlabel',
										children: [
											createPathVariableField({
												name: 'editor_clip_path_bg_color',
												value: {
													path_only: false,
													value: layer.clip_path.color
												},
												allow_path_only: false,
												on_edit: function () {
													getLayerById(GLOBAL.overlay_editor.active_layer).clip_path.color = this.value;
													printCurrentCanvas();
												}
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'editor_section_block',
								id: 'square_clip_editor_section',
								style: {
									display: (layer.clip_path.type == 'square' ? 'block' : 'none')
								},
								children: [
									Create('div', {
										className: 'editor_section_title',
										innerHTML: 'Square Clip Dimensions'
									}),
									Create('div', {
										className: 'row',
										children: [
											Create('div', {
												className: 'col',
												style: {
													width: '50%'
												},
												children: [
													Create('label', {
														innerHTML: 'x',
														children: [
															Create('input', {
																type: 'number',
																value: layer.clip_path.offset.x,
																onchange: function () {
																	getLayerById(GLOBAL.overlay_editor.active_layer).clip_path.offset.x = precise(this.value);
																	this.value = preciseAndTrim(this.value);
																	printCurrentCanvas();
																}
															})
														]
													})
												]
											}),
											Create('div', {
												className: 'col',
												style: {
													width: '50%'
												},
												children: [
													Create('label', {
														innerHTML: 'y',
														children: [
															Create('input', {
																type: 'number',
																value: layer.clip_path.offset.y,
																onchange: function () {
																	getLayerById(GLOBAL.overlay_editor.active_layer).clip_path.offset.y = precise(this.value);
																	this.value = preciseAndTrim(this.value);
																	printCurrentCanvas();
																}
															})
														]
													})
												]
											})
										]
									}),
									Create('div', {
										className: 'row',
										children: [
											Create('div', {
												className: 'col',
												style: {
													width: '50%'
												},
												children: [
													Create('label', {
														innerHTML: 'Width',
														children: [
															Create('input', {
																type: 'number',
																value: layer.clip_path.dimensions.width,
																onchange: function () {
																	getLayerById(GLOBAL.overlay_editor.active_layer).clip_path.dimensions.width = precise(this.value);
																	this.value = preciseAndTrim(this.value);
																	printCurrentCanvas();
																}
															})
														]
													})
												]
											}),
											Create('div', {
												className: 'col',
												style: {
													width: '50%'
												},
												children: [
													Create('label', {
														innerHTML: 'Height',
														children: [
															Create('input', {
																type: 'number',
																value: layer.clip_path.dimensions.height,
																onchange: function () {
																	getLayerById(GLOBAL.overlay_editor.active_layer).clip_path.dimensions.height = precise(this.value);
																	this.value = preciseAndTrim(this.value);
																	printCurrentCanvas();
																}
															})
														]
													})
												]
											})
										]
									})
								]
							})
						]
					})
				: Create('div')
			)
		]
	})

}

function editLayer(elem) {
	event.preventDefault();
	let index = elem.id.split('_');
	index.shift();
	index = index.join('_');
	setImageEditorDialog(event, {
		title: 'Edit Layer',
		items: [
			{
				title: 'Duplicate',
				click: () => { addNewTypeLayer('text', index, true); }
			},
			{
				title: 'Remove',
				click: () => { removeLayer(index); },
				remove: true
			}
		]
	});
}

function addNewLayer(index = null) {
	setImageEditorDialog(event, {
		title: 'New Layer Type',
		items: [
			{
				title: 'Text',
				click: () => { addNewTypeLayer('text', index); }
			},
			{
				title: 'Image',
				click: () => { addNewTypeLayer('image', index); }
			},
			{
				title: 'Rectangle',
				click: () => { addNewTypeLayer('rect', index); }
			},
			{
				title: 'Clipping Group',
				click: () => { addNewTypeLayer('clip_path', index); }
			}
		]
	});
}

function addNewTypeLayer(type, index, duplicate = false) {
	let ref = index == null ? null : getLayerById(index);
	let new_layer = null;
	if (duplicate == false) {
		if (type == 'text') {
			new_layer = {
				type: 'text',
				toggle: '',
				title: 'Untitled Text Layer',
				value: '',
				style: {
					font: 'Arial',
					fontStyle: 'normal',
					fontWeight: '400',
					fontSize: '22',
					fontMeasure: 'px',
					color: '#000000',
					align: 'left',
					caps: false
				},
				offset: {
					x: GLOBAL.overlay_editor.current.dimensions.width/2,
					y: GLOBAL.overlay_editor.current.dimensions.height/2
				},
				dimensions: {
					width: 300
				}
			};
		} else if (type == 'image') {
			new_layer = {
				type: 'image',
				toggle: '',
				title: 'Untitled Image Layer',
				value: '',
				offset: {
					x: GLOBAL.overlay_editor.current.dimensions.width/2,
					y: GLOBAL.overlay_editor.current.dimensions.height/2
				},
				dimensions: {
					width: '',
					height: ''
				}
			};
		} else if (type == 'clip_path') {
			new_layer = {
				type: 'clip_path',
				toggle: '',
				title: 'Untitled Group',
				clip_path: {
					type: 'none',
					color: '',
					offset: {
						x: GLOBAL.overlay_editor.current.dimensions.width/2,
						y: GLOBAL.overlay_editor.current.dimensions.height/2
					},
					dimensions: {
						width: 100,
						height: 100
					},
					clip_points: []
				},
				layers: []
			};
		}
	} else {
		new_layer = JSON.parse(JSON.stringify(ref));
		new_layer.title += ' (duplicate)';
	}
	if (index == null) {
		GLOBAL.overlay_editor.current.layers.unshift(new_layer);
		setActiveLayer(0);
	} else {
		if (index.indexOf('_') > -1) {
			let ids = index.split('_');
			GLOBAL.overlay_editor.current.layers[ids[0]].layers.splice(ids[1], 0, new_layer);
		} else {
			GLOBAL.overlay_editor.current.layers.splice(index, 0, new_layer);
		}
		setActiveLayer(index);
	}
	removeUIEditMenu();
}

function removeLayer(index) {
	if (index.indexOf('_') > -1) {
		let ids = index.split('_');
		GLOBAL.overlay_editor.current.layers[ids[0]].layers.splice(ids[1], 1);
	} else {
		GLOBAL.overlay_editor.current.layers.splice(index, 1);
	}
	setActiveLayer(null);
	removeUIEditMenu();
}

// removeUIEditMenu(); hijacked from create_ui.js

function setImageEditorDialog(event, menu_items) {
	removeUIEditMenu();
	
	let x = event.clientX;
	let y = event.clientY;
	
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
				children: [
					(typeof menu_items.title !== 'undefined' && menu_items.title != '' 
						?	Create('div', {
								className: 'ui_edit_menu_title',
								innerHTML: menu_items.title
							})
						: Create('span')
					),
					...menu_items.items.map(item => {
						return Create('div', {
							innerHTML: item.title,
							onclick: item.click,
							className: (typeof item.remove === 'undefined' ? (typeof item.action === 'undefined' ? '' : 'ui_edit_menu_save') : 'ui_edit_menu_remove')
						});
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

function createImageEditorListeners() {
	window.addEventListener('mousedown', imageEditorMouseDown);
	window.addEventListener('mousemove', imageEditorMouseMove);
	window.addEventListener('mouseup', imageEditorMouseUp);
	window.addEventListener('contextmenu', imageEditorMouseCTX);
	window.addEventListener('wheel', imageEditorZoom);
}

function removeImageEditorListeners() {
	window.removeEventListener('mousedown', imageEditorMouseDown);
	window.removeEventListener('mousemove', imageEditorMouseMove);
	window.removeEventListener('mouseup', imageEditorMouseUp);
	window.removeEventListener('contextmenu', imageEditorMouseCTX);
	window.removeEventListener('wheel', imageEditorZoom);
}

var image_editor_drag = null;

function targetIsLayerElem(elem) {
	return elem.className.split(' ').includes('editor_layer');
}

function imageEditorMouseCTX(event) {
	// if not a layer element, prevent context menu click
	if (!targetIsLayerElem(event.target)) {
		event.preventDefault();
	}
}

function imageEditorZoom(event) {
	if (event.target.id == 'workspace') {
		let delta = event.deltaY > 0 ? 1 : -1;
		GLOBAL.overlay_editor.scale *= event.deltaY < 0 ? 1.09 : .81;
		printCurrentCanvas();
	}
}

function imageEditorMouseDown(event) {
	
	// init layer drag
	if (image_editor_drag == null && targetIsLayerElem(event.target)) {
		image_editor_drag = {
			id: event.target.id,
			elem: event.target,
			active_hover: event.target.id,
			dragging: false
		};
		return;
	} 

	// init canvas drags
	if (event.target.id == 'workspace') {
		
		// if active selection
		if (GLOBAL.overlay_editor.active_layer_selection) {
			let translate_scale_x = event.clientX;
			let translate_scale_y = event.clientY;
			
			let canvas_elem = Select('#workspace');
			let canvas_dimensions = {
				offset_y: canvas_elem.getBoundingClientRect().top,
				width: canvas_elem.width,
				height: canvas_elem.height
			}
			
			// relate y to canvas origin
			translate_scale_y -= canvas_dimensions.offset_y;
			// relate y to translated origins within drawn canvas
			translate_scale_y -= (GLOBAL.overlay_editor.dimensions.height/2) - ((GLOBAL.overlay_editor.current.dimensions.height/2)*GLOBAL.overlay_editor.scale) - GLOBAL.overlay_editor.canvas_window.y;
			// scale y up for 1 to 1 in overlay comparison
			translate_scale_y = translate_scale_y/GLOBAL.overlay_editor.scale;
			
			// x already at canvas origin
			// relate x to translate origins within drawn canvas
			translate_scale_x -= (GLOBAL.overlay_editor.dimensions.width/2) - ((GLOBAL.overlay_editor.current.dimensions.width/2)*GLOBAL.overlay_editor.scale) - GLOBAL.overlay_editor.canvas_window.x;
			// scale x up for 1 to 1 in overlay comparison
			translate_scale_x = translate_scale_x/GLOBAL.overlay_editor.scale;
			
			if (
				translate_scale_x > GLOBAL.overlay_editor.active_layer_selection.x &&
				translate_scale_y > GLOBAL.overlay_editor.active_layer_selection.y &&
				translate_scale_x < GLOBAL.overlay_editor.active_layer_selection.x + GLOBAL.overlay_editor.active_layer_selection.width &&
				translate_scale_y < GLOBAL.overlay_editor.active_layer_selection.y + GLOBAL.overlay_editor.active_layer_selection.height
			) {
				GLOBAL.overlay_editor.layer_selection_drag = {
					origin: {
						x: event.clientX,
						y: event.clientY
					},
					layer_origin: {
						x: GLOBAL.overlay_editor.active_layer_selection.layer_x,
						y: GLOBAL.overlay_editor.active_layer_selection.layer_y
					},
					sub_layer_origins: null
				}
				// stash group layer children origins
				let layer = getLayerById(GLOBAL.overlay_editor.active_layer);
				if (typeof layer.clip_path !== 'undefined') {
					GLOBAL.overlay_editor.layer_selection_drag.sub_layer_origins = layer.layers.map(v => {
						return {
							x: v.offset.x,
							y: v.offset.y
						};
					});
				}
				
				// prevent canvas drag is selection drag true
				return;
			}
		}
		
		// init project drag
		GLOBAL.overlay_editor.canvas_window.origins = {
			x: GLOBAL.overlay_editor.canvas_window.x + event.clientX,
			y: GLOBAL.overlay_editor.canvas_window.y + event.clientY
		};
	
	}
	
}

function imageEditorMouseMove(event) {
	if (image_editor_drag != null) {
		
		if (image_editor_drag.dragging == false) {
			
			// create draggable ui indicator element
			Select('#body', {
				children: [
					Create('div', {
						id: 'drag_clone',
						style: {
							width: event.target.offsetWidth+'px',
							height: event.target.offsetHeight+'px'
						}
					})
				]
			});
			image_editor_drag.dragging = true;
		}
		
		// update drag clone location
		Select('#drag_clone', {
			style: {
				top: event.clientY+'px',
				left: event.clientX+'px'
			}
		});
		
		// layer drag border indicator
		if (targetIsLayerElem(event.target)) {
			// reset past drop element border
			Select('#'+image_editor_drag.active_hover).style.borderTop = '';
			// set new drop element
			event.target.style.borderTop = '4px solid #0469e2';
			image_editor_drag.active_hover = event.target.id;
		}
		
	} else if (GLOBAL.overlay_editor.layer_selection_drag) {
		
		// cursor move layer and reprint
		let x_diff = (GLOBAL.overlay_editor.layer_selection_drag.origin.x - event.clientX)/GLOBAL.overlay_editor.scale;
		let y_diff = (GLOBAL.overlay_editor.layer_selection_drag.origin.y - event.clientY)/GLOBAL.overlay_editor.scale;
		
		// drag hotkeys
		// ctrl - allow vertical only
		// shift - allow horizontal only
		if (GLOBAL.held_keys.ctrl) {
			x_diff = 0;
		}
		if (GLOBAL.held_keys.shift) {
			y_diff = 0;
		}
		
		// set reference incase of sub layer movement
		let selection_layer_reference = getLayerById(GLOBAL.overlay_editor.active_layer);
		
		// group movement
		if (selection_layer_reference.type == 'clip_path') {
			for (let i=0; i<selection_layer_reference.layers.length; i++) {
				let group_move_layer = selection_layer_reference.layers[i];
				let assoc_origin = GLOBAL.overlay_editor.layer_selection_drag.sub_layer_origins[i];
				group_move_layer.offset = {
					x: preciseAndTrim(assoc_origin.x - x_diff),
					y: preciseAndTrim(assoc_origin.y - y_diff)
				}
			}
		}
		
		// if group container, change reference for container movement
		if (selection_layer_reference.type == 'clip_path' && selection_layer_reference.clip_path.type == 'square') {
			selection_layer_reference = selection_layer_reference.clip_path;
		}
		
		// if a moveable layer
		if (GLOBAL.overlay_editor.layer_selection_drag.layer_origin.x != null) {
			selection_layer_reference.offset = {
				x: preciseAndTrim(GLOBAL.overlay_editor.layer_selection_drag.layer_origin.x - x_diff),
				y: preciseAndTrim(GLOBAL.overlay_editor.layer_selection_drag.layer_origin.y - y_diff)
			}
		}
		
		printCurrentCanvas();
		
	} else if (GLOBAL.overlay_editor.canvas_window.origins) {
		
		// project drag
		GLOBAL.overlay_editor.canvas_window.x = GLOBAL.overlay_editor.canvas_window.origins.x - event.clientX;
		GLOBAL.overlay_editor.canvas_window.y = GLOBAL.overlay_editor.canvas_window.origins.y - event.clientY;
		printCurrentCanvas();
		
	}
	
}

function imageEditorMouseUp(event) {
	if (image_editor_drag != null) {
		if (image_editor_drag.dragging == true) {
			if (image_editor_drag.id != image_editor_drag.active_hover) {
				
				let drag_layer = getLayerById(image_editor_drag.id);
				let hover_layer = getLayerById(image_editor_drag.active_hover);
				
				// ensure drag is not a drop into a group
				if (
					drag_layer.type == 'clip_path' &&
					(
						(hover_layer.type == 'clip_path' && event.target.className.split(' ').includes('editor_layer_group')) ||
						image_editor_drag.active_hover.split('_').filter(v => v != 'layer').length > 1
					)
				) {
					
					// not allowed
					
				} else {
					
					// if hover target is an empty layer group area, append sub layer id to mock an insert
					if (event.target.className.split(' ').includes('editor_layer_group')) {
						image_editor_drag.active_hover += '_0';
					}
					
					// insert into group and pull from group flags
					let insert_to_group = false;
					let pull_from_group = false;
					
					// set insert to group flag and prepare ids
					let insert_ids = image_editor_drag.active_hover.split('_');
					insert_ids.shift();
					if (insert_ids.length == 2) {
						insert_ids.map(v => parseInt(v));
						insert_to_group = true;
					}
					
					// set pull from group flag and prepare ids
					let pull_ids = image_editor_drag.id.split('_');
					pull_ids.shift();
					if (pull_ids.length == 2) {
						pull_ids.map(v => parseInt(v));
						pull_from_group = true;
					}
					
					let insert_index = insert_ids.length > 1 ? insert_ids[1] : insert_ids[0];
					let pull_index = pull_ids.length > 1 ? pull_ids[1] : pull_ids[0];
					
					let pull_base = GLOBAL.overlay_editor.current;
					if (pull_from_group) {
						pull_base = pull_base.layers[pull_ids[0]];
					}

					// if pull from index is less than insert index, and not in groups or within the same group, decrement insert index because of splice index change to array
					if (
						(!insert_to_group && !pull_from_group && pull_ids[0] < insert_ids[0]) ||
						(insert_to_group && pull_from_group && pull_ids[0] == insert_ids[0] && pull_ids[1] < insert_ids[1])
					) {
						insert_index--;
					} else if (insert_to_group && !pull_from_group && pull_ids[0] < insert_ids[0]) {
						// if pulling from non group into insert group after, group index needs decremented
						insert_ids[0]--;
					}
					
					if (insert_to_group) {
						let pulled = pull_base.layers.splice(pull_index, 1);
						GLOBAL.overlay_editor.current.layers[insert_ids[0]].layers.splice(insert_index, 0, ...pulled);
					} else {
						GLOBAL.overlay_editor.current.layers.splice(insert_index, 0, ...pull_base.layers.splice(pull_index, 1));
					}
					
					// set new active layer
					setActiveLayer(insert_ids.join('_'));
					
				}
			}
			
			// remove drag clone
			Select('#drag_clone').remove();
			
		}
		
		// reset drag state
		image_editor_drag = null;
		
	} else if (GLOBAL.overlay_editor.layer_selection_drag) {
		
		// end cursor drag
		GLOBAL.overlay_editor.layer_selection_drag = null;
		setupLayerInfo();
		
	} else if (GLOBAL.overlay_editor.canvas_window.origins != null) {
		
		// reset project drag
		GLOBAL.overlay_editor.canvas_window.origins = null;
		
	}
}

function printCurrentCanvas() {
	
	let ctx = GLOBAL.overlay_editor.ctx;
	let overlay = GLOBAL.overlay_editor.current;
	ctx.textBaseline = 'top';
	
	// reset canvas
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, GLOBAL.overlay_editor.dimensions.width, GLOBAL.overlay_editor.dimensions.height);
	
	// set print from location to scaled down area start
	ctx.translate(
		(GLOBAL.overlay_editor.dimensions.width/2) - ((GLOBAL.overlay_editor.current.dimensions.width/2)*GLOBAL.overlay_editor.scale) - GLOBAL.overlay_editor.canvas_window.x,
		(GLOBAL.overlay_editor.dimensions.height/2) - ((GLOBAL.overlay_editor.current.dimensions.height/2)*GLOBAL.overlay_editor.scale) - GLOBAL.overlay_editor.canvas_window.y
	);
	
	// scale canvas
	ctx.scale(GLOBAL.overlay_editor.scale, GLOBAL.overlay_editor.scale);
	
	// print backdrop over current overlay size
	ctx.fillStyle = '#555555';
	ctx.fillRect(0, 0, GLOBAL.overlay_editor.current.dimensions.width, GLOBAL.overlay_editor.current.dimensions.height);
	
	let selection_layer = null;
	
	// loop layers from back to front
	for (let i=overlay.layers.length-1; i>-1; i--) {
		
		// active layer
		let layer = overlay.layers[i];
		
		// current selection layer
		if (i == GLOBAL.overlay_editor.active_layer) {
			selection_layer = layer;
		}
		
		if (layer.type == 'image') {
			printImage(ctx, layer);
		} else if (layer.type == 'text') {
			printText(ctx, layer);
		} else if (layer.type == 'clip_path') {
			
			if (toggleTrue(layer)) {
			
				// square clipping path
				if (layer.clip_path.type == 'square') {
					ctx.beginPath();
					ctx.moveTo(layer.clip_path.offset.x, layer.clip_path.offset.y);
					ctx.lineTo(layer.clip_path.offset.x, layer.clip_path.offset.y + layer.clip_path.dimensions.height);
					ctx.lineTo(layer.clip_path.offset.x + layer.clip_path.dimensions.width, layer.clip_path.offset.y + layer.clip_path.dimensions.height);
					ctx.lineTo(layer.clip_path.offset.x + layer.clip_path.dimensions.width, layer.clip_path.offset.y);
					ctx.lineTo(layer.clip_path.offset.x, layer.clip_path.offset.y);
					ctx.closePath();
					if (layer.clip_path.color) {
						let clip_color = getRealValue(layer.clip_path.color);
						if (clip_color.length == 7 || clip_color.length == 9) {
							ctx.fillStyle = clip_color;
							ctx.fill();
						}
					}
					ctx.save();
					ctx.clip();
				}
				
				// print sub layers
				for (let i2=layer.layers.length-1; i2>-1; i2--) {
					
					let sub_layer = layer.layers[i2];
					
					// current selection layer
					if (i+'_'+i2 == GLOBAL.overlay_editor.active_layer) {
						selection_layer = sub_layer;
					}
					
					if (sub_layer.type == 'image') {
						printImage(ctx, sub_layer);
					} else if (sub_layer.type == 'text') {
						printText(ctx, sub_layer);
					} else if (sub_layer.type == 'rect') {
						printRect(ctx, sub_layer);
					}
				} 
				
				// if clipping path, restore
				if (layer.clip_path.type != 'none') {
					ctx.restore();
				}
				
			}
			
		} else if (layer.type == 'rect') {
			printRect(ctx, layer);
		}
		
	}
	
	// active layer indicator
	if (selection_layer != null) {
		
		let out_dim = getLayerOutputDimensions(selection_layer);

		if (out_dim != null) {
			ctx.lineWidth = 2;
			ctx.setLineDash([6, 8]);
			ctx.strokeStyle = '#0051ff';
			ctx.strokeRect(out_dim.x, out_dim.y, out_dim.width, out_dim.height);
			// save selection area for dragging logic
			GLOBAL.overlay_editor.active_layer_selection = out_dim;
		} else {
			GLOBAL.overlay_editor.active_layer_selection = null;
		}
	}
	
}

function getLayerOutputDimensions(layer) {
	let output = {
		x: null,
		y: null,
		width: 0,
		height: 0,
		layer_x: null,
		layer_y: null
	};
	
	if (layer.type == 'text') {
		
		output.width = layer.dimensions.width;
		output.height = parseInt(layer.style.fontSize);
		output.x = layer.offset.x;
		output.y = layer.offset.y;
		output.layer_x = layer.offset.x;
		output.layer_y = layer.offset.y;
		if (layer.style.align == 'center') {
			output.x -= output.width/2;
		} else if (layer.style.align == 'right') {
			output.x -= output.width;
		}
		
	} else if (layer.type == 'image') {
		
		output.x = layer.offset.x;
		output.y = layer.offset.y;
		output.layer_x = layer.offset.x;
		output.layer_y = layer.offset.y;
		output.width = layer.dimensions.width;
		output.height = layer.dimensions.height;
		
		// detect image output size by ratio if set
		let width_scale = layer.dimensions.width != '' && layer.dimensions.width != null;
		let height_scale = layer.dimensions.height != '' && layer.dimensions.height != null;
		
		let value = getRealValue(layer.value);
		if (value.width && value.height) {
			output.width = value.width;
			output.height = value.height;
			if (width_scale || height_scale) {
				if (width_scale && height_scale) {
					// if both scaling
					output.width = layer.dimensions.width;
					output.height = layer.dimensions.height;
				} else if (width_scale) {
					// if only scaling width
					output.width = layer.dimensions.width;
					output.height = (layer.dimensions.width / value.width) * output.height;
				} else if (height_scale) {
					// if only scaling height
					output.height = layer.dimensions.height;
					output.width = (layer.dimensions.height / value.height) * output.width;
				}
			} else {
				output.width = value.width;
				output.height = value.height;
			}
		}
		
	} else if (layer.type == 'clip_path') {
		
		// no children or clip path, exit
		if (layer.layers.length == 0 && layer.clip_path.type == 'none') {
			return null;
		} else {
			
			// if a true clipping path, use layer dimensions and positions
			if (layer.clip_path.type == 'square') {
				output.x = layer.clip_path.offset.x;
				output.y = layer.clip_path.offset.y;
				output.layer_x = layer.clip_path.offset.x;
				output.layer_y = layer.clip_path.offset.y;
				output.width = layer.clip_path.dimensions.width;
				output.height = layer.clip_path.dimensions.height;
			} else {
				
				let max_x = null;
				let max_y = null;
				
				// expand bounding rect by children if just a layer group
				layer.layers.forEach(sub_layer => {
					let sub_dim = getLayerOutputDimensions(sub_layer);
					if (output.x == null || sub_dim.x < output.x) {
						output.x = sub_dim.x;
					}
					if (output.y == null || sub_dim.y < output.y) {
						output.y = sub_dim.y;
					}
					if (max_x == null || (sub_dim.x + sub_dim.width) > max_x) {
						max_x = sub_dim.x + sub_dim.width;
					}
					if (max_y == null || (sub_dim.y + sub_dim.height) > max_y) {
						max_y = sub_dim.y + sub_dim.height;
					}
				});
				
				if (max_x == null || max_y == null) {
					return null;
				} else {
					output.width = max_x - output.x;
					output.height = max_y - output.y;
				}
				
			}
		}
		
	}
	
	return output;
}