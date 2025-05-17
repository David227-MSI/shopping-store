import { createRouter, createWebHistory } from 'vue-router'

// 引用元件檔案
// import 元件名 from 檔案位置
import Home from '@/views/Home.vue'
import FakeHome from '@/views/order/FakeHome.vue'
import NotFound from '@/views/errors/NotFound.vue'
import Forbidden from '@/views/errors/Forbidden.vue'

// 商品頁面
//import ProductList from '@/views/pages/brown/ProductList.vue'
import ProductDetail from '@/views/pages/brown/ProductDetail.vue'

// 0428 order相關頁面
import CartPage from '@/views/order/CartPage.vue'
import CheckoutPage from '@/views/order/CheckoutPage.vue'
import OrderCompletePage from '@/views/order/OrderCompletePage.vue'
import OrdersPage from '@/views/order/OrdersPage.vue'
import LoginPage from '@/views/order/LoginPage.vue'
// ttpp
import UserCouponList from '@/views/pages/ttpp/front/UserCouponList.vue'
import UserSubscribeList from '@/views/pages/ttpp/front/UserSubscribeList.vue';
import UserEventList2 from '@/views/pages/ttpp/front/UserEventList2.vue'
import UserNotificationList from '@/views/pages/ttpp/front/UserNotificationList.vue'

import UserLogin from '@/views/pages/ttpp/_fake/UserLogin.vue'
import UserMemberCenter from '@/views/pages/ttpp/_fake/UserMemberCenter.vue'
import UserModify from '@/views/pages/ttpp/_fake/UserModify.vue'
import UserRegister from '@/views/pages/ttpp/_fake/UserRegister2.vue'



// back
import AdminAddPrizeToEvent from '@/views/pages/ttpp/back/AdminAddPrizeToEvent.vue'

// 設定頁面參數
// path:網址, name:頁面名稱, component:元件名
const routes = [
  {
  path: '/products',
  name: 'ProductList',
  component: () => import('@/views/pages/brown/Home2.vue')
},
  // 一般頁面
  { path: '/', name: 'Home', component: Home},

  { path: '/fakehome', name: 'fakehome', component: FakeHome},

    // 商品詳情含評論頁面
    { path: '/products/:id', name: 'ProductDetail', component: ProductDetail },
   // { path: '/products', name: 'ProductList', component: ProductList },

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
  {
    path: '/pages/user-event-list',
    name: 'UserEventList2',
    component: UserEventList2,
  },


    // 訂單相關頁面
  { path: '/cart', name: 'cart', component: CartPage },
  { path: '/checkout', name: 'checkout', component: CheckoutPage },
  { path: '/order/complete/:orderId', name: 'order-complete', component: OrderCompletePage },
  { path: '/member/orders', name: 'orders', component: OrdersPage },
  { path: '/login', name: 'login', component: LoginPage },

]

// 註冊頁面給Router管理
const router = createRouter({
  routes: routes,
  history: createWebHistory(import.meta.env.BASE_URL)
})

export default router
