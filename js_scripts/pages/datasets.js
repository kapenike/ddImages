function setNavigationDatasets() {

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
														innerHTML: 'Data Set Management'
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
														innerHTML: 'Create Data Set',
														onclick: () => { setupDatasetEditor(); },
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
										id: 'dataset_list',
										style: {
											height: 'calc(100% - 150px)',
											overflowY: 'scroll'
										}
									})
								]
							}),
							Create('div', {
								className: 'col',
								id: 'dataset_management_form_block',
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
	
	// setup dataset editor, default to create
	setupDatasetEditor(null);
	
	// setup team selection list
	generateDatasetSelectionList();
		
}

function updateDataset() {
	
	// use form style capture to easily inherit form capture methods
	let form_details = formToObj('dataset_creation_form');
	
	// append application
	form_details.application = 'update_team';
	
	// append tournament uid
	form_details.tournament_uid = GLOBAL.active_tournament.uid;
	
	// update server-side dataset details, then call back to same scope function to save changes locally
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		
		if (status) {
			
			// update / insert new team locally
			GLOBAL.active_tournament.data.sets[data.display][data.uid] = data.entries;
			
			// load dataset into form
			loadDataset(data.uid);
			
			// re-create dataset selection list
			generateDatasetSelectionList();
			
		}
		
	}, 'dataset_management_form_block');
}

function removeDataset(dataset) {
	
	let form_details = {
		tournament_uid: GLOBAL.active_tournament.uid,
		team_uid: dataset.uid,
		application: 'remove_team'
	};
	
	// remove dataset server side
	ajax('POST', '/requestor.php', form_details, (status, data) => {
		
		if (status) {
			
			// delete local dataset
			delete GLOBAL.active_tournament.data.sets[data.display];
			
			// bring up create dataset form
			loadDataset();
			
			// re-create team selection list
			generateDatasetSelectionList();
			
		}
		
	}, 'dataset_management_form_block');
}

function loadDataset(dataset = null) {
	setupDatasetEditor(dataset);
}

function setupDatasetEditor(data = null) {
	Select('#dataset_management_form_block', {
		innerHTML: '',
		children: [
			Create('h3', {
				innerHTML: (data == null ? 'Create New Data Set' : 'Update Data Set')
			}),
			Create('form', {
				id: 'dataset_creation_form',
				children: [
					Create('input', {
						type: 'hidden',
						name: 'dataset_manager_type',
						value: data == null ? 'create' : data.uid
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
									Create('div', {
										id: 'structure_list',
										children: [
											Create('h3', {
												style: {
													marginTop: '0'
												},
												innerHTML: 'Structure'
											}),
											...(data == null ? ['display'] : data.structure).map((key, index) => {
												return Create('div', {
													className: 'row',
													children: [
														Create('div', {
															className: 'col',
															style: {
																width: '86%'
															},
															children: [
																Create('input', {
																	type: 'text',
																	name: 'structure[]',
																	value: key
																})
															]
														}),
														Create('div', {
															className: 'col',
															style: {
																width: '14%'
															},
															children: [
																(index > 0 
																	?	Create('div', {
																			className: 'remove_data_key',
																			innerHTML: '&times;',
																			onclick: function () {
																				this.parentNode.parentNode.remove();
																			}
																		})
																	: Create('div')
																)
															]
														})
													]
												});
											}),
											Create('div', {
												className: 'create_data_key',
												innerHTML: '+ New Structure Key',
												onclick: function () {
													this.insertAdjacentElement('beforebegin',
														Create('div', {
															className: 'row',
															children: [
																Create('div', {
																	className: 'col',
																	style: {
																		width: '86%'
																	},
																	children: [
																		Create('input', {
																			type: 'text',
																			name: 'structure[]',
																			value: ''
																		})
																	]
																}),
																Create('div', {
																	className: 'col',
																	style: {
																		width: '14%'
																	},
																	children: [
																		Create('div', {
																			className: 'remove_data_key',
																			innerHTML: '&times;',
																			onclick: function () {
																				this.parentNode.parentNode.remove();
																			}
																		})
																	]
																})
															]
														})
													);
												}
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'col',
								style: {
									width: '60%'
								},
								children: []
							})
						]
					})
				]
			})
		]
	});
}

function generateDatasetSelectionList() {
	
	Select('#dataset_list', {
		innerHTML: '',
		children: Object.keys(GLOBAL.active_tournament.data.sets).map(key => {
			if (key != 'teams') {
				let dataset = GLOBAL.active_tournament.data.sets[key];
				return Create('div', {
					innerHTML: dataset.display,
					className: 'team_block',
					onclick: () => { loadDataset(dataset); }
				});
			}
			return Create('div');
		})
	});
	
}