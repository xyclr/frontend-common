import React from "react";
import { Form, Input, Button,  } from 'antd';
// const { Option } = Select;

import Select from "@components/Select";

class RegistrationForm extends React.Component<any, any> {

  handleSubmit = (e: any) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  };


  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };

    const required = {
      required: true,
      message: '必填',
    }
    return (
      <Form {...formItemLayout} onSubmit={this.handleSubmit} style={{ width: 500, margin: '50px auto' }}>
        <Form.Item label="邮箱">
          {getFieldDecorator('email', {
            rules: [
              required,
              {
                type: 'email',
                message: '请输入正确的邮箱',
              }
            ],
          })(<Input placeholder='请输入内容' />)}
        </Form.Item>
        <Form.Item label="字典">
          {getFieldDecorator('diction', { rules: [required], })(
            <Select placeholder='请选择' />
          )}
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create()(RegistrationForm);
