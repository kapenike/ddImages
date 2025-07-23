function precise(v) {
	return parseFloat(Math.trunc(v * 100) / 100);
}

function preciseAndTrim(v) {
	return parseFloat(String(Math.trunc(v * 100) / 100).trim('0'));
}