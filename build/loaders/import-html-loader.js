const fs = require('fs');
const path = require('path');
function import_html_loader(source) {
	let newStr = '';
	for (let i = 0, len = source.length; i < len; i++) {
		const currentChar = source[i];
		if(currentChar === '<'&&
			source[i + 1] === 'i'&&
			source[i + 2] === 'm'&&
			source[i + 3] === 'p'&&
			source[i + 4] === 'o'&&
			source[i + 5] === 'r'&&
			source[i + 6] === 't'&&
			source[i + 7] === '-'&&
			source[i + 8] === 'h'&&
			source[i + 9] === 't'&&
			source[i + 10] === 'm'&&
			source[i + 11] === 'l'&&
			source[i + 12] === ' '){
			const tagStr = findStrByEndChar(source, '>', i);
			i += tagStr.length;
			const url = findSrcAttr(tagStr);
			if(!url){
				throw new Error(`unexpected syntax : ${tagStr}`);
			}
			const filePath = path.resolve(this.context, url);
			newStr = newStr.concat(import_html_loader(readFile(filePath)));
			this.addDependency(filePath);
		}else{
			newStr += currentChar;
		}
	}
	return newStr;
}
function findStrByEndChar(source, endChar, start) {
	let str = '';
	let endIndex = -1;
	for (let i = start, len = source.length; i < len; i++) {
		str += source[i];
		if(source[i] === endChar){
			endIndex = i;
			break;
		}
	}
	return (endIndex === -1) ? null : str;
}
function findSrcAttr(source) {
	let result = '';
	for (let i = 0, len = source.length; i < len; i++) {
		if(
			(source[i] === ' ')&&
			(source[i+1] === 's')&&
			(source[i+2] === 'r')&&
			(source[i+3] === 'c')&&
			(source[i+4] === '=')&&
			(source[i+5] === '"')
		){
			if(result = findStrByEndChar(source, '"', i+6)){
				result = result.substring(0, result.length - 1);
			}
			break;
		}
	}
	return result;
}
function readFile(src) {
	return fs.readFileSync(src).toString();
}
module.exports = import_html_loader;
