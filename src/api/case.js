import request from '@/utils/request'

export function getCaseList(params) {
  return request({
    url: '/auto/case/list',
    method: 'get',
    params: params
  })
}

export function createNewCase(data) {
  return request({
    url: '/auto/case/add',
    method: 'post',
    data
  })
}

export function updateCase(case_id, data) {
  return request({
    url: '/auto/case/modify/' + case_id,
    method: 'put',
    data
  })
}

export function deleteCase(case_id) {
  return request({
    url: '/auto/case/delete/' + case_id,
    method: 'delete',
  })
}

export function deleteCaseBatch(data) {
  return request({
    url: '/auto/case/del_batch',
    method: 'delete',
    data
  })
}

export function updateCaseBatch(data) {
  return request({
    url: '/auto/case/batch_modify',
    method: 'put',
    data
  })
}

export function runCase(data) {
  return request({
    url: '/auto/case/run',
    method: 'post',
    data
  })
}

export function getInvokeList(params) {
  return request({
    url: '/auto/case/assist',
    method: 'get',
    params: params
  })
}

export function getInterfaceList(params) {
  return request({
    url: '/api/records/list',
    method: 'get',
    params: params
  })
}

export function sendInterface(data) {
  return request({
    url: '/api/verify',
    method: 'post',
    data
  })
}

export function createInterface(data) {
  return request({
    url: '/api/records',
    method: 'post',
    data
  })
}

export function updateInterface(case_id, data) {
  return request({
    url: '/api/records/' + case_id,
    method: 'put',
    data
  })
}

export function deleteInterface(case_id) {
  return request({
    url: '/api/records/' + case_id,
    method: 'delete',
  })
}

export function getTemplateList(params) {
  return request({
    url: '/auto/case/template/list',
    method: 'get',
    params: params
  })
}

export function generateTemplateCase(data) {
  return request({
    url: '/auto/case/generate',
    method: 'post',
    data
  })
}

export function updateTemplate(template_id, data) {
  return request({
    url: '/auto/case/template/' + template_id,
    method: 'put',
    data
  })
}

export function deleteTemplate(template_id) {
  return request({
    url: '/auto/case/template/' + template_id,
    method: 'delete',
  })
}

export function saveTemplateCase(data) {
  return request({
    url: '/auto/case/save',
    method: 'post',
    data
  })
}

export function caseReplace(data) {
  return request({
    url: '/auto/case/replace',
    method: 'post',
    data
  })
}

export function downloadCase(data) {
    return request({
        url: '/auto/case/download',
        method: 'post',
        data
    })
}

export function remarkCase(data) {
    return request({
        url: '/auto/case/remark',
        method: 'post',
        data
    })
}

export function getCaseTypeList() {
    return request({
        url: '/auto/case/type/list',
        method: 'get'
    })
}

export function createNewType(data) {
    return request({
        url: '/auto/case/type',
        method: 'post',
        data
    })
}

export function deleteCaseType(data) {
    return request({
        url: '/auto/case/type/del',
        method: 'delete',
        data
    })
}

//SwaggerTemplate
export function getSwaggerTemplate() {
    return request({
        url: '/api/swagger/template',
        method: 'get'
    })
}