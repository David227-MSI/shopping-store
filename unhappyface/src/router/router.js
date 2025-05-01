import { createRouter, createWebHistory } from 'vue-router'

// 引用元件檔案
// import 元件名 from 檔案位置
import Home from '@/views/Home.vue'
import NotFound from '@/views/errors/NotFound.vue'
import Forbidden from '@/views/errors/Forbidden.vue'

// ttpp
import NotificationList from '@/views/pages/ttpp/front/NotificationList.vue'
import AddPrizeToEvent from '@/views/pages/ttpp/back/AddPrizeToEvent.vue'


// 設定頁面參數 
// path:網址, name:頁面名稱, component:元件名
const routes = [
  // 一般頁面
  { path: '/', name: 'home', component: Home},
  
  // 錯誤顯示頁面
  { path: "/:pathMatch(.*)", component: NotFound, name: "notfound-link" },
  { path: "/403", component: Forbidden, name: "forbidden-link" },
  
  
  // ttpp
  // { path: '/', name: '', component:  },
  { path: '/notificationList', name: 'NotificationList', component: NotificationList},
  { path: '/events/:eventId/add-prizes', name: 'AddPrizeToEvent', component: AddPrizeToEvent},



]

// 註冊頁面給Router管理
const router = createRouter({
  routes: routes,
  history: createWebHistory(import.meta.env.BASE_URL)
})

export default router
