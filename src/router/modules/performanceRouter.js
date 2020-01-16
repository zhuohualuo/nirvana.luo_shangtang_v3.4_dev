import Layout from '@/views/layout/Layout'
import parentView from '@/views/layout/components/parentView'
import c from "./constant"

const performanceRouter = {
  path: '/perf',
  component: Layout,
  redirect: '/perf/perfTaskList',
  name: 'performance',
  meta: {title: 'performance', icon:'performance', headerNav:true,
        access:[c.self,c.vi,c.sf,c.mkt,c.bi,c.cv,c.idea,c.safe,c.sb,c.sid,c.tec,c.rd,c.chip,c.air,c.ad,c.gateway,c.remote,c.cabin,c.wos]},
  children: [
    {path: '/perf/createPerf',name: 'createPerf',component: () => import('@/views/performance/createPerf'),meta: {title: 'createPerf', icon: 'add',noCache: true},hidden: true},
    {path: '/perf/updatePerf',name: 'updatePerf',component: () => import('@/views/performance/createPerf'),meta: {title: 'updatePerf', icon: 'edit',noCache: true},hidden: true},
    {path: '/perf/perfTaskList',name: 'perfTaskList',component: () => import('@/views/performance/perfTaskList'),meta: {title: 'perfTaskList', icon: 'book'}},
    {path: '/perf/perfTaskSet',name: 'perfTaskSet',component: () => import('@/views/performance/perfTaskSet'),meta: {title: 'perfTaskSet', icon: 'book'}},
    {path: '/perf/perfTaskPlan',name: 'perfTaskPlan',component: () => import('@/views/performance/perfTaskPlan'),meta: {title: 'perfTaskPlan', icon: 'form'}},
    {path: '/perf/addPerfPlan',name: 'addPerfPlan',component: () => import('@/views/performance/addPerfPlan'),meta: {title: 'addPerfPlan', icon: 'form'},hidden: true},
    {path: '/perf/updatePerfPlan',name: 'updatePerfPlan',component: () => import('@/views/performance/addPerfPlan'),meta: {title: 'updatePerfPlan', icon: 'form'},hidden: true},
    {path: '/perf/perfDetailList',name: 'perfDetailList',component: () => import('@/views/performance/perfDetailList'),meta: {title: 'perfDetailList', icon: 'form'},hidden: true},
    {path: '/perf/perfTaskConfig',name: 'perfTaskConfig',component: () => import('@/views/performance/perfTaskConfig'),meta: {title: 'perfTaskConfig', icon: 'bookmark'}},
    {path: '/perf/PerfTaskUpload',name: 'PerfTaskUpload',component: () => import('@/views/performance/PerfTaskUpload'),meta: {title: 'PerfTaskUpload', icon: 'add',noCache: true},hidden : true},
    {path: '/perf/createScript',name: 'createScript',component: () => import('@/views/performance/createScript'),meta: {title: 'createScript', icon: 'add',noCache: true},hidden: true},
  ]
}

export default performanceRouter
