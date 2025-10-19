<?php

class ddImages {
	
	// location of locally served application
	private $local_host = 'localhost';
	
	public $application_port = '8000';
	public $application_ip = null;
	
	function start($args) {
		
		// check if application should run on external ipv4 or localhost (external IP called via 'php start_client.php external')
		$this->application_ip = (in_array('external', $args) ? app('server')->ipv4 : $this->local_host);
		
		// start client
		app('server')->launchApplication($this->application_ip);
		
		// if CLI includes 'ALL', start websocket server and client server as well
		if (in_array('ALL', $args)) {
			app('server')->launchWebsocketServer();
		}
		
	}
	
	function stop($args) {
		
		// kill application process
		app('server')->stopApplication();
		
		// if CLI includes reference to 'ALL', kill websocket server and client too
		if (in_array('ALL', $args)) {
			
			app('server')->stopWebsocketServer();
			
		}
		
	}
	
}

?>