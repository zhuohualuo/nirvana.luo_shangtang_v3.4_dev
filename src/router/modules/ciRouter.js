import Layout from '@/views/layout/Layout'
import parentView from '@/views/layout/components/parentView'
import c from "./constant";

const ciRouter = {
  path: '/deviceManage',
  redirect: '/deviceManage/device',
  component: Layout,
  name: '持续集成',
  meta: {title: '持续集成', icon:'enable', headerNav:true},
  children: [
    {path: '/deviceManage/addDeviceResource',name: 'addDeviceResource',component: () => import('@/views/deviceManage/addDeviceResource'),meta: {title: '增加机器', icon:'form', noCache: true}, hidden: true},
    {path: '/deviceManage/device',name: 'device',component: () => import('@/views/deviceManage/device'),meta: {title: '机器管理', icon:'form'}},
    // {path: '/deviceManage/sfstDeviceList',name: '业务机器',component: () => import('@/views/deviceManage/sfstDeviceList'),meta: {title: '业务机器', icon:'form'}, hidden:[c.vi]},
    {path: '/deviceManage/packOffline',name: '打离线包',component: () => import('@/views/deviceManage/packOffline'),meta: {title: '打离线包', icon:'form'}, hidden:[c.sf]},
    {path: '/deviceManage/ciPipeline',name: '配置CI',component: () => import('@/views/deviceManage/ciPipeline'),meta: {title: '配置CI', icon:'form'}},
    {path: '/deviceManage/ciPipelineLog',name: 'CI执行详情',component: () => import('@/views/deviceManage/ciPipelineLog'),meta: {title: 'CI执行详情', icon:'form',noCache: true},hidden: true},
    {path: '/deviceManage/addCIPipeline',name: '编辑CI配置',component: () => import('@/views/deviceManage/addCIPipeline'),meta: {title: '编辑CI配置', icon:'form',noCache: true},hidden: true},
    { path: '/deviceManage/viewLog', name: 'CI执行日志', component: () => import('@/views/deviceManage/viewLog'), meta: { title: 'CI执行日志', icon: 'form', noCache: true }, hidden: true },
    {path: '/deviceManage/addExecutive',name: '执行情况',component: () => import('@/views/deviceManage/addExecutive'),meta: {title: '执行情况', icon:'form',noCache: true},hidden: true},
  ]
}

export default ciRouter
