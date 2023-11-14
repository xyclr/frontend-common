/**
 *  @desc 时间区间选择器
 */
import React from 'react';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;

import moment from 'moment';
const defaultFmt = 'YYYY-MM-DD'

interface receiveProps {
  [key: string]: any;
}

export default class Demo extends React.Component<receiveProps, any> {
  constructor(props: receiveProps) {
    super(props);
    this.state = {
      value: this.props.value || []
    }
  }

  triggerChange(value: any) {
    const { onChange, format = defaultFmt } = this.props;
    value[0] = moment(value[0]).format(format)
    value[1] = moment(value[1]).format(format)
    this.setState({
      value
    })
    if (onChange)
      onChange(value);
  };

  render() {
    const { format = defaultFmt } = this.props
    const { value } = this.state
    return (
      <RangePicker {...this.props} value={value[0] ? [moment(value[0]), moment(value[1])] : null} format={format} onChange={this.triggerChange.bind(this)} />
    );
  }
}
