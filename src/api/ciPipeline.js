import request from '@/utils/request'

export function getCIPipelineList(params) {
  return request({
    url: '/ci/ci_pipeline',
    method: 'get',
    params: params
  })
}

export function addCIPipeline(data) {
  return request({
    url: '/ci/ci_pipeline/clone',
    method: 'post',
    data: data
  })
}

export function deleteCIPipeline(id) {
  return request({
    url: '/ci/ci_pipeline/' + id,
    method: 'delete'
  })
}

export function modifyCIPipeline(id, data) {
  return request(
    {
      url: '/ci/ci_pipeline/' + id,
      method: 'put',
      data: data
    }
  )
}

export function runCIPipeline(data) {
  return request(
    {
      url: '/ci/ci_pipeline/run',
      method: 'post',
      data: data
    }
  )
}

export function cancelCIPipeline() {
  return request(
    {
      url: '/ci/ci_pipeline/cancel',
      method: 'get'
    }
  )
}

export function cancelPipeline(data) {
  return request(
    {
      url: '/ci/ci_pipeline/cancel',
      method: 'post',
      data: data
    }
  )
}
export function getPipelineLogList(params) {
  return request(
    {
      url: '/ci/ci_pipeline_log',
      method: 'get',
      params: params
    }
  )
}

export function viewPipelineLog(params) {
  return request(
    {
      url: '/ci/view_log',
      method: 'get',
      params: params
    }
  )
}

export function getCIProductList(id) {
  return request(
    {
      url: '/ci/ci_pipeline/product/' + id,
      method: 'get'
    }
  )
}

export function getCIPipelineArgsList(params) {
  return request(
    {
      url: '/ci/ci_pipeline_args',
      method: 'get',
      params: params
    }
  )
}

export function newCIPipeline(data) {
  return request({
    url: '/ci/ci_pipeline',
    method: 'post',
    data: data
  })
}

export function updateCIPipeline(data) {
  return request({
    url: '/ci/ci_pipeline',
    method: 'put',
    data
  })
}

// 编辑定时任务接口
export function editSchedules(data) {
  return request({
    url: '/ci/ci_pipeline_schedules/edit',
    method: 'post',
    data: data
  })
}

// 删除定时任务接口
export function deleteSchedules(pipeline_id) {
  return request({
    url: '/ci/ci_pipeline_schedules/delete/' + pipeline_id,
    method: 'delete'
  })
}

// 获取定时任务信息
export function getSchedulesInfo(pipeline_id) {
  return request({
    url: '/ci/ci_pipeline_schedules/job_info/' + pipeline_id,
    method: 'get'
  })
}

//配置Cl接口
export function getClId(data) {
  return request({
    url: '/ci/ci_pipeline/retry',
    method: 'post',
    data:data
  })
}