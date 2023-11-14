import * as React from 'react';
interface TypeProps {
    code?: string;
    name?: string;
}
interface ValueProps {
    currency?: string | number;
    number?: string | number;
}
interface States {
    value?: ValueProps;
    [key: string]: any;
}
interface Props {
    typeData?: TypeProps[];
    size?: 'large' | 'default' | 'small';
    [key: string]: any;
}
declare class PriceInput extends React.PureComponent<Props, States> {
    static getDerivedStateFromProps(nextProps: Props): any;
    constructor(props: Props);
    handleNumberChange: (e: any) => void;
    handleCurrencyChange: (currency: any) => void;
    triggerChange: (changedValue: any) => void;
    render(): JSX.Element;
}
export default PriceInput;
