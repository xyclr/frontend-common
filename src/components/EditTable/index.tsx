import React from 'react';
import { Row, Table, Divider, Button, Modal, message, Form, Popconfirm } from 'antd';
import _ from 'lodash';
import Moment from 'moment';
import { xhr_post_json, xhr_get } from '../_common/request';
import { getLanguage } from '../_common/language';

const { confirm } = Modal;
interface TableProps {
	isEditable?: boolean | 0 | 1; // 是否可编辑
	hasAdd?: boolean | 0 | 1; // 是否可新增
	hasPrint?: boolean | 0 | 1; // 是否有打印按钮
	newItemData?: any[]; // 新增行数据
	columns?: any[]; // 表头配置参数
	value?: any[]; // 列表数据
	onChange?: (value: any, obj?: any) => void; // change回调
	onCheck?: (value: any, obj?: any) => void; // 弹窗确认校验回调
	onPrint?: (value: any, obj?: any) => void; // 打印按钮点击回调
	valueCbk?: (value: any, obj?: any) => void; // 处理点击确认按钮之后的值
	saveCbk?: (value: any, obj?: any) => void; // 处理所有数据
	className?: string;
	addValid?: (value?: any) => boolean;
	addMessage?: (value?: any) => boolean;
	tplUrl?: string;
	scrollX?: any;
	hasDownload?: boolean | 0 | 1;
	noEdit?: boolean | 0 | 1;
	FormModal?: any;
	columnUrl?: string;
	hasIndex?: boolean | 0 | 1; // 是否有序号
	modelArray?: string;
	[key: string]: any;
	relateName?: string; // 关联数据名称
	beRelateName?: string; // 被关联数据名称
	beRelateKey?: string; // 被关联数据取值
	size?: any; // small default
	cttClass?: string; // 包装className
	handleFieldChange?: (params?: any, values?: any) => void;
	disabled?: boolean;
	EditBtn?: any; // 编辑按钮组件
	editBtnProps?: string; // 编辑按钮组件的props
	delBtnProps?: string; // 删除按钮组件的props
}

interface TableState {
	editData: any[];
	showModal: boolean;
	columns: any[];
}

export default class EditableTable extends React.Component<TableProps, TableState> {

	saveData: any[] = [];
	dataKeys: any[] = [];
	uploadKeys: any[] = [];
	editType: string = '';
	editIndex: number = 0;
	formItems: any[] = [];
	formSetData: any = undefined;

	constructor(props: any) {
		super(props);

		const { value, columns } = props;
		// const { dataKeys, uploadKeys } = this.getKeys(newItemData);

		this.state = {
			editData: [],
			showModal: false,
			columns,
		};
		this.saveData = _.cloneDeep(value || []);
		// this.dataKeys = dataKeys;
		// this.uploadKeys = uploadKeys;
	}

	componentWillMount(): void {
		this.queryData();
	}

	shouldComponentUpdate(nextProps: Readonly<TableProps>, nextState: Readonly<TableState>, nextContext: any): boolean {
		const { props, state } = this;
		const newProps = _.filter(props, (item: any) => {
			return typeof (item) !== 'function';
		});
		const newNextProps = _.filter(nextProps, (item: any) => {
			return typeof (item) !== 'function';
		});
		if (state.showModal !== nextState.showModal) {
			return true;
		}
		if (!state.columns || nextState.columns.length !== state.columns.length) {
			return true;
		}
		if (props.value && nextProps.value && props.value.length !== nextProps.value.length) {
			return true;
		}

		return !_.isEqual(newNextProps, newProps) || props.value !== nextProps.value;
	}

	// componentWillReceiveProps(nextProps: any) {
	// 	this.saveData = nextProps.value || [];
	// }

	componentDidUpdate(prevProps: Readonly<TableProps>, prevState: Readonly<TableState>, snapshot?: any): void {
		this.saveData = this.props.value || [];
		if (this.props.value) {
			this.saveData = this.props.value || [];
		}
		this.queryData();
	}

