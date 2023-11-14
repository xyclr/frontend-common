import * as React from 'react';
import './index.scss';
/**
 * @desc 带列表的下拉控件
 * @author BaiYu
 * @params {columns: 表头字段, dataSource： 数据}
 *
 **/
interface SelectValue {
    name?: string;
    [propsName: string]: any;
}
interface TableProps {
    columns: ColumnsProps[];
    dataSource: DataSourceProps[];
    keyName: string;
    value?: string | SelectValue;
    onChange?: any;
    api?: {
        params: any;
    };
    showSizeChanger: boolean;
    pageSizeOptions: string[];
    keyWords?: string[];
    [key: string]: any;
    valueName: string;
    formatMessage?: any;
}
interface ColumnsProps {
    title: string;
    dataIndex: string;
    key?: string | number;
}
interface DataSourceProps {
    name: string;
    [key: string]: any;
}
interface States {
    open: boolean;
    keyWord?: string;
    [key: string]: any;
    record: any;
    searchValue?: string;
}
interface SelectTableProps extends TableProps {
    style?: object;
    size?: 'default' | 'small';
    [key: string]: any;
}
declare class SelectTable extends React.Component<SelectTableProps, States> {
    lock: any;
    select: any;
    constructor(props: SelectTableProps);
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: SelectTableProps, nextState: States): void;
    loadData(newApi?: any): void;
    pageChange: (page: string | number, pageSize: string | number) => void;
    setValue(record: any): void;
    onSearchValue: () => void;
    showAllValue: () => void;
    lockClose: (e: any) => void;
    onDropdownVisibleChange: (open: boolean) => void;
    changeItem: (e: any) => void;
    render(): JSX.Element;
}
export default SelectTable;
