import request from '@/utils/request'

export function getTestPlanConfig(params) {
    return request({
        url: '/auto/collection/set_config/list',
        method: 'get',
        params: params
    })
}

export function getTestPlanList(params) {
    return request({
        url: '/auto/collection/list',
        method: 'get',
        params: params
    })
}

export function createTestPlan(data) {
    return request({
        url: '/auto/collection/add',
        method: 'post',
        data
    })
}

export function updateTestPlan(set_id, data) {
    return request({
        url: '/auto/collection/' + set_id,
        method: 'put',
        data
    })
}

export function deleteTestPlan(set_id) {
    return request({
        url: '/auto/collection/' + set_id,
        method: 'delete',
    })
}

export function deleteTestPlanBatch(data) {
    return request({
        url: '/auto/collection/batch_del',
        method: 'post',
        data
    })
}

export function getPlanProgress(data) {
    return request({
        url: '/auto/collection/progress',
        method: 'post',
        data
    })
}

export function getPlanSetProgress(data) {
    return request({
        url: '/auto/collection/set/progress',
        method: 'post',
        data
    })
}

export function getPlanSetDetail(col_id, params) {
    return request({
        url: '/auto/collection/' + col_id,
        method: 'get',
        params: params
    })
}

export function setPlanSetCaseResult(data) {
    return request({
        url: '/auto/collection/set/case/result',
        method: 'post',
        data
    })
}

export function getTestPlanReport(data) {
    return request({
        url: '/auto/manual/send_collection_report',
        method: 'post',
        data
    })
}

export function createSetReport(data) {
    return request({
        url: '/auto/manual/generate_set_report',
        method: 'post',
        data
    })
}

export function getPlanSetReport(set_id, query) {
    return request({
        url: '/auto/collection/set_report/' + set_id,
        method: 'get',
        params: query
    })
}

export function runTestPlan(data) {
    return request({
        url: '/auto/collection/run',
        method: 'post',
        data
    })
}

export function cloneTestPlan(set_id, data) {
    return request({
        url: '/auto/collection/clone/' + set_id,
        method: 'post',
        data
    })
}
