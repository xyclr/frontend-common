/**
 *  @desc 文件上传
 */
import React from 'react';
import { Upload, Button } from 'antd';
import { getLanguage } from '../_common/language';
interface receiveProps {
  [key: string]: any;
}

export default class Demo extends React.Component<receiveProps, any> {
  constructor(props: receiveProps) {
    super(props);
  }

  render() {
    const { children, ...otherProps } = this.props
    return (
      <Upload {...otherProps} >
        {
          children ? children :
            <Button icon='upload'>{getLanguage('uploadFile')}</Button>
        }
      </Upload>
    );
  }
}
