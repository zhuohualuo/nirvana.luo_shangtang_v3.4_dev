import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    username: username,
    password: password
  }
  return request({
    url: '/common/user/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/common/login/logout',
    method: 'post'
  })
}

export function getUserInfo(params) {
  return request({
    url: '/common/user/info',
    method: 'get',
    params: params
  })
}

/* 权限相关 */

// 所有用户列表显示
export function getUserList() {
  return request({
    url: '/common/platform_access/platform/user/list',
    method: 'get',
  })
}

// 判断用户是否为管理员
export function getUserManager() {
  return request({
    url: '/common/platform_access/platform/user/manager',
    method: 'get',
  })
}

// 权限的授予
export function getUserAuthorise(data) {
  return request({
    url: '/common/platform_access/platform/authorise',
    method: 'put',
    data
  })
}

// 获取当前产品线所有用户
export function getPlatformMember() {
  return request({
    url: '/common/platform_access/platform/member',
    method: 'get'
  })
}
