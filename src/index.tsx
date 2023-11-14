import PriceInput from '@components/PriceInput'; // 币种金额控件
import SelectTable from '@components/SelectTable';
import CascaderCity from '@components/CascaderCity';

import Select from '@components/Select';
import Radio from '@components/Radio';
import Checkbox from '@components/Checkbox';
import RangePicker from '@components/RangePicker';
import Editor from '@components/Editor';
import Upload from '@components/Upload';
import UploadContinue from '@components/UploadContinue';
import EditableTable from '@components/EditTable';

export {
	PriceInput, // 币种金额控件
	Select, // 下拉控件
	Radio, // 单选组控件
	Checkbox, // 多选组控件
	RangePicker, // 时间控件
	SelectTable, // 下拉列表控件
	Editor, // 富文本
	CascaderCity, // 地区选择
	Upload, // 上传
	UploadContinue, // 断点续传
	EditableTable // 编辑页面的表格
};

// // 以下用于测试显示问题，发布时请注释
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import 'antd/dist/antd.css';
// import Form from "./form";
// import { getLanguage } from './components/_common/language';

// console.log(getLanguage('search'),'search')
// ReactDOM.render(//
//   <Form />,
//   document.getElementById('root')
// );
