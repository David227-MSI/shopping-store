import { createRouter, createWebHistory } from 'vue-router'

// 引用元件檔案
// import 元件名 from 檔案位置
import Home from '@/views/pages/brown/Home.vue'
import NotFound from '@/views/errors/NotFound.vue'
import Forbidden from '@/views/errors/Forbidden.vue'

// 商品頁面
import ProductList from '@/views/pages/brown/ProductList.vue'
import ProductDetail from '@/views/pages/brown/ProductDetail.vue'


// 設定頁面參數 
// path:網址, name:頁面名稱, component:元件名
const routes = [
  // 一般頁面
  { path: '/', name: 'Home', component: Home},

  // 商品詳情含評論頁面
  { path: '/products/:id', name: 'ProductDetail', component: ProductDetail },
  { path: '/products', name: 'ProductList', component: ProductList },
  
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
