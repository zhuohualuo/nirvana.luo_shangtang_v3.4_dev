import request from '@/utils/request'

export function getModulesCIList(params) {
  return request({
    url: '/modules_ci',
    method: 'get',
    params: params
  })
}

export function addModulesCI(data) {
  return request({
    url: '/modules_ci',
    method: 'post',
    data: data
  })
}

export function updateModulesCI(id,data) {
  return request({
    url: '/modules_ci/' + id,
    method: 'put',
    data: data
  })
}

export function deleteModulesCI(id) {
  return request({
    url: '/modules_ci/' + id,
    method: 'delete'
  })
}
