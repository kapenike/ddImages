<?php

class websocket {
	
	private $running = false;
	private $controller_key = null;
	private $clients = [];
	private $client_details = [];
	private $client_uid = 0;
	
	public $server = null;
	
	public function __construct() {
		
		// load configuration
		$config = json_decode(file_get_contents('web_socket_server_details.json'));
		
		// stash controller key
		$this->controller_key = $config->controller_key;
		
		// setup server
		$this->server = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
		socket_set_option($this->server, SOL_SOCKET, SO_REUSEADDR, 1);
		socket_bind($this->server, $config->host, $config->ws_port);
		socket_listen($this->server);
		
		// add server to client process list
		$this->clients[] = $this->server;
		$this->client_details[] = null;
		
		// server is running
		$this->running = true;
		
		// start server
		$this->runServer();
		
	}
	
	private function clientHandshake($handshake) {
		
		preg_match('#Sec-WebSocket-Key: (.*)\r\n#', $handshake, $matches);
		$headers = "HTTP/1.1 101 Switching Protocols\r\n";
		$headers .= "Upgrade: websocket\r\n";
		$headers .= "Connection: Upgrade\r\n";
		$headers .= "Sec-WebSocket-Version: 13\r\n";
		$headers .= "Sec-WebSocket-Accept: ".base64_encode(pack('H*', sha1($matches[1].'258EAFA5-E914-47DA-95CA-C5AB0DC85B11')))."\r\n\r\n";
		return $headers;
		
	}
	
	private function removeMask($v) {
		
		$len = ord($v[1]) & 127;
		
		if ($len == 126) {
			$masks = substr($v, 4, 4);
			$data = substr($v, 8);
		} else if ($len == 127) {
			$masks = substr($v, 10, 4);
			$data = substr($v, 14);
		} else {
			$masks = substr($v, 2, 4);
			$data = substr($v, 6);
		}
		
		$v = '';
		for ($i=0; $i<strlen($data); ++$i) {
			$v .= $data[$i] ^ $masks[$i%4];
		}
		
		return $v;
	}
	
	// generate a send header and append to content
	private function package($v) {
		
		$b1 = 0x80 | (0x1 & 0x0f);
		
		$len = strlen($v);
		
		if ($len <= 125) {
			$header = pack('CC', $b1, $len);
		} else if ($len > 125 && $len < 65536) {
			$header = pack('CCn', $b1, 126, $len);
		} else if ($len >= 65536) {
			$header = pack('CCNN', $b1, 127, $len);
		}
		
		return $header.$v;
		
	}
	
	private function handleNewConnection($client) {
		
		// add new connection to clients list
		$this->clients[] = $new_client = socket_accept($client);
		
		// identify client ip
		socket_getpeername($new_client, $ip);
		
		// init client details object
		$this->client_details[] = (object)[
			'ip' => $ip,
			'uid' => str_pad(++$this->client_uid, 4, '0', STR_PAD_LEFT),
			'state' => 'accept',
			'type' => null,
			'project_uid' => null,
			'listeners' => (object) [
				'data' => [],
				'overlays' => []
			],
			'input' => (object) [
				'state' => false,
				'read_buffer' => ''
			]
		];
		
		// handshake to new client
		socket_write($new_client, $this->clientHandshake(socket_read($new_client, 1024)));
		
	}
	
	private function notifyController($data) {
		
		// loop clients
		foreach ($this->client_details as $index => $details) {
			
			if ($index == 0) {
				continue;
			}
			
			// if a controller exists, notify them of the disconnect
			if ($details->type == 'controller') {
				
				// notify controller
				socket_write($this->clients[$index], $this->package(json_encode($data)));
				break;
				
			}
			
		}
		
	}
	
	private function closeClientConnection($client, $index) {
		
		// close socket connection
		socket_shutdown($client);
		
		// if client is not server or controller
		if ($index > 0 && $this->client_details[$index]->type != 'controller') {
			
			// notify controller of disconnect
			$this->notifyController([
				'type' => 'disconnect',
				'ip' => $this->client_details[$index]->ip,
				'uid' => this->client_details[$index]->uid
			]);
			
		}
		
		// remove client and client details data from server
		unset($this->clients[$index]);
		unset($this->client_details[$index]);
		
	}
	
