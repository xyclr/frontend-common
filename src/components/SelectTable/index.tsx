import * as React from 'react';
import { Button, Select, Table } from 'antd';
import './index.scss';
import { getTempData } from '../_common/data';
import { getLanguage } from '../_common/language';
import _ from 'lodash';

/**
 * @desc 带列表的下拉控件
 * @author BaiYu
 * @params {columns: 表头字段, dataSource： 数据}
 *
 **/

interface SelectValue {
	name?: string;
	[propsName: string]: any;
}

interface TableProps {
	columns: ColumnsProps[]; // 下拉表头字段
	dataSource: DataSourceProps[]; // 数据源
	keyName: string; // 获取值字段
	value?: string | SelectValue; // 设置值
	onChange?: any; // 回调函数
	// pageChange?: any;// 分页回调
	api?: { params: any }; // 接口参数，包含（url:接口地址，params:发送的数据，一旦发送数据默认GET）;
	showSizeChanger: boolean;
	pageSizeOptions: string[];
	keyWords?: string[];
	[key: string]: any;
	valueName: string;
	formatMessage?: any; // 中英文国际化函数
}

interface ColumnsProps {
	title: string;
	dataIndex: string;
	key?: string | number;
}

interface DataSourceProps {
	name: string;
	[key: string]: any;
}

interface States {
	open: boolean;
	keyWord?: string;
	[key: string]: any;
	record: any;
	searchValue?: string;
}

interface SelectTableProps extends TableProps {
	style?: object;
	size?: 'default' | 'small';
	[key: string]: any;
}

class SelectTable extends React.Component<SelectTableProps, States> {
	// selectId: string;
	lock: any;
	select: any;
	constructor(props: SelectTableProps) {
		super(props);
		this.state = {
			open: false,
			dataSource: props.dataSource || [],
			page: 1,
			pageSize: 5,
			record: undefined,
		};
		// this.selectId = _.uniqueId('slectTable_')
	}

	componentDidMount() {
		const { api, keyName, value } = this.props;
		if (value) {
			if (typeof value === 'object') {
				return this.setState({
					dataSource: [value],
					total: 1,
					value: value[keyName],
					searchValue: value[keyName],
				});
			} else {
				return this.setState({
					value
				});
			}
		}
		if (api) {
			this.loadData();
		}
	}

	componentWillReceiveProps(nextProps: SelectTableProps, nextState: States): void {
		if (!this.props.api) {
			if (!_.isEqual(nextProps.dataSource, this.props.dataSource)) {
				this.setState({ dataSource: nextProps.dataSource });
			}
		}

		/**
		 * 动态查询
		 * 判断：当传参变化时，重新load数据
		 * url
		 */
		if (!_.isEqual(this.props.api, nextProps.api)) {
			this.setState({ value: '', searchValue: '' }, () => {
				this.loadData(nextProps.api);
			});
		}

		if (!nextProps.value) {
			this.setState({ value: undefined, searchValue: '' });
		} else {
			const { value, keyName } = nextProps;
			if (value && typeof value === 'object' && value[keyName]) {
				this.setState({
					value: value[keyName]
				});
			} else {
				if (!keyName && value && typeof value === 'string') {
					this.setState({
						value,
					});
				}
			}
		}
	}

	loadData(newApi?: any) {
		const api = newApi ? newApi : this.props.api;
		let nextApi;

		try {
			let keyWords = [];
			if (api.params.keyWords) {
				keyWords = api.params.keyWords;
			}

			nextApi = {
				...api,
				params: {
					...api.params,
					keyWords,
					pageSize: this.state.pageSize,
					pageNo: this.state.page,
					value: this.state.searchValue
				}
			};
		} catch (error) {
		}

		getTempData(nextApi).then((res: any) => {
			this.setState({
				dataSource: res.content || [],
				total: res.totalElements || 0,
			});
		});
	}

