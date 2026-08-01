// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Sayfa bileşenlerini içeri aktarıyoruz
import Home from '../pages/Home.vue'
import MarketplaceIndex from '../pages/Marketplace/Index.vue'

const routes = [
  {
  path: '/',
  name: 'Home',
  component: () => import('../pages/Home.vue') // veya doğru dosya yolu
  },
  {
  path: '/marketplace',
  name: 'Marketplace',
  component: () => import('../pages/Marketplace/Index.vue')
  },
  // router dosyasındaki routes dizisinin içine şunu ekle:
  {
    path: '/marketplace/:id', // :id kısmı bu rotanın dinamik olduğunu belirtir
    name: 'ListingDetail',
    component: () => import('../pages/Marketplace/ListingDetail.vue')
  },

  {
  path: '/games',
  name: 'GamesCatalog',
  component: () => import('../pages/Games/Index.vue')
  }

]

const router = createRouter({
  // Modern web sitelerindeki gibi "site.com/pazar" formatı için WebHistory kullanırız
  history: createWebHistory(),
  routes
})

export default router