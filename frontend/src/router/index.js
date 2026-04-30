import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'PaipanInput',
    component: () => import('@/views/PaipanInput.vue'),
    meta: { title: '八字排盘' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '用户登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '用户注册' },
  },
  {
    path: '/result',
    name: 'PaipanResult',
    component: () => import('@/views/PaipanResult.vue'),
    meta: { title: '排盘结果' },
  },
  {
    path: '/detail',
    name: 'PaipanDetail',
    component: () => import('@/views/PaipanDetail.vue'),
    meta: { title: '专业细盘' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  document.title = to.meta.title || '八字排盘'
})

export default router
