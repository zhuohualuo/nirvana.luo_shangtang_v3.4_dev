import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style

NProgress.configure({ showSpinner: false })// NProgress Configuration

function checkAndCreateCaseRoute(projectList){
  let routers = store.getters.addRouters;
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

const whiteList = ['/login', '/401'] // no redirect whitelist

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  if (store.getters.uid && store.getters.platform) { // 判断是否有uid和platform
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    }
    else {
      if (store.getters.roles === '') { // 判断当前用户是否已拉取完user_info信息
        store.dispatch('user/FedLogOut').then(() => {
          Message.error("用户信息错误，请重新登录！")
          next({path: '/login'})
        })
      }
      let roles = store.getters.roles;
      let platform = store.getters.platform;
      if(store.getters.addRouters.length === 0)
      {
        store.dispatch('permission/GenerateRoutes', { roles, platform }).then(() => {
          store.dispatch('basicData/GetProject').then(() => {  //获取项目列表生成case路由
            let route = checkAndCreateCaseRoute(store.getters.projectList);
            router.addRoutes(route); // 动态添加可访问路由表
            next({...to});
          })
        })
      }
      else{
        store.dispatch('permission/GetNowRoutes', to);
        next();
      }
    }
  }
  else {
    if (whiteList.indexOf(to.path) !== -1) { // 在白名单中，直接进入
      next()
    }
    else {
      if(!store.getters.uid){ // 无uid则全部重定向到登录页
        next('/login')
      }
      else{ // 有uid无platform则全部重定向到401页
        next({ path: '/401', replace: true, query: { noGoBack: true }})
      }
      NProgress.done() // if current page is login/401 will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
