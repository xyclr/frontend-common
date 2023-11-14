interface ParamObj {
    [name: string]: any;
}
interface HeadersInterface {
    Authorization?: string;
    [name: string]: any;
}
export declare function addURLParam(url: string, name: string, value: string | number): string;
/**
 * 拼装Header字段：Accept-Language
 * @returns zh-CN,zh;q=0.9
 */
export declare const getLanguageHeader: () => string;
export declare function xhr_get(url: string, params?: ParamObj, headers?: HeadersInterface): Promise<unknown>;
export declare function xhr_delete(url: string, params?: ParamObj, headers?: HeadersInterface): Promise<unknown>;
export declare function xhr_post_json(url: string, params?: ParamObj, headers?: HeadersInterface): Promise<unknown>;
export declare function xhr_post_url_encoding(url: string, params?: ParamObj, headers?: HeadersInterface): Promise<unknown>;
export {};