	private function sendNewClientInitData($index) {
		
		$client_details = $this->client_details[$index];
		
		// if no initialized data, return here
		if ($client_details.project_uid != null && $client_details.listeners.data.length == 0 && $client_details.listeners.overlays.length == 0) {
			return;
		}
		
		$init_data = [];
		
		// TODO: init DATA passing
		if ($client_details.listeners.data.length > 0) {
			
		}
		
		
		

		socket_write($this->clients[$index], $this->package(json_encode($init_data)));
	}
	
	private function processInputList() {
		foreach ($this->clients as $index => $client) {
			if ($index > 0) {
				$this->processInput($index);
			}
		}
	}
	
	private function processInput($index) {
		
		// stash read buffer
		$json = $this->client_details[$index]->input->read_buffer;
		
		// set input state to false
		$this->client_details[$index]->input->state = false;
		
		// reset client read buffer
		$this->client_details[$index]->input->read_buffer = '';
		
		// read buffer must be valid json
		if (json_validate($json)) {
			
			$json = json_decode($json);
			
			// initial connection
			if ($json->state == 'connect' && $this->client_details[$index]->state == 'accept') {

				// if controller, log and confirm
				if (isset($json->controller_key)) {
					if ($json->controller_key == $this->controller_key) {
						
						// controller confirmed
						$this->client_details[$index]->type = 'controller';
						$this->client_details[$index]->state = 'accepted';
						
						// inform controller of control state
						socket_write($this->clients[$index], $this->package(json_encode([
							'upgrade_to_controller' => true
						])));
						
					} else {
						
						// controller denied, disconnect
						$this->closeClientConnection($this->clients[$index], $index);
						
					}
					
				} else {
				
					// client connect
					$this->client_details[$index]->type = 'controlled_client';
					$this->client_details[$index]->state = 'accepted';
					
					// if client defines listeners, uncontrollable
					if (isset($json->self_controlled) && $json->self_controlled == true) {
						$this->client_details[$index]->type = 'uncontrolled_client';
					}
					
					// check for initial project uid declaration
					if (isset($json->project_uid)) {
						$this->client_details[$index]->project_uid = $json->project_uid;
					
						// check for initial data and overlay listener declaration
						if (isset($json->listeners)) {
							
							if (isset($json->listeners->data)) {
								$this->client_details[$index]->listeners->data = $json->listeners->data;
							}
							
							if (isset($json->listeners->overlays)) {
								$this->client_details[$index]->listeners->overlays = $json->listeners->overlays;
							}
							
						}
					
					}
					
					// send initialized project data to new client
					$this->sendNewClientInitData($index);
					
					// notify controller of new client
					$this->notifyController([
						'type' => 'new_client',
						'ip' => $this->client_details[$index]->ip,
						'uid' => $this->client_details[$index]->uid,
						'listeners' => $this->client_details[$index]->listeners
					]);
				
				}
				
			} else {
			
				if ($this->client_details[$index]->type == 'controller') {
					
					// send logged data to proper clients
					
				}
			
			}
			
		}
		
	}

	private function runServer() {
		
		while ($this->running) {
			
			$read = $this->clients;
			$write = [];
			$except = [];
			
			// if no actions, continue
			if (socket_select($read, $write, $except, 0) < 1) {
				
				// check all clients to determine if processing of inputs required
				$this->processInputList();
				
				continue;
			}
			
			// handle client actions
			foreach ($this->clients as $index => $client) {
				
				// if no action on client, skip
				if (!in_array($client, $read)) {
					
					// if read state was true, process data
					if ($index > 0 && $this->client_details[$index]->input->state == true) {
						$this->processInput($index);
					}
					
					continue;
				} else if ($index > 0) {
					
					// if read action, ensure read state
					$this->client_details[$index]->input->state = true;
					
				}
				
				// if client is server, handle new connection
				if ($client == $this->server) {
					$this->handleNewConnection($client);
					continue;
				}
				
				// handle client sent data in blocks to prevent blocking
				$data = socket_read($client, 1024);
				
				// if socket_select passed empty read data, close connection identified
				if ($data === false || strlen($data) == 0) {
					
					$this->closeClientConnection($client, $index);
					
				} else {
					
					// otherwise, append to client input buffer
					$this->client_details[$index]->input->read_buffer .= $this->removeMask($data);
					
					
				}
				
			}
			
		}
		
	}
	
}

// init websocket class
new websocket();