<?php

class uid {
	
	function generate() {
		// load current uid integer
		$cuid_int = intval(file_get_contents('./php_apps/app_data/cuid_int.txt'));
		
		// increment
		$cuid_int++;
		
		// save new uid integer
		file_put_contents('./php_apps/app_data/cuid_int.txt', $cuid_int);
		
		// prepare for use and return
		return 'uid_'.str_pad($cuid_int, 7, '0', STR_PAD_LEFT);
	}
	
}

?>