	pageChange = (page: string | number, pageSize: string | number) => {
		const { api } = this.props;
		let nextApi;
		try {
			let keyWords = [];
			if (api.params.keyWords) {
				keyWords = api.params.keyWords;
			}

			nextApi = {
				...api,
				params: {
					...api.params,
					pageSize,
					pageNo: page,
					keyWords,
					value: this.state.searchValue
				}
			};
		} catch (error) {
		}
		if (api) {
			getTempData(nextApi).then((res: any) => {
				this.setState({
					dataSource: res.content || [],
					total: res.totalElements || 0,
					page,
					pageSize,
				});
			});
		}
	}
	setValue(record: any) {
		const { keyName, onChange, valueName } = this.props;
		this.setState({
			value: record[keyName],
			open: false,
			record,
			// searchValue: record[keyName],
		});
		if (onChange) {
			onChange(valueName ? record[valueName] : record, record);
		}
	}
	onSearchValue = () => {
		const { api } = this.props;
		if (api) {
			this.setState({
				page: 1,
				searchValue: this.state.value,
			}, () => this.loadData());
			return;
		}
		// 本地搜索
		const { value } = this.state;
		const keyWord = new RegExp(value);
		const data = this.state.dataSource.filter((item: DataSourceProps) => {
			for (const key in item) {
				if (keyWord.test(item[key])) {
					return true;
				}
			}
			return false;
		});
		this.setState({
			dataSource: data,
			searchValue: value,
		});
	}

	showAllValue = () => {
		const { api } = this.props;
		if (api) {
			this.setState({
				searchValue: undefined,
			}, this.loadData);
			return;
		}
		this.setState({
			dataSource: this.props.dataSource,
		});
	}

	lockClose = (e: any) => {
		clearTimeout(this.lock);
		this.lock = setTimeout(() => {
			this.lock = null;
		}, 100);
	}

	onDropdownVisibleChange = (open: boolean) => {
		if (this.lock) {
			this.select.focus();
			return;
		}
		this.setState({
			open
		}, () => {
			/**
			 * 新增逻辑，如果收起后，输入框还有自行输入的值，如果与当前值不一样，就清空
			 * 离开时，this.props.value为空，则清空this.state.value，即什么都没有选
			 *      this.props.value有值，则this.state.value为其name
			 */
			if (!open) {
				if (this.props.value) {
					try {
						const { keyName = 'name', value, valueName } = this.props;
						const { record } = this.state;
						let curValue: any = '';
						if (valueName) {
							curValue = typeof value === 'string' || typeof value === 'undefined' ? value : this.state.value;
							if (value === record[valueName]) {
								curValue = record[keyName];
							}
						} else {
							// @ts-ignore
							curValue = value[keyName] ? value[keyName] : this.state.value;
						}
						this.setState({
							value: curValue,
							// value: (this.props.value as SelectValue)[keyName],
						});
					} catch (error) {

					}
				} else {
					this.setState({ value: '' });
				}
			}
		});
	}

	changeItem = (e: any) => {
		if (!e) {
			this.setState({
				value: undefined,
				searchValue: undefined,
			}, () => {
				this.loadData();
				const { onChange } = this.props;
				if (onChange) {
					onChange(undefined, undefined);
				}
			});
		}
	}

	render() {
		const { size = 'small', style = { width: '100%' },
			columns, showSearch = false, disabled = false,
			allowClear = true,
		} = this.props;
		const { value, open, dataSource, total, pageSize } = this.state;
		const { formatMessage } = this.props;
		return (
			<span className="selectTable">
				<Select
					allowClear={allowClear}
					onChange={this.changeItem}
					ref={(node) => (this.select = node)}
					showSearch={showSearch}
					onSearch={(e) => this.setState({ value: e || value, searchValue: e || value })}
					placeholder={getLanguage('pleaseSelect')}
					open={open}
					value={value}
					style={style}
					disabled={disabled}
					dropdownMatchSelectWidth={false}
					onDropdownVisibleChange={this.onDropdownVisibleChange}
					dropdownRender={(menu) => (
						<div className="selectropdown" onMouseDown={this.lockClose} onMouseUp={this.lockClose}>
							{showSearch &&
								<div className="topBtn">
									<Button type="primary" onClick={this.onSearchValue}>{getLanguage('search')}</Button>
									<Button type="primary" onClick={this.showAllValue}>{getLanguage('showAll')}</Button>
								</div>
							}
							<Table
								size={size}
								onRow={(record) => {
									return {
										onClick: () => this.setValue(record)
									};
								}}
								dataSource={dataSource} columns={columns}
								pagination={{ size, total, pageSize, onChange: this.pageChange }}
								{...this.props}
							/>
						</div>
					)}
				>
				</Select>
			</span>
		);
	}
}

export default SelectTable;
