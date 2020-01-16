import Layout from '@/views/layout/Layout'
import parentView from '@/views/layout/components/parentView'
import c from "./constant"

const uiRouter =   {
  path: '/webUI',
  redirect: '/webUI/uiTestsetList',
  component: Layout,
  name: 'webUI',
  meta: {title: 'webUI', icon:'example', access:[c.sf,c.safe]},
  children: [
    {path: '/webUI/uiPageList',name: 'uiPageList',component: () => import('@/views/uiAutomation/uiPageList'),meta: {title: 'uiPageList', icon: 'form'}},
    {path: '/webUI/createUICase',name: 'createUICase',component: () => import('@/views/uiAutomation/createUICase'),meta: {title: 'createUICase', icon: 'add',noCache: true},hidden: true},
    {path: '/webUI/uiCaseList',name: 'uiCaseList',component: () => import('@/views/uiAutomation/uiCaseList'),meta: {title: 'uiCaseList', icon: 'book'}},
    {path: '/webUI/uiTestsetList',name: 'uiTestsetList',component: () => import('@/views/uiAutomation/uiTestsetList'),meta: {title: 'uiTestsetList', icon: 'book'}},
    {path: '/webUI/machineList',name: 'machineList',component: () => import('@/views/uiAutomation/machineList'),meta: {title: 'machineList', icon: 'machine'}},
  ]
}

export default uiRouter