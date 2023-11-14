/**
 *  @desc 标签表单组件
 */
import { Icon, Input, Tag, Tooltip } from 'antd';
import React from 'react';

interface receiveProps {
  data?: Array<any>;//显示的数据，格式 ：['选项一', '选项二'] 或 [{ name: '选项一', code: 1 }, { name: '选项二', code: 2 }];
  [key: string]: any;
}

export default class Tags extends React.Component<receiveProps, any> {
  constructor(props: receiveProps) {
    super(props);
    let value: any = this.props.value;
    if (this.props.mode) {
      value = this.props.value ? this.props.value : [];
    }
    this.state = {
      data: [],
      value,
      inputVisible: false,
      inputValue: '',
    }
  }

  input: any;

  componentWillReceiveProps(nextProps: any) {

    if (nextProps.value && JSON.stringify(nextProps.value) != JSON.stringify(this.state.value)) {
      this.setState({ value: nextProps.value });
    }
    const nextValue = nextProps.value;
    if (!nextValue && (nextValue !== this.state.value)) {
      this.setState({ value: nextValue });
    }
  }

  triggerChange = (changedValue: any) => {
    const { onChange, value } = this.props;
    if (onChange) {
      onChange(changedValue);
    }
    this.setState({ value: changedValue });
  };

  handleClose = (removedTag: any) => {
    const value = this.state.value.filter((tag: any) => tag !== removedTag);
    this.triggerChange(value);
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = (e: any) => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { value = [] } = this.state;
    if (inputValue && value.indexOf(inputValue) === -1) {
      value = [...value, inputValue];
    }
    this.triggerChange(value);
    this.setState({
      inputVisible: false,
      inputValue: '',
    });
  };

  saveInputRef = (input: any) => (this.input = input);


  render() {
    let { value = [], inputVisible, inputValue } = this.state;
    const { maxLength = 20 } = this.props;
    return (
      <div>
        {value.map((tag: any, index: any) => {
          const isLongTag = tag.length > maxLength;
          const tagElem = (
            <Tag key={tag} closable={true} onClose={() => this.handleClose(tag)}>
              {isLongTag ? `${tag.slice(0, maxLength)}...` : tag}
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
              tagElem
            );
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
            <Icon type="plus" /> {this.props.plusName ? this.props.plusName : '标签'}
          </Tag>
        )}
      </div>
    );
  }
}
