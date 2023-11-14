import * as React from 'react';
import { Input, Select, } from 'antd';
import { getLanguage } from '../_common/language';

const { Option } = Select;

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

class PriceInput extends React.PureComponent<Props, States> {
	static getDerivedStateFromProps(nextProps: Props) {
		// Should be a controlled component.
		if ('value' in nextProps) {
			return {
				...(nextProps.value || {}),
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);

		const value = props.value || {};
		this.state = {
			number: value.number || 0,
			currency: value.currency || 'rmb',
		};
	}

	handleNumberChange = (e: any) => {
		const number = parseInt(e.target.value || 0, 10);
		if (isNaN(number)) {
			return;
		}
		if (!('value' in this.props)) {
			this.setState({ number });
		}
		this.triggerChange({ number });
	}

	handleCurrencyChange = (currency: any) => {
		if (!('value' in this.props)) {
			this.setState({ currency });
		}
		this.triggerChange({ currency });
	}

	triggerChange = (changedValue: any) => {
		// Should provide an event to pass value to Form.
		const { onChange } = this.props;
		if (onChange) {
			onChange({
				...this.state,
				...changedValue,
			});
		}
	}

	render() {
		const { size = 'default', typeData } = this.props;
// tslint:disable-next-line: variable-name
		const { currency, number } = this.state;
		// console.log(123);
		return (
			<span>
        <Input
	        type="text"
	        size={size}
	        value={number}
	        onChange={this.handleNumberChange}
	        style={{ width: '65%', marginRight: '3%' }}
        />
        <Select
	        value={currency || ''}
	        size={size}
	        style={{ width: '32%' }}
	        onChange={this.handleCurrencyChange}
        >
	        <Option value={''} disabled>{getLanguage('pleaseSelect')}</Option>
	        {typeData && typeData.length > 0 && typeData.map((item: TypeProps) => {
	        	return <Option value={item.code}>{item.name}</Option>;
	        })}
        </Select>
      </span>
		);
	}
}

export default PriceInput;
