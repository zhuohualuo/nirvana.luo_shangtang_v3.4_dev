import axios from 'axios'
import { Message } from 'element-ui'
import Cookies from 'js-cookie'

// create an axios instance
const service = axios.create({
  // baseURL: 'http://localhost:5000', // api的base_url
  baseURL: 'http://172.20.25.198:5000', // api的base_url
  // baseURL: 'http://172.20.25.37:5000', // api的base_url
  // baseURL: 'http://10.9.244.33:5000', // api的base_url
  // baseURL: 'http://10.9.242.41:5000', // api的base_url
  timeout: 120000 // request timeout
})

// request interceptor
service.interceptors.request.use(config => {
  // Do something before request is sent
  config.headers['uidNumber'] = Cookies.get('uidNumber')
  config.headers['platform'] = Cookies.get('platform')
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone interceptor
service.interceptors.response.use(
  response => response,
  error => {
    console.log(error) // for debug
    Message({
      message: error.message,
      type: 'error'
    })
    return Promise.reject(error)
  })

export default service
