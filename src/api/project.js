import request from '@/utils/request'

export function getProjectList(params) {
  return request({
    url: '/common/project/list',
    method: 'get',
    params: params
  })
}

export function createProject(data) {
  return request({
    url: '/common/project/add',
    method: 'post',
    data
  })
}

export function updateProject(project_id, data) {
  return request({
    url: '/common/project/update/' + project_id,
    method: 'put',
    data
  })
}

export function deleteProject(project_id) {
  return request({
    url: '/common/project/delete/' + project_id,
    method: 'delete'
  })
}

export function getVersionList(params) {
  return request({
    url: '/common/project/version/list',
    method: 'get',
    params: params
  })
}

export function createVersion(data) {
  return request({
    url: '/common/project/version/add',
    method: 'post',
    data
  })
}

export function deleteVersion(version_id) {
  return request({
    url: '/common/project/version/del/' + version_id,
    method: 'delete'
  })
}

export function getModuleList(params) {
  return request({
    url: '/common/project/module/list',
    method: 'get',
    params: params
  })
}

export function createModule(data) {
  return request({
    url: '/common/project/module',
    method: 'post',
    data
  })
}

export function updateModule(module_id, data) {
  return request({
    url: '/common/project/module/' + module_id,
    method: 'put',
    data
  })
}

export function deleteModule(module_id) {
  return request({
    url: '/common/project/module/' + module_id,
    method: 'delete'
  })
}

export function getSubProjectList(params) {
  return request({
    url: '/common/project/sub/list',
    method: 'get',
    params: params
  })
}

export function getPlatformList() {
  return request({
    url: '/common/platform_access/platform/list',
    method: 'get'
  })
}
