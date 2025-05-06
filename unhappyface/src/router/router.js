import { createRouter, createWebHistory } from 'vue-router'

// 引用元件檔案
// import 元件名 from 檔案位置
import Home from '@/views/Home.vue'
import NotFound from '@/views/errors/NotFound.vue'
import Forbidden from '@/views/errors/Forbidden.vue'

// 商品頁面
import ProductDetail from '@/views/pages/ProductDetail.vue'
import ProductList from '@/views/pages/ProductList.vue'

// 假的訂單詳情頁面
import OrderDetailDemo from '@/views/pages/OrderDetailDemo.vue'


// 設定頁面參數 
// path:網址, name:頁面名稱, component:元件名
const routes = [
  // 一般頁面
  { path: '/', name: 'home', component: ProductList},

  // 商品詳情含評論頁面
  { path: '/products/:id', component: ProductDetail },

  // 假的訂單詳情頁面
  { path: '/demo/order', component: OrderDetailDemo },
  
  // 錯誤顯示頁面
  { path: "/403", component: Forbidden, name: "forbidden-link" },
  { path: "/:pathMatch(.*)", component: NotFound, name: "notfound-link" },



]

// 註冊頁面給Router管理
const router = createRouter({
  routes: routes,
  history: createWebHistory(import.meta.env.BASE_URL)
})

export default router
