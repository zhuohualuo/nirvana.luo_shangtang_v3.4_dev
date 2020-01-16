import request from '@/utils/request'

export function getDeviceList(params) {
  return request({
    url: '/ci/device/list',
    method: 'get',
    params: params
  })
}

export function addDevice(data) {
  return request({
    url: '/ci/device/add',
    method: 'post',
    data: data
  })
}

export function updateDevice(data) {
  return request({
    url: '/ci/device/update',
    method: 'post',
    data: data
  })
}

export function deleteDevice(data) {
  return request({
    url: '/ci/device/delete',
    method: 'post',
    data: data
  })
}

export function rentDevice(data) {
  return request({
    url: '/ci/device/rentserver',
    method: 'post',
    data: data
  })
}

export function returnDevice(data) {
  return request({
    url: '/ci/device/returnserver',
    method: 'post',
    data: data
  })
}

export function reinstallSystemDevice(params) {
  return request({
    url: '/ci/device/rebuildserver/' + params,
    method: 'get'
  })
}

export function reinstallInfraDevice(data) {
  return request({
    url: '/ci/device/infraserver',
    method: 'post',
    data: data
  })
}

//部署保存事件
export function saveDeployment(data,id) {
  return request({
    url: '/ci/device/save_deploy_record/'+id,
    method: 'put',
    data: data
  })
}

//部署
export function getDeployMsg(user,id,data) {
  return request({
    url: '/ci/device/deploy/'+user+'/'+id,
    method: 'post',
    data: data
  })
}

export function getsfstDeviceList(params) {
  return request({
    url: '/ci/sf_st_app/get_info',
    method: 'get',
    params: params
  })
}

export function createRecord(data) {
  return request({
    url: '/ci/sf_st_app/deploy',
    method: 'post',
    data: data
  })
}

export function deleteRecord(id) {
  return request({
    url: '/ci/sf_st_app/deploy_record/' + id,
    method: 'delete'
  })
}

export function getTaskProgress(id) {
  return request({
    url: '/ci/sf_st_app/deploy_record/' + id,
    method: 'get'
  })
}

export function getDeployLogList(params) {
  return request({
    url: '/ci/device/log',
    method: 'get',
    params: params
  })
}

export function getLicenseList() {
  return request({
    url: '/ci/license/list',
    method: 'get'
  })
}

export function getManageMachine() {
  return request({
    url: "/ci/system_version_args",
    method: "get"
  })
}

export function getSystemLog(params) {
  return request({
    url: "/ci/deploy_record"+params,
    method: "get"
  })
}
