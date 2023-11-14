/**
 * @author King
 */

import { Input, Switch, InputNumber } from 'antd';
import _ from 'lodash';
import React from 'react';
import TrueComponent from './TrueComponent';
import { getLanguage } from './language';
import Tags from '../Tags';
import CustomRadio from '../Radio';
import SelectTable from '../SelectTable';

/**
 * 共通组件渲染定义
 */
const definition = {
    'INPUT': (finalProps: any) => {
        return <TrueComponent {...finalProps} comp={Input} allowClear={true} />
    },
    'INPUT_TEXTAREA': (finalProps: any) => {
        return <TrueComponent {...finalProps} comp={Input.TextArea} />;
    },
    // 'INPUT_RICH': () => { },
    // 'INPUT_EMAIL': () => { },
    // 'INPUT_PHONE': () => { },
    // 'INPUT_TEL': () => { },
    'SWITCH': (finalProps: any) => {
        return <TrueComponent {...finalProps} comp={Switch} />
    },
    'TAGS': (finalProps: any) => {
        return <TrueComponent {...finalProps} comp={Tags} />
    },

    // 'NUMBER': (finalProps: any) => {
    //     return <TrueComponent {...finalProps} comp={InputNumber} />;
    // },
    // 'NUMBER_RANGE': (finalProps: any) => { },
    // 'NUMBER_SUFFIX': (finalProps: any) => { },
    // 'CHECKBOX_GROUP': (finalProps: any) => { },
    // 'RADIO_GROUP': (finalProps: any) => {
    //     return <CustomRadio  {...finalProps} />
    // },
    // 'DATE': (finalProps: any) => { },
    // 'DATE_RANGE': (finalProps: any) => { },
    // 'SELECT': (finalProps: any) => { },
    // 'SELECT_SEARCH': (finalProps: any) => { },
    // 'SELECT_MUL': (finalProps: any) => { },
    // 'SELECT_MUL_SEARCH': (finalProps: any) => { },
    'SELECT_SEARCH_TABLE': (finalProps: any) => {
        return <TrueComponent {...finalProps} comp={SelectTable} />;
    },
    'SELECT_MUL_SEARCH_TABLE': (finalProps: any) => {
        return <TrueComponent {...finalProps} comp={SelectTable} />;
    },
    // 'TREE_LAZY': (finalProps: any) => { },
    // 'TREE': (finalProps: any) => { },
    // 'TREE_LAZY_SEARCH': (finalProps: any) => { },
    // 'TREE_SEARCH': (finalProps: any) => { },
    // 'TREE_MUL_LAZY': (finalProps: any) => { },
    // 'TREE_MUL': (finalProps: any) => { },
    // 'TREE_MUL_LAZY_SEARCH': (finalProps: any) => { },
    // 'TREE_MUL_SEARCH': (finalProps: any) => { },
    // 'UPLOAD': (finalProps: any) => { },
    // 'UPLOAD_PIC': (finalProps: any) => { },
}

/**
 * 渲染器
 * @param item Meta
 * @param definitions 渲染定义
 * @param renderType 渲染类型 'EDIT' | 'CREATE' | 'SEARCH'
 * @param formatMessage 国际化函数
 */
const switchComp = (item: any = {}, definitions: any = {}) => {
    const { inputValueComponentType: componentType, props } = item;
    // 自定义组件属性
    const { compConfig = {} } = props;
    // let componentType = renderType === 'SEARCH' ? searchValueComponentType : inputValueComponentType;
    const render = definitions[componentType];

    props.disabled = !!+props.disabled;

    // if (renderType == 'CREATE') {
    //     props.disabled = Boolean(+props.disabledCreate);
    // }
    // if (renderType == 'EDIT') {
    //     props.disabled = Boolean(+props.disabledEdit);
    // }

    if (!render) {
        return <Input {...props} />
    } else {
        const defTips = `${getLanguage('pls_input') + item.label || ''}`;
        const finalProps = {
            ...props,
            ...compConfig,
            placeholder: defTips,
            allowClear: true,
        };
        return render(finalProps, item, defTips);
    }
}

/**
 * 初始化选择器
 * @param privateDefinition 自定义渲染
 */
export const initSwitchComp = (privateDefinition?: object) => {
    const definitions = _.merge(definition, privateDefinition);
    return (item: object) => {
        return switchComp(item, definitions);
    };
}
