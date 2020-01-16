import request from '@/utils/request'

export function getMaterialList(params) {
    return request({
        url: '/common/material/list/',
        method: 'get',
        params: params
    })
}

export function getScriptList(params) {
  return request({
    url: '/perf/dir/list/',
    method: 'get',
    params: params
  })
}

export function getReportList(params) {
    return request({
        url: '/common/report/list',
        method: 'get',
        params: params
    })
}

export function deleteReport(name) {
    return request({
        url: '/common/report/delete/' + name,
        method: 'get',
    })
}

export function downloadReportList(data) {
    return request({
        url: '/common/report/batch_download',
        method: 'post',
        data
    })
}


//用例库 TestLink
export function getTestLinkList(params) {
    return request({
        url: '/case/manage/list',
        method: 'get',
        params: params
    })
}

export function createTestLink(data) {
    return request({
        url: '/case/manage/add',
        method: 'post',
        data
    })
}

export function updateTestLink(case_id, data) {
    return request({
        url: '/case/manage/modify/' + case_id,
        method: 'put',
        data
    })
}

export function deleteTestLink(case_id) {
    return request({
        url: '/case/manage/delete/' + case_id,
        method: 'delete',
    })
}

//特征值入库
export function featureIntoDb(data) {
    return request({
        url: '/feature/into/db',
        method: 'post',
        data
    })
}

export function getFeatureStatus(host) {
    return request({
        url: '/feature/into/db/status/' + host,
        method: 'get'
    })
}

//探索性测试任务管理
export function getFreeTaskList(params) {
    return request({
        url: '/stbm/task/list',
        method: 'get',
        params: params
    })
}

export function addFreeTask(data) {
    return request({
        url: '/stbm/task/add',
        method: 'post',
        data
    })
}

export function editFreeTask(task_id,data) {
    return request({
        url: '/stbm/task/edit/' + task_id,
        method: 'put',
        data
    })
}

export function delFreeTask(task_id) {
    return request({
        url: '/stbm/task/edit/' + task_id,
        method: 'delete'
    })
}

export function openFile(url) {
    return request({
        url: url,
        method: 'get'
    })
}

export function getFeature(data) {
    return request({
        url: '/image/process/getFeature' ,
        method: 'post',
        data
    })
}

export function detectAndQuality(data) {
    return request({
        url: '/image/process/detectAndQuality' ,
        method: 'post',
        data
    })
}
export function imageClear(data) {
    return request({
        url: '/image/process/imageClear' ,
        method: 'post',
        data
    })
}

export function scriptScan(data) {
    return request({
        url: '/tools/scan_flow' ,
        method: 'post',
        data
    })
}

export function getScriptPath(params) {
    return request({
        url: '/script/path',
        method: 'get',
        params: params
    })
}

export function scriptUpdate(data) {
    return request({
        url: '/tools/pull_script' ,
        method: 'post',
        data
    })
}


//备份&恢复工具
const host_url = 'http://172.20.25.53:5690'

export function BackupInterface(data) {
    return request({
        url: host_url + '/db_backup_recover/backup' ,
        method: 'post',
        data
    })
}

export function RecoveryInterface(data) {
    return request({
        url: host_url + '/db_backup_recover/recover' ,
        method: 'post',
        data
    })
}

export function cleanInterface(data) {
    return request({
        url: host_url + '/db_backup_recover/clean' ,
        method: 'post',
        data
    })
}

export function getStatus(host) {
    return request({
        url: host_url + '/db_backup_recover/status/'+ host ,
        method: 'get',
    })
}

export function getBackupInfo() {
    return request({
        url: host_url + '/db_backup_recover/backupinfo' ,
        method: 'get'
    })
}

export function getBackupStatus(params) {
    return request({
        url: host_url + '/db_backup_recover/status' ,
        method: 'get',
        params
    })
}

export function updateBackupName(data) {
    return request({
        url: host_url + '/db_backup_recover/updatename' ,
        method: 'post',
        data
    })
}

export function getBackupVersion() {
    return request({
        url: host_url + '/db_backup_recover/version' ,
        method: 'get'
    })
}

export function deleteBackup(data) {
    return request({
        url: host_url + '/db_backup_recover/delelte' ,
        method: 'delete',
        data
    })
}
