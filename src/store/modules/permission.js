import { asyncRouterMap, constantRouterMap } from '@/router'

/**
 * 通过meta.role和access判断是否与当前用户权限匹配
 * @param {roles, platform}
 * @param route
 */
function hasPermission({roles, platform}, route) {
  let result = true;
  if(route.meta){
    if(route.meta.roles){
      result &= route.meta.roles.indexOf( Number(role) ) >= 0
    }
    if(route.meta.access){
      result &= route.meta.access.indexOf( Number(platform) )>= 0
    }
  }
  return result
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param {roles, platform}
 */
function filterAsyncRouter(asyncRouterMap, {roles, platform}) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission({roles, platform}, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, {roles, platform})
      }
      return true
    }
    return false
  })
  return accessedRouters
}

function getNowRouter(asyncRouterMap, to) {
  return asyncRouterMap.some(route => {
    if(to.path.indexOf(route.path) !==-1) {
      return true;
    }
    else if (route.children && route.children.length) { //如果有孩子就遍历孩子
      return  getNowRouter(route.children, to)
    }
  })

}

const permission = {
  namespaced: true,
  state: {
    routers: constantRouterMap,
    addRouters: [],
    siderbar_routers:[]
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
    SET_NOW_ROUTERS: (state, to) => {
      // 递归访问 addRouters，找到包含to 的那个路由对象，设置给siderbar_routers
      // console.log(state.addRouters)
      state.addRouters.forEach(e => {
        if(e.children&& e.children.length ){
          if(getNowRouter(e.children,to)===true)
            state.siderbar_routers=e;
        }
      })
    }

  },
  actions: {
    GenerateRoutes({ commit }, {roles, platform}) {
      return new Promise(resolve => {
        let accessedRouters = filterAsyncRouter(asyncRouterMap, {roles, platform});
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    },
    GetNowRoutes({ commit }, data) {
      return new Promise(resolve => {
        commit('SET_NOW_ROUTERS', data);
        resolve();
      })
    }
  }
}

export default permission
