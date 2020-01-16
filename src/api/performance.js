import request from '@/utils/request'

export function getPerfTaskList(params) {
    return request({
        url: '/perf/list',
        method: 'get',
        params: params
    })
}

export function getPerfStrategyList(params) {
    return request({
        url: '/perf/strategies',
        method: 'get',
        params: params
    })
}

export function deletePerfTask(task_id) {
    return request({
        url: '/perf/' + task_id,
        method: 'delete'
    })
}

export function addPerfTask(data) {
    return request({
        url: '/perf/add',
        method: 'post',
        data
    })
}

export function updatePerfTask(task_id, data) {
    return request({
        url: '/perf/' + task_id,
        method: 'put',
        data
    })
}

export function clonePerfTask(params) {
    return request({
        url: '/perf/clone',
        method: 'get',
        params: params
    })
}

export function getPerfTaskDetail(task_id) {
    return request({
        url: '/perf/' + task_id,
        method: 'get'
    })
}

export function runPerfTask(data) {
    return request({
        url: '/perf/run',
        method: 'post',
        data
    })
}

export function getPerfSetList(params) {
    return request({
        url: '/perf/set/list',
        method: 'get',
        params: params
    })
}

export function createPerfSet(data) {
    return request({
        url: '/perf/set/add',
        method: 'post',
        data
    })
}

export function createPerfScript(data) {
  return request({
    url: '/perf/add_jmeter',
    method: 'post',
    data
  })
}

export function updatePerfScript(data) {
  return request({
    url: '/perf/add_jmeter',
    method: 'put',
    data
  })
}

export function perfUpload(data) {
  return request({
    url: '/perf/upload',
    method: 'post',
    data
  })
}

export function updatePerfSet(set_id, data) {
    return request({
        url: '/perf/set/' + set_id,
        method: 'put',
        data
    })
}

export function deletePerfSet(set_id) {
    return request({
        url: '/perf/set/' + set_id,
        method: 'delete',
    })
}

export function runPerfTaskSet(data) {
    return request({
        url: '/perf/set/run',
        method: 'post',
        data
    })
}

export function stopPerfTaskSet(data) {
    return request({
        url: '/perf/set/stop',
        method: 'post',
        data
    })
}

export function getTaskOfSet(setId, params) {
    return request({
        url: '/perf/set/' + setId,
        method: 'get',
        params: params
    })
}

export function getPerfTaskSetReport(setId, params) {
    return request({
        url: '/perf/collection/set_report/' + setId,
        method: 'get',
        params: params
    })
}

export function getPerfHistoryReport(setId, params) {
    return request({
        url: '/perf/set/report/history/' + setId,
        method: 'get',
        params: params
    })
}

export function getConfigList(params) {
    return request({
        url: '/perf/config/list',
        method: 'get',
        params: params
    })
}

export function createConfig(data) {
    return request({
        url: '/perf/config',
        method: 'post',
        data
    })
}

export function cloneConfig(data) {
    return request({
        url: '/perf/config/clone',
        method: 'post',
        data
    })
}

export function updateConfig(config_id, data) {
    return request({
        url: '/perf/config/' + config_id,
        method: 'put',
        data
    })
}

export function deleteConfig(config_id) {
    return request({
        url: '/perf/config/' + config_id,
        method: 'delete',
    })
}

export function getProgress(data) {
    return request({
        url: '/perf/set/progress',
        method: 'post',
        data
    })
}

export function getSetup(params) {
  return request({
    url: '/perf/setup',
    method: 'get',
    params: params
  })
}

export function downloadTask(data){
    return request({
        url :'/perf/update_download',
        method : 'post',
        data
    })
}

//���Լ���¡
export function reqSetClone(data){
    return request({
        url : '/perf/set/clone',
        method : 'post',
        data
    })
}

//��ѯ����ByIDs
export function getTaskByIds(data){
    return request({
        url : '/perf/config/ids',
        method : 'post',
        data
    })
}

//���������� 
//return config_id
export function saveTaskConfig(data){
    return request({
        url : '/perf/config/build',
        method : 'post',
        data
    })
}
//性能测试任务方法
export function getPlanList(params) {
    return request({
      url: '/perf/task_set/list',
      method: 'get',
      params: params
    })
  }
export function addPlan(data){
    return request({
        url : '/perf/task_set/add',
        method : 'post',
        data  
    })
}
export function getPlanDetail(plan_id) {
    return request({  
      url: '/perf/task_set/progress/'+plan_id,
      method: 'get',
    })
  }
export function updatePlan(plan_id, data) {
    return request({
        url: '/perf/task_set/' + plan_id,
        method: 'put',
        data
    })
}
export function deletePlan(plan_id,data) {
    return request({
        url: '/perf/task_set/'+plan_id,
        method: 'delete',
        data
    })
}
export function clonePerfPlan(data){
    return request({
        url : '/perf/task_set/clone',
        method : 'post',
        data 
    })
}
export function historyReport(plan_id,params) {
    return request({
      url: '/perf/task_set/report/list/'+plan_id,
      method: 'get',
      params: params
    })
}
export function planProgress(data){
    return request({
        url : '/perf/task_set/progress',
        method : 'post',
        data   
    })
}
export function runPlan(data){
    return request({
        url : '/perf/task_set/run',
        method : 'post',
        data    
    })
}
export function stopPlan(data){
    return request({
        url : '/perf/task_set/stop',
        method : 'post',
        data    
    })
}
export function getConfig(set_id) {
    return request({
      url: '/perf/config/set/'+set_id,
      method: 'get',
    })
}
export function sendConfig(data) {
    return request({
      url: '/config/build',
      method: 'post',
      data
    })
  }