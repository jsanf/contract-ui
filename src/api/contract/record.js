import request from '@/utils/request'

// 查询签署记录列表
export function listRecord(query) {
  return request({
    url: '/contract/record/list',
    method: 'get',
    params: query
  })
}

// 查询签署记录详细
export function getRecord(id) {
  return request({
    url: '/contract/record/' + id,
    method: 'get'
  })
}

// 新增签署记录
export function addRecord(data) {
  return request({
    url: '/contract/record',
    method: 'post',
    data: data
  })
}

// 修改签署记录
export function updateRecord(data) {
  return request({
    url: '/contract/record',
    method: 'put',
    data: data
  })
}

// 删除签署记录
export function delRecord(id) {
  return request({
    url: '/contract/record/' + id,
    method: 'delete'
  })
}
