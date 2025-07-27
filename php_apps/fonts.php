<?php

class fonts {
	
	function generateFontCSS($print_style_tags = true) {
		// font file extension to format
		$ext_to_format = (object)[
			'woff' => 'woff',
			'woff2' => 'woff2',
			'otf' => 'opentype',
			'ttf' => 'truetype'
		];
		
		// load font registry
		$font_registry = json_decode(str_replace("\r\n", "", file_get_contents(getBasePath().'/fonts/font_registry.json')));
		
		// print leading style tag
		if ($print_style_tags) {
			echo '<style>'."\r\n";
		}
		
		// print font faces
		foreach ($font_registry as $font) {
			$get_ext = explode('.',$font->filename);
			$get_ext = strtolower(array_pop($get_ext));
			echo '
			@font-face {
				font-family: \''.$font->name.'\';
				src: url(\'/fonts/'.$font->filename.'\') format(\''.$ext_to_format->{$get_ext}.'\');
				font-style: '.$font->style.';
				font-weight: '.($font->weight ?? '400').';
			}
			'."\r\n";
		}
		
		// print tail style tag
		if ($print_style_tags) {
			echo '</style>'."\r\n";
		}
	}
	
}

?>