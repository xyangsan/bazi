import { defineStore } from 'pinia';
import { login as loginApi, register as registerApi, getProfile } from '@/api/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.username || '',
    nickname: (state) => state.userInfo?.nickname || '',
  },

  actions: {
    /**
     * 用户登录
     */
    async login(username, password) {
      const res = await loginApi({ username, password });
      if (res.code === 0) {
        this.token = res.data.token;
        this.userInfo = res.data.user;
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userInfo', JSON.stringify(res.data.user));
        return res;
      }
      throw new Error(res.message || '登录失败');
    },

    /**
     * 用户注册
     */
    async register(username, password, nickname) {
      const res = await registerApi({ username, password, nickname });
      if (res.code === 0) {
        this.token = res.data.token;
        this.userInfo = res.data.user;
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userInfo', JSON.stringify(res.data.user));
        return res;
      }
      throw new Error(res.message || '注册失败');
    },

    /**
     * 获取用户信息
     */
    async fetchUserInfo() {
      if (!this.token) return;
      try {
        const res = await getProfile();
        if (res.code === 0) {
          this.userInfo = res.data;
          localStorage.setItem('userInfo', JSON.stringify(res.data));
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },

    /**
     * 用户退出登录
     */
    logout() {
      this.token = '';
      this.userInfo = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
  },
});
