/**
 *  @datetime 2019/2/15 9:42 AM
 *  @author Ping Dong
 *  @desc 网络请求
 ======================由原项目直接搬过来的，可以在该组件中删除，指向统一的request======================
 */
// import server_api from './api';
// import history from '../router/history';
import { notification } from 'antd';

const NOT_LOGIN_CODE = 400;

enum Method {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE'
}

enum DataType {
  JSON = 'JSON',
  URL_ENCODING = 'URL_ENCODING'
}

interface ParamObj {
  [name: string]: any;
}

interface HeadersInterface {
  Authorization?: string;

  [name: string]: any;
}

type SuccessCbk = (data: object | string) => void;
type ErrorCbk = (error: Error) => void;

class XHRRequest {
  static timeout = 3000 * 60; // 10 seconds
  url: string;
  method: Method;
  params: object;
  dataType?: DataType;
  headers?: HeadersInterface | null;
  xhr: XMLHttpRequest;
  onSuccess: SuccessCbk;
  onFailed: ErrorCbk;

  constructor(
    url: string,
    method: Method,
    params: object | null,
    onSuccess: SuccessCbk,
    onFailed: ErrorCbk,
    dataType?: DataType,
    headers?: HeadersInterface
  ) {
    this.url = url;
    this.method = method;
    this.params = params;
    this.onSuccess = onSuccess;
    this.onFailed = onFailed;
    if (dataType) {
      this.dataType = dataType;
    }
    if (headers) {
      this.headers = headers;
    }
    this.init();
  }

  private init() {
    const xhr = new XMLHttpRequest();
    this.xhr = xhr;
    xhr.onreadystatechange = () => {
      try {
        if (xhr.readyState === 4) {
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            if (/application\/json/.test(xhr.getResponseHeader('Content-Type'))) {
              this.onSuccess(JSON.parse(xhr.responseText));
            } else {
              this.onSuccess(xhr.responseText);
            }
          } else {
            if (xhr.status === 401) {
              // history.push('/login');
              notLogin()
              return false;
            }
            this.onFailed(new Error(`错误码：, ${xhr.status}`));
          }
        }
      } catch (e) {
        this.onFailed(e);
      }
    };
    this.openRequest();
    this.setTimeout();
    this.setRequestHeaders();
    this.sendData();
  }

  private openRequest() {
    switch (this.method) {
      case Method.DELETE: {
        this.xhr.open(this.method, this.params ? addObjectParamToUrl(this.url, this.params) : this.url, true);
        break;
      }
      case Method.GET: {
        this.xhr.open(this.method, this.params ? addObjectParamToUrl(this.url, this.params) : this.url, true);
        break;
      }
      case Method.POST: {
        this.xhr.open(this.method, this.url, true);
        break;
      }
      default:
        break;
    }
  }

  private setTimeout() {
    this.xhr.timeout = XHRRequest.timeout;
    this.xhr.ontimeout = () => {
      this.onFailed(new Error('连接服务器超时'));
    };
  }

  private setRequestHeaders() {
    if (!this.headers) {
      return;
    }
    for (const i in this.headers) {
      this.xhr.setRequestHeader(i, this.headers[i]);
    }
  }

  private sendData() {
    switch (this.method) {
      case Method.DELETE: {
        this.xhr.send(null);
        break;
      }
      case Method.GET: {
        this.xhr.send(null);
        break;
      }
      case Method.POST: {
        let body = '';
        if (this.dataType === DataType.JSON) {
          if (this.params) {
            body = JSON.stringify(this.params);
          }
        } else if (this.dataType === DataType.URL_ENCODING) {
          if (this.params) {
            body = paramUrlEncoding(this.params);
          }
        }
        this.xhr.send(body);
        break;
      }
      default:
        break;
    }
  }
}

export function addURLParam(url: string, name: string, value: string | number): string {
  let valueStr: string;
  if (null === value) {
    valueStr = '';
  } else if ((typeof value) !== 'string') {
    valueStr = value.toString();
  } else {
    valueStr = (value as string);
  }
  url += (url.indexOf('?') === -1 ? '?' : '&');
  url += encodeURIComponent(name) + '=' + encodeURIComponent(valueStr);
  return url;
}

function addObjectParamToUrl(url: string, param: ParamObj): string {
  param = JSON.parse(JSON.stringify(param));
  for (const i in param) {
    url = addURLParam(url, i, param[i]);
  }
  return url;
}

/**
 * 对象参数编码,x-www-form-urlencoded
 **/
