import { Component } from 'react';
interface BizUploaderProps {
    value?: any;
    fileList?: any;
    onChange?: (value: any) => void;
    disabled?: boolean;
    uploadImg?: boolean;
    multiple?: boolean;
    sigle?: boolean;
}
export default class BizUploader extends Component<BizUploaderProps, any> {
    state: any;
    constructor(props: any);
    componentWillReceiveProps(nextProps: any): void;
    onChange: (v: any) => void;
    triggerChange: (changedValue: any) => void;
    handleCloseModal: () => void;
    handleShowModal: () => void;
    filterFiles: () => void;
    handleUpload: (file: any) => void;
    handleDelete: (id: any) => void;
    render(): JSX.Element;
}
export {};
