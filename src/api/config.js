import request from '@/utils/request'

export function getConfigList(params) {
  return request({
    url: '/config/list',
    method: 'get',
    params: params
  })
}

export function createConfig(data) {
  return request({
    url: '/config',
    method: 'post',
    data
  })
}

export function cloneConfig(data) {
  return request({
    url: '/config/clone',
    method: 'post',
    data
  })
}

export function updateConfig(config_id, data) {
  return request({
    url: '/config/' + config_id,
    method: 'put',
    data
  })
}

export function deleteConfig(config_id) {
  return request({
    url: '/config/' + config_id,
    method: 'delete',
  })
}

export function getKeyList(params) {
  return request({
    url: '/config/keys/list',
    method: 'get',
    params: params
  })
}

export function createKey(data) {
  return request({
    url: '/config/keys',
    method: 'post',
    data
  })
}

export function deleteKey(key_id) {
  return request({
    url: '/config/keys/' + key_id,
    method: 'delete',
  })
}
