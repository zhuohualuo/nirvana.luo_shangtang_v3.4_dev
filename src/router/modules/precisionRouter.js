import Layout from '@/views/layout/Layout'
// import parentView from '@/views/layout/components/parentView'

const precisionRouter = {
  path: '/precision',
  redirect: '/precision/taskList',
  component: Layout,
  name: 'precision',
  meta: {title: 'precision', icon:'chart', headerNav:true},
  children: [
    {path: '/precision/taskList',name:'taskList',component: () => import('@/views/precision/taskList'),meta: {title: 'taskList', icon:'book'}},
    {path: '/precision/createTask',name: 'createPrecision',component: () => import('@/views/precision/createPrecision'),meta: {title: 'createTask', icon:'add',noCache: true},hidden:true},
    {path: '/precision/createSuite',name: 'createSuite',component: () => import('@/views/precision/createPrecision'),meta: {title: 'createSuite', icon:'add',noCache: true},hidden:true},
    {path: '/precision/updateSuite',name: 'updateSuite',component: () => import('@/views/precision/createPrecision'),meta: {title: 'updateSuite', icon:'edit',noCache: true},hidden:true},
    {path: '/precision/testPointList',name: 'testPointList',component: () => import('@/views/precision/testpointList'),meta: {title: 'testPointList', icon:'form'}},
    {path: '/precision/suiteList',name: 'suiteList',component: () => import('@/views/precision/suiteList'),meta: {title: 'suiteList', icon:'book'}},
    {path: '/precision/createPoint',name: 'createPoint',component: () => import('@/views/precision/createPoint'),meta: {title: 'createPoint', icon:'add',noCache: true},hidden:true},
    {path: '/precision/editPoint',name: 'editPoint',component: () => import('@/views/precision/createPoint'),meta: {title: 'editPoint', icon:'add',noCache: true},hidden:true},
    {path: '/precision/businessCode',name: 'businessCode',component: () => import('@/views/precision/businessCode'),meta: {title: 'businessCode', icon:'form'}},
    // {
    //   path:'/precision/resourceManage',
    //   redirect:'/precision/resourceManage',
    //   alwaysShow: true,
    //   component:  parentView,
    //   name: 'resourceManage',
    //   meta: {title:'resourceManage', icon:'bookmark'},
    //   children:[
        
        
    //   ]
    // },
    {path:'/precision/offlineTools',name: 'offlineTools', component: () => import('@/views/precision/offlineTools'),meta: {title: 'offlineTools', icon:'toolbox'}},
  ]
}

export default precisionRouter