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
	
	// setup active layer index
	GLOBAL.overlay_editor.active_layer = null;
	
	// setup scaling factor
	GLOBAL.overlay_editor.scale = 1;
	
	if (GLOBAL.overlay_editor.current.dimensions.width > GLOBAL.overlay_editor.dimensions.width) {
		GLOBAL.overlay_editor.scale = GLOBAL.overlay_editor.dimensions.width / GLOBAL.overlay_editor.current.dimensions.width;
	} else if (GLOBAL.overlay_editor.current.dimensions.height > GLOBAL.overlay_editor.dimensions.height) {
		GLOBAL.overlay_editor.scale = GLOBAL.overlay_editor.dimensions.height / GLOBAL.overlay_editor.current.dimensions.width;
	}
	
	setupLayersUI();
	
	printCurrentCanvas();
}

function closeOverlayEditor() {
	Select('#image_editor').remove();
}

function setupLayersUI() {
	Select('#lower_editor', {
		innerHTML: '',
		children: GLOBAL.overlay_editor.current.layers.map((layer, index) => {
			return Create('div', {
				id: 'layer_'+index,
				className: 'editor_layer'+(index == GLOBAL.overlay_editor.active_layer ? ' active_editor_layer' : ''),
				innerHTML: layer.title ?? 'Untitled Layer',
				onclick: () => { setActiveLayer(index); }
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

function setupLayerInfo() {
	let layer = GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer];
	
	Select('#upper_editor', {
		innerHTML: '',
		children: [
			Create('label', {
				innerHTML: 'Layer Title',
				children: [
					Create('input', {
						type: 'text',
						value: layer.title ?? '',
						onkeyup: function () {
							GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].title = this.value;
							Select('#layer_'+GLOBAL.overlay_editor.active_layer).innerHTML = this.value;
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
											GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].value = this.value;
											printCurrentCanvas();
										}
									})
								]
							})
						: (layer.type == 'image'
								? Create('label', {
										innerHTML: 'Image',
										children: [
											Create('select', {
												onchange: function () {
													GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].value = this.value;
												},
												children: Object.keys(GLOBAL.active_tournament.data.assets).map(key => {
													return Create('option', {
														innerHTML: GLOBAL.active_tournament.data.assets[key].display,
														value: '$var$assets/'+key+'$/var$'
													})
												})
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
									GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].toggle = this.value;
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
											width: '50%'
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
															GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].style.font = this.value;
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
															GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].style.fontSize = parseFloat(this.value);
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
											width: '20%'
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
															GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].style.fontMeasure = this.value;
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
															GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].style.fontStyle = this.value;
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
															GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].style.fontWeight = this.value;
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
											width: '20%'
										},
										children: [
											Create('label', {
												innerHTML: 'CAPS',
												children: [
													Create('input', {
														type: 'checkbox',
														checked: layer.style.caps == true,
														onchange: function () {
															GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].style.caps = this.checked;
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
			Create('div', {
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
													GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].offset.x = parseFloat(this.value);
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
													GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].offset.y = parseFloat(this.value);
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
													GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].dimensions.width = parseFloat(this.value);
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
															GLOBAL.overlay_editor.current.layers[GLOBAL.overlay_editor.active_layer].dimensions.height = parseFloat(this.value);
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
		]
	})

	
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
		(GLOBAL.overlay_editor.dimensions.width/2) - ((GLOBAL.overlay_editor.current.dimensions.width/2)*GLOBAL.overlay_editor.scale),
		(GLOBAL.overlay_editor.dimensions.height/2) - ((GLOBAL.overlay_editor.current.dimensions.height/2)*GLOBAL.overlay_editor.scale)
	);
	
	// scale canvas
	ctx.scale(GLOBAL.overlay_editor.scale, GLOBAL.overlay_editor.scale);
	
	// print backdrop over current overlay size
	ctx.fillStyle = '#444444';
	ctx.fillRect(0, 0, GLOBAL.overlay_editor.current.dimensions.width, GLOBAL.overlay_editor.current.dimensions.height);
	
	// loop layers from back to front
	for (let i=overlay.layers.length-1; i>-1; i--) {
		
		// active layer
		let layer = overlay.layers[i];
		
		if (layer.type == 'image') {
			printImage(ctx, layer);
		} else if (layer.type == 'text') {
			printText(ctx, layer);
		} else if (layer.type == 'clip_path') {
			//manageClipPath(ctx, layer);
		} else if (layer.type == 'rect') {
			printRect(ctx, layer);
		}
		
		// active layer indicator
		if (i == GLOBAL.overlay_editor.active_layer) {
			
			let output_width = 0;
			let output_height = 0;
			let output_x = layer.offset.x;
			let output_y = layer.offset.y;
			
			if (layer.type == 'text') {
				output_width = layer.dimensions.width;
				output_height = layer.style.fontSize;
				if (layer.style.align == 'center') {
					output_x -= output_width/2;
				} else if (layer.style.align == 'right') {
					output_x -= output_width;
				}
			} else if (layer.type == 'image') {
				
				// detect image output size by ratio if set
				let width_scale = layer.dimensions.width != '';
				let height_scale = layer.dimensions.height != '';
				
				let value = getRealValue(layer.value);
				output_width = value.width;
				output_height = value.height;
				
				if (width_scale || height_scale) {
					if (width_scale && height_scale) {
						// if both scaling
						output_width = layer.dimensions.width;
						output_height = layer.dimensions.height;
					} else if (width_scale) {
						// if only scaling width
						output_width = layer.dimensions.width;
						output_height = (layer.dimensions.width / value.width) * output_height;
					} else if (height_scale) {
						// if only scaling height
						output_height = layer.dimensions.height;
						output_width = (layer.dimensions.height / value.height) * output_width;
					}
				} else {
					output_width = value.width;
					output_height = value.height;
				}
			}

			ctx.lineWidth = 2;
			ctx.setLineDash([6, 8]);
			ctx.strokeStyle = '#0051ff';
			ctx.strokeRect(output_x, output_y, output_width, output_height);
		}
		
	}
	
}