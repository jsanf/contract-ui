import request from '@/utils/request'

// 查询合同模版库列表
export function listTemplate(query) {
  return request({
    url: '/contract/template/list',
    method: 'get',
    params: query
  })
}

// 查询合同模版库详细
export function getTemplate(templateId) {
  return request({
    url: '/contract/template/' + templateId,
    method: 'get'
  })
}

// 新增合同模版库
export function addTemplate(data) {
  return request({
    url: '/contract/template',
    method: 'post',
    data: data
  })
}

// 修改合同模版库
export function updateTemplate(data) {
  return request({
    url: '/contract/template',
    method: 'put',
    data: data
  })
}

// 删除合同模版库
export function delTemplate(templateId) {
  return request({
    url: '/contract/template/' + templateId,
    method: 'delete'
  })
}


// 模版状态修改
export function changeContractTemplateStatus(templateId, status) {
  const data = {
    templateId,
    status
  }
  return request({
    url: '/contract/template/changeStatus',
    method: 'post',
    data: data
  })
}
