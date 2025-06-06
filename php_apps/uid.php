<?php

class uid {
	
	function generate($tournament_uid = null) {
		
		// if tournament uid, return inc uid
		if ($tournament_uid != null) {
			return $this->generateIncUID($tournament_uid);
		} else {
			return $this->generateRandUID();
		}
		
	}
	
	function generateIncUID($tournament_uid) {
		
		// location of tournament uid incrementor file
		$inc_file = getBasePath().'/data/'.$tournament_uid.'/cuid.txt';
		
		// if UID incrementor does not exist, create it
		if (!file_exists($inc_file)) {
			file_put_contents($inc_file, 0);
		}
		
		// load current uid integer
		$cuid_int = intval(file_get_contents($inc_file));
		
		// increment
		$cuid_int++;
		
		// save new uid integer
		file_put_contents($inc_file, $cuid_int);
		
		// prepare for use and return
		return 'uid_'.str_pad($cuid_int, 7, '0', STR_PAD_LEFT);
	}
	
	function generateRandUID() {
		return 'uid_'.bin2hex(random_bytes(8));
	}
	
}

?>