<?php
$OS = file_get_contents('os.txt');

require('server_details.php'); 

$details = requestServerDetails();

if ($details !== false) {
	
	// kill client
	if ($OS == 'WINDOWS') {
		$pids = array_filter(explode("\r\n", shell_exec('wmic PROCESS where "Name=\'php.exe\' and commandLine like \'%-t ./client%\'" get ProcessID')));
		// pop and trim last for kill
		$pid = array_pop($pids);
		if ($pid != null && trim(is_numeric($pid))) {
			shell_exec('taskkill /F /PID '.trim($pid));
		}
	} else if ($OS == 'LINUX') {
		shell_exec('kill '.$details->host_pid);
	}
	
	// kill websocket
	if ($OS == 'WINDOWS') {
		$pids = array_filter(explode("\r\n", shell_exec('wmic PROCESS where "Name=\'php.exe\' and commandLine like \'%web_socket_server.php%\'" get ProcessID')));
		// pop and trim last for kill
		$pid = array_pop($pids);
		if ($pid != null && trim(is_numeric($pid))) {
			shell_exec('taskkill /F /PID '.trim($pid));
		}
	} else if ($OS == 'LINUX') {
		shell_exec('kill '.$details->ws_pid);
	}
	
	echo json_encode(true);
	
}

?>