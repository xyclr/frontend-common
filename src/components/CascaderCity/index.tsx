import { Cascader  }  from 'antd';
import React from 'react';
import { getTempData } from "../_common/data";
import _ from 'lodash'
import { getLanguage } from '../_common/language';
interface Props {
    api: any;
	size?: 'large' | 'default' | 'small';
    placeholder?: string;
    [key: string]: any;
}

interface LabelProps {
    value: string;
    label?: string;
    code: string;
    children: LabelProps[];
}

interface StateProps {
    options: LabelProps[];
    initValue: string[];
}

class CascaderCity extends React.PureComponent<Props,StateProps> {

    constructor(props: Props) {
        super(props);
        this.state = {
            options: [],
            initValue: [],// 编辑时的值
        }
    }
    componentDidMount() {
        this.loadValue();
    }

    setOptions(params: string[], res: any) {
        // 暂时不用了
        let ins = params.length;
        if (ins === 0) {
            return
        }
        const options = _.cloneDeep(this.state.options);
        options[ins -1].children = res.data;
        this.setState({ options })
    }

    itemChildren(children: Array<LabelProps>) {
        let code: string = '';
        const { value } = this.props
        const arrayValue = value.split('/')
        children.forEach((item: LabelProps)=> {
            arrayValue.every((list: string)=> {
                if (list === item.value) {
                    code = item.code
                    return false
                }
                return true
            })
        })
        return code
    }

    loadValue = ()=> {
        const { api, value } = this.props
        // api.params = value
        getTempData(api).then((res: any) => {
            // this.setOptions(value, res)
            let initValue: string[]= []
            if (value) {
                const arrayValue = value.split('/')
                res.forEach((item: LabelProps) => {
                    arrayValue.every((list: string)=> {
                        if (list === item.value) {
                            initValue.push(item.code)
                            if (item.children.length) {
                                let code: string = this.itemChildren(item.children)
                                initValue.push(code)
                            }
                            return false
                        }
                        return true
                    })
                })
            }

            this.setState({options: res, initValue})
        })
        // if (this.props.onChange) {
        //     this.props.onChange(value)
        // }
    }

    onChange = (value: any[], selectedOptions?: any[]) => {
        const { onChange } = this.props
        if (onChange) {
          if (this.props.sign) {
              const item = {options: selectedOptions}
              value.push(item)
            }
            onChange(value, selectedOptions)
            this.setState({initValue: value})
        }
    }

    render() {
        const initFieldName ={ label: 'value', value: 'code', children: 'children' }
        const { fieldNames } = this.props
       return (
            <Cascader
                fieldNames={fieldNames || initFieldName}
                options={this.state.options}
                changeOnSelect
                {...this.props}
                popupClassName="ant-select-dropdown"
                value={this.state.initValue}
                onChange={this.onChange}
                placeholder={getLanguage('pleaseSelect')}
            />
       )
    }
}

export default CascaderCity