	queryData = async () => {
		const { columnUrl, hasIndex, tplUrl, modelArray, paramType, } = this.props;
		const columns: any[] = [];
		let result: any = this.props.newItemData;
		// console.log(columnUrl);
		if (columnUrl) {
			const params = paramType === 'rb' ? { modelCode: modelArray } : { modelArray: [modelArray] };
			const res: any = await xhr_post_json(columnUrl, params);
			if (!res.success) {
				return false;
			}
			result = res.result;
		}
		if (hasIndex) {
			columns.push({
				key: 'id',
				title: getLanguage('index'),
				dataIndex: 'id',
				render: (val: any, row: any, index: number) => {
					return index + 1;
				}
			});
		}
		// tslint:disable-next-line: no-unused-expression
		result && result.length > 0 && result.map((item: any) => {
			if (item.props.isBaseTableColumn === '1') {
				const tempColumn: any = {
					key: item.key,
					title: item.label,
					dataIndex: item.key,
				};
				switch (item.props.columnRenderType) {
					case 'DATE':
						tempColumn.render = (val: any) => {
							if (val instanceof Array) {
								return <div>{val[0]
								&& Moment(val[0]).format('YYYY-MM-DD')}-{val[1]
								&& Moment(val[1]).format('YYYY-MM-DD')}</div>;
							}
							return Moment(val).format('YYYY-MM-DD');
						};
						break;
					case 'DATETIME':
						tempColumn.render = (val: any) => {
							if (val instanceof Array) {
								return <div>{val[0]
								&& Moment(val[0]).format('YYYY-MM-DD HH:mm:SS')}-{val[1]
								&& Moment(val[1]).format('YYYY-MM-DD HH:mm:SS')}</div>;
							}
							return Moment(val).format('YYYY-MM-DD HH:mm:SS');
						};
						break;
					case 'HREF':
						tempColumn.render = (val: any) => {
							return <div className="et-a-ctt">
								{val && val.length > 0 && val.map((valItem: any) => <a
									href={`${tplUrl}/${valItem.fileId}`}
									style={{ display: 'block' }}
								>{valItem.fileName}</a>)}
							</div>;
						};
						break;
					case 'IMG':
						tempColumn.render = (val: any) => {
							return <div className="et-img-ctt">
								{val && val.length > 0 && val.map((valItem: any) => <img
									src={`${tplUrl}/${valItem.fileId}`}
									style={{ width: '80px', height: '80px', display: 'inline-block' }} />)}
							</div>;
						};
						break;
					case 'DICT_TYPE':
						tempColumn.render = (val: any, row: any) => {
							if (typeof val === 'string') {
								return row[`${item.key}Name`];
							}
							return val && typeof val === 'object' && (val.name || val.value);
						};
						break;
					case 'BANK_NAME':
						tempColumn.render = (val: any, row: any) => {
							if (typeof val === 'string') {
								return val;
							}
							return val && typeof val === 'object' && (val.name || val.value || val.matlCode);
						};
						break;
					default:
						tempColumn.render = (val: any) => {
							if (item.props.render) {
								return item.props.render(val);
							}
							return val;
						};
						break;
				}
				columns.push(tempColumn);
			}
		});
		this.formItems = result;
		this.setState({
			columns,
		});
	}

	getTableData = (value: any) => {
		if (!value || !value.length) {
			return [];
		}
		const newData = _.cloneDeep(value);
		const dateNum = Moment(new Date()).valueOf();

		return newData.map((item: any, index: number) => {
			let rowObj = null;
			const itemKeys = Object.keys(item);

			if (this.uploadKeys.length) {
				itemKeys.map((key) => {
					if (_.find(this.uploadKeys, (o: any) => o === key)) {
						item.tableFileId = item[key][0].id;
						item[key] = item[key][0].value;
					}
				});
			}

			rowObj = { ...item, index, key: dateNum + index };

			return rowObj;
		});
	}

	getKeys = (newItemData: any) => {
		const dataKeys: any[] = [];
		const uploadKeys: any[] = [];

		newItemData.map((item: any) => {
			if (item.props.inputValueComponentType === 'FIL_INPUT_UPLOAD_DISPLAY') {
				uploadKeys.push(item.key);
			}
			dataKeys.push(item.key);
		});

		return { dataKeys, uploadKeys };
	}

	getEditData = (index: number) => {
		const newItems = this.props.newItemData || this.formItems || [];
		const rowData = this.saveData[index];
		const dateNum = Moment(new Date()).valueOf();
		this.formSetData = rowData;
		return newItems.map((item: any, nextIndex: number) => {
			const newItem = _.cloneDeep(item);
			const findKey = item.key;
			if (findKey) {
				// 字典类型加判断
				if (item.props.columnRenderType === 'DICT_TYPE') {
					newItem.value = rowData[findKey] && rowData[findKey].code || undefined;
				} else {
					newItem.value = rowData[findKey];
				}
			}
			newItem.id = dateNum + nextIndex;

			return newItem;
		});
	}

	handleNewItem = () => {
		const { addValid, addMessage } = this.props;
		if (addValid) {
			if (!addValid()) {
				message.error(addMessage);
				return false;
			}
		}
		const newItemData = _.cloneDeep(this.props.newItemData || this.formItems || []);
		const dateNum = Moment(new Date()).valueOf();

		newItemData.map((item, index) => {
			item.id = dateNum + index;

			return null;
		});
		this.setState({
			showModal: true,
			editData: newItemData,
		});
		this.editType = 'new';
		this.formSetData = undefined;
	}

	handleDownTemplate = () => {
		const { tplUrl } = this.props;
		window.open(tplUrl, '_blank');
	}

	handleEditItem = (index: number) => {
		this.setState({
			showModal: true,
			editData: this.getEditData(index),
		});
		this.editType = 'edit';
		this.editIndex = index;
	}

