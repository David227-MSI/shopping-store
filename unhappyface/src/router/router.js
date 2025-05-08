import { createRouter, createWebHistory } from 'vue-router'

// 引用元件檔案
// import 元件名 from 檔案位置
import Home from '@/views/Home.vue'
import NotFound from '@/views/errors/NotFound.vue'
import Forbidden from '@/views/errors/Forbidden.vue'

// ttpp
import UserCouponList from '@/views/pages/ttpp/front/UserCouponList.vue'
import UserSubscribeList from '@/views/pages/ttpp/front/UserSubscribeList.vue';

import UserNotificationList from '@/views/pages/ttpp/front/UserNotificationList.vue'

import UserLogin from '@/views/pages/ttpp/_fake/UserLogin.vue'
import UserMemberCenter from '@/views/pages/ttpp/_fake/UserMemberCenter.vue'
import UserModify from '@/views/pages/ttpp/_fake/UserModify.vue'
import UserRegister from '@/views/pages/ttpp/_fake/UserRegister.vue'



// back
import AdminAddPrizeToEvent from '@/views/pages/ttpp/back/AdminAddPrizeToEvent.vue'

// 設定頁面參數 
// path:網址, name:頁面名稱, component:元件名
const routes = [
  // 一般頁面
  { path: '/', name: 'home', component: Home},
  
  // 錯誤顯示頁面
  { path: "/:pathMatch(.*)", component: NotFound, name: "notfound-link" },
  { path: "/403", component: Forbidden, name: "forbidden-link" },
  
  
  // ttpp

  // 會員相關
  { path: '/secure/register', name: 'UserRegister', component: UserRegister},
  { path: '/secure/login', name: 'UserLogin', component: UserLogin},
  { 
    path: '/secure/modify', 
    name: 'UserModify', 
    component: UserModify,
    meta: { requiresAuth: true },
  },
  { 
    path: '/secure/member-center', 
    name: 'UserMemberCenter', 
    component: UserMemberCenter,
    meta: { requiresAuth: true },
  },
  
  
  
  
  
  // 其他頁面
  {
    path: '/pages/user-coupon-list',
    name: 'UserCouponList',
    component: UserCouponList,
    meta: { requiresAuth: true }, // 標記此路由需要身份驗證
  },
  {
    path: '/pages/user-notification-list',
    name: 'UserNotificationList',
    component: UserNotificationList,
    meta: { requiresAuth: true },
  },
  {
    path: '/pages/user-subscribe-list',
    name: 'UserSubscribeList',
    component: UserSubscribeList,
    meta: { requiresAuth: true },
  },

  // back
  { 
    path: '/events/:eventId/add-prizes', 
    name: 'AdminAddPrizeToEvent', 
    component: AdminAddPrizeToEvent
  },









]

// 註冊頁面給Router管理
const router = createRouter({
  routes: routes,
  history: createWebHistory(import.meta.env.BASE_URL)
})

export default router
