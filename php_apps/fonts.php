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
			echo '
			@font-face {
				font-family: \''.$font->name.'\';
				src: url(\'./fonts/'.$font->filename.'\') format(\''.$ext_to_format->{strtolower(array_pop(explode('.',$font->filename)))}.'\');
				font-style: '.$font->style.';
				font-weight: '.$font->weight ?? '400'.';
			}
			'."\r\n";
		}
		
		// increment
		$cuid_int++;
		
		// print tail style tag
		if ($print_style_tags) {
			echo '</style>'."\r\n";
		}
	}
	
}

?>