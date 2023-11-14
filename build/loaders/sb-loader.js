/**
 *  @datetime 2019/1/28 11:14 AM
 *  @author Ping Dong
 *  @desc this is a simple loader for test
 */

module.exports = function (source) {
	console.log('source : ', source);
	return 'export default function(){console.log(123);}';
};
