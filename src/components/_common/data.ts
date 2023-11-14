import { xhr_get, xhr_post_json } from './request';
import api from './api';//字典查询接口URL

export let allData: any = {}//临时数据存储

//=====类型列表=====
//城市列表：region
//贷款办理的业务：INSTLMT_BIZ_TYPE
//分期渠道：STAGES_CHANNEL
//退订原因：CANCELRS
//转全款原因：FULLMONEYRS
//承保类型：ACCEPTINSTYPE
//险种信息：INS_TYPE
//车龄属性：CAR_AGE_PRPTY
//销售类型：SALETYPE
//会员类型: VIP_TYPE
//代步出行业务：BIZ_SOURCE
//会员业务-预存项目：PRE_STORE
//贴息方式：DISCOUNT_WAY
//第三者责任险 ：THIRD_PARTY_LBTY_INS
//车身划痕险：L_CARBDY_INS


//获取全部数据
export const getListData = (type: string, config?: any) => {
  return new Promise((resolve: any, reject: any) => {
    if (allData[type] && allData[type].length > 0) {
      if (config && config.type == 'old') {
        resolve(allData[type + 'OLD'])
        return
      }
      resolve(allData[type])
    } else {
      xhr_post_json(api.queryListByAttrCodes, [type]).then((res: any) => {
        if (res.result) {
          allData[type] = res.result[type]
          resolve(allData[type])
        }
      })
    }
  })
}

//获取全部数据（不缓存）
export const getTempData = (api?: any) => {
  return new Promise((resolve: any, reject: any) => {
    if (api.type) {
      xhr_post_json(api.url, api.params).then((res: any) => {
        if (res.result) {
          resolve(res.result)
        }
      })
    } else {
      xhr_get(api.url, api.params).then((res: any) => {
        if (res.result) {
          resolve(res.result)
        }
      })
    }
  })
}
