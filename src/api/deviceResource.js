import request from "@/utils/request";

export function getDeviceList(params) {
  return request({
    url: "/ci/device/",
    method: "get",
    params: params
  });
}

export function addDevice(data) {
  return request({
    url: "/ci/device/",
    method: "post",
    data: data
  });
}

export function updateDevice(data, id) {
  return request({
    url: "/ci/device/" + id,
    method: "put",
    data: data
  });
}

export function deleteDevice(id) {
  return request({
    url: "/ci/device/" + id,
    method: "delete"
  });
}

export function rentDevice(data, id) {
  return request({
    url: "/ci/device/rent/" + id,
    method: "post",
    data: data
  });
}

export function returnDevice(data, id) {
  return request({
    url: "/ci/device/return/" + id,
    method: "post",
    data: data
  });
}

export function reinstallSystemDevice(params) {
  return request({
    url: "/ci/device/rebuildserver/" + params,
    method: "post"
  });
}

export function reinstallInfraDevice(data, params) {
  return request({
    url: "/ci/device/infraserver/" + params,
    method: "post",
    data: data
  });
}

export function getsfstDeviceList(params) {
  return request({
    url: "/ci/sf_st_app/get_info",
    method: "get",
    params: params
  });
}

export function cloneSuite(data, id) {
  return request({
    url: "/ci/sf_st_app/clone/" + id,
    method: "post",
    data: data
  });
}

export function createRecord(data) {
  return request({
    url: "/ci/sf_st_app/add",
    method: "post",
    data: data
  });
}

//编辑保存事件
export function editRecord(id, data) {
  return request({
    url: "/ci/sf_st_app/modify/" + id,
    method: "put",
    data: data
  });
}
//机器部署
export function getDeployment(id,data) {
  return request({
    url: "/ci/sf_st_app/deploy/" + id,
    method: "post",
    data: data
  });
}

export function deleteRecord(id) {
  return request({
    url: "/ci/sf_st_app/deploy_record/" + id,
    method: "delete"
  });
}

export function getTaskProgress(id) {
  return request({
    url: "/ci/sf_st_app/deploy_record/" + id,
    method: "get"
  });
}

export function getDeployLogList(id) {
  return request({
    url: "/ci/device/log/" + id,
    method: "get"
  });
}

export function getLicenseList() {
  return request({
    url: "/ci/license/list",
    method: "get"
  });
}

// 部署保存事件
export function saveDeployment(data, id) {
  return request({
    url: '/ci/device/save_deploy_record/' + id,
    method: 'put',
    data: data
  })
}

// 部署
export function triggerDeploy(user, id, data) {
  return request({
    url: '/ci/device/deploy/' + user + '/'+ id,
    method: 'post',
    data: data
  })
}

// 获取系统版本信息
export function getSystemVersion() {
  return request({
    url: '/ci/system_version_args',
    method: 'get'
  })
}


