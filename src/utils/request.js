import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent

        if (store.getters.token) {
            config.headers['Authorization'] = `Bearer ${getToken()}`
        }
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        const res = response.data
        console.log(res);
        // if the custom code is not 20000, it is judged as an error.
        if (res.code !== 0) {
            const errMsg = res.msg || '请求失败'
            Message({
                message: errMsg,
                type: 'error',
                duration: 5 * 1000
            })

            //判断token失效
            if (res.code === -2) {
                // to re-login
                 MessageBox.confirm('您的登录状态已经失效，请重新登录', '登录失效', {
                   confirmButtonText: '重新登录',
                   cancelButtonText: '取消',
                   type: 'warning'
                 }).then(() => {
                   store.dispatch('user/resetToken').then(() => {
                     location.reload()
                   })
                 })
            }
            return Promise.reject(new Error(errMsg))
        } else {
            return res
        }
    },
    error => {
        let errMsg = error.message || error.msg || '请求失败'
        if (error.response && error.response.data) {
           errMsg = error.response.data.msg
        }
        Message({
            message: errMsg,
            type: 'error',
            duration: 5 * 1000
        })
        return Promise.reject(error)
    }
)

export default service