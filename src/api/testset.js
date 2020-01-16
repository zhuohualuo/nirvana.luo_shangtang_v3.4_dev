import request from '@/utils/request'

export function getTestsetList(params) {
  return request({
    url: '/auto/set/list',
    method: 'get',
    params: params
  })
}

export function createTestset(data) {
  return request({
    url: '/auto/set/add',
    method: 'post',
    data
  })
}

export function updateTestset(set_id, data) {
  return request({
    url: '/auto/set/' + set_id,
    method: 'put',
    data
  })
}

export function deleteTestset(set_id) {
  return request({
    url: '/auto/set/' + set_id,
    method: 'delete',
  })
}

export function deleteTestsetBatch(data) {
  return request({
    url: '/auto/set/del_batch',
    method: 'post',
    data
  })
}

export function getProgress(data) {
  return request({
    url: '/auto/set/progress',
    method: 'post',
    data
  })
}

export function getTestsetDetail(set_id, params) {
  return request({
    url: '/auto/set/' + set_id,
    method: 'get',
    params: params
  })
}

export function getTestsetLog(set_id, case_id) {
  return request({
    url: '/auto/case/result/' + set_id + '/' + case_id,
    method: 'get'
  })
}

export function getTestsetReport(report_id) {
  return request({
    url: '/auto/set/history/report/' + report_id,
    method: 'get'
  })
}

export function getTestsetReportHistory(set_id, params) {
  return request({
    url: '/auto/set/history/' + set_id,
    method: 'get',
    params: params
  })
}

export function runTestset(data) {
  return request({
    url: '/auto/set/run',
    method: 'post',
    data
  })
}

export function mockTestset(data) {
  return request({
    url: '/auto/set/mockrun',
    method: 'post',
    data
  })
}

export function rerunTestset(data) {
  return request({
    url: '/auto/set/rerun',
    method: 'post',
    data
  })
}

export function stopTestset(data) {
  return request({
    url: '/auto/set/stop',
    method: 'post',
    data
  })
}

export function getSetup(params) {
  return request({
    url: '/auto/set/setup_teardown',
    method: 'get',
    params: params
  })
}

export function getSetModule(set_id) {
  return request({
    url: '/auto/set/module/' + set_id,
    method: 'get'
  })
}

export function getTestsetLock(set_id) {
  return request({
    url: '/auto/set/edit/' + set_id,
    method: 'get'
  })
}

export function setTestsetLock(set_id, data) {
  return request({
    url: '/auto/set/edit/' + set_id,
    method: 'put',
    data
  })
}

export function cloneTestSet(set_id, name) {
  return request({
    url: '/auto/set/clone/' + set_id,
    method: 'get',
    params:{
      title: name
    }
  })
}
