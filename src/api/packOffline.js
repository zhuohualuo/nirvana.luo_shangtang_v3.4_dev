import request from '@/utils/request'

export function getPackOfflineList(params) {
  return request({
    url: '/ci/pack_offline',
    method: 'get',
    params: params
  })
}

export function addPackOffline(data) {
  return request({
    url: '/ci/pack_offline',
    method: 'post',
    data: data
  })
}

export function deletePackOffline(id) {
  return request({
    url: '/ci/pack_offline/' + id,
    method: 'delete'
  })
}

export function modifyPackOffline(id, data) {
  return request(
    {
      url: '/ci/pack_offline/' + id,
      method: 'put',
      data: data
    }
  )
}

export function runPackOffline(data) {
  return request(
    {
      url: '/ci/pack_offline/run',
      method: 'post',
      data: data
    }
  )
}

export function cancelPackOffline() {
  return request(
    {
      url: '/ci/pack_offline/cancel',
      method: 'get'
    }
  )
}
