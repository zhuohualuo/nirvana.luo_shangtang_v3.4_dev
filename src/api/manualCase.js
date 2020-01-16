import request from '@/utils/request'

//Case
export function getManualCaseList(params) {
    return request({
        url: '/case/maintenance/list',
        method: 'get',
        params: params
    })
}

export function addManualCase(data) {
    return request({
        url: '/case/maintenance/add',
        method: 'post',
        data
    })
}

export function updateManualCase(id, data) {
    return request({
        url: '/case/maintenance/modify/' + id,
        method: 'put',
        data
    })
}

export function deleteManualCase(id) {
    return request({
        url: '/case/maintenance/delete/' + id,
        method: 'delete'
    })
}

//Case Set
export function getManualTaskList(params) {
    return request({
        url: '/stbm/plan/list',
        method: 'get',
        params: params
    })
}

export function addManualTask(data) {
    return request({
        url: '/stbm/plan/add',
        method: 'post',
        data
    })
}

export function updateManualTask(id, data) {
    return request({
        url: '/stbm/plan/' + id,
        method: 'put',
        data
    })
}

export function cloneManualTask(id, data) {
    return request({
        url: '/stbm/plan/clone/' + id,
        method: 'post',
        data
    })
}

export function deleteManualTask(id) {
    return request({
        url: '/stbm/plan/' + id,
        method: 'delete'
    })
}

export function getManualTaskResult(id, params) {
    return request({
        url: '/stbm/subplan/' + id,
        method: 'get',
        params: params
    })
}

export function updateManualTaskResult(id, data) {
    return request({
        url: '/stbm/subplan/' + id,
        method: 'put',
        data
    })
}


export function downloadManualCase(data) {
  return request({
    url: '/case/maintenance/download',
    method: 'post',
    data
  })
}
