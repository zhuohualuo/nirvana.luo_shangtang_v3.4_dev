import { getPlatformList, getProjectList } from '@/api/project'

const basicData = {
  namespaced: true,
  state: {
    platformList: [],
    projectList: []
  },
  mutations: {
    SET_PROJECTLIST: (state, project) => {
      state.projectList = project
    },
    SET_PLATFORMLIST: (state, platform) => {
      state.platformList = platform
    },
  },
  actions: {
    GetPlatform({ commit }) {
      return new Promise((resolve, reject) => {
        getPlatformList().then(response => {
          var data = response.data.platform;
          commit('SET_PLATFORMLIST', data);
          resolve();
        }).catch(error => {
          commit('SET_PLATFORMLIST', []);
          console.log(error)
          resolve();
        })
      })
    },
    GetProject({ commit }) {
      return new Promise((resolve, reject) => {
        getProjectList().then(response => {
          var data = response.data.projects;
          commit('SET_PROJECTLIST', data);
          resolve();
        }).catch(error => {
          commit('SET_PROJECTLIST', []);
          console.log(error)
          resolve();
        })
      })
    },
  }
}

export default basicData
