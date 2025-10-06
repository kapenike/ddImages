function setNavigationP2PServer() {

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

function generateConnectionList() {
	// create list from non server, non controller clients
	if (Select('#connection_list')) {
		Select('#connection_list', {
			innerHTML: '',
			children: P2P_SERVER.clients.filter(x => x != null && x.type != 'controller').map(client => {
				console.log(client);
				return Create('div', {
					className: 'row block',
					children: [
						Create('div', {
							className: 'col',
							style: {
								width: '20%',
							},
							innerHTML: client.uid
						}),
						Create('div', {
							className: 'col',
							style: {
								width: '30%',
							},
							innerHTML: client.ip
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
					innerHTML: '<span style="font-size:22px">'+(P2P_SERVER.status ? 'STOP' : 'START')+'</span><br />server'
				})
			]
		});
	}
}