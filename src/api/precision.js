import request from '@/utils/request'

export function getTaskList(params) {
  return request({
    url: '/precision/task/list',
    method: 'get',
    params: params
  })
}

export function createNewTask(data) {
  return request({
    url: '/precision/task/submit',
    method: 'post',
    data
  })
}

export function getTaskProgress(params) {
  return request({
    url: '/precision/task/progress',
    method: 'get',
    params: params
  })
}

export function reloadTask(data) {
  return request({
    url: '/precision/task/reload',
    method: 'post',
    data
  })
}

export function getEmail(params) {
  return request({
    url: '/precision/task/config',
    method: 'get',
    params:params
  })
}

export function stopTask(data) {
  return request({
    url: '/precision/task/stop',
    method: 'post',
    data
  })
}

export function getTaskListChild(params) {
  return request({
    url: '/precision/task/child',
    method: 'get',
    params: params
  })
}

export function downloadResult(data) {
  return request({
    url: '/precision/result/download',
    method: 'post',
    data
  })
}

export function getSuiteList(data) {
  return request({
    url: '/precision/suite/list',
    method: 'post',
    data
  })
}

export function createNewSuite(data) {
  return request({
    url: '/precision/suite/create',
    method: 'post',
    data
  })
}

export function updateSuite(data) {
  return request({
    url: '/precision/suite/update',
    method: 'post',
    data
  })
}

export function deleteSuite(data) {
  return request({
    url: '/precision/suite/delete',
    method: 'post',
    data
  })
}

export function getSceneList(params) {
  return request({
    url: '/precision/category/scene/list',
    method: 'get',
    params: params
  })
}

export function getPointList(params) {
  return request({
    url: '/precision/point/list',
    method: 'get',
    params: params
  })
}

export function createNewPoint(data) {
  return request({
    url: '/precision/point/add',
    method: 'post',
    data
  })
}

export function updatePoint(data) {
  return request({
    url: '/precision/point/update',
    method: 'post',
    data
  })
}

export function deletePoint(data) {
  return request({
    url: '/precision/point/delete',
    method: 'post',
    data
  })
}

export function cloneSuite(data) {
  return request({
    url: '/precision/suite/clone',
    method: 'post',
    data
  })
}

// 业务代码管理
export function updateBusinessCode(data) {
  return request({
    url: '/precision/vendor/update',
    method: 'post',
    data
  })
}

export function reloadBusinessCode(data) {
  return request({
    url: '/precision/vendor/reload ',
    method: 'post',
    data
  })
}

export function updateBusinessLog(params) {
  return request({
    url: '/precision/vendor/update_log',
    method: 'get',
    params:params
  })
}

export function getBusinessList() {
  return request({
    url: '/precision/vendor/list',
    method: 'get'
  })
}

export function getBusinessDetail(params) {
  return request({
    url: '/precision/vendor/detail',
    method: 'get',
    params:params
  })
}

// 准确率 离线工具
export function getToolList() {
  return request({
    url: '/precision/tool/list',
    method: 'get'
  })
}

export function getToolParams(params) {
  return request({
    url: '/precision/tool/params',
    method: 'get',
    params:params
  })
}

export function getRunTool(params) {
  return request({
    url: '/precision/tool/run',
    method: 'get',
    params:params
  })
}

export function getToolUpdate() {
  return request({
    url: '/precision/tool/update',
    method: 'get',
  })
}

export function getToolReport(params) {
  return request({
    url: '/precision/file/list',
    method: 'get',
    params
  })
}

//查询历史报告
export function getReportName(params) {
  return request({
    url: '/precision/aggregate/report/test_name',
    method: 'get',
    params
  })
}

export function getReportOperator(params) {
  return request({
    url: '/precision/aggregate/report/operator',
    method: 'get',
    params
  })
}

export function getReportConfig(params) {
  return request({
    url: '/precision/aggregate/report/config',
    method: 'get',
    params
  })
}

export function getReportUrl(data) {
  return request({
    url: '/precision/aggregate/report/get',
    method: 'post',
    data
  })
}

//json 参数配置
export function getConfigList(params) {
  return request({
    url: '/precision/config/list',
    method: 'get',
    params
  })
}

export function getAllName(params) {
  return request({
    url: '/precision/config/filter_list',
    method: 'get',
    params
  })
}

export function configEditGet(params) {
  return request({
    url: '/precision/config/edit',
    method: 'get',
    params
  })
}

export function configRestore(data) {
  return request({
    url: '/precision/config/restore',
    method: 'post',
    data
  })
}

export function configListEditPost(data) {
  return request({
    url: '/precision/config/edit',
    method: 'post',
    data
  })
}

export function getRemoveConfig(params) {
  return request({
    url: '/precision/config/delete',
    method: 'get',
    params
  })
}

export function getAddConfig(data) {
  return request({
    url: '/precision/config/add',
    method: 'post',
    data
  })
}

// 查询setup
export function getSetup(params) {
  return request({
    url: '/precision/entry/setup/list',
    method: 'get',
    params
  })
}
// 过滤条件
export function filterSetup(params) {
  return request({
    url: '/precision/category/category/list',
    method: 'get',
    params
  })
}

export function getTestPoint(params) {
  return request({
    url: '/precision/entry/case/list',
    method: 'get',
    params
  })
}

export function filterTestPoint(params) {
  return request({
    url: '/precision/category/scene/list',
    method: 'get',
    params
  })
}

export function getCreateSuiteList(params) {
  return request({
    url: '/precision/suite/query',
    method: 'get',
    params
  })
}
export function restoreSuite(data) {
  return request({
    url: '/precision/suite/recover',
    method: 'post',
    data
  })
}
export function addBusiness(data){
  return request({
    url :'/precision/vendor/add',
    method : 'post',
    data
  })
}

export function delBusiness(data){
  return request({
    url :'/precision/vendor/delete',
    method : 'post',
    data
  })
}

export function getPropress(params) {
  return request({
    url :'/precision/vendor/process',
    method : 'get',
    params
  })
}

export function getBranch(params) {
  return request({
    url :'/precision/vendor/branch',
    method : 'get',
    params
  })
}