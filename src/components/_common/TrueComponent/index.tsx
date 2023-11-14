import * as React from 'react';
import _ from 'lodash';
interface TrueProps {
  comp: any;
  finalProps?: any;
  [key: string]: any;
}
export default class TrueComponent extends React.Component<TrueProps, any> {
  // 去除function之外控制是否更新
  shouldComponentUpdate(nextProps: Readonly<TrueProps>, nextState: Readonly<any>, nextContext: any): boolean {
    const {props} = this;
    const newProps = _.filter(props, (item: any) => {
      return typeof(item) !== 'function';
    });
    const newNextProps = _.filter(nextProps, (item: any) => {
      return typeof(item) !== 'function';
    });
    return !_.isEqual(newNextProps, newProps) || props.value !== nextProps.value;
  }

  triggerChange = (value: any, obj: any) => {
    const {onChange} = this.props;
    onChange && onChange(value, obj);
  }

  render() {
    const {comp, ... finalProps} = this.props;
    const Comp = comp;
    return <Comp {... finalProps} onChange={this.triggerChange}/>;
  }
}
