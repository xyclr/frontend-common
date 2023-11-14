import React from 'react';
interface Props {
    api: any;
    size?: 'large' | 'default' | 'small';
    placeholder?: string;
    [key: string]: any;
}
interface LabelProps {
    value: string;
    label?: string;
    code: string;
    children: LabelProps[];
}
interface StateProps {
    options: LabelProps[];
    initValue: string[];
}
declare class CascaderCity extends React.PureComponent<Props, StateProps> {
    constructor(props: Props);
    componentDidMount(): void;
    setOptions(params: string[], res: any): void;
    itemChildren(children: Array<LabelProps>): string;
    loadValue: () => void;
    onChange: (value: any[], selectedOptions?: any[]) => void;
    render(): JSX.Element;
}
export default CascaderCity;
