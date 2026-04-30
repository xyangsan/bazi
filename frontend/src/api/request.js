import axios from 'axios'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截
request.interceptors.request.use(
  (config) => {
    // 添加token到请求头（直接从localStorage读取，避免store未初始化问题）
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截
request.interceptors.response.use(
  (response) => {
    // 如果响应是标准格式 { code, data, message }
    if (response.data && typeof response.data.code !== 'undefined') {
      if (response.data.code === 0) {
        return response.data
      } else {
        // token过期或无效
        if (response.data.code === 401 || response.data.code === 403) {
          const userStore = useUserStore()
          userStore.logout()
          ElMessage.error('登录已过期，请重新登录')
          // 跳转到登录页
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(new Error(response.data.message || '请求失败'))
      }
    }
    return response.data
  },
  (error) => {
    console.error('请求失败:', error)
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
