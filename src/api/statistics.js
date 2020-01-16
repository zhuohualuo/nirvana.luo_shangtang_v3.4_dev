import request from '@/utils/request'

export function getApiCaseCount() {
    return request({
        url: '/common/statistics/cases',
        method: 'get'
    })
}

export function getPerfCaseCount() {
    return request({
        url: '/perf/get/case',
        method: 'get'
    })
}

export function getPrecisionCaseCount() {
    return request({
        url: '/precision/case/statistics',
        method: 'get'
    })
}

export function getSetStatistics(params) {
    return request({
        url: '/statistics/test_set',
        method: 'get',
        params: params
    })
}

export function getTestSet(params) {
    return request({
        url: '/statistics/set_list',
        method: 'get',
        params: params
    })
}

// home_page 测试报告
export function getStatisticsReport(params) {
    return request({
        url: '/common/statistics/report',
        method: 'get',
        params
    })
}
//用例执行次数
export function getStatisticsCase(params) {
    return request({
        url: '/common/statistics/case',
        method: 'get',
        params: params
    })
}