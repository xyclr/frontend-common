## 城市级联选择组件

广汽商贸前端

## 使用和说明

### @props { api: *必传, size: 可选 , onChange: 回调函数}

### 数据例子
#### [更多参考：](https://ant-design.gitee.io/components/cascader-cn/#header)
(```)
const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
        ],
      },
    ],
  }
  ]
(```)
### demo
```

import CascaderCity from './index.tex'
const params = {
  url:'http:baidu.com'
  params: {'body'}
}

<CascaderCity
  fieldNames={} // 自定义渲染字段
  api={params}
  sign={1}// 返回数组里有包含所选过的对象
  onChange={(value, selectOpction)=> console.log(value, selectOpction)}
/>


```