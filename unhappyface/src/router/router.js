import { createRouter, createWebHistory } from 'vue-router'

// 引用元件檔案
// import 元件名 from 檔案位置
import Home from '@/views/Home.vue'
import NotFound from '@/views/errors/NotFound.vue'
import Forbidden from '@/views/errors/Forbidden.vue'

// 0428 order相關頁面
import CartPage from '@/views/order/CartPage.vue'
import CheckoutPage from '@/views/order/CheckoutPage.vue'
import OrderCompletePage from '@/views/order/OrderCompletePage.vue'
import OrdersPage from '@/views/order/OrdersPage.vue'

// 設定頁面參數
// path:網址, name:頁面名稱, component:元件名
const routes = [
  // 一般頁面
  { path: '/', name: 'home', component: Home},
  // { path: '/', name: '', component:  },
  // 錯誤顯示頁面
  { path: "/:pathMatch(.*)", component: NotFound, name: "notfound-link" },
  { path: "/403", component: Forbidden, name: "forbidden-link" },

    // 訂單相關頁面
  { path: '/cart', name: 'cart', component: CartPage },
  { path: '/checkout', name: 'checkout', component: CheckoutPage },
  { path: '/order/complete', name: 'order-complete', component: OrderCompletePage },
  { path: '/member/orders', name: 'orders', component: OrdersPage }

]
// 註冊頁面給Router管理
const router = createRouter({
  routes: routes,
  history: createWebHistory(import.meta.env.BASE_URL)
})

export default router
