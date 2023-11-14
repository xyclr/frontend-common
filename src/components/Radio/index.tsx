/**
 *  @desc 单选
 */
import React from 'react';
import { Radio } from 'antd';
import { getTempData } from "../_common/data";

interface receiveProps {
  codeName?: string;//字典的查询codeName
  api?: Object;//接口参数，包含（url:接口地址，params:发送的数据，一旦发送数据默认GET）
  data?: Array<any>;//显示的数据，格式 ：['选项一', '选项二'] 或 [{ name: '选项一', code: 1 }, { name: '选项二', code: 2 }];
  setVisi?: Array<string>;//设置新的显示 Label 和 value 对应的字段名
  type?: number;//显示类型：1文本（默认）、2按钮，
  [key: string]: any;
}

export default class CustomRadio extends React.Component<receiveProps, any> {
  constructor(props: receiveProps) {
    super(props);
    this.state = {
      data: []
    }
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps.api && JSON.stringify(nextProps.api) != JSON.stringify(this.props.api)) {
      this.getData(nextProps.api)
    }
  }

  componentDidMount() {
    this.getData(this.props.api)
  }

  getData(api: any) {
    if (api) {
      getTempData(api).then((data: any) => {
        this.setState({ data })
      })
    }
  }

  render() {
    let { data = [], setVisi = ['name', 'code'], codeName, api, type = 1 } = this.props
    if (codeName || api)
      data = this.state.data
    return (
      <Radio.Group {...this.props}>
        {
          data.map((i: any, index: number) => {
            if (type == 1) {
              return <Radio value={typeof (i) == 'object' ? i[setVisi[1]] : i} key={index}>{typeof (i) == 'object' ? i[setVisi[0]] : i}</Radio>
            } else {
              return <Radio.Button value={typeof (i) == 'object' ? i[setVisi[1]] : i} key={index}>{typeof (i) == 'object' ? i[setVisi[0]] : i}</Radio.Button>
            }
          })
        }
      </Radio.Group>
    );
  }
}