function paramUrlEncoding(param: ParamObj): string {
  return addObjectParamToUrl('', param).substring(1);
}

/**
 * 拼装Header字段：Accept-Language
 * @returns zh-CN,zh;q=0.9
 */
export const getLanguageHeader = (): string => {
  const defaultLanguage = 'zh-CN';
	const language: string = localStorage.getItem('umi_locale') || defaultLanguage;
	return `${language},${language.slice(0, 2)};`;
}

export function xhr_get(url: string, params?: ParamObj, headers?: HeadersInterface) {
  const userInfo = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
  let token = '';
  if (params && params.access_token) {
    token = params.access_token;
  } else if (userInfo && userInfo.accessToken) {
    token = userInfo.accessToken;
    params = params || {};
    // queryObj.access_token = token;
  }

  const Authorization = token ? { Authorization: `Bearer ${token}` } : {};

  const defaultHeader: HeadersInterface = {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': getLanguageHeader(),
      ...Authorization
};
    return new Promise((resolve, reject) => {
    const xhrRequest = new XHRRequest(
      url,
      Method.GET,
      params || null,
      (data: any) => {
        if (!data.success) {
          notification.error({ message: data.message });
        }
        resolve(data);
      },
      (error: Error) => {
        if (xhrRequest.xhr.status === NOT_LOGIN_CODE) {
          notLogin();
        }
        notification.error({ message: error.message });
        reject(error);
      },
      DataType.JSON,
      { ...headers, ...defaultHeader } || defaultHeader);
  });
}

export function xhr_delete(url: string, params?: ParamObj, headers?: HeadersInterface) {
  return new Promise((resolve, reject) => {
    const xhrRequest = new XHRRequest(
      url,
      Method.DELETE,
      params || null,
      (data) => {
        resolve(data);
      },
      (error: Error) => {
        if (xhrRequest.xhr.status === NOT_LOGIN_CODE) {
          notLogin();
        }
        notification.error({ message: error.message });
        reject(error);
      },
      DataType.JSON,
      headers || null);
  });
}

export function xhr_post_json(url: string, params?: ParamObj, headers?: HeadersInterface) {
  const userInfo = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
  let token = '';
  if (params && params.access_token) {
    token = params.access_token;
  } else if (userInfo && userInfo.accessToken) {
    token = userInfo.accessToken;
    params = params || {};
    // queryObj.access_token = token;
  }
    const Authorization = token ? { Authorization: `Bearer ${token}` } : {};
  const defaultHeader: HeadersInterface = {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': getLanguageHeader(),
      ...Authorization
  };
  if (!headers) {
    headers = defaultHeader;
  } else {
    headers = { ...defaultHeader, ...headers };
  }
  headers['Content-Type'] = 'application/json';
  return new Promise((resolve, reject) => {
    const xhrRequest = new XHRRequest(
      url,
      Method.POST,
      params || null,
      (data: any) => {
        if (!data.success) {
          notification.error({ message: data.message });
        }
        resolve(data);
      },
      (error: Error) => {
        if (xhrRequest.xhr.status === NOT_LOGIN_CODE) {
          notLogin();
        }
        notification.error({ message: error.message });
        reject(error);
      },
      DataType.JSON,
      headers || null);
  });
}

export function xhr_post_url_encoding(url: string, params?: ParamObj, headers?: HeadersInterface) {
  const userInfo = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
  let token = '';
  if (params && params.access_token) {
    token = params.access_token;
  } else if (userInfo && userInfo.accessToken) {
    token = userInfo.accessToken;
    params = params || {};
    // queryObj.access_token = token;
  }

    const Authorization = token ? { Authorization: `Bearer ${token}` } : {};

  const defaultHeader: HeadersInterface = {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': getLanguageHeader(),
      ...Authorization,
  };

  if (!headers) {
    headers = defaultHeader;
  } else {
    headers = { ...defaultHeader, ...headers };
  }

  headers['Content-Type'] = 'application/x-www-form-urlencoded';
  return new Promise((resolve, reject) => {
    const xhrRequest = new XHRRequest(
      url,
      Method.POST,
      params || null,
      (data) => {
        resolve(data);
      },
      (error: Error) => {
        if (xhrRequest.xhr.status === NOT_LOGIN_CODE) {
          notLogin();
        }
        notification.error({ message: error.message });
        reject(error);
      },
      DataType.URL_ENCODING,
      headers || null);
  });
}

/**
 * 没登录 @TODO
 */
function notLogin() {
  window.location.href = '#/login'
}
