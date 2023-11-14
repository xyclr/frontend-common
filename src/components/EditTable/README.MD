##使用说明
	isEditable?: boolean; // 是否可编辑
	hasAdd?: boolean; // 是否可新增
	hasPrint?: boolean; // 是否有打印按钮
	newItemData?: any[]; // 新增行数据
	columns: any[]; // 表头配置参数
	value?: any[]; // 列表数据
	onChange?: (value: any, obj?: any) => void; // change回调 value 是当前列表数组
	onCheck?: (value: any, obj?: any) => void; // 弹窗确认校验回调  value是当前需要验证的行， obj是当前列表数组
	onPrint?: (value: any, obj?: any) => void; // 打印按钮点击回调 value当前行数据
	valueCbk?: (value: any, obj?: any) => void; // 处理点击确认按钮之后的值 value是当前列表数组
	saveCbk?: (value: any, obj?: any) => void; // 处理所有数据 value是当前列表数组
	className?: string; // css扩展
	addValid?: (value?: any) => boolean; // 添加数据后的验证，验证不通过不添加
	addMessage?: (value?: any) => boolean; // 添加不通过的提示信息
	tplUrl?: string; // 当有文件类型的数据时，下载链接的url
	scrollX?: any; // 滚动条
	hasDownload?: boolean; // 是否有下载
	noEdit?: boolean; // 是否没有编辑按钮
	FormModal?: any; // 新增编辑时弹窗 formSetData是用来传给form表单初始化数据的
	columnUrl?: string; // api获取渲染的tableheader
	hasIndex?: boolean; // 是否有序号