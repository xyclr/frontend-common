import { Component } from 'react';
import './indes.scss';
interface UpProps {
    uploadImg?: boolean;
    disabled?: boolean;
    btnName?: boolean;
    noShow?: boolean;
    onChange?: (obj: any) => void;
    value?: any;
    deleteCb?: (obj: any) => void;
    uploadCb?: (obj: any) => void;
    singleUpload?: (obj: any) => void;
    uploadUrl?: string;
    multiple?: boolean;
    sigle?: boolean;
}
export default class Uploader extends Component<UpProps, any> {
    uploader: any;
    fileObj: any;
    isClose: boolean;
    uploadIndex: number;
    filesAll: any;
    constructor(props: any);
    componentWillReceiveProps(newProps: any): void;
    componentDidMount(): void;
    uploadFile: () => void;
    addFile: (e: any) => void;
    continueUpload(): void;
    handleDelete: (id: any) => void;
    distinct(a: any, b?: any): any[];
    render(): JSX.Element;
}
export {};
