/*
* MIT Licensed
* http://www.23developer.com/opensource
* http://github.com/23/resumable.js
* Steffen Tiedemann Christensen, steffen@23company.com
*/


(() => {
	'use strict';


	const Resumable = function(opts: any) {
		if (!(this instanceof Resumable)) {
			// @ts-ignore
			return new Resumable(opts);
		}
		this.version = 1.0;
		// SUPPORTED BY BROWSER?
		// Check if these features are support by the browser:
		// - File object type
		// - Blob object type
		// - FileList object type
		// - slicing files
		this.support = (
			(typeof(File) !== 'undefined')
			&&
			(typeof(Blob) !== 'undefined')
			&&
			(typeof(FileList) !== 'undefined')
			&&
			// @ts-ignore
			(!!Blob.prototype.webkitSlice || !!Blob.prototype.mozSlice || !!Blob.prototype.slice || false)
		);
		if (!this.support) {
			return (false);
		}

		// PROPERTIES
		const $ = this;
		$.files = [];
		$.defaults = {
			chunkSize: 1 * 1024 * 1024,
			forceChunkSize: false,
			simultaneousUploads: 3,
			fileParameterName: 'file',
			chunkNumberParameterName: 'resumableChunkNumber',
			chunkSizeParameterName: 'resumableChunkSize',
			currentChunkSizeParameterName: 'resumableCurrentChunkSize',
			totalSizeParameterName: 'resumableTotalSize',
			typeParameterName: 'resumableType',
			identifierParameterName: 'resumableIdentifier',
			fileNameParameterName: 'resumableFilename',
			relativePathParameterName: 'resumableRelativePath',
			totalChunksParameterName: 'resumableTotalChunks',
			throttleProgressCallbacks: 0.5,
			query: {},
			headers: {},
			preprocess: null,
			method: 'multipart',
			uploadMethod: 'POST',
			testMethod: 'GET',
			prioritizeFirstAndLastChunk: false,
			target: '/',
			testTarget: null,
			parameterNamespace: '',
			testChunks: true,
			generateUniqueIdentifier: null,
			getTarget: null,
			maxChunkRetries: 100,
			chunkRetryInterval: undefined,
			permanentErrors: [400, 404, 415, 500, 501],
			maxFiles: undefined,
			withCredentials: false,
			xhrTimeout: 0,
			clearInput: true,
			chunkFormat: 'blob',
			maxFilesErrorCallback: (files: any, errorCount: any) => {
				const maxFiles = $.getOpt('maxFiles');
				console.log('Please upload no more than ' + maxFiles + ' file' + (maxFiles === 1 ? '' : 's') + ' at a time.');
				// alert('Please upload no more than ' + maxFiles + ' file' + (maxFiles === 1 ? '' : 's') + ' at a time.');
			},
			minFileSize: 1,
			minFileSizeErrorCallback: (file: any, errorCount: any) => {
				console.log(file.fileName || file.name + ' is too small, please upload files larger than ' + $h.formatSize($.getOpt('minFileSize')) + '.');
			},
			maxFileSize: undefined,
			maxFileSizeErrorCallback: (file: any, errorCount: any) => {
				console.log(file.fileName || file.name + ' is too large, please upload files less than ' + $h.formatSize($.getOpt('maxFileSize')) + '.');
			},
			fileType: [],
			fileTypeErrorCallback: (file: any, errorCount: any) => {
				console.log(file.fileName || file.name + ' has type not allowed, please upload files of type ' + $.getOpt('fileType') + '.');
			}
		};
		$.opts = opts || {};
		$.getOpt = (o: any) => {
			let $opt: any = this;
			// Get multiple option if passed an array
			if (o instanceof Array) {
				const options: any = {};
				$h.each(o, (option: any) => {
					options[option] = $opt.getOpt(option);
				});
				return options;
			}
			// Otherwise, just return a simple option
			if ($opt instanceof ResumableChunk) {
				// @ts-ignore
				if (typeof $opt.opts[o] !== 'undefined') {
					// @ts-ignore
					return $opt.opts[o];
				} else {
					// @ts-ignore
					$opt = $opt.fileObj;
				}
			}
			if ($opt instanceof ResumableFile) {
				// @ts-ignore
				if (typeof $opt.opts[o] !== 'undefined') {
					// @ts-ignore
					return $opt.opts[o];
				} else {
					// @ts-ignore
					$opt = $opt.resumableObj;
				}
			}
			if ($opt instanceof Resumable) {
				// @ts-ignore
				if (typeof $opt.opts[o] !== 'undefined') {
					// @ts-ignore
					return $opt.opts[o];
				} else {
					// @ts-ignore
					return $opt.defaults[o];
				}
			}
		};

		// EVENTS
		// catchAll(event, ...)
		// fileSuccess(file), fileProgress(file), fileAdded(file, event), filesAdded(files, filesSkipped), fileRetry(file),
		// fileError(file, message), complete(), progress(), error(message, file), pause()
		$.events = [];
		$.on = (event: any, callback: any) => {
			$.events.push(event.toLowerCase(), callback);
		};
		$.fire = () => {
			// `arguments` is an object, not array, in FF, so:
			const args = [];
// tslint:disable-next-line: prefer-for-of
			// @ts-ignore
			for (const index in arguments) {
				// @ts-ignore
				args.push(arguments[index]);
			}
			// Find event listeners, and support pseudo-event `catchAll`
			const event = args[0].toLowerCase();
			for (let i = 0; i <= $.events.length; i += 2) {
// tslint:disable-next-line: triple-equals
				if ($.events[i] == event) {
					$.events[i + 1].apply($, args.slice(1));
				}
// tslint:disable-next-line: triple-equals
				if ($.events[i] == 'catchall') {
					$.events[i + 1].apply(null, args);
				}
			}
// tslint:disable-next-line: triple-equals
			if (event == 'fileerror') {
				// whx add for 401
				$.fire('error', args[2], args[1], args[3]);
			}
// tslint:disable-next-line: triple-equals
			if (event == 'fileprogress') {
				$.fire('progress');
			}
		};

		// INTERNAL HELPER METHODS (handy, but ultimately not part of uploading)
		// @ts-ignore
		const $h = {
			stopEvent: (e: any) => {
				e.stopPropagation();
				e.preventDefault();
			},
			// @ts-ignore
			each: (o: any, callback: (indexTemp: any, obj?: any) => any) => {
				if (typeof(o.length) !== 'undefined') {
					for (const index in o) {
						if (callback(o[index]) === false) {
							return;
						}
					}
				} else {
					for (const index in o) {
						// Object
						if (callback(index, o[index]) === false) {
							return;
						}
					}
				}
			},
			generateUniqueIdentifier: (file: any, event: any) => {
				const custom = $.getOpt('generateUniqueIdentifier');
				if (typeof custom === 'function') {
					return custom(file, event);
				}
				const relativePath = file.webkitRelativePath || file.fileName || file.name; // Some confusion in different versions of Firefox
				const size = file.size;
				return (size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, ''));
			},
			contains: (array: any, test: any) => {
				let result: boolean = false;
				$h.each(array,  (value: any) => {
// tslint:disable-next-line: triple-equals
					if (value == test) {
						result = true;
						return false;
					}
					return true;
				});
				return result;
			},
			formatSize: (size: any) => {
				if (size < 1024) {
					return size + ' bytes';
				} else if (size < 1024 * 1024) {
					return (size / 1024.0).toFixed(0) + ' KB';
				} else if (size < 1024 * 1024 * 1024) {
					return (size / 1024.0 / 1024.0).toFixed(1) + ' MB';
				} else {
					return (size / 1024.0 / 1024.0 / 1024.0).toFixed(1) + ' GB';
				}
			},
			getTarget: (request: any, params: any) => {
				let target = $.getOpt('target');
				if (request === 'test' && $.getOpt('testTarget')) {
					target = $.getOpt('testTarget') === '/' ? $.getOpt('target') : $.getOpt('testTarget');
				}
				if (typeof target === 'function') {
					return target(params);
				}
				const separator = target.indexOf('?') < 0 ? '?' : '&';
				const joinedParams = params.join('&');
				return target + separator + joinedParams;
			}
		};

		const onDrop = (event: any) => {
			$h.stopEvent(event);

			// handle dropped things as items if we can (this lets us deal with folders nicer in some cases)
			if (event.dataTransfer && event.dataTransfer.items) {
				loadFiles(event.dataTransfer.items, event);
			} else if (event.dataTransfer && event.dataTransfer.files) {
				// else handle them as files
				loadFiles(event.dataTransfer.files, event);
			}
		};
		const preventDefault = (e: any) => {
			e.preventDefault();
		};

		/**
		 * processes a single upload item (file or directory)
		 * @param {Object} item item to upload, may be file or directory entry
		 * @param {string} path current file path
		 * @param {File[]} items list of files to append new items to
		 * @param {Function} cb callback invoked when item is processed
		 */
		function processItem(item: any, path: any, items: any, cb: any) {
			let entry: any = '';
			if (item.isFile) {
				// file provided
				return item.file((file: any) => {
					file.relativePath = path + file.name;
					items.push(file);
					cb();
				});
			} else if (item.isDirectory) {
				// item is already a directory entry, just assign
				entry = item;
			} else if (item instanceof File) {
				items.push(item);
			}
			if ('function' === typeof item.webkitGetAsEntry) {
				// get entry from file object
				entry = item.webkitGetAsEntry();
			}
			if (entry && entry.isDirectory) {
				// directory provided, process it
				return processDirectory(entry, path + entry.name + '/', items, cb);
			}
			if ('function' === typeof item.getAsFile) {
				// item represents a File object, convert it
				item = item.getAsFile();
				item.relativePath = path + item.name;
				items.push(item);
			}
			cb(); // indicate processing is done
		}


		/**
		 * cps-style list iteration.
		 * invokes all functions in list and waits for their callback to be
		 * triggered.
		 * @param  {Function[]}   items list of functions expecting callback parameter
		 * @param  {Function} cb    callback to trigger after the last callback has been invoked
		 */
		function processCallbacks(items: any, cb: any) {
			if (!items || items.length === 0) {
				// empty or no list, invoke callback
				return cb();
			}
			// invoke current function, pass the next part as continuation
			items[0](() => {
				processCallbacks(items.slice(1), cb);
			});
		}

		/**
		 * recursively traverse directory and collect files to upload
		 * @param  {Object}   directory directory to process
		 * @param  {string}   path      current path
		 * @param  {File[]}   items     target list of items
		 * @param  {Function} cb        callback invoked after traversing directory
		 */
		function processDirectory(directory: any, path: any, items: any, cb: any) {
			const dirReader = directory.createReader();
			dirReader.readEntries((entries: any) => {
				if (!entries.length) {
					// empty directory, skip
					return cb();
				}
				// process all conversion callbacks, finally invoke own one
				processCallbacks(
					entries.map((entry: any) => {
						// bind all properties except for callback
						return processItem.bind(null, entry, path, items);
					}),
					cb
				);
			});
		}

		/**
		 * process items to extract files to be uploaded
		 * @param  {File[]} items items to process
		 * @param  {Event} event event that led to upload
		 */
		function loadFiles(items: any, event: any) {
			if (!items.length) {
				return; // nothing to do
			}
			$.fire('beforeAdd');
			const files: any = [];
			processCallbacks(
				Array.prototype.map.call(items, (item: any) =>  {
					// bind all properties except for callback
					return processItem.bind(null, item, '', files);
				}),
				() => {
					if (files.length) {
						// at least one file found
						appendFilesFromFileList(files, event);
					}
				}
			);
		}

		const appendFilesFromFileList = (fileList: any, event: any) => {
			// check for uploading too many files
			let errorCount = 0;
			const o = $.getOpt(['maxFiles', 'minFileSize', 'maxFileSize', 'maxFilesErrorCallback', 'minFileSizeErrorCallback', 'maxFileSizeErrorCallback', 'fileType', 'fileTypeErrorCallback']);
			if (typeof(o.maxFiles) !== 'undefined' && o.maxFiles < (fileList.length + $.files.length)) {
				// if single-file upload, file is already added, and trying to add 1 new file, simply replace the already-added file
				if (o.maxFiles === 1 && $.files.length === 1 && fileList.length === 1) {
					$.removeFile($.files[0]);
				} else {
					o.maxFilesErrorCallback(fileList, errorCount++);
					return false;
				}
			}
			const files: any = [];
			const filesSkipped: any = [];
			let remaining: any = fileList.length;
			const decreaseReamining = () => {
				if (!--remaining) {
					// all files processed, trigger event
					if (!files.length && !filesSkipped.length) {
						// no succeeded files, just skip
						return;
					}
					window.setTimeout(() => {
						$.fire('filesAdded', files, filesSkipped);
					}, 0);
				}
			};
// tslint:disable-next-line: only-arrow-functions @ts-ignore
			$h.each(fileList, function(file: any) {
				const fileName = file.name;
				if (o.fileType.length > 0) {
					let fileTypeFound = false;
					for (const index in o.fileType) {
						const extension = '.' + o.fileType[index];
						if (fileName.toLowerCase().indexOf(extension.toLowerCase(), fileName.length - extension.length) !== -1) {
							fileTypeFound = true;
							break;
						}
					}
					if (!fileTypeFound) {
						o.fileTypeErrorCallback(file, errorCount++);
						return false;
					}
				}

				if (typeof(o.minFileSize) !== 'undefined' && file.size < o.minFileSize) {
					o.minFileSizeErrorCallback(file, errorCount++);
					return false;
				}
				if (typeof(o.maxFileSize) !== 'undefined' && file.size > o.maxFileSize) {
					o.maxFileSizeErrorCallback(file, errorCount++);
					return false;
				}

// tslint:disable-next-line: no-shadowed-variable
				function addFile(uniqueIdentifier: any) {
					if (!$.getFromUniqueIdentifier(uniqueIdentifier)) {
						(() => {
							file.uniqueIdentifier = uniqueIdentifier;
							// @ts-ignore
							const f: any = new ResumableFile($, file, uniqueIdentifier);
							$.files.push(f);
							files.push(f);
// tslint:disable-next-line: triple-equals
							f.container = (typeof event != 'undefined' ? event.srcElement : null);
							window.setTimeout(() => {
								$.fire('fileAdded', f, event);
							}, 0);
						})();
					} else {
						filesSkipped.push(file);
					}
					decreaseReamining();
				}

				// directories have size == 0
				const uniqueIdentifier = $h.generateUniqueIdentifier(file, event);
				if (uniqueIdentifier && typeof uniqueIdentifier.then === 'function') {
					// Promise or Promise-like object provided as unique identifier
					uniqueIdentifier
						.then(
// tslint:disable-next-line: no-shadowed-variable
							(uniqueIdentifier: any) => {
								// unique identifier generation succeeded
								addFile(uniqueIdentifier);
							},
							() => {
								// unique identifier generation failed
								// skip further processing, only decrease file count
								decreaseReamining();
							}
						);
				} else {
					// non-Promise provided as unique identifier, process synchronously
					addFile(uniqueIdentifier);
				}
			});
		};

		// INTERNAL OBJECT TYPES
		function ResumableFile(resumableObj: any, file: any, uniqueIdentifier: any) {
// tslint:disable-next-line: no-shadowed-variable
			const $ = this;
			$.opts = {};
			$.getOpt = resumableObj.getOpt;
			$._prevProgress = 0;
			$.resumableObj = resumableObj;
			$.file = file;
			$.fileName = file.fileName || file.name; // Some confusion in different versions of Firefox
			$.size = file.size;
			$.relativePath = file.relativePath || file.webkitRelativePath || $.fileName;
			$.uniqueIdentifier = uniqueIdentifier;
			$._pause = false;
			$.container = '';
// tslint:disable-next-line: variable-name
			let _error = uniqueIdentifier !== undefined;

			// Callback when something happens within the chunk
			// whx add for 401
			const chunkEvent = (event: any, message: any, status?: any) => {
				// event can be 'progress', 'success', 'error' or 'retry'
				switch (event) {
					case 'progress':
						$.resumableObj.fire('fileProgress', $, message);
						break;
					case 'error':
						$.abort();
						_error = true;
						$.chunks = [];
						// whx add for 401
						$.resumableObj.fire('fileError', $, message, status);
						break;
					case 'success':
						if (_error) {
							return;
						}
						$.resumableObj.fire('fileProgress', $); // it's at least progress
						if ($.isComplete()) {
							$.resumableObj.fire('fileSuccess', $, message);
						}
						break;
					case 'retry':
						$.resumableObj.fire('fileRetry', $);
						break;
				}
			};

			// Main code to set up a file object with chunks,
			// packaged to be able to handle retries if needed.
			$.chunks = [];
			$.abort = () => {
				// Stop current uploads
				let abortCount = 0;
				$h.each($.chunks, (c: any) => {
// tslint:disable-next-line: triple-equals
					if (c.status() == 'uploading') {
						c.abort();
						abortCount++;
					}
				});
				if (abortCount > 0) {
					$.resumableObj.fire('fileProgress', $);
				}
			};
			$.cancel = () => {
				// Reset this file to be void
// tslint:disable-next-line: variable-name
				const _chunks = $.chunks;
				$.chunks = [];
				// Stop current uploads
				$h.each(_chunks, (c: any) => {
// tslint:disable-next-line: triple-equals
					if (c.status() == 'uploading') {
						c.abort();
						$.resumableObj.uploadNextChunk();
					}
				});
				$.resumableObj.removeFile($);
				$.resumableObj.fire('fileProgress', $);
			};
			$.retry = () => {
				$.bootstrap();
				let firedRetry = false;
				$.resumableObj.on('chunkingComplete', () => {
					if (!firedRetry) {
						$.resumableObj.upload();
					}
					firedRetry = true;
				});
			};
			$.bootstrap = () => {
				$.abort();
				_error = false;
				// Rebuild stack of chunks from file
				$.chunks = [];
				$._prevProgress = 0;
				const round = $.getOpt('forceChunkSize') ? Math.ceil : Math.floor;
				const maxOffset = Math.max(round($.file.size / $.getOpt('chunkSize')), 1);
				for (let offset = 0; offset < maxOffset; offset++) {
					window.setTimeout(() => {
						// @ts-ignore
						$.chunks.push(new ResumableChunk($.resumableObj, $, offset, chunkEvent));
						$.resumableObj.fire('chunkingProgress', $, offset / maxOffset);
					}, 0);
					// ((offset1: number) => {
					// 	window.setTimeout(() => {
					// 		$.chunks.push(new ResumableChunk($.resumableObj, $, offset1, chunkEvent));
					// 		$.resumableObj.fire('chunkingProgress', $, offset / maxOffset);
					// 	}, 0);
					// })(offset);
				}
				window.setTimeout(() => {
					$.resumableObj.fire('chunkingComplete', $);
				}, 0);
			};
			$.progress = () => {
				if (_error) {
					return (1);
				}
				// Sum up progress across everything
				let ret = 0;
				let error = false;
				$h.each($.chunks, (c: any) => {
// tslint:disable-next-line: triple-equals
					if (c.status() == 'error') {
						error = true;
					}
					ret += c.progress(true); // get chunk progress relative to entire file
				});
				ret = (error ? 1 : (ret > 0.99999 ? 1 : ret));
				ret = Math.max($._prevProgress, ret); // We don't want to lose percentages when an upload is paused
				$._prevProgress = ret;
				return (ret);
			};
			$.isUploading = () => {
				let uploading = false;
				$h.each($.chunks, (chunk: any) => {
// tslint:disable-next-line: triple-equals
					if (chunk.status() == 'uploading') {
						uploading = true;
						return (false);
					}
				});
				return (uploading);
			};
			$.isComplete = () => {
				let outstanding = false;
				$h.each($.chunks, (chunk: any) => {
					const status = chunk.status();
// tslint:disable-next-line: triple-equals
					if (status == 'pending' || status == 'uploading' || chunk.preprocessState === 1) {
						outstanding = true;
						return (false);
					}
				});
				return (!outstanding);
			};
			$.pause = (pause: any) => {
				if (typeof(pause) === 'undefined') {
					$._pause = ($._pause ? false : true);
				} else {
					$._pause = pause;
				}
			};
			$.isPaused = () => {
				return $._pause;
			};


			// Bootstrap and return
			$.resumableObj.fire('chunkingStart', $);
			$.bootstrap();
			return (this);
		}


		function ResumableChunk(resumableObj: any, fileObj: any, offset: any, callback: any) {
// tslint:disable-next-line: no-shadowed-variable
			const $: any = this;
			$.opts = {};
			$.getOpt = resumableObj.getOpt;
			$.resumableObj = resumableObj;
			$.fileObj = fileObj;
			$.fileObjSize = fileObj.size;
			$.fileObjType = fileObj.file.type;
			$.offset = offset;
			$.callback = callback;
// tslint:disable-next-line: new-parens
			$.lastProgressCallback = (new Date);
			$.tested = false;
			$.retries = 0;
			$.pendingRetry = false;
			$.preprocessState = 0; // 0 = unprocessed, 1 = processing, 2 = finished

			// Computed properties
			const chunkSize = $.getOpt('chunkSize');
			$.loaded = 0;
			$.startByte = $.offset * chunkSize;
			$.endByte = Math.min($.fileObjSize, ($.offset + 1) * chunkSize);
			if ($.fileObjSize - $.endByte < chunkSize && !$.getOpt('forceChunkSize')) {
				// The last chunk will be bigger than the chunk size, but less than 2*chunkSize
				$.endByte = $.fileObjSize;
			}
			$.xhr = null;

			// test() makes a GET request without any data to see if the chunk has already been uploaded in a previous session
			$.test = () => {
				// Set up request and listen for event
				$.xhr = new XMLHttpRequest();

				const testHandler = (e: any) => {
					$.tested = true;
					const status = $.status();
// tslint:disable-next-line: triple-equals
					if (status == 'success') {
						// whx add for login
						$.callback(status, $.message(), $.xhr.status);
						$.resumableObj.uploadNextChunk();
					} else {
						$.send();
					}
				};
				$.xhr.addEventListener('load', testHandler, false);
				$.xhr.addEventListener('error', testHandler, false);
				$.xhr.addEventListener('timeout', testHandler, false);

				// Add data from the query options
				let params: any[] | string[] = [];
				const parameterNamespace = $.getOpt('parameterNamespace');
				let customQuery = $.getOpt('query');
// tslint:disable-next-line: triple-equals
				if (typeof customQuery == 'function') {
					customQuery = customQuery($.fileObj, $);
				}
				$h.each(customQuery, (k: any, v: any) => {
					params.push([encodeURIComponent(parameterNamespace + k), encodeURIComponent(v)].join('='));
				});
				// Add extra data to identify chunk
				params = params.concat(
					[
						// define key/value pairs for additional parameters
						['chunkNumberParameterName', $.offset + 1],
						['chunkSizeParameterName', $.getOpt('chunkSize')],
						['currentChunkSizeParameterName', $.endByte - $.startByte],
						['totalSizeParameterName', $.fileObjSize],
						['typeParameterName', $.fileObjType],
						['identifierParameterName', $.fileObj.uniqueIdentifier],
						['fileNameParameterName', $.fileObj.fileName],
						['relativePathParameterName', $.fileObj.relativePath],
						['totalChunksParameterName', $.fileObj.chunks.length]
					].filter((pair: any) => {
						// include items that resolve to truthy values
						// i.e. exclude false, null, undefined and empty strings
						return $.getOpt(pair[0]);
					})
						.map((pair: any) => {
							// map each key/value pair to its final form
							return [
								parameterNamespace + $.getOpt(pair[0]),
								encodeURIComponent(pair[1])
							].join('=');
						})
				);
				// Append the relevant chunk and send it
				$.xhr.open($.getOpt('testMethod'), $h.getTarget('test', params));
				$.xhr.timeout = $.getOpt('xhrTimeout');
				$.xhr.withCredentials = $.getOpt('withCredentials');
				// Add data from header options
				let customHeaders = $.getOpt('headers');
				if (typeof customHeaders === 'function') {
					customHeaders = customHeaders($.fileObj, $);
				}
				$h.each(customHeaders, (k: any, v: any) => {
					$.xhr.setRequestHeader(k, v);
				});
				$.xhr.send(null);
			};

			$.preprocessFinished = () => {
				$.preprocessState = 2;
				$.send();
			};

			// send() uploads the actual data in a POST call
			$.send = () => {
				const preprocess = $.getOpt('preprocess');
				if (typeof preprocess === 'function') {
					switch ($.preprocessState) {
						case 0:
							$.preprocessState = 1;
							preprocess($);
							return;
						case 1:
							return;
						case 2:
							break;
					}
				}
				if ($.getOpt('testChunks') && !$.tested) {
					$.test();
					return;
				}

				// Set up request and listen for event
				$.xhr = new XMLHttpRequest();

				// Progress
				$.xhr.upload.addEventListener('progress', (e: any) => {
// tslint:disable-next-line: new-parens
					// @ts-ignore
// tslint:disable-next-line: new-parens
					if ((new Date) - $.lastProgressCallback > $.getOpt('throttleProgressCallbacks') * 1000) {
						$.callback('progress');
// tslint:disable-next-line: new-parens
						$.lastProgressCallback = (new Date);
					}
					$.loaded = e.loaded || 0;
				}, false);
				$.loaded = 0;
				$.pendingRetry = false;
				$.callback('progress');

				// Done (either done, failed or retry)
				const doneHandler = (e: any) => {
					const status = $.status();
// tslint:disable-next-line: triple-equals
					if (status == 'success' || status == 'error') {
						// whx add for login
						$.callback(status, $.message(), $.xhr.status);
						$.resumableObj.uploadNextChunk();
					} else {
						$.callback('retry', $.message());
						$.abort();
						$.retries++;
						const retryInterval = $.getOpt('chunkRetryInterval');
						if (retryInterval !== undefined) {
							$.pendingRetry = true;
							setTimeout($.send, retryInterval);
						} else {
							$.send();
						}
					}
				};
				$.xhr.addEventListener('load', doneHandler, false);
				$.xhr.addEventListener('error', doneHandler, false);
				$.xhr.addEventListener('timeout', doneHandler, false);

				// Set up the basic query data from Resumable
				const query = [
					['chunkNumberParameterName', $.offset + 1],
					['chunkSizeParameterName', $.getOpt('chunkSize')],
					['currentChunkSizeParameterName', $.endByte - $.startByte],
					['totalSizeParameterName', $.fileObjSize],
					['typeParameterName', $.fileObjType],
					['identifierParameterName', $.fileObj.uniqueIdentifier],
					['fileNameParameterName', $.fileObj.fileName],
					['relativePathParameterName', $.fileObj.relativePath],
					['totalChunksParameterName', $.fileObj.chunks.length],
				].filter((pair: any) => {
					// include items that resolve to truthy values
					// i.e. exclude false, null, undefined and empty strings
					return $.getOpt(pair[0]);
				})
				// tslint:disable-next-line: no-shadowed-variable
					.reduce((query: any, pair: any) => {
						// assign query key/value
						query[$.getOpt(pair[0])] = pair[1];
						return query;
					}, {});
				// Mix in custom data
				let customQuery = $.getOpt('query');
// tslint:disable-next-line: triple-equals
				if (typeof customQuery == 'function') {
					customQuery = customQuery($.fileObj, $);
				}
				$h.each(customQuery, (k: any, v: any) => {
					query[k] = v;
				});

				const func = ($.fileObj.file.slice ? 'slice' : ($.fileObj.file.mozSlice ? 'mozSlice' : ($.fileObj.file.webkitSlice ? 'webkitSlice' : 'slice')));
				const bytes = $.fileObj.file[func]($.startByte, $.endByte);
				let data: any = null;
				const params: any = [];

				const parameterNamespace = $.getOpt('parameterNamespace');
				if ($.getOpt('method') === 'octet') {
					// Add data from the query options
					data = bytes;
					$h.each(query, (k: any, v: any) => {
						params.push([encodeURIComponent(parameterNamespace + k), encodeURIComponent(v)].join('='));
					});
				} else {
					// Add data from the query options
					data = new FormData();
					$h.each(query, (k: any, v: any) => {
						data.append(parameterNamespace + k, v);
						params.push([encodeURIComponent(parameterNamespace + k), encodeURIComponent(v)].join('='));
					});
// tslint:disable-next-line: triple-equals
					if ($.getOpt('chunkFormat') == 'blob') {
						data.append(parameterNamespace + $.getOpt('fileParameterName'), bytes, $.fileObj.fileName);
// tslint:disable-next-line: triple-equals
					} else if ($.getOpt('chunkFormat') == 'base64') {
						const fr = new FileReader();
						fr.onload = () => {
							data.append(parameterNamespace + $.getOpt('fileParameterName'), fr.result);
							$.xhr.send(data);
						};
						fr.readAsDataURL(bytes);
					}
				}

				const target = $h.getTarget('upload', params);
				const method = $.getOpt('uploadMethod');

				$.xhr.open(method, target);
				if ($.getOpt('method') === 'octet') {
					$.xhr.setRequestHeader('Content-Type', 'application/octet-stream');
				}
				$.xhr.timeout = $.getOpt('xhrTimeout');
				$.xhr.withCredentials = $.getOpt('withCredentials');
				// Add data from header options
				let customHeaders = $.getOpt('headers');
				if (typeof customHeaders === 'function') {
					customHeaders = customHeaders($.fileObj, $);
				}

				$h.each(customHeaders, (k: any, v: any) => {
					$.xhr.setRequestHeader(k, v);
				});

// tslint:disable-next-line: triple-equals
				if ($.getOpt('chunkFormat') == 'blob') {
					$.xhr.send(data);
				}
			};
			$.abort = () => {
				// Abort and reset
				if ($.xhr) {
					$.xhr.abort();
				}
				$.xhr = null;
			};
			$.status = () => {
				// Returns: 'pending', 'uploading', 'success', 'error'
				if ($.pendingRetry) {
					// if pending retry then that's effectively the same as actively uploading,
					// there might just be a slight delay before the retry starts
					return ('uploading');
				} else if (!$.xhr) {
					return ('pending');
				} else if ($.xhr.readyState < 4) {
					// Status is really 'OPENED', 'HEADERS_RECEIVED' or 'LOADING' - meaning that stuff is happening
					return ('uploading');
				} else {
// tslint:disable-next-line: triple-equals
					if ($.xhr.status == 200 || $.xhr.status == 201) {
						// HTTP 200, 201 (created)
						return ('success');
					} else if ($h.contains($.getOpt('permanentErrors'), $.xhr.status) || $.retries >= $.getOpt('maxChunkRetries')) {
						// HTTP 415/500/501, permanent error
						return ('error');
					} else {
						// this should never happen, but we'll reset and queue a retry
						// a likely case for this would be 503 service unavailable
						$.abort();
						return ('pending');
					}
				}
			};
			$.message = () =>  {
				return ($.xhr ? $.xhr.responseText : '');
			};
			$.progress = (relative: any) => {
				if (typeof(relative) === 'undefined') {
					relative = false;
				}
				let factor = (relative ? ($.endByte - $.startByte) / $.fileObjSize : 1);
				if ($.pendingRetry) {
					return (0);
				}
				if (!$.xhr || !$.xhr.status) {
					factor *= .95;
				}
				const s = $.status();
				switch (s) {
					case 'success':
					case 'error':
						return (1 * factor);
					case 'pending':
						return (0 * factor);
					default:
						return ($.loaded / ($.endByte - $.startByte) * factor);
				}
			};
			return (this);
		}

		// QUEUE
		$.uploadNextChunk = () => {
			let found = false;

			// In some cases (such as videos) it's really handy to upload the first
			// and last chunk of a file quickly; this let's the server check the file's
			// metadata and determine if there's even a point in continuing.
			if ($.getOpt('prioritizeFirstAndLastChunk')) {
				$h.each($.files, (file: any) => {
// tslint:disable-next-line: triple-equals
					if (file.chunks.length && file.chunks[0].status() == 'pending' && file.chunks[0].preprocessState === 0) {
						file.chunks[0].send();
						found = true;
						return (false);
					}
// tslint:disable-next-line: triple-equals
					if (file.chunks.length > 1 && file.chunks[file.chunks.length - 1].status() == 'pending' && file.chunks[file.chunks.length - 1].preprocessState === 0) {
						file.chunks[file.chunks.length - 1].send();
						found = true;
						return (false);
					}
				});
				if (found) {
					return (true);
				}
			}

			// Now, simply look for the next, best thing to upload
			$h.each($.files, (file: any) => {
				if (file.isPaused() === false) {
					$h.each(file.chunks, (chunk: any) => {
// tslint:disable-next-line: triple-equals
						if (chunk.status() == 'pending' && chunk.preprocessState === 0) {
							chunk.send();
							found = true;
							return (false);
						}
					});
				}
				if (found) {
					return (false);
				}
			});
			if (found) {
				return (true);
			}

			// The are no more outstanding chunks to upload, check is everything is done
			let outstanding = false;
			$h.each($.files, (file: any) => {
				if (!file.isComplete()) {
					outstanding = true;
					return (false);
				}
			});
			if (!outstanding) {
				// All chunks have been uploaded, complete
				$.fire('complete');
			}
			return (false);
		};


		// PUBLIC METHODS FOR RESUMABLE.JS
		$.assignBrowse = (domNodes: any, isDirectory: any) => {
// tslint:disable-next-line: triple-equals
			if (typeof(domNodes.length) == 'undefined') {
				domNodes = [domNodes];
			}

			$h.each(domNodes, (domNode: any) => {
				let input: any = null;
				if (domNode.tagName === 'INPUT' && domNode.type === 'file') {
					input = domNode;
				} else {
					input = document.createElement('input');
					input.setAttribute('type', 'file');
					input.style.display = 'none';
					domNode.addEventListener('click', () => {
						input.style.opacity = 0;
						input.style.display = 'block';
						input.focus();
						input.click();
						input.style.display = 'none';
					}, false);
					domNode.appendChild(input);
				}
				const maxFiles = $.getOpt('maxFiles');
// tslint:disable-next-line: triple-equals
				if (typeof(maxFiles) === 'undefined' || maxFiles != 1) {
					input.setAttribute('multiple', 'multiple');
				} else {
					input.removeAttribute('multiple');
				}
				if (isDirectory) {
					input.setAttribute('webkitdirectory', 'webkitdirectory');
				} else {
					input.removeAttribute('webkitdirectory');
				}
				// When new files are added, simply append them to the overall list
				input.addEventListener('change', (e: any) => {
					appendFilesFromFileList(e.target.files, e);
					const clearInput = $.getOpt('clearInput');
					if (clearInput) {
						e.target.value = '';
					}
				}, false);
			});
		};
		$.assignDrop = (domNodes: any) => {
// tslint:disable-next-line: triple-equals
			if (typeof(domNodes.length) == 'undefined') {
				domNodes = [domNodes];
			}

			$h.each(domNodes, (domNode: any) => {
				domNode.addEventListener('dragover', preventDefault, false);
				domNode.addEventListener('dragenter', preventDefault, false);
				domNode.addEventListener('drop', onDrop, false);
			});
		};
		$.unAssignDrop = (domNodes: any) => {
// tslint:disable-next-line: triple-equals
			if (typeof(domNodes.length) == 'undefined') {
				domNodes = [domNodes];
			}

			$h.each(domNodes, (domNode: any) => {
				domNode.removeEventListener('dragover', preventDefault);
				domNode.removeEventListener('dragenter', preventDefault);
				domNode.removeEventListener('drop', onDrop);
			});
		};
		$.isUploading = () => {
			let uploading = false;
			$h.each($.files, (file: any) => {
				if (file.isUploading()) {
					uploading = true;
					return (false);
				}
			});
			return (uploading);
		};
		$.upload = () => {
			// Make sure we don't start too many uploads at once
			if ($.isUploading()) {
				return; }
			// Kick off the queue
			$.fire('uploadStart');
			for (let num = 1; num <= $.getOpt('simultaneousUploads'); num++) {
				$.uploadNextChunk();
			}
		};
		$.pause = () => {
			// Resume all chunks currently being uploaded
			$h.each($.files, (file: any) => {
				file.abort();
			});
			$.fire('pause');
		};
		$.cancel = () => {
			$.fire('beforeCancel');
			for (let i = $.files.length - 1; i >= 0; i--) {
				$.files[i].cancel();
			}
			$.fire('cancel');
		};
		$.progress = () => {
			let totalDone = 0;
			let totalSize = 0;
			// Resume all chunks currently being uploaded
			$h.each($.files, (file: any) => {
				totalDone += file.progress() * file.size;
				totalSize += file.size;
			});
			return (totalSize > 0 ? totalDone / totalSize : 0);
		};
		$.addFile = (file: any, event: any) => {
			appendFilesFromFileList([file], event);
		};
		$.removeFile = (file: any) => {
			for (let i = $.files.length - 1; i >= 0; i--) {
				if ($.files[i] === file) {
					$.files.splice(i, 1);
				}
			}
		};
		$.getFromUniqueIdentifier = (uniqueIdentifier: any) => {
			let ret = false;
			$h.each($.files, (f: any) => {
// tslint:disable-next-line: triple-equals
				if (f.uniqueIdentifier == uniqueIdentifier) {
					ret = f;
				}
			});
			return (ret);
		};
		$.getSize = () => {
			let totalSize = 0;
			$h.each($.files, (file: any) => {
				totalSize += file.size;
			});
			return (totalSize);
		};
		$.handleDropEvent = (e: any) => {
			onDrop(e);
		};
		$.handleChangeEvent = (e: any) => {
			appendFilesFromFileList(e.target.files, e);
			e.target.value = '';
		};
		$.updateQuery = (query: any) => {
			$.opts.query = query;
		};

		return (this);
	};

	// Node.js-style export for Node and Component
// tslint:disable-next-line: triple-equals
	if (typeof module != 'undefined') {
		module.exports = Resumable;
	} else {
		// Browser: Expose to window
		// @ts-ignore
		window.Resumable = Resumable;
	}

})();
