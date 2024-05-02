import request from '@/utils/request'

// 获取微信用户信息
export function getWxUserInfo(code) {
  return request({
    url: '/wechat/getWxUserInfo',
    method: 'get',
    params: {code: code}
  })
}

// 获取合同模版链接
export function getContractTemplate(params) {
  return request({
    url: '/wechat/getContractTemplate',
    method: 'get',
    params: params
  })
}
// 获取合同模版链接
export function getCodeUrl() {
  return request({
    url: '/wechat/getCodeUrl',
    method: 'get',
  })
}

// 合同上传
export function saveContract(data) {
  return request({
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    url: '/wechat/saveContract',
    method: 'post',
    data: data
  })
}
