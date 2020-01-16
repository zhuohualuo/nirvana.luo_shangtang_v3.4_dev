import Layout from '@/views/layout/Layout'
import parentView from '@/views/layout/components/parentView'
import c from "./constant"

const sdkRouter =     {
  path: '/sdkTest',
  redirect: '/sdkTest/sdkCase',
  component: Layout,
  name: 'sdkTest',
  meta: {title: 'sdkTest', icon:'sdk', headerNav:true, access:[c.sdk]},
  children: [
    {path: '/sdkTest/sdkCase',name: 'sdkCase',component: () => import('@/views/sdkTest/sdkCase'),meta: {title: 'sdkCase', icon: 'form'}},
    {path: '/sdkTest/sdkType',name: 'sdkType',component: () => import('@/views/sdkTest/sdkType'),meta: {title: 'sdkType', icon: 'form'}},
    {path: '/sdkTest/sdkModel',name: 'sdkModel',component: () => import('@/views/sdkTest/sdkModel'),meta: {title: 'sdkModel', icon: 'form'}},
    {path: '/sdkTest/sdkConfig',name: 'sdkConfig',component: () => import('@/views/sdkTest/sdkConfig'),meta: {title: 'sdkConfig', icon: 'form'}},
  ]
}

export default sdkRouter