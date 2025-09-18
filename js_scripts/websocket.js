// web socker controller tool
class wsct {
	
	connection = null;
	details = null;
	state = 'await_control';
	clients = [];
	
	constructor() {
		
		// detect if server is already running, then stash data and connect websocket
		ajax('POST', '/p2p/server_details.php', { request_server_details: true }, (v, data) => {
			if (v && data) {
				this.details = data;
				this.connect();
			}
		});
		
	}
	
	// start public web docket and http server
	start() {
		ajax('POST', '/p2p/init.php', {}, (v, data) => {
			if (v && data) {
				this.details = data;
				setTimeout(() => this.connect(), 500);
			}
		});
	}
	
	// stop public web socket and http server
	stop() {
		// use PIDs to kill local processes
	}
	
	connect() {
		
		// controller connection init
		this.connection = new WebSocket('ws://'+this.details.host+':'+this.details.ws_port);
		
		// validate controller status
		this.connection.addEventListener('open', (event) => {
			this.connection.send(JSON.stringify({
				state: 'connect',
				controller_key: this.details.controller_key
			}));
		});

		// listen for communication from web socket server
		this.connection.addEventListener('message', (event) => {
			
			let data = JSON.parse(event.data);
			
			// if awaiting control status
			if (this.state == 'await_control') {
				if (data.upgrade_to_controller) {
					this.state = 'control';
				}
			} else if (this.state == 'control') {
				
				console.log(data);
				
			}
			
		});
		
		
	}
	
}
const P2P_SERVER = new wsct();
