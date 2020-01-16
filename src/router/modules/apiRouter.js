import Layout from '@/views/layout/Layout'
import parentView from '@/views/layout/components/parentView'
import c from "./constant"

const apiRouter = {
  path: '/autoTest',
  redirect: '/autoTest/testset',
  component: Layout,
  name: 'autoTest',
  meta: {title: 'autoTest', icon:'component', headerNav:true,
        access:[c.self,c.vi,c.sf,c.mkt,c.bi,c.cv,c.idea,c.safe,c.sb,c.sid,c.tec,c.rd,c.chip,c.air,c.ad,c.gateway,c.remote,c.cabin,c.wos]},
  children: [
    {path: '/autoTest/interfaceList',name: 'interfaceList',component: () => import('@/views/caseManage/interfaceList'),meta: {title: 'interfaceList', icon:'icon'}},
    {path: '/autoTest/createInterface',name: 'createInterface',component: () => import('@/views/caseManage/createInterface'),meta: {title: 'createInterface', icon:'add', noCache: true},hidden: true},
    {path: '/autoTest/updateInterface',name: 'updateInterface',component: () => import('@/views/caseManage/createInterface'),meta: {title: 'updateInterface', icon:'edit', noCache: true},hidden: true},

    {
      path: '/autoTest/caseManage',
      component: parentView,
      name: 'caseManage',
      alwaysShow: true,
      meta: {title: 'caseManage', icon:'excel'},
      children: []
    },

    {path: '/autoTest/createCase',name: 'createCase',component: () => import('@/views/caseManage/createCase'),meta: {title: 'createCase', icon:'add', noCache: true},hidden: true},
    {path: '/autoTest/updateCase',name: 'updateCase',component: () => import('@/views/caseManage/createCase'),meta: {title: 'updateCase', icon:'edit', noCache: true},hidden: true},
    {path: '/autoTest/uploadCase',name: 'uploadCase',component: () => import('@/views/caseManage/uploadCase'),meta: {title: 'uploadCase', icon:'upload'},hidden: true},
    {path: '/autoTest/testset',name: 'testsetList',component: () => import('@/views/testset/testsetList'),meta: {title: 'testset', icon:'book'}},
    {path: '/autoTest/testPlan',name: 'testPlanList',component: () => import('@/views/testset/testPlanList'),meta: {title: 'testPlan', icon:'book'}},
    {path: '/autoTest/editTestPlan',name: 'editTestPlan',component: () => import('@/views/testset/editTestPlan'),meta: {title: 'editTestPlan', icon:'book'},hidden:true},
    {path: '/autoTest/addTestPlan',name: 'addTestPlan',component: () => import('@/views/testset/editTestPlan'),meta: {title: 'addTestPlan', icon:'book'},hidden:true},
    {path: '/autoTest/planSetList',name: 'planSetList',component: () => import('@/views/testset/planSetList'),meta: {title: 'planSetList', icon:'book'},hidden: true},
    {path: '/autoTest/SwaggerUpload',name: 'SwaggerUpload',component: () => import('@/views/caseManage/SwaggerUpload'),meta: {title: 'SwaggerUpload', icon:'upload'},hidden: true},

    {
      path: '/autoTest/configManage',
      redirect: '/autoTest/configManage/configList',
      component: parentView,
      name: 'configManage',
      meta: {title: 'configManage', icon:'bookmark'},
      children: [
        {path:'keyList',name: 'KeyList',component: () => import('@/views/configManage/keyList'),meta: {title: 'keyList', icon:'form'}},
        {path:'configList',name: 'ConfigList',component: () => import('@/views/configManage/configList'),meta: {title: 'configList', icon:'form'}},
      ]
    },

    {path: '/autoTest/templateList',name: 'templateList',component: () => import('@/views/caseManage/templateList'),meta: {title: 'templateList', icon:'table'}},
    {path: '/autoTest/createTemplate',name: 'createTemplate',component: () => import('@/views/caseManage/createTemplate'),meta: {title: 'createTemplate', icon:'form', noCache: true},hidden: true},
    {path: '/autoTest/templateCaseList',name: 'templateCaseList',component: () => import('@/views/caseManage/templateCaseList'),meta: {title: 'templateCaseList', icon:'form'},hidden: true},

    {
      path: '/autoTest/tools',
      redirect: '/autoTest/tools/testLink',
      component: parentView,
      name: 'tools',
      meta: {title: 'tools', icon:'tools'},
      children: [
        // {path: 'batchReplace',name: 'batchReplace',component: () => import('@/views/tools/batchReplace'),meta: {title: 'batchReplace', icon:'replace'}},
        // {path: 'addFeature',name: 'addFeature',component: () => import('@/views/tools/addFeature'),meta: {title: 'addFeature', icon:'add'}},
        {path: 'scanScript',name: 'scanScript',component: () => import('@/views/tools/scanScript'),meta: {title: 'scanScript', icon:'script'}},
        {path: 'externalTool',name: 'externalTool',component: () => import('@/views/tools/externalTool'),meta: {title: 'externalTool', icon:'toolbox'}},
        {path: 'imageProcess',name: 'imageProcess',component: () => import('@/views/tools/imageProcess'),meta: {title: 'imageProcess', icon:'edit'}},
        {path: 'backups',name: 'backups',component: () => import('@/views/tools/backups'),meta: {title: 'backups', icon:'clipboard'}}
      ]
    },

    {
      path: '/autoTest/manualCase',
      redirect: '/autoTest/manualCase/manualCaseList',
      component: parentView,
      name: 'manualCase',
      meta: {title: 'manualCase', icon:'peoples' },
      children: [
        {path: 'manualCaseList',name: 'manualCaseList',component: () => import('@/views/testLink/testLink'),meta: {title: 'testLink', icon: 'book'}},
        {path: 'manualTaskList',name: 'manualTaskList',component: () => import('@/views/testLink/taskLink'),meta: {title: 'taskLink', icon: 'book'}},
        {path: 'createManualTask',name: 'createManualTask',component: () => import('@/views/testLink/createManualTask'),meta: {title: 'createManualTask', icon: 'add'},hidden: true},
        {path: 'updateManualTask',name: 'updateManualTask',component: () => import('@/views/testLink/createManualTask'),meta: {title: 'updateManualTask', icon: 'edit'},hidden: true},
        {path: 'subTaskList',name: 'subTaskList',component: () => import('@/views/testLink/subTaskList'),meta: {title: 'subTaskList', icon: 'bookmark'},hidden: true},
        {path: 'manualCaseUpload',name: 'manualCaseUpload',component: () => import('@/views/testLink/manualCaseUpload'),meta: {title: 'manualCaseUpload', icon: 'bookmark'},hidden: true},
      ]
    },

    {path: '/autoTest/exploreTest',name: 'exploreTest',component: () => import('@/views/tools/exploreTest'),meta: {title: 'exploreTest', icon:'guide'}},

  ]
}

export default apiRouter