	handleDeleteItem = (index: number) => {
		const { value } = this.props;
		const _value = _.cloneDeep(value);
		_value.splice(index, 1) || [];
		this.saveData = _value;
		this.triggerChange();
		// confirm({
		// 	title: '确认删除？',
		// 	content: '',
		// 	onOk: () => {
		// 		this.saveData.splice(index, 1);
		// 		this.triggerChange();
		// 	},
		// 	onCancel: () => {
		// 		console.log('Cancel');
		// 	},
		// });
	}

	triggerChange = () => {
		const { onChange, } = this.props;
		if (onChange) {
			// @ts-ignore
			onChange(this.saveData);
		}
	}

	// @ts-ignore
	handleSave = (data: any) => {
		const { onCheck, valueCbk, saveCbk, relateName, beRelateName, beRelateKey } = this.props;
		if (relateName && data[relateName]) {
			data[beRelateName] = data[relateName][beRelateKey] || data[beRelateName];
		}
		// @ts-ignore
		// tslint:disable-next-line: no-unused-expression
		valueCbk ? data = valueCbk(data) : null;
		// @ts-ignore
		if (onCheck && !onCheck(this.saveData && this.saveData[this.editIndex], data)) { // arguments[oldData, newData]
			return null;
		}

		if (this.editType === 'new') {
			this.saveData.push(data);
		} else {
			const editData = this.saveData[this.editIndex];
			this.saveData.splice(this.editIndex, 1, { ...editData, ...data });
		}
		// @ts-ignore
		// tslint:disable-next-line: no-unused-expression
		saveCbk ? this.saveData = saveCbk(this.saveData) : null;

		this.setState({
			showModal: false,
		});
		this.triggerChange();
	}

	handleCancel = () => {
		this.setState({
			showModal: false,
		});
	}

	render() {
		const { editData, showModal, columns } = this.state;
		const {
			value = [],
			isEditable,
			hasAdd,
			hasPrint,
			onPrint,
			scrollX,
			hasDownload,
			noEdit,
			className = '',
			FormModal,
			size = 'default',
			cttClass,
			bordered = false,
			handleFieldChange = () => { },
			disabled = false,
			EditBtn,
			editBtnProps,
			delBtnProps,
		} = this.props;
		const tableData = this.getTableData(value);

		const newColumns = _.cloneDeep(columns) || [];
		if (isEditable && !disabled) {
			newColumns.push({
				title: getLanguage('operate'),
				key: 'operations',
				dataIndex: 'operations',
				width: hasPrint ? 250 : 200,
				render: (text: any, record: any) => {
					let EditBtnTmp = <Button
						type="primary"
						size="small"
						style={{marginRight: '5px'}}
						onClick={() => this.handleEditItem(record.index)}>{getLanguage('edit')}</Button>;
					let DelBtnTmp = <Button type="danger" size="small">{getLanguage('delete')}</Button>;
					if (EditBtn) {
						EditBtnTmp = <EditBtn {...editBtnProps} onClick={() => this.handleEditItem(record.index)} />;
						DelBtnTmp = <EditBtn {...delBtnProps} />;
					}
					return (<span>
						{
							hasPrint ?
								<Button size="small" onClick={() => {
									onPrint(record);
				}}>{getLanguage('print')}</Button> : null
						}
						{
							hasPrint ?
								<Divider type="vertical" /> : null
						}
						{
							!noEdit ?
								EditBtnTmp : null
						}
						{
							!noEdit ?
								<Divider type="vertical" /> : null
						}
						<Popconfirm
							title={getLanguage('areYouSure')}
							onConfirm={() => this.handleDeleteItem(record.index)}
							okText={getLanguage('ok')}
							cancelText={getLanguage('cancel')}
						>
							{DelBtnTmp}
						</Popconfirm>

					</span>);
				},
			});
		}

		return (<Row className={cttClass ? cttClass : ''}>
			{
				isEditable && !disabled && hasAdd ?
					<Row style={{ margin: '10px 0 20px', textAlign: 'right' }} className="edit-table-btn-ctt">
	<Button onClick={this.handleNewItem} className="edit-table-add-btn" icon="plus">{getLanguage('add')}</Button>
						{hasDownload &&
							<Button onClick={this.handleDownTemplate}>{getLanguage('downloadTemplate')}</Button>}
					</Row> : null
			}
			<Table
				className={className}
				columns={newColumns || []}
				dataSource={tableData}
				pagination={false}
				scroll={{ x: scrollX || 0 }}
				size={size}
				bordered={bordered}
			/>
			{FormModal && <FormModal
				tableType={true}
				visible={showModal}
				formData={editData}
				data={this.formSetData}
				onSubmit={this.handleSave}
				onCancel={this.handleCancel}
				handleFieldChange={handleFieldChange}
			/> || null}
		</Row>);
	}
}



