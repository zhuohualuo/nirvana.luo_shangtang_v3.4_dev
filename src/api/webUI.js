import request from '@/utils/request4debug'

//Machine
export function getMachineList(data) {
    return request({
        url: '/ui/machine/list',
        method: 'post',
        data
    })}

export function createNewMachine(data) {
    return request({
        url: '/ui/machine/add',
        method: 'post',
        data
    })
}

export function updateMachine(data) {
    return request({
        url: '/ui/machine/update',
        method: 'post',
        data
    })
}

export function deleteMachine(data) {
    return request({
        url: '/ui/machine/delete',
        method: 'post',
        data
    })
}

export function getFreeMachineList() {
    return request({
        url: '/ui/machine/get_free',
        method: 'post'
    })
}

//Page
export function getPageList(data) {
    return request({
        url: '/ui/page/page_list',
        method: 'post',
        data
    })
}

export function getPageDetail(data) {
    return request({
        url: '/ui/page/method_list',
        method: 'post',
        data
    })
}

export function getMethodList(data) {
    return request({
        url: '/ui/page/method_list',
        method: 'post',
        data
    })
}

//Case
export function getUICaseList(data) {
    return request({
        url: '/ui/case/list',
        method: 'post',
        data
    })
}

export function addUICase(data) {
    return request({
        url: '/ui/case/add',
        method: 'post',
        data
    })
}

export function updateUICase(data) {
    return request({
        url: '/ui/case/update',
        method: 'post',
        data
    })
}

export function getUICaseById(data) {
    return request({
        url: '/ui/case/get',
        method: 'post',
        data
    })
}

export function deleteUICase(data) {
    return request({
        url: '/ui/case/delete',
        method: 'post',
        data
    })
}

export function runUICase(data) {
    return request({
        url: '/ui/case/run',
        method: 'post',
        data
    })
}

export function getUICaseReport(data) {
    return request({
        url: '/ui/case_set/report',
        method: 'post',
        data
    })
}

//Case Set
export function getUITestSetList(data) {
    return request({
        url: '/ui/case_set/list',
        method: 'post',
        data
    })
}

export function addUITestSet(data) {
    return request({
        url: '/ui/case_set/add',
        method: 'post',
        data
    })
}

export function updateUITestSet(data) {
    return request({
        url: '/ui/case_set/update',
        method: 'post',
        data
    })
}

export function deleteUITestSet(data) {
    return request({
        url: '/ui/case_set/delete',
        method: 'post',
        data
    })
}

export function runUITestSet(data) {
    return request({
        url: '/ui/case_set/run',
        method: 'post',
        data
    })
}

export function getUITestSetReport(data) {
    return request({
        url: '/ui/case_set/report',
        method: 'post',
        data
    })
}