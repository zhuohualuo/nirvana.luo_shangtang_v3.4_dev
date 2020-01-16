import Cookies from 'js-cookie'

const app = {
  namespaced: true,
  state: {
    sidebar: {
      opened: Cookies.get('sidebarStatus') && !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    navbar: {
      childPage: Number(Cookies.get('childPage')),
      parentUrl: Cookies.get('parentUrl')
    },
    device: 'desktop',
    language: Cookies.get('language') || 'zh'
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_CHILD_NAVBAR: (state, parentUrl) => {
      Cookies.set('childPage', 1)
      Cookies.set('parentUrl', parentUrl)
      state.navbar.childPage = 1
      state.navbar.parentUrl = parentUrl
    },
    TOGGLE_PARENT_NAVBAR: (state) => {
      Cookies.set('childPage', 0)
      Cookies.set('parentUrl', '')
      state.navbar.childPage = 0
      state.navbar.parentUrl = ''
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    SET_LANGUAGE: (state, language) => {
      state.language = language
      Cookies.set('language', language)
    }
  },
  actions: {
    toggleSideBar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    closeSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    toggleChildNav({ commit }, parentUrl) {
      commit('TOGGLE_CHILD_NAVBAR', parentUrl)
    },
    toggleParentNav({ commit }) {
      commit('TOGGLE_PARENT_NAVBAR')
    },
    toggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    setLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
    }
  }
}

export default app
