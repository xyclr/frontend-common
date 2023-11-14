/**
 *  @desc 多选
 */
import React from 'react';
interface receiveProps {
    codeName?: string;
    api?: Object;
    data?: Array<any>;
    setVisi?: Array<string>;
    [key: string]: any;
}
export default class Demo extends React.Component<receiveProps, any> {
    constructor(props: receiveProps);
    componentWillReceiveProps(nextProps: any): void;
    componentDidMount(): void;
    getData(api: any): void;
    render(): JSX.Element;
}
export {};
