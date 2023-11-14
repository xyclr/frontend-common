## 使用说明

-   **使用的ant.design封装，所以保持原有的API**
-   **打开源文件receiveProps内也有传参的说明**

## 参数说明

-   **codeName** 类型：string; 字典的查询codeName
-   **api** 类型: Object; 接口参数，包含（url:接口地址，params:发送的数据，type:接口类型，默认GET，可以不传，其他值自动为POST；）
-   **data** 类型: Array; 显示的数据，格式 ：['选项一', '选项二'] 或 [{ name: '选项一', code: 1 }, { name: '选项二', code: 2 }] 或 [{ lbl: '选项一', id: 1 }];
-   **setVisi** 类型: Array; 设置新的显示 Label 和 value 对应的字段名，默认值：['name',code]，如上面的data为第三种类型，则setVisi=['lbl','id']
