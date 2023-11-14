/**
 *  @desc 下拉框
 */
import React from 'react';
import { Select } from 'antd';
const { Option } = Select;
import { getTempData } from "../_common/data";
import { getLanguage } from '../_common/language';

interface receiveProps {
  codeName?: string;//字典的查询codeName
  api?: Object;//接口参数，包含（url:接口地址，params:发送的数据，一旦发送数据默认GET）
  data?: Array<any>;//显示的数据，格式 ：['选项一', '选项二'] 或 [{ name: '选项一', code: 1 }, { name: '选项二', code: 2 }];
  setVisi?: Array<string>;//设置新的显示 Label 和 value 对应的字段名
  [key: string]: any;
}

export default class Demo extends React.Component<receiveProps, any> {
  constructor(props: receiveProps) {
    super(props);
    let value: any = this.props.value;
    if (this.props.mode) {
      value = this.props.value ? this.props.value : [];
    }
    this.state = {
      data: [],
      value,
    }
  }


  componentWillReceiveProps(nextProps: any) {
    if (nextProps.api && JSON.stringify(nextProps.api) != JSON.stringify(this.props.api)) {
      this.getData(nextProps.api)
    }

    if (nextProps.value && JSON.stringify(nextProps.value) != JSON.stringify(this.state.value)) {
      if (this.props.sign == 1) {
        let { setVisi = ['name', 'code'] } = this.props
        this.setState({ value: nextProps.value[setVisi[1]] })
      } else {
        this.setState({ value: nextProps.value })
      }
    }
    /**
     * 表单重置为空时，重置只能Select组件state
     * @BUG #XRMDM-280 2019年10月10日15:41:03 周旺生
     */
    const nextValue = nextProps.value;
    if (!nextValue && (nextValue !== this.state.value)) {
      this.setState({ value: nextValue });
    }
  }

  componentDidMount() {
    this.getData(this.props.api)
  }

  getData(api: any) {
    if (api) {
      getTempData(api).then((data: any) => {
        const { extCode } = this.props;
        let tempData = data;
        if (extCode) {
          tempData = data.filter((item: any) => {
            return item.code !== extCode;
          });
        }
        this.setState({ data: tempData })
      })
    }
  }

  onChange(value: any) {
    const { onChange } = this.props
    let { setVisi = ['name', 'code'], data = [], codeName, api } = this.props
    if (codeName || api)
      data = this.state.data

    if (onChange) {
        const item = data.find(i => i[setVisi[1]] == value)
      if (this.props.sign == 1) {
        onChange(item, data, item)
      } else {
        onChange(value, data, item)
      }
    }
    this.setState({ value })
  }



  render() {
    let { data = [], setVisi = ['name', 'code'], codeName, api, objCode = 'code', mode } = this.props;
    let { value } = this.state;
    if (objCode && value && typeof value === 'object' && value[objCode]) {
      value = value[objCode];
    }
    if (mode === 'multiple' && !value) {
      value = [];
    }
    if (codeName || api)
      data = this.state.data
    return (
      <Select placeholder={getLanguage('pleaseSelect')} {...this.props} onChange={this.onChange.bind(this)} value={value}>
        {
          data.map((i: any, index: number) =>
            <Option
                title={typeof (i) == 'object' ? i[setVisi[0]] : i}
                value={typeof (i) == 'object' ? i[setVisi[1]] : i}
                key={index}>{typeof (i) == 'object' ? i[setVisi[0]] : i}</Option>
          )
        }
      </Select>
    );
  }
}
