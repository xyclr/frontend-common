/**
 *  @desc 时间区间选择器
 */
import React from 'react';
interface receiveProps {
    [key: string]: any;
}
export default class Demo extends React.Component<receiveProps, any> {
    constructor(props: receiveProps);
    triggerChange(value: any): void;
    render(): JSX.Element;
}
export {};
