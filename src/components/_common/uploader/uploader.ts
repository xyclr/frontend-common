// @ts-ignore
import Resumable from './resumable';
// whx add for 401
const userInfo = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
const accessToken: string = userInfo && userInfo.accessToken || null;

// 本地测试成都接口 -- hardcord，后面需要用上面的方法动态获取
// let accessToken = "263495a9-57f0-4955-a855-08bc0ee0e6eb";

function Uploader(chunkSize: any, chunkRetry: any, listener: any) {
	function uuid(len: any, radix: any) {
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
// tslint:disable-next-line: no-shadowed-variable
		const uuid = [];
		let i = 0;
		radix = radix || chars.length;

		if (len) {
			// Compact form
			for (i = 0; i < len; i++) {
// tslint:disable-next-line: no-bitwise
				uuid[i] = chars[0 | Math.random() * radix];
			}
		} else {
			// rfc4122, version 4 form
			let r = 0;

			// rfc4122 requires these characters
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';

			// Fill in random data.  At i==19 set the high bits of clock sequence as
			// per rfc4122, sec. 4.1.5
			for (i = 0; i < 36; i++) {
				if (!uuid[i]) {
// tslint:disable-next-line: no-bitwise
					r = 0 | Math.random() * 16;
// tslint:disable-next-line: triple-equals tslint:disable-next-line: no-bitwise
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}
		}
		return uuid.join('');
	}

	// @ts-ignore
	this._uploader = new Resumable({
		chunkSize,
		maxChunkRetries: chunkRetry,
		simultaneousUploads: 1,
		testChunks: true,
		throttleProgressCallbacks: 1,
		method: 'octet',
		permanentErrors: [400, 404, 415, 500, 501, 401],
		generateUniqueIdentifier: (file: any, event: any) => {
			const relativePath = file.webkitRelativePath || file.fileName || file.name; // Some confusion in different versions of Firefox
			const size = file.size;
			return (size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, '') + '-' + uuid(8, 16));
		},
		headers: {
			'Authorization': !accessToken ? '' : 'Bearer ' + accessToken,
		}
	});

// tslint:disable-next-line: only-arrow-functions
	this._uploader.on('pause', function() {
		if (listener.pause) {
			listener.pause();
		}
	});

// tslint:disable-next-line: only-arrow-functions
	this._uploader.on('error', function(message: any, file: any, status?: any) {
		if (listener.error) {
			listener.error(message, file, status);
		}
	});

// tslint:disable-next-line: only-arrow-functions
	this._uploader.on('fileSuccess', function(message: any, file: any) {
		if (listener.success) {
			listener.success(message, file);
		}
	});

// tslint:disable-next-line: only-arrow-functions
	this._uploader.on('complete', function() {
		if (listener.complete) {
			listener.complete();
		}
	});

	this._uploader.on('progress', function() {
		if (listener.progress) {
			listener.progress(this.progress());
		}
	});
}

Uploader.prototype.getFiles = function() {
	return this._uploader.files;
};

Uploader.prototype.getProgress = function() {
	return this._uploader.progress();
};

Uploader.prototype.getSize = function() {
	return this._uploader.getSize();
};

Uploader.prototype.clearFiles = function() {
	if (this && this._uploader && this._uploader.cancel) {
		this._uploader.cancel();
	}
};

Uploader.prototype.removeFile = function(file: any) {
	this._uploader.removeFile(file);
};

Uploader.prototype.addFile = function(file: any) {
	this._uploader.addFile(file);
};

Uploader.prototype.upload = function(url: any, query: any) {
	this._uploader.opts.target = url;
	this._uploader.opts.query = query;
	this._uploader.upload();
};

Uploader.prototype.resume = function() {
	this._uploader.retry();
};

Uploader.prototype.pause = function() {
	this._uploader.pause();
};

export default Uploader;
