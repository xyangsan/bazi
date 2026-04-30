<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="app-header" v-if="showHeader">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <span class="logo-text">八字排盘</span>
        </div>
        <div class="user-actions">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown @command="handleUserCommand">
              <span class="user-name">
                {{ userStore.nickname || userStore.username }}
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="records">我的排盘</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button text @click="goToLogin">登录</el-button>
            <el-button type="primary" size="small" @click="goToRegister">注册</el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main :class="{ 'with-header': showHeader }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 是否显示顶部导航栏（登录和注册页面不显示）
const showHeader = computed(() => {
  return !['Login', 'Register'].includes(route.name)
})

function goHome() {
  router.push('/')
}

function goToLogin() {
  router.push('/login')
}

function goToRegister() {
  router.push('/register')
}

function handleUserCommand(command) {
  switch (command) {
    case 'profile':
      ElMessage.info('个人信息页面开发中')
      break
    case 'records':
      ElMessage.info('我的排盘页面开发中')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f5f5f5;
}
</style>

<style scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  cursor: pointer;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #b2955d;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
}

.with-header {
  /* 为固定头部留出空间 */
}

main {
  min-height: 100vh;
}
</style>
