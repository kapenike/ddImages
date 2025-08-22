function precise(v) {
	return parseFloat(Math.trunc(v * 100) / 100);
}

function preciseAndTrim(v) {
	return parseFloat(String(Math.trunc(v * 100) / 100).trim('0'));
}

function degToRad(v) {
	return (Math.PI/180)*v;
}

function rotate(x, y, cx, cy, angle) {
	let rad = degToRad(angle);
	let cos = Math.cos(rad);
	let sin = Math.sin(rad);
	let nx = (cos * (x - cx)) + (sin * (y-cy)) + cx;
	let ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
	return { x: precise(nx), y: precise(ny) };
}

function spaceTrim(v) {
	return v.trim().replaceAll('&nbsp;', '');
}