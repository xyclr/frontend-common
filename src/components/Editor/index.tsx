/**
 *  @desc 富文本
 */
import React from 'react';
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/index.css'
import { getLanguage } from '../_common/language';

interface receiveProps {
  value?: string;//Html字符串
  onChange?: Function;//返回Html字符串 onChange(html)
  [key: string]: any;
}

export default class Demo extends React.Component<receiveProps, any> {
  constructor(props: receiveProps) {
    super(props);
    this.state = {
      value: this.props.value || ''
    }
  }

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    if (typeof prevState.value == 'string') {
      return {
        value: BraftEditor.createEditorState(nextProps.value)
      }
    }
    return {
      value: nextProps.value
    }
  }

  handleEditorChange = (value: any) => {
    this.setState({ value })
    const { onChange } = this.props
    if (onChange) {
      onChange(value.toHTML())
    }
  }

  render() {
    const { value } = this.state

    return (
      <BraftEditor placeholder={getLanguage('pleaseEnter')}  {...this.props} value={value} onChange={this.handleEditorChange} style={{ border: '1px solid #d9d9d9', borderRadius: '4px', ...this.props.style }} />
    );
  }
}
