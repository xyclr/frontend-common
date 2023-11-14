import React from "react";
import { Form, Button } from 'antd';

import Select from "@components/Select";
import Radio from "@components/Radio";
import EditableTable from '@components/EditTable';
import Checkbox from "@components/Checkbox";
import RangePicker from "@components/RangePicker";
import Editor from "@components/Editor";
import Upload from "@components/Upload";
import UploadContinue from "@components/UploadContinue";
import FormModal from '@components/EditTable/testForm';
import { getLanguage } from './components/_common/language';

class RegistrationForm extends React.Component<any, any> {

  state: any = {
    val: 'WAIT_NEW_CAR',
    api: null,
    editValue: 'null',
  }

  handleSubmit = (e: any) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err: any, values: any) => {
      console.log(values)
    });
  };

  change(val: any) {
    this.setState({
      val
    })
  }

  changeTable = (value: any) => {
    console.log(value);
  }

  testHandle(name: any) {
    this.setState({
      api: { url: '/common/queryListByAttrCode?attrCode=' + name }
    })
  }

  testChange(value: any, data: any) {
    console.log(value, data);
  }


  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
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
          offset: 4,
        },
      },
    };

    const required = {
      required: true,
      message: '必填',
    }

    const radioData = ['选项一', '选项二', '选项三'];
    const radioData2 = [{ name: '选项', code: 0 }, { name: '选项一', code: 1 }, { name: '选项二', code: 2 }, { name: '选项三', code: 3 }];
    const radioData3 = [{ title: '选项一', value: 1 }, { title: '选项二', value: 2 }, { title: '选项三', value: 3 }];
    const radioData4 = [{ name: '是', code: true }, { name: '否', code: false }];
    return (
      <Form {...formItemLayout} onSubmit={this.handleSubmit} style={{ width: 1000, margin: '50px auto' }}>
        <Form.Item label={getLanguage('showAll')}>
          {getFieldDecorator('diction', { rules: [required] ,initialValue:[2]})(
            <Select data={radioData2} onChange={this.testChange.bind(this)} sign={1} />
          )}
        </Form.Item>
        <Select data={radioData2} mode="multiple" optionFilterProp="children"  />
        <Select mode="multiple" optionFilterProp="children" api={this.state.api} />
        <Form.Item label="下拉框（取接口数据）">
          {getFieldDecorator('diction2', { rules: [required] })(
            <Select mode="multiple" optionFilterProp="children" api={this.state.api} />
          )}
        </Form.Item>
        <Form.Item label="测试">
          <Button onClick={this.testHandle.bind(this, 'DISCOUNT_WAY')}>测试按钮</Button>
          <Button onClick={this.testHandle.bind(this, 'STAGES_CHANNEL')}>测试按钮2</Button>
          <Button onClick={() => {
            this.props.form.setFieldsValue({ editor: '<s>2222222222</s>' })
            this.setState({ editValue: '<b>OK</b>' })
          }}>测试按钮3</Button>
          <Button onClick={() => {
            this.props.form.setFieldsValue({ diction: 3 })
          }}>测试按钮4</Button>
        </Form.Item>
        <Form.Item label="单选（取字典数据）">
          {getFieldDecorator('radio', { rules: [required] })(
            <Radio codeName='BIZ_SOURCE' />
          )}
        </Form.Item>
        <Form.Item label="单选（取接口）">
          {getFieldDecorator('radio2', { rules: [required] })(
            <Radio api={this.state.api} />
          )}
        </Form.Item>
        <Form.Item label="单选（直接给数据）">
          {getFieldDecorator('radio3', { rules: [required] })(
            <Radio data={radioData4} />
          )}
        </Form.Item>
        <Form.Item label="单选（按钮样式）">
          {getFieldDecorator('radio4', { rules: [required], initialValue: 2 })(
            <Radio data={radioData2} type={2} />
          )}
        </Form.Item>
        <Form.Item label="单选（自定义label和value显示方式）">
          {getFieldDecorator('radio5', { rules: [required], initialValue: 2 })(
            <Radio data={radioData3} setVisi={['title', 'value']} type={2} buttonStyle="solid" />
          )}
        </Form.Item>
        <Form.Item label="多选（直接给数据）">
          {getFieldDecorator('checkbox', { rules: [required], initialValue: ['选项三'] })(
            <Checkbox data={radioData} />
          )}
        </Form.Item>
        <Form.Item label="多选（取字典）">
          {getFieldDecorator('checkbox2', { rules: [required], initialValue: ['METAL_PLT_LACQUER', 'WAIT_NEW_CAR'] })(
            <Checkbox codeName='BIZ_SOURCE' />
          )}
        </Form.Item>
        <Form.Item label="多选（取字典加label和value自定义）">
          {getFieldDecorator('checkbox3', { rules: [required], initialValue: ['METAL_PLT_LACQUER', 'WAIT_NEW_CAR'] })(
            <Checkbox codeName='BIZ_SOURCE' setVisi={['id', 'code']} />
          )}
        </Form.Item>
        <Form.Item label="时间段">
          {getFieldDecorator('datePicker', { rules: [required] })(
            <RangePicker />
          )}
        </Form.Item>
        <Form.Item label="时间段2">
          {getFieldDecorator('datePicker2', { rules: [required], initialValue: ['2015-02-06', '2015-03-03'] })(
            <RangePicker format='YYYY/MM/DD' />
          )}
        </Form.Item>
        <Form.Item label="普通上传">
          {getFieldDecorator('upload', { rules: [required] })(
            <Upload accept='/gacb-ud/file/upload' name='file' />
          )}
        </Form.Item>
        <Form.Item label="断点续传">
          {getFieldDecorator('uploadContinue', { rules: [required] })(
            <UploadContinue />
          )}
        </Form.Item>
        <Form.Item label="富文本">
          {getFieldDecorator('editor', { rules: [required], initialValue: '<h1>默认数据测试</h1>' })(
            <Editor />
          )}
        </Form.Item>
        {/* <Form.Item label="富文本2">
          <Editor value={this.state.editValue} onChange={(val: any) => {
            this.setState({editValue:val})
          }} />
        </Form.Item> */}

        <Form.Item>
          {getFieldDecorator('tableTemp', {
            initialValue: [{
              test01: '1',
              test02: 'Mon Aug 26 2019 14:51:07 GMT+0800',
              test04: [{ fileId: '123', fileName: '123' }],
              test05: [{ fileId: '123', fileName: '123' }],
              test03: 'Mon Aug 26 2019 14:51:07 GMT+0800'
            }]
          })(
            <EditableTable isEditable={true}
              FormModal={FormModal}
              hasAdd={true}
              columns={[{
                title: '参数名称',
                key: 'paramsName',
                dataIndex: 'paramsName'
              }, {
                title: '参数值',
                key: 'paramsValue',
                dataIndex: 'paramsValue'
              }]}
              newItemData={[
                {
                  key: 'paramsName',
                  label: '参数名称',
                  props: {
                    required: true,
                    visibleCreate: true,
                  },
                },
                {
                  key: 'paramsValue',
                  label: '参数值',
                  props: {
                    required: true,
                    visibleCreate: true,
                  },
                },
              ]}
              onChange={this.changeTable} />
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
