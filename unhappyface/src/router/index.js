import { createRouter, createWebHistory } from 'vue-router'

import ProductList from '@/components/ProductList.vue'
import ProductDetail from '@/components/ProductDetail.vue'
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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
