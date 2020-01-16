import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

/* Layout */
import Layout from '@/views/layout/Layout'
import commonRouter from "./modules/commonRouter";
import apiRouter from "./modules/apiRouter";
import performanceRouter from "./modules/performanceRouter";
import precisionRouter from "./modules/precisionRouter";
import sdkRouter from "./modules/sdkRouter";
import uiRouter from "./modules/uiRouter";
import manualRouter from "./modules/manualRouter";
import ciRouter from "./modules/ciRouter";

/** note: submenu only apppear when children.length>=1
 *   detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 **/

/**
 * hidden: true/false/[hidden platform]       if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','ordinary']   will control the page roles (must be array)
    access: ['xxx','xxx']         the page will show among access, default is always show (must be array)
    headerNav: true               the route will show in the header, only affect the first route, default is false
    title: 'title'                the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'              the icon show in the sidebar
    noCache: true                 if true, the page will no be cached(default is false)
  }
 **/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/authredirect', component: () => import('@/views/login/authredirect'), hidden: true },
  { path: '/icon', component: () => import('@/views/svg-icons/index'), hidden: true },
  { path: '/404', component: () => import('@/views/errorPage/404'), hidden: true },
  { path: '/401', component: () => import('@/views/errorPage/401'), hidden: true },
]

export const asyncRouterMap = [
  {
    path: '/',
    redirect: 'dashboard',
    component: Layout,
    meta: {title: 'home', icon:'home', headerNav:true},
    children: [
      {path: '/dashboard', name: 'dashboard', component: () => import('@/views/dashboard/index'), meta: { title: 'home', icon: 'home' },hidden: true},
      {path: '/releaseNote', name: 'releaseNote', component: () => import('@/views/dashboard/releaseNote'), meta: { title: 'releaseNote', icon: 'form'},hidden: true}
    ]
  },

  apiRouter,
  precisionRouter,
  performanceRouter,
  // sdkRouter,
  uiRouter,
  // manualRouter,
  ciRouter,
  commonRouter,

  {
    path: '/permission',
    redirect: '/permission/list',
    component: Layout,
    name: 'permission',
    children: [
      {path: '/permission/list',name: 'permissionList',component: () => import('@/views/permission/index'),meta: {title: 'permission', icon:'form'}},
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRouterMap
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
}

export default router