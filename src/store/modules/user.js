import Cookies from 'js-cookie';
import { loginByUsername } from '@/api/login'
import router, { resetRouter } from '@/router'

const inFifteenMinutes = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

/* 根据项目生成用例列表路由 */
function checkAndCreateCaseRoute(routers, projectList){
  if(routers.some(
      function (item) {
        return item.name === 'autoTest'
      }))
  {
    let caseRoute = [];
    for(let item of projectList){
      caseRoute.push({
        path: '' + item.id,
        name: item.name,
        component: () => import('@/views/caseManage/caseList'),
        meta: { title: item.name },
        query: { project_id: item.id }
      })
    }
    routers[1].children[3].children = caseRoute;
  }
  return routers
}


const user = {
  namespaced: true,
  state: {
    status: '',
    email: '',
    uid: Cookies.get('uidNumber'),
    name: Cookies.get('name'),
    uid_name: Cookies.get('uid_name'),
    roles: Cookies.get('role'),
    platform: Cookies.get('platform'),
  },

  mutations: {
    SET_UID: (state, uid) => {
      state.uid = uid;
    },
    SET_UID_NAME: (state, uid_name) => {
      state.uid_name = uid_name;
    },
    SET_EMAIL: (state, email) => {
      state.email = email;
    },
    SET_STATUS: (state, status) => {
      state.status = status;
    },
    SET_NAME: (state, name) => {
      state.name = name;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    SET_PLATFORM: (state, platform) => {
      state.platform = platform;
    },
  },

  actions: {
    // 用户名登录
    LoginByUsername({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        loginByUsername(userInfo.username, userInfo.password).then(response => {
          if(response.data.code === 0){
            const data = JSON.parse(atob(response.data.user));
            // console.log(data);
            Cookies.set('uidNumber', data.uidNumber, {expires: inFifteenMinutes});
            Cookies.set('role', data.role, {expires: inFifteenMinutes});
            Cookies.set('name', data.displayName, {expires: inFifteenMinutes});
            Cookies.set('uid_name', data.uid, {expires: inFifteenMinutes});
            Cookies.set('platform', data.platform, {expires: inFifteenMinutes});
            Cookies.set('token', data.token, {expires: inFifteenMinutes});
            commit('SET_UID', data.uidNumber);
            commit('SET_EMAIL', data.email);
            commit('SET_STATUS', data.status);
            commit('SET_NAME', data.displayName);
            commit('SET_ROLES', data.role);
            commit('SET_UID_NAME', data.uid);
            commit('SET_PLATFORM', data.platform);
            resolve();
          }
          else{
            reject(response.data.msg);
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        //ToDo
      })
    },

    // 第三方验证登录
    LoginByThirdparty({ commit, state }, code) {
      return new Promise((resolve, reject) => {
        //ToDo
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        //ToDo
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_UID', undefined);
        commit('SET_EMAIL', '');
        commit('SET_STATUS', '');
        commit('SET_NAME', '');
        commit('SET_ROLES', '');
        commit('SET_UID_NAME', '');
        commit('SET_PLATFORM', '');
        Cookies.remove('uidNumber');
        Cookies.remove('role');
        Cookies.remove('name');
        Cookies.remove('uid_name');
        Cookies.remove('platform');
        Cookies.remove('token');
        resolve();
      })
    },

    // 修改权限
    ChangeRoles({ commit }, role) {
      return new Promise(resolve => {
        //ToDo
      })
    },

    // 修改业务线
    ChangePlatform({ commit, dispatch, state, rootState }, platform) {
      return new Promise(async resolve => {
        resetRouter();

        Cookies.set('platform', platform, {expires: inFifteenMinutes});
        commit('SET_PLATFORM', platform);

        // generate accessible routes map based on permission
        let roles = state.roles;
        await dispatch('permission/GenerateRoutes', {roles, platform}, { root: true });
        await dispatch('basicData/GetProject', null, { root: true });
        let accessRoutes = checkAndCreateCaseRoute(rootState.permission.addRouters, rootState.basicData.projectList);

        // dynamically add accessible routes
        router.addRoutes(accessRoutes);

        // reset visited views and cached views
        dispatch('tagsView/delAllViews', null, { root: true });
        resolve();
      })
    }
  }
}

export default user
