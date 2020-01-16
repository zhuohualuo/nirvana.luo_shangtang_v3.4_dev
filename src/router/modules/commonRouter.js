import Layout from '@/views/layout/Layout'
import parentView from '@/views/layout/components/parentView'
import c from './constant'

const commonRouter = {
  path: '/common',
  redirect: '/common/projectList',
  component: Layout,
  name: 'common',
  meta: {title: 'common', icon:'international', headerNav:true},
  children: [
    {path: '/common/projectList',name: 'projectList',component: () => import('@/views/projectManage/projectList'),meta: {title: 'projectList', icon:'book'}},
    {path: '/common/projectVersion',name: 'projectVersion',component: () => import('@/views/projectManage/projectVersion'),meta: {title: 'projectVersion', icon:'book'}},
    {path: '/common/moduleList',name: 'moduleList',component: () => import('@/views/projectManage/moduleList'),meta: {title: 'moduleList', icon:'book'}},
    {path: '/common/caseType',name: 'caseType',component: () => import('@/views/caseManage/caseType'),meta: {title: 'caseType', icon:'bookmark'}},
    {path: '/common/testReport',name: 'testReportList',component: () => import('@/views/testReport/testReportList'),meta: {title: 'testReport', icon:'form'}},
    {path: '/common/materialList',name: 'materialList',component: () => import('@/views/material/materialList'),meta: {title: 'materialList', icon:'picture'}},
    // {path: '/common/uploadMaterial',name: 'uploadMaterial',component: () => import('@/views/material/uploadMaterial'),meta: {title: 'uploadMaterial', icon:'upload'},hidden: true},
  ]
}

export default commonRouter