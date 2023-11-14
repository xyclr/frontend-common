import React, { Component } from 'react';
import { Button, Icon, notification, Tag } from 'antd';
import UploaderFun from './uploader';
import api from '../api';
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
  uploader: any = null;
  fileObj: any = null;
  isClose: boolean = false;
  uploadIndex: number = 0;
  filesAll: any = [];
  constructor(props: any) {
    super(props);

    this.state = {
      fileObj: this.props.value || [],
      confirmLoading: false,
    };
  }

  componentWillReceiveProps(newProps: any) {
    if (!newProps.showModal) {
      // this.inputFile.value = "";
      this.uploader.clearFiles();
      this.setState({
        // fileObj: null,
        confirmLoading: false
      });
    }
    if (newProps.value !== this.props.value) {
      this.setState({
        fileObj: newProps.value || [],
      });
    }
  }

  componentDidMount() {
    // 普通上传
    const { uploadCb, singleUpload, multiple } = this.props;
    // @ts-ignore
    this.uploader = new UploaderFun(512 * 1024, 2, {
      complete: () => {
        console.log('完成');
        if (multiple) {//多文件上传
          this.continueUpload()
        }

      },
      success: (message: any, file: any) => {
        console.log(file);
        try {
          const fileObj = JSON.parse(file.replace(new RegExp('\'', 'gm'), '\"'));
          const fileSuccess = fileObj.success;
          if (!fileSuccess) {
            notification.error({ message: fileObj.message });
            return;
          }

          fileObj.fileName = this.fileObj.name;
          fileObj.size = this.fileObj.size;
          if (uploadCb) {
            uploadCb(fileObj);
          }
          // uploadCb && uploadCb(fileObj);

          this.setState({
            confirmLoading: false,
            fileObj: singleUpload ? [{
              id: fileObj.result,
              value: fileObj.fileName,
            }] : [...this.state.fileObj, {
              id: fileObj.result,
              value: fileObj.fileName,
            }],
          });
        } catch (e) {

        }
      },
      error: (message: any, file: any, status: any) => {
        const ss = !isNaN(+status) && +status || '';
        if (ss === 401) {
          window.location.href = '#/login';
          return false;
        }
        notification.error({
          message: '系统提示',
          description: '文件上传失败',
        });
        this.setState({
          confirmLoading: false
        });
      },
      progress: (progress: any) => {// 上传进度

        console.log(`progress:${progress}`);
      }
    });
  }

  uploadFile = () => {
    if (!this.uploader._uploader.files.length) {
      notification.warning({
        message: '系统提示',
        description: '请选择文件',
      });
      return;
    }
    setTimeout(() => {
      this.uploader.upload(this.props.uploadUrl || api.curUpload);
    }, 100);
    this.setState({
      confirmLoading: true,
    });
  }

  // focusInput = () => {
  // 	this.inputFile.click();
  // }

  addFile = (e: any) => {
    console.log(345, this.props.sigle, this.state.fileObj)
    if (this.props.sigle && this.state.fileObj.length > 1) {
      notification.error({
        message: '温馨提示',
        description: '单文件上传，请删除再上传',
      });
      return
    }
    const files = e.target.files;
    const length = files.length;
    this.uploader.clearFiles();
    this.fileObj = files[0];

    for (let i = 0; i < length; i++) {
      this.uploader.addFile(files[i]);
    }

    this.uploadFile();
    this.filesAll = files
    this.uploadIndex = 0
  }

  continueUpload() {
    if (this.filesAll.length == this.uploadIndex + 1)
      return
    this.uploadIndex++;
    this.uploader.clearFiles();
    this.fileObj = this.filesAll[this.uploadIndex];
    for (let i = this.uploadIndex; i < this.filesAll.length; i++) {
      this.uploader.addFile(this.filesAll[i]);
    }
    this.uploadFile();
  }


  handleDelete = (id: any) => {
    const { fileObj } = this.state;
    const { deleteCb } = this.props;
    const temp: any = [];
    if (fileObj && fileObj.length > 0) {
      fileObj.forEach((f: any) => {
        if (f.id !== id) {
          temp.push(f);
        }
      });
    }

    this.setState({
      fileObj: temp,
    }, () => {
      if (deleteCb) {
        deleteCb(id);
      }

      this.isClose = false;
    });
  }

  distinct(a: any, b: any = []) {
    let arr = a.concat(b)
    let result = []
    let obj: any = {}
    for (let i of arr) {
      if (!obj[i.value]) {
        result.push(i)
        obj[i.value] = 1
      }
    }
    return result
  }
  render() {
    const { uploadImg, disabled, btnName, noShow, multiple } = this.props;
    let { fileObj } = this.state;
    fileObj = this.distinct(fileObj);
    let mapObj: any = {};
    // console.log('fileObj', fileObj);
    return (<div>
      <div style={{ position: 'relative', textAlign: 'left', cursor: 'pointer' }} className="ctrl-cls">
        <Button disabled={disabled} icon='upload'>
          {btnName || '上传文件'}
        </Button>
        {
          uploadImg ?
            <input
              disabled={disabled}
              type="file"
              accept="image/*"
              className="ctrl-file-btn"
              multiple={multiple}
              onChange={this.addFile.bind(this)} /> :
            <input
              disabled={disabled}
              type="file"
              className="ctrl-file-btn"
              multiple={multiple}
              onChange={this.addFile.bind(this)} />
        }
        {
          !noShow && fileObj && fileObj.length > 0 ?
            fileObj.map((f: any, i: any) => {
              return (
                <div className="ant-upload-list-item ant-upload-list-item-done" style={{ marginLeft: 30 }} key={i}>
                  <div className="ant-upload-list-item-info">
                    <Tag
                      style={{
                        paddingRight: 20
                      }}
                      closable={!disabled}
                      key={f.value}
                      onClick={() => {
                        if (this.isClose) {
                          return;
                        }

                        window.open(`/gacb-ud/file/download/${f.id}`);
                      }}
                      onClose={() => {
                        this.isClose = true;
                        this.handleDelete(f.id);
                      }}>{f.value}</Tag>
                  </div>
                </div>);
            })
            : null

        }

      </div>
      {/* <Progress percent={50} status="active"/> */}
    </div>
    );
  }
}
