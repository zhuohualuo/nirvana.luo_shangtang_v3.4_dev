import request from '@/utils/request'

export function getSdkCaseList(params) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases',
        method: 'get',
        params: params
    })
}

export function createSdkCase(data) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/add',
        method: 'post',
        data
    })
}

export function updateSdkCase(case_id,data) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/' + case_id,
        method: 'put',
        data
    })
}

export function deleteSdkCase(case_id) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/' + case_id,
        method: 'delete'
    })
}

export function runSdkCase(data) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/run_case',
        method: 'post',
        data
    })
}

export function getSdkCaseReportList(params) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/report/history',
        method: 'get',
        params: params
    })
}

export function getSdkTypeList(params) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/type/list',
        method: 'get',
        params: params
    })
}

export function createSdkType(data) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/type',
        method: 'post',
        data
    })
}

export function deleteSdkType(params) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/type',
        method: 'delete',
        params: params
    })
}

export function getSdkConfigList(params) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/config/list',
        method: 'get',
        params: params
    })
}

export function createSdkConfig(data) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/config',
        method: 'post',
        data
    })
}

export function deleteSdkConfig(params) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/config',
        method: 'delete',
        params: params
    })
}

export function getSdkModelList(params) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/model/list',
        method: 'get',
        params: params
    })
}

export function createSdkModel(data) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/models',
        method: 'post',
        data
    })
}

export function deleteSdkModel(params) {
    return request({
        // baseURL: baseURL,
        url: '/sdk/cases/models',
        method: 'delete',
        params: params
    })
}

