<template>
  <div class="login-page">
    <div class="login-container">
      <div class="header">
        <h1 class="main-color">八字排盘</h1>
        <p class="subtitle">用户登录</p>
      </div>

      <el-form :model="form" label-width="0" size="large">
        <el-form-item>
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item>
          <el-input 
            v-model="form.password" 
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            class="submit-btn main-bg" 
            @click="handleLogin"
            :loading="loading"
            block
          >
            登录
          </el-button>
        </el-form-item>

        <div class="form-footer">
          <span>还没有账号？</span>
          <router-link to="/register" class="link">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

async function handleLogin() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    // 跳转到首页或之前的页面
    const redirect = router.currentRoute.value.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    ElMessage.error(err.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf6e3 0%, #f5f0e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.header {
  text-align: center;
  margin-bottom: 30px;

  h1 {
    font-size: 28px;
    margin: 0 0 8px;
  }

  .subtitle {
    color: #999;
    font-size: 14px;
    margin: 0;
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.main-bg {
  background-color: #b2955d;
  border-color: #b2955d;

  &:hover {
    background-color: #a0844d;
    border-color: #a0844d;
  }
}

.form-footer {
  text-align: center;
  color: #999;
  font-size: 14px;

  .link {
    color: #b2955d;
    text-decoration: none;
    margin-left: 5px;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
