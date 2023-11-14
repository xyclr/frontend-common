import React from 'react';
interface TableProps {
    isEditable?: boolean | 0 | 1;
    hasAdd?: boolean | 0 | 1;
    hasPrint?: boolean | 0 | 1;
    newItemData?: any[];
    columns?: any[];
    value?: any[];
    onChange?: (value: any, obj?: any) => void;
    onCheck?: (value: any, obj?: any) => void;
    onPrint?: (value: any, obj?: any) => void;
    valueCbk?: (value: any, obj?: any) => void;
    saveCbk?: (value: any, obj?: any) => void;
    className?: string;
    addValid?: (value?: any) => boolean;
    addMessage?: (value?: any) => boolean;
    tplUrl?: string;
    scrollX?: any;
    hasDownload?: boolean | 0 | 1;
    noEdit?: boolean | 0 | 1;
    FormModal?: any;
    columnUrl?: string;
    hasIndex?: boolean | 0 | 1;
    modelArray?: string;
    [key: string]: any;
    relateName?: string;
    beRelateName?: string;
    beRelateKey?: string;
    size?: any;
    cttClass?: string;
    handleFieldChange?: (params?: any, values?: any) => void;
    disabled?: boolean;
    EditBtn?: any;
    editBtnProps?: string;
    delBtnProps?: string;
}
interface TableState {
    editData: any[];
    showModal: boolean;
    columns: any[];
}
export default class EditableTable extends React.Component<TableProps, TableState> {
    saveData: any[];
    dataKeys: any[];
    uploadKeys: any[];
    editType: string;
    editIndex: number;
    formItems: any[];
    formSetData: any;
    constructor(props: any);
    componentWillMount(): void;
    shouldComponentUpdate(nextProps: Readonly<TableProps>, nextState: Readonly<TableState>, nextContext: any): boolean;
    componentDidUpdate(prevProps: Readonly<TableProps>, prevState: Readonly<TableState>, snapshot?: any): void;
    queryData: () => Promise<boolean>;
    getTableData: (value: any) => any;
    getKeys: (newItemData: any) => {
        dataKeys: any[];
        uploadKeys: any[];
    };
    getEditData: (index: number) => any[];
    handleNewItem: () => boolean;
    handleDownTemplate: () => void;
    handleEditItem: (index: number) => void;
    handleDeleteItem: (index: number) => void;
    triggerChange: () => void;
    handleSave: (data: any) => any;
    handleCancel: () => void;
    render(): JSX.Element;
}
export {};
