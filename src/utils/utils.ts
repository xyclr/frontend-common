import _ from 'lodash';
import moment from 'moment';
/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

const isUrl = (path: string): boolean => reg.test(path);

export interface FormObject {
  formArr: any[];
  formArrObj: any;
}
// 统一的meta数据转换器
const transformBaseData = (meta: any): FormObject => {
  const sortData = sort(meta);
  const dataArr: any = groupData(sortData);
  const finalData: any = {};
  finalData.formArr = [];
  finalData.formArrObj = {};
  // 无分组处理
  if (!dataArr) {
    finalData.formArr = sortData || [];
    finalData.formArrObj = dataTransformToMap(finalData.formArr);
    return finalData;
  }
  // 到底会不会有分组 存疑。。。
  dataArr.map((group: any, i: number) => {
    finalData.formArr.push(group);
    finalData.formArr = finalData.formArr.concat(group.children);
    // group.props = {};
    group.isTitle = true;
    delete group.children;
  });
  finalData.formArrObj = dataTransformToMap(finalData.formArr);
  return finalData;
};

// 初始化数据，记录角标
const dataTransformToMap = (data: any = []) => {
  const dataMap: any = {};
  // key 测试
  data.forEach((item: any, i: number) => {
    if (item.key) {
      dataMap[item.key] = i;
    }
  });

  return dataMap;
};
/**
 * item排序
 */
const sort = (data: any[] = []) => {
  // sequence排序
  const compare = (obj1: any, obj2: any) => {
    const value1 = Number(obj1.props.sequence) || 0;
    const value2 = Number(obj2.props.sequence) || 0;
    let g = 0;
    if (obj1.props.group && obj2.props.group) {
      const group1 = Number(obj1.props.group.sequence) || 0;
      const group2 = Number(obj2.props.group.sequence) || 0;
      g = group1 - group2;
    }
    if (g === 0) {
      return value1 - value2;
    }
    return g;
  };
  return data.sort(compare);
};
/**
 * 分组
 */
const groupData = (arr: any[]) => {
  const groupMap: any = {};
  let groupArr: any = [];
  arr.forEach((element, i: number) => {
    // 处理分组
    if (element && element.props && element.props.group && element.props.group.code) {
      const groupObj = element.props.group;
      if (groupMap[groupObj.code]) {
        groupMap[groupObj.code].children.push(element);
      } else {
        groupMap[groupObj.code] = {
          code: groupObj.code,
          label: groupObj.label,
          children: [element],
          sequence: groupObj.sequence || element.props.groupOrder,
        };
        groupArr.push(groupMap[groupObj.code]);
      }
    } else {
      // 未分组
    }
  });
  if (groupArr.length == 0) {
    return false;
  }

  // 排序
  groupArr = _.sortBy(groupArr, o => o.sequence);

  return groupArr;
};
/**
 * 读取搜索缓存数据
 */
const getSearchData = () => {
  const cache: any = sessionStorage.getItem('searchCache');
  const cacheObj: any = cache ? JSON.parse(cache) : {};
  return { ...cacheObj };
};
/**
 * 保存数据
 */
const setSearchData = (cacheObj: any) => {
  sessionStorage.setItem('searchCache', JSON.stringify({ ...cacheObj }));
};
/**
 *
 */
const getSearchCache = (key: string, metas: any[]) => {
  const obj: any = getSearchData();
  const formValues = obj[key];
  // 判断searchComponentType
  for (const k in formValues) {
    const item = _.find(metas, { key: k });
    if (item) {
      const { searchValueComponentType } = item.props;
      if (searchValueComponentType === 'DAR_DATE_RANGE') {
        const v: any[] = formValues[k];
        if (v && v.length > 0) {
          formValues[k] = [moment(v[0]), moment(v[1])];
        }
      }
      if (searchValueComponentType === 'DAT_DATE') {
        const v = formValues[k];
        if (v) {
          formValues[k] = moment(v[0]);
        }
      }
    }
  }
  return formValues;
};
/**
 * 缓存
 * @param values
 * @param key
 */
const setSearchCache = (values: any, key: string) => {
  const cacheObj: any = getSearchData();
  cacheObj[key] = { ...values };
  setSearchData(cacheObj);
};

const storageInstance = sessionStorage;
const storage = {
  setItem: (key: string, value: object) => {
    storageInstance.setItem(key, JSON.stringify(value));
  },
  updateItem: (key: string, value: object) => {
    let item: any = JSON.parse(storageInstance.getItem(key) || '{}');
    if (item) {
      item = Object.assign(item, value);
      storage.setItem(key, item);
    }
  },
  getItem: (key: string) => JSON.parse(storageInstance.getItem(key) || '{}'),
  instance: storageInstance,
};

/**
 * 转换Boolean
 * @param value
 * @returns {any}
 */
const transferBooleanValue = (value: any) => {
  if (value === 'true' || value === true) {
    return true;
  }
  if (value === 'false' || value === false) {
    return false;
  }
  return value;
};
// 获取链接的参数
const getUrlParam = (name: string) => {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  const str = window.location.href;
  const r = str.substr(str.indexOf('?') + 1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
};
// 转化千分位
const setThousandth = (val: any, type?: string) => {
  if (type) {
    switch (type) {
      case 'noFixed': return val && val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 不tofixed
      default: break;
    }
  }
  return val && Number(val).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || 0
}

const isTrue = (v: any) => v === true || v === '1' || v === 1


const ICON_WIDTH = 36;

export { transformBaseData, isUrl, setSearchCache, getSearchData, getSearchCache, storage, transferBooleanValue, getUrlParam, setThousandth, ICON_WIDTH, isTrue, };

