function setNavigationAssets() {

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
														innerHTML: 'Asset Manager'
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
														innerHTML: 'Create Asset',
														onclick: () => { setupAssetEditor(); },
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
										id: 'asset_list',
										style: {
											height: 'calc(100% - 150px)',
											overflowY: 'scroll'
										}
									})
								]
							}),
							Create('div', {
								className: 'col',
								id: 'asset_manager_form_block',
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
	
	// setup asset editor, default to create
	setupAssetEditor(null);
	
	// setup asset selection list
	generateAssetSelectionList();
		
}

function updateAssetData() {
	
	// use form style capture to easily inherit form capture methods
	let form_details = formToObj('asset_creation_form');
	
	// ensure no form errors
	if (!checkForAssetSlug(form_details.asset_slug) || !checkForAssetName(form_details.asset_name) || !checkForFile(form_details.asset_file)) {
		return false;
	}
	
	// append application
	form_details.application = 'create_update_asset';
	
	// append tournament uid
	form_details.tournament_id = GLOBAL.active_tournament.uid;
	
	// update server-side asset details, then call back to same scope function to save changes locally
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		
		if (status) {

			// update local asset list
			GLOBAL.active_tournament.data.assets[form_details.asset_slug] = data;
			
			// if updated slug, remove old path
			if (form_details.asset_registration_type != 'create' && form_details.asset_registration_type != form_details.asset_slug) {
				GLOBAL.active_tournament.data.assets[form_details.asset_registration_type] = null;
				delete GLOBAL.active_tournament.data.assets[form_details.asset_registration_type];
			}

			// load asset data into form
			setupAssetEditor(form_details.asset_slug);
			
			// re-create asset selection list
			generateAssetSelectionList();
			
			// if file was included in the form submission, load file into source and update affected overlays
			if (form_details.asset_file.length > 0) {
				// init loader, generateStreamOverlays will clear
				ajaxInitLoader('body');
				let image = new Image();
				image.src = '/data/'+GLOBAL.active_tournament.uid+'/sources/'+data.file;
				image.onload = () => {
					if (GLOBAL.use_vram) {
						createImageBitmap(image).then(bitmap => {
							GLOBAL.active_tournament.data.assets[form_details.asset_slug].source = bitmap;
							generateStreamOverlays(['$assets/'+form_details.asset_slug+'$']);
						});
					} else {
						GLOBAL.active_tournament.data.assets[form_details.asset_slug].source = image;
						generateStreamOverlays(['$assets/'+form_details.asset_slug+'$']);
					}
				}
			}
			
		}
		
	}, 'asset_manager_form_block');
}

function checkForAssetSlug(slug) {
	// ensure slug is not being used (unless it is the current slug of the active asset object)
	if (slug != '' && (typeof GLOBAL.active_tournament.data.assets[slug] === 'undefined' || Select('[name="asset_registration_type"]').value == slug)) {
		Select('#valid_asset_slug').innerHTML = '';
		return true;
	} else {
		Select('#valid_asset_slug').innerHTML = 'Asset slug is currently in use. Consider xXx'+slug+'xXx';
		return false;
	}
}

function checkForAssetName(name) {
	if (name != '') {
		Select('#valid_asset_name').innerHTML = '';
		return true;
	} else {
		Select('#valid_asset_name').innerHTML = 'Asset name cannot be empty';
		return false;
	}
}

function checkForFile(file) {
	if (file.length > 0 || Select('[name="asset_registration_type"]').value != 'create') {
		Select('#valid_asset_file').innerHTML = '';
		return true;
	} else {
		Select('#valid_asset_file').innerHTML = 'Asset image required for creation';
		return false;
	}
}

function setupAssetEditor(slug = null) {
	
	let asset_data = (slug == null ? null : GLOBAL.active_tournament.data.assets[slug]);
	
	Select('#asset_manager_form_block', {
		innerHTML: '',
		children: [
			Create('h3', {
				innerHTML: (asset_data == null ? 'Create New Asset' : 'Update Asset')
			}),
			Create('form', {
				id: 'asset_creation_form',
				children: [
					Create('input', {
						type: 'hidden',
						name: 'asset_registration_type',
						value: asset_data == null ? 'create' : slug
					}),
					Create('div', {
						id: 'valid_asset_name',
						style: {
							fontSize: '12px',
							color: 'red'
						}
					}),
					Create('label', {
						innerHTML: 'Asset Name',
						children: [
							Create('input', {
								type: 'text',
								name: 'asset_name',
								value: asset_data == null ? '' : asset_data.name
							})
						]
					}),
					Create('div', {
						id: 'valid_asset_slug',
						style: {
							fontSize: '12px',
							color: 'red'
						}
					}),
					Create('label', {
						innerHTML: 'Asset Slug',
						children: [
							Create('input', {
								type: 'text',
								name: 'asset_slug',
								onkeyup: function () { checkForAssetSlug(this.value); },
								value: asset_data == null ? '' : slug
							})
						]
					}),
					Create('div', {
						id: 'valid_asset_file',
						style: {
							fontSize: '12px',
							color: 'red'
						}
					}),
					Create('label', {
						innerHTML: 'Asset Image',
						children: [
							Create('input', {
								type: 'file',
								accept: 'image/*',
								name: 'asset_file'
							})
						]
					}),
					Create('label', {
						innerHTML: 'Image Offset X',
						children: [
							Create('input', {
								type: 'text',
								name: 'asset_offset_x',
								value: asset_data == null ? '0' : asset_data.offset_x
							})
						]
					}),
					Create('label', {
						innerHTML: 'Image Offset Y',
						children: [
							Create('input', {
								type: 'text',
								name: 'asset_offset_y',
								value: asset_data == null ? '0' : asset_data.offset_y
							})
						]
					}),
					(asset_data == null
						? Create('div')
						:	Create('div', {
								className: 'asset_preview',
								children: [
									Create('img', {
										src: '/data/'+GLOBAL.active_tournament.uid+'/sources/'+asset_data.file
									})
								]
							})
					)
				]
			})
		]
	});
}

function generateAssetSelectionList() {
	
	Select('#asset_list', {
		innerHTML: '',
		children: Object.keys(GLOBAL.active_tournament.data.assets).map(slug => {
			return Create('div', {
				innerHTML: GLOBAL.active_tournament.data.assets[slug].name,
				className: 'team_block',
				onclick: () => { setupAssetEditor(slug); }
			});
		})
	});
	
}