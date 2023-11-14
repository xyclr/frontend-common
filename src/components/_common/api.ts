const BASE_URL: string = '';
const api = {
  queryListByAttrCodes: `${BASE_URL}/common/queryListByAttrCodes`, //字典查询
  curUpload: `${BASE_URL}/gacb-ud/file/upload`, // 文件上传
  curDownload: `${BASE_URL}/gacb-ud/file/download`, // 文件下载
};
export default api;
