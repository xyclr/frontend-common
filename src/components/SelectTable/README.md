## 下拉数据中显示表格

## 使用和说明

### @props { api: 可选,keyName: 获取值字段, columns: 下拉表头字段 , dataSource: 数据源， onChange: 可选，回调函数，返回其中一行}

### 数据例子（Select, Table）
#### [更多参考：](https://ant-design.gitee.io/components/select-cn/#header)
### [table](https://ant-design.gitee.io/components/table-cn/#header)
(```)
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    render: text => <a>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: 70,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
]
(```)

### demo
```

import SelectTable from './index.tex'
const params = {
  url:'http:baidu.com'
  params: {'body'}
}

<SelectTable
  showSearch={false}//是否可搜索
  keyWords=['code','name']// 搜索字段
  keyName={'name'} // 获取值字段
  disabled={false}
  columns={columns},api={params} onChange={(value)=> console.log(value)}
/>

```