import React, { Component } from 'react';
import Uploader from '../_common/uploader';
import { message } from 'antd';
import { getLanguage } from '../_common/language';
interface BizUploaderProps {
	value?: any;
	fileList?: any;
	onChange?: (value: any) => void;
	disabled?: boolean;
	uploadImg?: boolean;
	multiple?: boolean;//多文件上传，可以一个个选择后添加到列表，或者一次选择多个
	sigle?: boolean;//单文件上传，只选择一个
}

export default class BizUploader extends Component<BizUploaderProps, any> {


	state: any = {
		showModal: false,
		value: [],
	};

	constructor(props: any) {
		super(props);
		const value = props.value || props.fileList || [];
		this.state = {
			value,
		};
	}

	componentWillReceiveProps(nextProps: any) {
		if (this.props.value !== nextProps.value || this.props.fileList !== nextProps.fileList) {
			this.setState({
				value: nextProps.value || nextProps.fileList || [],
			});
		}
	}

	onChange = (v: any) => {
		console.log(444, this.props.sigle, v)
		const { value } = this.state;
		const temp = [...value, v];
		this.setState({
			value: temp,
		});
		this.triggerChange(temp);
	}

	triggerChange = (changedValue: any) => {
		const { onChange } = this.props;
		if (onChange) {
			onChange(changedValue);
		}
	}

	handleCloseModal = () => {
		this.setState({
			showModal: false,
		});
	}

	handleShowModal = () => {
		this.setState({
			showModal: true,
		});
	}
	filterFiles = () => {
		const { value } = this.state;
	}
	handleUpload = (file: any) => {
		this.setState({
			showModal: false,
		});

		if (file.result) {

			this.onChange({
				id: file.result,
				value: file.fileName,
			});
			message.success(getLanguage('uploadSuccess'))
		}

	}

	handleDelete = (id: any) => {
		const { value } = this.state;
		const temp: any[] = [];
		value.forEach((f: any) => {
			if (f.id !== id) {
				temp.push(f);
			}
		});

		this.setState({
			value: temp,
		});
		this.triggerChange(temp);
	}

	render() {
		const { disabled, uploadImg, multiple = false, sigle = false } = this.props;

		return (
			<div>
				<Uploader
					value={this.state.value}
					uploadCb={this.handleUpload}
					deleteCb={this.handleDelete}
					disabled={disabled}
					uploadImg={uploadImg}
					multiple={multiple}
					sigle={sigle}
				/>
			</div>
		);
	}

}
