<template>
  <div class="register-page">
    <div class="register-container">
      <div class="header">
        <h1 class="main-color">八字排盘</h1>
        <p class="subtitle">用户注册</p>
      </div>

      <el-form :model="form" label-width="0" size="large">
        <el-form-item>
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名（至少3位）"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item>
          <el-input 
            v-model="form.nickname" 
            placeholder="请输入昵称（可选）"
            prefix-icon="Edit"
          />
        </el-form-item>

        <el-form-item>
          <el-input 
            v-model="form.password" 
            type="password"
            placeholder="请输入密码（至少6位）"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-input 
            v-model="form.confirmPassword" 
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            class="submit-btn main-bg" 
            @click="handleRegister"
            :loading="loading"
            block
          >
            注册
          </el-button>
        </el-form-item>

        <div class="form-footer">
          <span>已有账号？</span>
          <router-link to="/login" class="link">立即登录</router-link>
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
  nickname: '',
  password: '',
  confirmPassword: '',
})

async function handleRegister() {
  // 表单验证
  if (!form.username || form.username.length < 3) {
    ElMessage.warning('用户名至少3位')
    return
  }
  if (!form.password || form.password.length < 6) {
    ElMessage.warning('密码至少6位')
    return
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    await userStore.register(form.username, form.password, form.nickname)
    ElMessage.success('注册成功')
    // 注册成功后跳转到首页
    router.push('/')
  } catch (err) {
    ElMessage.error(err.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf6e3 0%, #f5f0e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
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
