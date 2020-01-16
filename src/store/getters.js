const getters = {
  sidebar: state => state.app.sidebar,
  navbar: state => state.app.navbar,
  language: state => state.app.language,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  uid: state => state.user.uid,
  name: state => state.user.name,
  uid_name: state => state.user.uid_name,
  email: state => state.user.email,
  status: state => state.user.status,
  roles: state => state.user.roles,
  platform: state => state.user.platform,
  routers: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,
  siderbar_routers: state => state.permission.siderbar_routers,
  errorLogs: state => state.errorLog.logs,
  platformList: state => state.basicData.platformList,
  projectList: state => state.basicData.projectList
}
export default getters
