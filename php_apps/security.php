<?php

class security {
	
	private $local_ipv4 = null;
	private $ip_accept_list = [];
	private $host_launch_ip = null;
	
	function __construct() {
		$this->local_ipv4 = app('server')->ipv4;
		$this->requestIPAcceptList();
		$this->host_launch_ip = app('server')->getServerData()->host_launch_ip;
	}
	
	function saveIPAcceptList() {
		// treat list as executable that cannot be accessed from outside of this class
		file_put_contents(getBasePath().'/php_apps/app_data/ip_accept_list.php', '<?php exit; ?>'.json_encode($this->ip_accept_list));
	}
	
	function requestIPAcceptList() {
		if (!file_exists(getBasePath().'/php_apps/app_data/ip_accept_list.php')) {
			$this->saveIPAcceptList();
		}
		// strip exit and decide trailing json
		$this->ip_accept_list = json_decode(str_replace('<?php exit; ?>', '', file_get_contents(getBasePath().'/php_apps/app_data/ip_accept_list.php')));
	}
	
	function isLocalMachine() {
		return $this->host_launch_ip == app('ddImages')->local_host && $_SERVER['REMOTE_ADDR'] == '127.0.0.1' || $this->host_launch_ip != app('ddImages')->local_host && $this->host_launch_ip == $_SERVER['REMOTE_ADDR'];
	}
	
	function test() {
		// if local cli or if local machine or whitelisted ip
		if (php_sapi_name() === 'cli' || $this->isLocalMachine() || in_array($_SERVER['REMOTE_ADDR'], $this->ip_accept_list)) {
			return true;
		}
		
		// unauthorized access to external application
		echo '<h1>Unauthorized</h1><p>If this is a mistake, please whitelist this IP from the servers local application: <strong>'.$_SERVER['REMOTE_ADDR'].'</strong></p>';
	}
	
	function requestAcceptsIPs() {
		return $this->ip_accept_list;
	}
	
	function updateIPs($ips) {
		// accept only value ipv4 addresses
		$this->ip_accept_list = array_filter($ips, function ($ip) {
			return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4);
		});
		$this->saveIPAcceptList();
	}
	
}

?>