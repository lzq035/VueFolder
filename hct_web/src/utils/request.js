'use strict';
import QS from 'qs'
import Axios from 'axios'
import url from '@/utils/server'
import utils from '@/utils/utils'
import toaster from '@/utils/toaster'
import store from '@/store/index'
const baseurl = url.apiurl
import { Message, MessageBox } from 'element-ui'

// http request 拦截器
Axios.interceptors.request.use(
    (config) => {
        config.baseURL = baseurl
        if (!config['params']) {
            config['params'] = {}
        }
        config.params['token'] = store.state.user.token
        config.headers['token'] = store.state.user.token
        return config
    },
    (err) => {
        return Promise.reject(err)
    }
)

// 添加响应拦截器
Axios.interceptors.response.use(
    (res) => {
        // 对响应数据做点什么
        switch (res.data.code) {
            case 200:
                return res.data
                break
            case 402:
                MessageBox.confirm(
                    `${res.data.msg}，可以取消继续留在该页面，或者重新登录`,
                    '确定登出', {
                        confirmButtonText: '重新登录',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                ).then(() => {
                    utils.delAllStorage();
                    utils.delAllSession();
                    location.reload() // 为了重新实例化vue-router对象 避免bug
                })
                break
            default:
                toaster.error('', res.data.msg, 1500)
                    // return Promise.reject(res.data)
                return res.data
                break
        }
    },
    (error) => {
        // 对响应错误做点什么
        toaster.error('网络异常', '', 1500)
        return Promise.reject(error);
    }
)
export default {
    get: (option) => {
        var options = {
            url: option.url,
            timeout: 10000,
            method: option.method || 'get',
            params: option.data || {},
            success: option.succ || function(res) {},
            error: option.error || function(res) {},
        }
        return Axios.request(options)
    },
    post: (option) => {
        var options = {
            url: option.url,
            timeout: 1000000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            method: option.method || 'post',
            data: option.data,
            success: option.succ || function(res) {},
            error: option.error || function(res) {}
        }
        if (option.data && option.typea == 1) {
            options.headers['content-Type'] = 'application/json;charset=utf-8'
            options.beforeSend = function(xhr) {
                xhr.setRequestHeader("Test", "testheadervalue");
            }
        } else if (option.data && option.typea == 2) {
            options.headers['content-Type'] = 'multipart/form-data'
        } else {
            options.data = QS.stringify(options.data)
        }
        return Axios.request(options)
    },
}