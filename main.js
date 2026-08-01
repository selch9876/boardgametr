// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // YENİ: Router'ı import ettik

const app = createApp(App)

app.use(router) // YENİ: Router'ı projeye dahil ettik
app.mount('#app')