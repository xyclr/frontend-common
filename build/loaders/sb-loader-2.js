/**
 *  @datetime 2019/1/28 11:30 AM
 *  @author Ping Dong
 *  @desc sb loader 2
 */

module.exports = function (source) {
	console.log('loader 2 : ', source);
	const newStr = source.replace(/123/g, '2345');
	if(/^export /.test(newStr)){
		return newStr;
	}
	return `export default ${newStr}`;
};
