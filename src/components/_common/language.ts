/**
 * @name 多语言设置
 * @desc 根据本地存储的语言设置不同的语言
 * @author yangliu at 2020-3-02
 *
 */

import { langObj } from './locales';

export const getLanguageHeader = (): string => {
    const defaultLanguage = 'zh-CN';
    const language: string = localStorage.getItem('umi_locale') || defaultLanguage;
    return `${language.split('-').join('')}`;
}

export const getLanguage = (name: any) => {
    const nowLang = getLanguageHeader();
    return langObj[nowLang][name]

}