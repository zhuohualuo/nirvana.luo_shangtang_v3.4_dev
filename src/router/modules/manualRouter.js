import Layout from '@/views/layout/Layout'
import parentView from '@/views/layout/components/parentView'
import c from "./constant"

const manualRouter =   {
  path: '/manualCase',
  redirect: '/manualCase/manualCaseList',
  component: Layout,
  name: 'manualCase',
  meta: {title: 'manualCase', icon:'peoples', headerNav:true},
  children: [
    {path: '/manualCase/manualCaseList',name: 'manualCaseList',component: () => import('@/views/testLink/testLink'),meta: {title: 'testLink', icon: 'book'}},
    {path: '/manualCase/manualTaskList',name: 'manualTaskList',component: () => import('@/views/testLink/taskLink'),meta: {title: 'taskLink', icon: 'book'}},
    {path: '/manualCase/createManualTask',name: 'createManualTask',component: () => import('@/views/testLink/createManualTask'),meta: {title: 'createManualTask', icon: 'add'},hidden: true},
    {path: '/manualCase/updateManualTask',name: 'updateManualTask',component: () => import('@/views/testLink/createManualTask'),meta: {title: 'updateManualTask', icon: 'edit'},hidden: true},
    {path: '/manualCase/subTaskList',name: 'subTaskList',component: () => import('@/views/testLink/subTaskList'),meta: {title: 'subTaskList', icon: 'bookmark'},hidden: true},
  ]
}

export default manualRouter