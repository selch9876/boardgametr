// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Sayfa bileşenlerini içeri aktarıyoruz
import Home from '../pages/Home.vue'
import MarketplaceIndex from '../pages/Marketplace/Index.vue'
import EditListing from '../pages/Marketplace/EditListing.vue' // <-- Buraya ekleyin

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
    path: '/marketplace/:id/edit', // 2. Rota tanımını ekle
    name: 'EditListing',
    component: EditListing
  },

  {
  path: '/games',
  name: 'GamesCatalog',
  component: () => import('../pages/Games/Index.vue')
  },
  {
  path: '/games/:id',
  name: 'GameDetail',
  component: () => import('../pages/Games/GameDetail.vue')
  },
  {
  path: '/marketplace/create',
  name: 'CreateListing',
  component: () => import('../pages/Marketplace/Create.vue')
  },
  {
  path: '/games/create',
  name: 'CreateGame',
  component: () => import('../pages/Games/Create.vue')
  },
  {
  path: '/auth',
  name: 'Auth',
  component: () => import('../pages/Auth/Index.vue')
  },
  {
  path: '/admin/games/:id/edit',
  name: 'AdminGameEdit',
  component: () => import('../pages/Admin/GameEdit.vue')
  }

]

const router = createRouter({
  // Modern web sitelerindeki gibi "site.com/pazar" formatı için WebHistory kullanırız
  history: createWebHistory(),
  routes
})

export default router