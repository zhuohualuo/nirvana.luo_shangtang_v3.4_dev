import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import router from '@/router'
import Cookies from "js-cookie";

// create an axios instance
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 120000 // request timeout
})

// request interceptor
service.interceptors.request.use(config => {
  // Do something before request is sent
  config.headers['uidNumber'] = Cookies.get("uidNumber")
  config.headers['platform'] = Cookies.get("platform")
  config.headers['token'] = Cookies.get("token")
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone interceptor
service.interceptors.response.use(
  response => {
    if (response) {
      switch (response.data.code) {
        case 401:
          Message({
            message: "鉴权失败，请重新登录！",
            type: 'error',
          })
          store.dispatch('user/FedLogOut');
          store.dispatch('app/closeSideBar', { withoutAnimation: false })
          router.replace({
            path: '/login'
          })
      }
    }
    return response
  },
  error => {
    console.log(error) // for debug
    Message({
      message: error.message,
      type: 'error',
    })
    return Promise.reject(error)
  })

export default service
