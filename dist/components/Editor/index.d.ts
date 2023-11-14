/**
 *  @desc 富文本
 */
import React from 'react';
import 'braft-editor/dist/index.css';
interface receiveProps {
    value?: string;
    onChange?: Function;
    [key: string]: any;
}
export default class Demo extends React.Component<receiveProps, any> {
    constructor(props: receiveProps);
    static getDerivedStateFromProps(nextProps: any, prevState: any): {
        value: any;
    };
    handleEditorChange: (value: any) => void;
    render(): JSX.Element;
}
export {};
