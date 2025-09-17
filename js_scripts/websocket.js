function startWebSocketServer() {
	
	// init websocket server
	ajax('POST', '/p2p/init.php', {}, (v, data) => {
		
		// if false, server already running. request server details
		if (data == false) {
			
			ajax('POST', '/p2p/request_server_details.php', {}, (v, data) => {
				
				GLOBAL.p2p = data;
				
				connectWSController(false);
				
			});
			
		} else {
			
			// stash websocket server details
			GLOBAL.p2p = data;
			
			connectWSController(true);
			
		}
		
	});
	
}

function connectWSController(pass) {
	console.log(pass, GLOBAL.p2p);
}

startWebSocketServer();