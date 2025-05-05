// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 一般頁面
import ProductList from '@/components/ProductList.vue'
import ProductDetail from '@/components/ProductDetail.vue'

// 錯誤頁面
import NotFound from '@/views/errors/NotFound.vue'
import Forbidden from '@/views/errors/Forbidden.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ProductList
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: Forbidden
  },
  {
    path: '/:pathMatch(.*)*', // 注意這裡 * 結尾避免匹配問題
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router