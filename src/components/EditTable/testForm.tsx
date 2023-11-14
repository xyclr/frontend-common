import React from 'react';
import {Form, Modal, Input, Col} from 'antd';

class TestForm extends React.Component<any, any> {
	state: any = {
		formData: [],
	};
	componentWillReceiveProps(nextProps: Readonly<any>, nextContext: any): void {
		const { formData } = nextProps;
		if (formData !== this.props.formData) {
			this.setState({
				formData,
			});
		}
	}

	resetData = (data: any) => {
		if (!data.length) {
			return [];
		}

		const newData: any[] = [];
		let rowArr: any[] = [];
		// @ts-ignore
		data.map((item: any, index: number) => {
			const nextItem = data[index + 1];
			if (item.props.colspan === '2') {
				rowArr = [item];
				newData.push(rowArr);
				rowArr = [];
				return null;
			}

			rowArr.push(item);
			if (index % 2 === 1 || !nextItem || nextItem.props.colspan === '2') {
				newData.push(rowArr);
				rowArr = [];
			}

			return null;
		});

		return newData;
	}

	render() {
		const {form: {getFieldDecorator}, visible, } = this.props;
		const {formData = []} = this.state;
		return <Modal visible={visible} onOk={() => {
			const {form} = this.props;
			form.validateFields((err: any, values: any) => {
				const {onSubmit} = this.props;
				onSubmit(values);
			});
		}}>
			{formData && formData.length > 0 && formData.map((item: any) => {
				return <Col span="12" key={`col_${item.id}`}>
					<Form.Item label={item.label}>
						{
							getFieldDecorator(item.key, {
								initialValue: item.value
							})(<Input />)
						}
					</Form.Item>
				</Col>;
			})}

		</Modal>;
	}
}

export default Form.create()(TestForm);
