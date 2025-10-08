function setNavigationP2PServer() {

	// request project overlay pairs before showing application
	ajax('POST', '/requestor.php', {
		application: 'request_project_overlay_pairs'
	}, (status, data) => {
		if (status) {
			
			P2P_SERVER.project_overlay_pairs = data.msg;
			
			Select('#main', {
				innerHTML: '',
				children: [
					Create('div', {
						className: 'block',
						children: [
							Create('div', {
								id: 'server_status',
								className: 'row',
								style: {
									textAlign: 'center'
								},
								innerHTML: ''
							})
						]
					}),
					Create('div', {
						id: 'connection_list'
					})
				]
			});
			
			updateServerStatus();
			generateConnectionList();
	
		}
	}, 'body');
	
	
		
}

function generateConnectionList() {
	// create list from non server, non controller clients
	if (Select('#connection_list')) {
		Select('#connection_list', {
			innerHTML: '',
			children: P2P_SERVER.clients.map((client, index) => {
				if (client == null || client.type == 'controller') {
					return Create('div');
				}
				return Create('div', {
					className: 'row block',
					children: [
						Create('div', {
							className: 'col',
							style: {
								width: '10%',
							},
							innerHTML: client.uid
						}),
						Create('div', {
							className: 'col',
							style: {
								width: '24%',
							},
							innerHTML: client.ip
						}),
						Create('div', {
							className: 'col',
							style: {
								width: '33%'
							},
							children: [
								Create('select', {
									data: index,
									onchange: function () {
										P2P_SERVER.clients[this.data].project_uid = this.value;
										Select('#project_overlay_server_pair_list_'+this.data, {
											innerHTML: '',
											children: [null, ...P2P_SERVER.project_overlay_pairs[this.value].overlays].map(v => {
												return Create('option', {
													innerHTML: v == null ? ' ------ ' : v,
													value: v == null ? '' : v
												});
											})
										});
									},
									children: [null, ...Object.keys(P2P_SERVER.project_overlay_pairs)].map(v => {
										return Create('option', {
											innerHTML: v == null ? ' ------ ' : P2P_SERVER.project_overlay_pairs[v].title,
											value: v == null ? '' : v,
											selected: client.project_uid == v
										});
									})
								})
							]
						}),
						Create('div', {
							className: 'col',
							style: {
								width: '33%'
							},
							children: [
								Create('select', {
									id: 'project_overlay_server_pair_list_'+index,
									data: index,
									onchange: function () {
										if (P2P_SERVER.clients[this.data].listeners.overlays.length == 0) {
											P2P_SERVER.clients[this.data].listeners.overlays.push(this.value);
										}
										P2P_SERVER.clients[this.data].listeners.overlays[0] = this.value;
										if (this.value != '') {
											P2P_SERVER.connection.send(JSON.stringify({
												action: 'client_reinit',
												client_uid: P2P_SERVER.clients[this.data].uid,
												project_uid: P2P_SERVER.clients[this.data].project_uid,
												overlay: P2P_SERVER.clients[this.data].listeners.overlays[0]
											}));
										}
									},
									children: (client.project_uid == null ? [] : [null, ...P2P_SERVER.project_overlay_pairs[client.project_uid].overlays]).map(v => {
										return Create('option', {
											innerHTML: v == null ? ' ------ ' : v,
											value: v == null ? '' : v,
											selected: client.listeners.overlays.includes(v)
										});
									})
								})
							]
						})
					]
				});
			})
		});
	}
}

function commandServer() {
	if (P2P_SERVER.status) {
		P2P_SERVER.stop();
	} else {
		P2P_SERVER.start();
	}
}

function updateServerStatus() {
	if (Select('#server_status')) {
		Select('#server_status', {
			innerHTML: '',
			children: [
				Create('div', {
					className: 'col',
					style: {
						width: '20%',
						height: '100px',
						backgroundColor: (P2P_SERVER.status ? '#B22222' : '#5bb450'),
						color: '#ffffff',
						textAlign: 'center',
						cursor: 'cursor',
					},
					onclick: commandServer,
					innerHTML: '<br /><span style="font-size:22px; font-weight: bold">'+(P2P_SERVER.status ? 'STOP' : 'START')+'</span><br />server'
				}),
				(P2P_SERVER.status
					?	Create('div', {
							children: [
								Create('div', {
									className: 'col',
									style: {
										width: '40%',
										height: '100px'
									},
									children: [
										Create('label', {
											innerHTML: 'Client URL',
											children: [
												Create('input', {
													type: 'text',
													readOnly: 'true',
													onclick: function () { this.focus(); this.select() },
													type: 'text',
													value: 'http://'+P2P_SERVER.details.host+':'+P2P_SERVER.details.host_port
												})
											]
										})
									]
								}),
								Create('div', {
									className: 'col',
									style: {
										width: '40%',
										height: '100px'
									},
									children: [
										Create('label', {
											innerHTML: 'Generate Auto-Overlay Connect URL',
											children: [
												Create('select', {
													style: {
														width: '50%',
														float: 'left',
														marginBottom: '0'
													},
													id: 'generate_auto_connect_overlay_project_id',
													onchange: function () {
														Select('#generate_auto_connect_overlay_slug', {
															innerHTML: '',
															children: [null, ...P2P_SERVER.project_overlay_pairs[this.value].overlays].map(v => {
																return Create('option', {
																	innerHTML: v == null ? '- Overlay -' : v,
																	value: v == null ? '' : v
																});
															})
														});
													},
													children: [null, ...Object.keys(P2P_SERVER.project_overlay_pairs)].map(v => {
														return Create('option', {
															innerHTML: v == null ? '- Project -' : P2P_SERVER.project_overlay_pairs[v].title,
															value: v == null ? '' : v
														});
													})
												}),
												Create('select', {
													style: {
														width: '50%',
														float: 'left',
														marginBottom: '0'
													},
													id: 'generate_auto_connect_overlay_slug',
													onchange: function () {
														Select('#generate_auto_connect_overlay_output').value = 'http://'+P2P_SERVER.details.host+':'+P2P_SERVER.details.host_port+'?uid='+Select('#generate_auto_connect_overlay_project_id').value+'&overlay='+this.value
													}
												}),
												Create('input', {
													id: 'generate_auto_connect_overlay_output',
													type: 'text',
													readOnly: 'true',
													onclick: function () { this.focus(); this.select() },
													type: 'text',
													value: ''
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
		});
	}
}