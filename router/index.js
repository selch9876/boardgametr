// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Sayfa bileşenlerini içeri aktarıyoruz
import Home from '../pages/Home.vue'
import MarketplaceIndex from '../pages/Marketplace/Index.vue'

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: Home 
  },
  { 
    path: '/pazar', 
    name: 'Marketplace', 
    component: MarketplaceIndex 
  }
]

const router = createRouter({
  // Modern web sitelerindeki gibi "site.com/pazar" formatı için WebHistory kullanırız
  history: createWebHistory(),
  routes
})

export default router